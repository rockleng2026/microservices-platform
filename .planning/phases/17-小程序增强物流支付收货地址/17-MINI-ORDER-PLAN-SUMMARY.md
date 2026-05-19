# Phase 17 Wave 1 - MINI-ORDER Execution Summary

## Completed Tasks

### Task 1: Fix order detail response unwrapping
**File:** `mall-mini-program/src/services/order.ts`

Changed `getOrderDetail` from using the generic `request()` wrapper to a custom implementation that correctly unwraps the backend's `Result` wrapper `{ code, msg, datas }`:

```typescript
export const getOrderDetail = (orderId: number): Promise<Order> => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${ORDER_DETAIL}/${orderId}`,
      method: 'GET',
      header: getCommonHeaders(),
      success: (res: any) => {
        if (res.statusCode === 200 && res.data) {
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

### Task 2: Add getLogistics function
**File:** `mall-mini-program/src/services/order.ts`

Added new exported function after `confirmReceipt`:

```typescript
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

### Task 3: Wire viewLogistics button to backend API
**File:** `mall-mini-program/src/pages/order-detail/index.vue`

- Updated import to include `getLogistics`
- Replaced stub `viewLogistics` function with async implementation that calls `getLogistics(order.value.id)` and updates `order.value.logistics` reactively

## Verification

| Success Criterion | Status |
|---|---|
| getOrderDetail returns unwrapped order object (not wrapped in Result) | Verified |
| order-detail page renders items, address, payment info | Template already correct |
| getLogistics function exists and is exported | Verified |
| viewLogistics calls getLogistics API and updates UI reactively | Verified |

## Files Modified

- `mall-mini-program/src/services/order.ts` - 2 changes (fix unwrapping + add getLogistics)
- `mall-mini-program/src/pages/order-detail/index.vue` - 2 changes (import + viewLogistics body)