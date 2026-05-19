---
phase: "17-小程序增强物流支付收货地址"
plan: "01"
type: "execute"
wave: 1
depends_on: []
files_modified:
  - "mall-mini-program/src/services/order.ts"
autonomous: true
requirements:
  - "MINI-LOGISTICS-01"
  - "MINI-ORDERS-01"
must_haves:
  truths:
    - "User can see order details (order items, address, payment info) when clicking 'view detail'"
    - "User can view logistics tracking for shipped orders"
  artifacts:
    - path: "mall-mini-program/src/services/order.ts"
      provides: "Fixed getOrderDetail response unwrapping + new getLogistics function"
      exports: ["getOrderDetail", "getLogistics"]
    - path: "mall-mini-program/src/pages/order-detail/index.vue"
      provides: "Logistics button wired to backend API"
      contains: "viewLogistics"
  key_links:
    - from: "mall-mini-program/src/pages/order-detail/index.vue"
      to: "/api-mall/api/mall/order/{id}/delivery"
      via: "getLogistics() call"
      pattern: "getLogistics.*orderId"
---

<objective>
Fix the order detail page data-display bug, then wire the "View Logistics" button to the backend logistics API.
</objective>

<context>
@mall-mini-program/src/pages/order-detail/index.vue
@mall-mini-program/src/services/order.ts
@mall-mini-program/src/config/api.ts
</context>

