---
phase: 15-管理后台前端UAT测试
plan: 02
status: complete
started: 2026-05-12
completed: 2026-05-12
type: execute
wave: 1
gap_closure: true
source: 15-ADMIN-UAT-01-UAT.md (Gap 1 & Gap 2)
---

## Summary

修复订单详情页空白问题（Gap 1）和添加发货功能（Gap 2）。

**Gap 1 根因：** 后端 `getOrderDetail` 返回嵌套 Map `{order, items, delivery, address}`，前端直接将该 Map 作为 `OrderDetailDTO` 使用，导致页面渲染失败。

**Gap 2 根因：** 订单列表和详情页均无发货入口，只有"查看详情"按钮。

## Changes Made

### 1. `zlt-web/portal-web/src/pages/MallAdmin/Orders/services/orders.ts`

重写 `getOrderDetail` 函数，将后端嵌套 Map 转换为扁平的 `OrderDetailDTO`：

```typescript
// 后端返回 {order: MallOrder, items: [...], delivery: {...}, address: {...}}
// 转换为 flat DTO
const raw = response?.datas || response?.data || response;
if (!raw || !raw.order) return null;
const o = raw.order;
// 提取 address、items、delivery 到顶层字段
return {
  id: o.id, orderNo: o.orderNo, status: o.status, ...
  addressId: raw.address?.id || o.addressId || 0,
  addressName: raw.address?.consigneeName || ...,
  addressPhone: raw.address?.consigneePhone || ...,
  addressDetail: raw.address?.detailAddress || ...,
  items: (raw.items || []).map(...),
  delivery: raw.delivery ? {...} : null,
}
```

### 2. `zlt-web/portal-web/src/pages/MallAdmin/Orders/index.tsx`

订单列表操作列添加"发货"按钮（仅 `status === ORDER_STATUS.PAID`）：

```typescript
// 新增 ShoppingCartOutlined 图标导入
// 操作列 render:
{record.status === ORDER_STATUS.PAID && (
  <Button type="link" icon={<ShoppingCartOutlined />} onClick={() => handleShipOrder(record)}>
    发货
  </Button>
)}
// 新增 handleShipOrder 跳转函数
const handleShipOrder = (record) => navigate(`/mall-admin/orders/detail/${record.id}?action=ship`);
```

### 3. `zlt-web/portal-web/src/pages/MallAdmin/Orders/detail/index.tsx`

详情页添加发货按钮和发货弹窗：

```typescript
// 新增状态：shipModalVisible, shipping, form, searchParams
// useEffect 自动检测 ?action=ship 并打开弹窗
// 发货按钮（PAID 状态且未发货）：
{order.status === ORDER_STATUS.PAID && !order.shipTime && (
  <Button icon={<ShoppingCartOutlined />} onClick={() => setShipModalVisible(true)}>发货</Button>
)}
// 发货 Modal（expressCode, expressName, waybillNo）
// 提交调用 shipOrder API 并刷新详情
```

## Verification

- ✅ 订单详情页正确显示：订单基本信息、收货地址、商品清单、支付信息、物流信息
- ✅ 已付款订单列表显示"发货"按钮
- ✅ 已付款订单详情页显示"发货"按钮
- ✅ 发货弹窗可填写快递公司编码/名称/运单号并提交
- ✅ 发货后订单详情页刷新显示物流信息

## Files Modified

- `zlt-web/portal-web/src/pages/MallAdmin/Orders/services/orders.ts`
- `zlt-web/portal-web/src/pages/MallAdmin/Orders/detail/index.tsx`
- `zlt-web/portal-web/src/pages/MallAdmin/Orders/index.tsx`

## Commit

已合并到 Phase 15 批量提交 (e161fcf03)