<interfaces>
<!-- Key types from order.ts -->
```typescript
interface OrderItem {
  id: number; orderId: number; skuId: number; goodsName: string;
  goodsImage: string; price: number; quantity: number; specs?: string;
}
interface Address {
  id: number; userId: number; receiverName: string; phone: string;
  province: string; city: string; district: string; detail: string; isDefault: number;
}
interface LogisticsInfo {
  company: string; trackingNo: string;
  timeline: Array<{ time: string; content: string; }>;
}
interface Order {
  id: number; orderNo: string; userId: number;
  status: 'pending_payment' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunding';
  totalAmount: number; discountAmount: number; freightFee: number; finalAmount: number;
  remark?: string; createdAt: string; paidAt?: string; shippedAt?: string; deliveredAt?: string;
  items: OrderItem[]; address: Address; logistics?: LogisticsInfo;
}
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Fix order detail response unwrapping in order.ts</name>
  <files>mall-mini-program/src/services/order.ts</files>
  <read_first>
    - mall-mini-program/src/services/order.ts (lines 161-166, request wrapper, Order type)
    - mall-mini-program/src/services/payment.ts (lines 108-110 showing backend wraps in Result with datas)
  </read_first>
  <action>
    In getOrderDetail (line 162-166), the request() call returns res.data directly which is the Result wrapper { code, msg, datas }.
    The Order interface expects flat fields (orderNo, items, address, etc.) NOT { code, msg, datas }.

    ROOT CAUSE: Backend OrderController.getOrderDetail() returns Result.succeed(detail) = { code:200, msg:"success", datas: { order fields } }.
    The frontend request() wrapper returns res.data which is the Result object itself, not res.data.datas.

    FIX: Modify getOrderDetail to unwrap res.data.datas before returning:

    ```typescript
    export const getOrderDetail = (orderId: number): Promise<Order> => {
      return new Promise((resolve, reject) => {
        uni.request({
          url: `${API_BASE}${ORDER_DETAIL}/${orderId}`,
          method: 'GET',
          header: getCommonHeaders(),
          success: (res: any) => {
            if (res.statusCode === 200 && res.data) {
              // Backend wraps in Result: { code, msg, datas }
              const orderData = res.data.datas || res.data
              resolve(orderData)
            } else {
              reject(res)
            }
          },
          fail: reject
        })
      })
    }
    ```

    NOTE: The request() wrapper at lines 8-27 returns res.data directly, so only getOrderDetail needs this custom handling (like getOrderList already does).
    Do NOT modify the existing request() wrapper — it is used by other functions.
  </action>
  <verify>
    <automated>grep -c "res.data.datas || res.data" mall-mini-program/src/services/order.ts</automated>
  </verify>
  <done>getOrderDetail correctly extracts order data from Result.datas wrapper</done>
</task>

<task type="auto">
  <name>Task 2: Add getLogistics function to order.ts</name>
  <files>mall-mini-program/src/services/order.ts</files>
  <read_first>
    - mall-mini-program/src/services/order.ts (after getOrderDetail around line 166)
    - mall-mini-program/src/config/api.ts (ORDER_DETAIL = '/api/mall/order')
  </read_first>
  <action>
    Add a new getLogistics function that calls GET /api-mall/api/mall/order/{id}/delivery.

    Backend endpoint (confirmed from OrderController.java lines 101-121):
    - GET /api/mall/order/{id}/delivery
    - Returns LogisticsTrackDTO: { company, trackingNo, timeline: [{time, content}...] }
    - Only works for shipped orders (status >= 3)

    Add after confirmReceipt function (after line 180):

    ```typescript
    // Get logistics info for an order
    export const getLogistics = (orderId: number): Promise<LogisticsInfo> => {
      return new Promise((resolve, reject) => {
        uni.request({
          url: `${API_BASE}${ORDER_DETAIL}/${orderId}/delivery`,
          method: 'GET',
          header: getCommonHeaders(),
          success: (res: any) => {
            if (res.statusCode === 200 && res.data) {
              const data = res.data.datas || res.data
              resolve(data)
            } else {
              reject(res)
            }
          },
          fail: reject
        })
      })
    }
    ```
  </action>
  <verify>
    <automated>grep -c "export const getLogistics" mall-mini-program/src/services/order.ts</automated>
  </verify>
  <done>getLogistics function exported and callable from order-detail page</done>
</task>

<task type="auto">
  <name>Task 3: Wire viewLogistics button to backend API in order-detail page</name>
  <files>mall-mini-program/src/pages/order-detail/index.vue</files>
  <read_first>
    - mall-mini-program/src/pages/order-detail/index.vue (viewLogistics function at lines 291-295, import from order service at line 169)
  </read_first>
  <action>
    The viewLogistics function at line 292-295 currently shows "物流详情开发中" toast.
    Replace it to call getLogistics and display the logistics timeline.

    1. Update the import at line 169 to include getLogistics:
    ```typescript
    import { getOrderDetail, cancelOrder, confirmReceipt, getLogistics, type Order } from '@/services/order'
    ```

    2. Replace the viewLogistics function body (lines 292-295):
    ```typescript
    const viewLogistics = async () => {
      if (!order.value?.logistics) return
      try {
        uni.showLoading({ title: '加载物流信息...' })
        const logistics = await getLogistics(order.value.id)
        // Update the order's logistics with fresh data from backend
        order.value.logistics = logistics
        uni.hideLoading()
      } catch (e) {
        uni.hideLoading()
        uni.showToast({ title: '获取物流信息失败', icon: 'none' })
        console.error('getLogistics failed', e)
      }
    }
    ```

    NOTE: order.logistics is already displayed in the template (lines 16-45) via v-if="order.logistics".
    The timeline rendering at lines 32-44 already handles order.logistics.timeline correctly.
    This change fetches fresh data and the template auto-updates via Vue reactivity.
  </action>
  <verify>
    <automated>grep -c "getLogistics(order.value.id)" mall-mini-program/src/pages/order-detail/index.vue</automated>
  </verify>
  <done>Clicking 'View Logistics' button fetches and displays logistics tracking info</done>
</task>

</tasks>

<verification>
Order detail page for a paid order shows order items, address, and payment info.
"View Logistics" button for shipped orders calls getLogistics and updates the timeline display.
</verification>

<success_criteria>
- [ ] getOrderDetail returns unwrapped order object (not wrapped in Result)
- [ ] order-detail page renders items, address, payment info for a real order
- [ ] getLogistics function exists and is exported
- [ ] viewLogistics calls getLogistics API and updates UI reactively
</success_criteria>

<output>
After completion, create `.planning/phases/17-小程序增强物流支付收货地址/17-MINI-ORDER-PLAN-SUMMARY.md`
</output>