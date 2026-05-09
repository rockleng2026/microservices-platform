# Phase 10: 管理后台核心模块 - Research

**Researched:** 2026-05-09
**Domain:** Admin Web (React + Umi 4 + Ant Design Pro + TypeScript) + mall-center Backend APIs
**Confidence:** MEDIUM-HIGH (backend APIs verified by reading source; frontend patterns from existing Phase 8 code + standard Ant Design Pro ecosystem)

## User Constraints (from 10-CONTEXT.md)

### Locked Decisions
- D-01: ProTable 组件用于所有列表页
- D-02: 批量操作：顶部工具栏 + Modal 确认
- D-03: 数字分页（1 2 3 ... 10）
- D-04: 商品编辑用 Modal 弹窗
- D-05: 规格管理与商品同表单
- D-06: 多图上传（最多5张，拖拽排序）
- D-07: 订单改价：输入框直接修改
- D-08: 改价提交：可选原因 + 确认
- D-09: 改价校验：不允许低于成本价（前端+后端双重校验）
- D-10: 优惠券发放：手动发放 + 生成领取链接/码
- D-11: 领取链接：限时一次性码
- D-12: 优惠券状态变化：站内信通知
- D-13: Banner：最多5张，可排序
- D-14: Banner 链接：商品详情 + 分类页
- D-15: Banner 排序：拖拽排序

### Deferred Ideas (OUT OF SCOPE)
- 商品列表高级搜索（多条件组合筛选）— Phase 11+
- 订单导出功能（Excel/CSV）— Phase 11+
- 管理员权限控制 UI — 后端复用平台用户体系，前端暂不实现 RBAC UI

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADMIN-02-01 | Admin can create a new product with name, description, price, stock, category, images, and type (physical/virtual) | AdminGoodsController POST /publish, AdminGoodsDTO |
| ADMIN-02-02 | Admin can edit existing product details | AdminGoodsController PUT /update, AdminGoodsDTO with skus array |
| ADMIN-02-03 | Admin can delete a product (soft delete) | AdminGoodsController DELETE /{id} |
| ADMIN-02-04 | Admin can view paginated product list with search and filter by category/status | AdminGoodsController GET /list |
| ADMIN-02-05 | Admin can batch publish (enable) selected products | AdminGoodsController PUT /batch/status |
| ADMIN-02-06 | Admin can batch unpublish (disable) selected products | AdminGoodsController PUT /batch/status |
| ADMIN-02-07 | Admin can manage product categories | AdminCategoryController CRUD + /sort |
| ADMIN-02-08 | Admin can upload product images via file-center integration | Frontend uses file-center upload API, backend receives image URLs |
| ADMIN-02-09 | Admin can set product specifications and stock per spec | AdminGoodsDTO.skus[], AdminSpecController |
| ADMIN-02-10 | Admin can view product detail page | AdminGoodsController GET /{id} |
| ADMIN-03-01 | Admin can view paginated order list with filters | AdminOrderController GET /list (TODO: needs implementation) |
| ADMIN-03-02 | Admin can view order detail | AdminOrderController GET /{id} returns OrderDetailDTO |
| ADMIN-03-03 | Admin can modify order price (with audit reason) | AdminOrderController POST /{id}/adjust-amount (adjustAmount=negative only) |
| ADMIN-03-04 | Admin can add internal notes to an order | AdminOrderController POST /{id}/admin-remark |
| ADMIN-03-05 | Admin can close an order (with reason selected) | AdminOrderController POST /{id}/close |
| ADMIN-03-06 | Admin can view order status flow | OrderDetailDTO.statusDesc |
| ADMIN-03-07 | Admin can trigger virtual product order completion | Backend auto-completes virtual orders at payment confirmation (OrderServiceImpl line 335) |
| ADMIN-04-01 | Admin can create a coupon | AdminCouponController POST /template |
| ADMIN-04-02 | Admin can edit an existing coupon | AdminCouponController PUT /template/{id} |
| ADMIN-04-03 | Admin can delete a coupon | Missing backend endpoint — needs verification |
| ADMIN-04-04 | Admin can view paginated coupon list | AdminCouponController GET /template/list |
| ADMIN-04-05 | Admin can issue a coupon to specific users | **MISSING in backend** — no issue-to-user endpoint found |
| ADMIN-04-06 | Admin can view coupon usage statistics | **MISSING in backend** — no statistics endpoint found |
| ADMIN-04-07 | Admin can manually expire a coupon | AdminCouponController POST /template/{id}/offline |
| ADMIN-10-01 | Admin can create a banner | AdminBannerController POST / |
| ADMIN-10-02 | Admin can edit an existing banner | AdminBannerController PUT / |
| ADMIN-10-03 | Admin can delete a banner | AdminBannerController DELETE /{id} |
| ADMIN-10-04 | Admin can view paginated banner list | AdminBannerController GET /list |
| ADMIN-10-05 | Admin can enable or disable a banner | AdminBannerController PUT / with status field |

---

## Summary

Phase 10 builds the core Admin modules: Product Management, Order Management, Coupon Management, and Banner Management. The backend APIs exist for most operations, but there are gaps in coupon issuance and statistics. Key frontend patterns are established via Phase 8's Dashboard: ProTable + Zustand + request utility. The main implementation risks are: (1) missing backend endpoints for ADMIN-04-05/06, (2) cost price validation requires frontend-only workaround since `costPrice` field not present in DTOs, (3) batch operations require careful ProTable valueEnum setup.

**Primary recommendation:** Build Admin-02, Admin-03, Admin-10 immediately as APIs are complete. Flag Admin-04-05 and Admin-04-06 as blocked pending backend implementation — do not plan frontend tasks for these until backend confirms.

---

## Backend API Analysis

### AdminGoodsController — `/api/mall/admin/goods`
Base path: `/api/mall/admin/goods`

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| GET | /list | `page, pageSize, categoryId?, keyword?, status?, goodsType?` | `Result<IPage<AdminGoodsDTO>>` | Paginates goods |
| GET | /{id} | — | `Result<AdminGoodsDTO>` | Single goods with skus |
| POST | (publish) | `AdminGoodsDTO` (name, categoryId, goodsType, price required) | `Result<Boolean>` | Creates new goods |
| PUT | (update) | `AdminGoodsDTO` with id | `Result<Boolean>` | Full update |
| DELETE | /{id} | — | `Result<Boolean>` | Soft delete |
| PUT | /{id}/status/{status} | — | `Result<Boolean>` | Single status toggle |
| PUT | /batch/status | `{goodsIds: Long[], status: Integer}` | `Result<Boolean>` | Batch status |
| POST | /clone | `{goodsId, newCategoryId?, newName?}` | `Result<Long>` | Clone goods |

**AdminGoodsDTO shape:**
```java
Long id;
Long categoryId;
String name;
String subTitle;
String mainImage;
String images;        // JSON array as string: "[\"url1\",\"url2\"]"
String detail;
BigDecimal price;
Integer goodsType;    // 1=physical, 2=virtual
String virtualUrl;
Long virtualFileId;
LocalDateTime virtualExpire;
List<SkuDTO> skus;   // embedded specs
Integer status;      // 0=下架, 1=上架
Integer sort;
```

**SkuDTO shape:**
```java
Long id;
String skuCode;
String specs;        // JSON: "{\"颜色\":\"红色\",\"尺寸\":\"XL\"}"
BigDecimal price;
Integer stock;
String image;
Integer status;
```

### AdminOrderController — `/api/mall/admin/order`
Base path: `/api/mall/admin/order`

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| GET | /list | `page, pageSize, orderNo?, status?, startTime?, endTime?, keyword?` | `Result<IPage<OrderListDTO>>` | **TODO: not fully implemented** |
| GET | /{id} | — | `Result<OrderDetailDTO>` | Full detail |
| POST | /{id}/ship | `{expressCode, expressName, waybillNo}` | `Result<Boolean>` | — |
| POST | /{id}/close | `{reason}` | `Result<Boolean>` | ORDER-EXT-01 |
| POST | /{id}/adjust-amount | `{orderId, adjustAmount: BigDecimal, reason?}` | `Result<Boolean>` | adjustAmount must be negative per code |
| POST | /{id}/admin-remark | `{remark}` | `Result<Boolean>` | ORDER-EXT-03 |

**OrderListDTO shape:**
```java
Long id;
String orderNo;
Long userId;
Integer goodsType;       // 1=实物, 2=虚拟
String goodsTypeDesc;
BigDecimal totalAmount;
BigDecimal payAmount;
Integer status;          // 1=待付款,2=已付款,3=已发货,4=已完成,5=已取消
String statusDesc;
Integer itemCount;
String remark;
LocalDateTime payTime;
LocalDateTime shipTime;
LocalDateTime createTime;
```

**OrderDetailDTO shape:**
```java
Long id;
String orderNo;
Long userId;
Integer goodsType;
String goodsTypeDesc;
BigDecimal totalAmount;
BigDecimal freightAmount;
BigDecimal payAmount;
Integer status;
String statusDesc;
String remark;
LocalDateTime payTime, shipTime, completeTime, createTime;
// Address (physical)
Long addressId;
String addressName, addressPhone, addressDetail;
// Items
List<OrderItemDTO> items;
// Delivery
DeliveryDTO delivery;
```

**AdminAdjustOrderDTO (ORDER-EXT-02):**
```java
Long orderId;
BigDecimal adjustAmount;   // NOTE: comment says "负数=减少金额，正数不允许"
String reason;
```

**CRITICAL D-09 finding:** The backend accepts negative `adjustAmount` only (decrease). The `costPrice` field does NOT exist in any DTO — cost price validation must be done by the frontend fetching the order's items and looking up the cost price per item. There is no single `costPrice` field returned by the order API.

### AdminCouponController — `/api/mall/admin/coupon`
Base path: `/api/mall/admin/coupon`

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| POST | /template | `Map<String, Object>` | `Result<Long>` | Creates coupon template |
| PUT | /template/{id} | `Map<String, Object>` | `Result<Boolean>` | Updates template |
| POST | /template/{id}/publish | — | `Result<Boolean>` | Publishes coupon |
| POST | /template/{id}/offline | — | `Result<Boolean>` | Takes offline |
| GET | /template/list | `status?, page?, pageSize?` | `Result<List<MallCouponTemplate>>` | **No pagination** |

**Coupon template params for create/update:**
```json
{
  "name": "string",
  "type": 1|2,           // 1=满减券, 2=折扣券
  "faceValue": "100.00", // type=1: 减免金额（元）
  "discountRate": "0.8", // type=2: 折扣率（8折=0.8）
  "minAmount": "200.00", // 最低消费金额
  "maxDiscount": "50.00", // 最高优惠金额（type=2时）
  "totalCount": 1000,
  "perUserLimit": 1,
  "validType": 1|2,     // 1=固定时间, 2=领券后N天
  "startTime": "2026-05-01T00:00:00",
  "endTime": "2026-05-31T23:59:59",
  "validDays": 7        // validType=2时有效
}
```

**BLOCKER — ADMIN-04-05/04-06:** No backend endpoint exists to:
- Issue a specific coupon template to a named user (by userId or phone)
- Retrieve coupon usage statistics (issued count, used count, unused count)

The user-facing CouponController has `/claim/{id}` for self-service claim, but no admin API for directed issuance. This must be flagged to the user before planning.

**BLOCKER — Coupon claim link generation:** No backend endpoint found for generating time-limited claim links or codes (`D-11`). The CouponController.claimCoupon accepts a template ID and userId — no code-based claim.

### AdminBannerController — `/api/mall/admin/banner`
Base path: `/api/mall/admin/banner`

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| GET | /list | — | `Result<List<BannerDTO>>` | All banners (no pagination, max 5 enforced at DB/service layer) |
| POST | (add) | `BannerDTO` (title, imageUrl, linkType, goodsId?, externalUrl?, sort?, status?) | `Result<Boolean>` | — |
| PUT | (update) | `BannerDTO` with id | `Result<Boolean>` | — |
| DELETE | /{id} | — | `Result<Boolean>` | — |
| PUT | /{id}/sort/{sort} | — | `Result<Boolean>` | Drag sort target |

**BannerDTO shape:**
```java
Long id;
String title;
String imageUrl;
Integer linkType;      // 1=goods, 2=external
Long goodsId;         // linkType=1
String externalUrl;    // linkType=2
Integer sort;
Integer status;
```

**Banner link validation (Backend enforced):**
- linkType=1 (goods): goodsId required, goodsType must be 1 (physical), tenant must match
- linkType=2 (external): externalUrl required
- Banner count: NOT enforced at DB level — frontend must enforce max 5

### AdminCategoryController — `/api/mall/admin/category`
Base path: `/api/mall/admin/category`

| Method | Path | Response | Notes |
|--------|------|----------|-------|
| GET | /list | `Result<List<AdminCategoryDTO>>` | Returns tree structure |
| POST | (add) | `Result<Boolean>` | — |
| PUT | (update) | `Result<Boolean>` | — |
| DELETE | /{id} | `Result<Boolean>` | — |
| PUT | /sort | `List<Long>` (ordered IDs) | `Result<Boolean>` | Bulk sort |

### AdminSpecController — `/api/mall/admin/spec`
Base path: `/api/mall/admin/spec`

| Method | Path | Request | Response | Notes |
|--------|------|---------|----------|-------|
| GET | /list | — | `Result<List<SpecDTO>>` | All specs with values |
| POST | (add spec) | `{specName}` | `Result<Long>` | — |
| POST | /value | `{specId, specValue}` | `Result<Long>` | Add value to spec |
| DELETE | /{id} | — | `Result<Boolean>` | Deletes spec + all values |
| DELETE | /value/{id} | — | `Result<Boolean>` | Deletes single value |

**SpecDTO shape:**
```java
Long id;
String specName;
List<SpecValueDTO> values;
```

---

## Frontend Architecture

### Recommended Project Structure (Phase 10 additions)
```
zlt-web/mall-admin-web/src/
├── layouts/BasicLayout.tsx          # Phase 8 — existing
├── pages/
│   ├── Dashboard/                  # Phase 8 — existing
│   ├── Goods/                      # ADMIN-02 (new)
│   │   ├── index.tsx               # ProTable list + toolbar
│   │   ├── components/
│   │   │   ├── GoodsModal.tsx      # Create/Edit Modal
│   │   │   ├── ImageUploader.tsx   # Multi-image uploader (drag-sortable)
│   │   │   └── SkuEditor.tsx       # Inline SKU/spec editor
│   │   └── services/goods.ts      # API calls
│   ├── Orders/                     # ADMIN-03 (new)
│   │   ├── index.tsx              # ProTable with tabs
│   │   ├── detail.tsx             # Order detail page
│   │   ├── components/
│   │   │   ├── PriceEditor.tsx    # Direct price input (D-07)
│   │   │   └── ShipModal.tsx      # Logistics input
│   │   └── services/orders.ts
│   ├── Coupons/                    # ADMIN-04 (new)
│   │   ├── index.tsx
│   │   ├── create.tsx             # Template form
│   │   ├── components/
│   │   │   └── IssueModal.tsx     # Issue to user (D-10)
│   │   └── services/coupons.ts
│   └── Banners/                   # ADMIN-10 (new)
│       ├── index.tsx
│       ├── components/
│       │   └── BannerCard.tsx     # With drag handle
│       └── services/banners.ts
├── stores/
│   └── useStore.ts                # Phase 8 Zustand — expand per module
└── config/
    └── api.ts                     # Expand with new endpoints
```

### Component Patterns Per Module

**Goods (ADMIN-02):**
- ProTable with `valueType: 'select'` for categoryId and status filters
- Toolbar: "Create Product" button + batch status buttons
- `columns` with `valueEnum` for status (0=下架/1=上架)
- Create/Edit: Single `Modal` (or `Drawer`) containing `ProForm` with:
  - Basic info fields
  - ImageUploader (max 5, drag-sortable via `@dnd-kit/sortable`)
  - Inline SkuEditor table for spec/stock management
  - Save triggers POST (create) or PUT (edit)

**Orders (ADMIN-03):**
- ProTable with `request` for tab-filtered queries
- Tabs: 全部 / 待付款 / 已付款 / 已发货 / 已完成 / 已取消
- Columns: orderNo, userId, statusDesc, totalAmount, payAmount, createTime
- Order detail: separate page route `/orders/detail/:id`
  - PriceEditor inline: `InputNumber` with `min={0}` and cost validation
  - ShipModal for logistics
  - CloseModal with reason select

**Coupons (ADMIN-04):**
- ProTable with status filter tabs (全部/发放中/已下架)
- Toolbar: "Create Coupon" button
- Create/Edit: Form page or Modal with fields per `MallCouponTemplate` entity
- IssueModal: User ID/phone input + "Send" button
- Generate claim link: Button that calls backend to generate one-time code

**Banners (ADMIN-10):**
- NOT a ProTable — use a drag-sortable list (e.g., `@dnd-kit/sortable` + `ArrayLayout` or antd `Table` with drag handle column)
- Each row: thumbnail, title, link info, sort number, status toggle
- Add banner: Modal with form
- Enforce max 5 banners at UI level

---

## Key Implementation Patterns

### ProTable + API Response Format

mall-center returns `Result<T>` where `.datas` or `.data` holds the payload. The Phase 8 request utility handles this. ProTable usage:

```typescript
// Source: Ant Design Pro Components docs
import { ProTable } from '@ant-design/pro-components';
import { request } from '@/utils/request';

const columns = [
  { title: '商品名称', dataIndex: 'name', copyable: true },
  {
    title: '状态',
    dataIndex: 'status',
    valueEnum: { 0: { text: '下架', status: 'Default' }, 1: { text: '上架', status: 'Success' } }
  },
  { title: '价格', dataIndex: 'price', valueType: 'money' },
];

<ProTable
  columns={columns}
  request={async (params) => {
    const response = await request('/api/mall/admin/goods/list', { params });
    return { data: response.datas.records, total: response.datas.total, success: true };
  }}
  rowKey="id"
  toolBarRender={() => [<Button key="create">新建商品</Button>]}
/>
```

**Key ProTable config for batch ops (D-02):**
```typescript
rowSelection={{
  selectedRowKeys,
  onChange: (keys) => setSelectedKeys(keys),
}}
search={{ filterType: 'query' }}
pagination={{ pageSize: 20, showSizeChanger: false }}
```

### Batch Operations Pattern

1. User selects rows via rowSelection
2. Toolbar buttons enable when `selectedRowKeys.length > 0`
3. Click triggers `Modal.confirm()` with selected count
4. On confirm, call `PUT /batch/status` with `{goodsIds: selectedKeys, status: targetStatus}`
5. On response, call `actionRef.current?.reload()` to refresh

### Image Upload Integration

The backend stores image URLs (hosted on file-center service). The frontend pattern:

1. Use `antd/upload` with `action` pointing to file-center upload endpoint
2. On success, receive `{ datas: { url: string } }` response
3. Maintain array of uploaded URLs in form state
4. For drag-sort: use `@dnd-kit/sortable` or `react-sortable-hoc` on the preview list
5. On form submit, send images as JSON string array: `["url1","url2","url3"]`

**Max 5 enforcement:** Validate before upload and show warning.

### Drag-Sortable Banner List (D-15)

Implementation approach:
1. Use `@dnd-kit/sortable` for drag-and-drop
2. Each banner item is a `SortableItem` wrapper
3. On drag end, extract new sorted array and call `PUT /{id}/sort/{sort}` for each item sequentially
4. Or batch: `PUT /banner/sort` with `{ids: [3,1,5,2,4]}` if backend supports batch

**Note:** AdminBannerController.updateSort is single-item (`id` + `sort` int). For drag-sort with 5 items, call sequentially or build batch update.

### Order Price Modification (D-07/D-09)

Pattern:
```typescript
// OrderDetailDTO contains items[]. Each item has goodsId and price.
// Frontend must fetch goods to get cost price for validation.
const handlePriceChange = async (newAmount: number, reason?: string) => {
  // D-09: Validate against cost price (no backend costPrice field)
  // Fetch the order's SKUs, look up their cost price
  const items = orderDetailDTO.items;
  // For each item: const goods = await getGoodsDetail(item.goodsId);
  // Check: newAmount >= sum(item.costPrice * item.quantity + freight)
  if (!validatePrice(newAmount, items)) {
    message.error('订单金额不能低于成本价');
    return;
  }
  // Call adjust with negative delta: adjustAmount = newAmount - currentPayAmount
  await request(`/api/mall/admin/order/${orderId}/adjust-amount`, {
    method: 'POST',
    data: { orderId, adjustAmount: newAmount - payAmount, reason }
  });
};
```

**D-09 cost price challenge:** No `costPrice` field in OrderDetailDTO or SkuDTO. Options:
1. [ASSUMED] Cost price may be in a hidden `MallGoods.costPrice` field not exposed in DTOs — need backend team to confirm
2. Frontend workaround: Store a local cost price map cached from goods detail, use it for UI validation only
3. Fallback: Remove frontend cost validation, rely solely on backend (which only rejects positive adjustAmount anyway)

### Virtual Goods Auto-Complete (ADMIN-03-07)

Backend behavior at `OrderServiceImpl.java:335`:
```java
if (order.getGoodsType() != null && order.getGoodsType() == 2) {
    order.setStatus(4); // 4=completed
    order.setCompleteTime(LocalDateTime.now());
    // Also generates delivery record for virtual goods
}
```

Triggered at payment confirmation. No frontend action needed for auto-complete. Admin can still view virtual order lifecycle.

---

## State Management

### Zustand Store Pattern (per D-09 from Phase 8)

Expand `useAdminStore` in `src/stores/useStore.ts`:

```typescript
// goods store slice
interface GoodsState {
  goodsList: AdminGoodsDTO[];
  loading: boolean;
  categoryTree: AdminCategoryDTO[];
  specList: SpecDTO[];
  fetchGoodsList: (params: any) => Promise<void>;
  publishGoods: (dto: AdminGoodsDTO) => Promise<void>;
  // ...
}

// orders store slice
interface OrderState {
  currentOrder: OrderDetailDTO | null;
  fetchOrderDetail: (id: number) => Promise<void>;
  adjustAmount: (orderId: number, amount: number, reason?: string) => Promise<void>;
  // ...
}

// coupons store slice
interface CouponState {
  templates: MallCouponTemplate[];
  fetchTemplates: (status?: number) => Promise<void>;
  // ...
}

// banners store slice
interface BannerState {
  banners: BannerDTO[];
  fetchBanners: () => Promise<void>;
  updateSort: (id: number, sort: number) => Promise<void>;
}
```

---

## Common Pitfalls

### Pitfall 1: AdminOrderController GET /list not fully implemented
**What goes wrong:** ProTable request to `/api/mall/admin/order/list` returns empty data.
**Why it happens:** The controller method body contains TODO comment and returns empty Page.
**How to avoid:** Check `IAdminOrderService` for actual `getOrderPage` implementation. May need backend fix before Phase 10 frontend work.
**Warning signs:** API response `datas.records = []` despite orders existing.

### Pitfall 2: Coupon issuance (ADMIN-04-05) has no backend
**What goes wrong:** Frontend issue-to-user feature cannot be implemented.
**Why it happens:** No endpoint in AdminCouponController for directed coupon issuance.
**How to avoid:** Do not plan tasks for ADMIN-04-05 until backend provides an API. Add to Open Questions.
**Warning signs:** Backend code review shows no `issue` or `send` method in AdminCouponController.

### Pitfall 3: Coupon statistics (ADMIN-04-06) has no backend
**What goes wrong:** Coupon usage stats tab/modal cannot show data.
**Why it happens:** No statistics aggregation endpoint for coupon templates.
**How to avoid:** Flag as blocked. Could implement frontend skeleton but no real data.

### Pitfall 4: Cost price validation has no backend support
**What goes wrong:** D-09 (no price below cost) cannot be properly enforced.
**Why it happens:** `costPrice` field does not exist in any DTO. Backend only checks adjustAmount is negative.
**How to avoid:** Add to Open Questions — either backend adds costPrice to DTO or frontend uses workaround (local cache or no validation).

### Pitfall 5: Banner images upload requires file-center
**What goes wrong:** Image uploads fail silently if file-center is not reachable.
**Why it happens:** `file-center` service must be running and accessible.
**How to avoid:** Verify file-center is included in docker-compose. Fallback: allow entering image URL manually.

### Pitfall 6: Batch sort for banners requires sequential calls
**What goes wrong:** Performance issue with 5 banners requiring 5 sequential PUT calls.
**Why it happens:** Backend `updateSort` is single-item; no batch endpoint.
**How to avoid:** Accept sequential calls for 5 items. If more items, suggest backend team add batch sort.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Page-based product edit | Modal/Drawer edit | Phase 10 decision | Stays on list page, better UX |
| Single image upload | Multi-image drag-sortable | Phase 10 decision | Better product showcase |
| Table row click to edit | Toolbar + Modal confirm for batch | Phase 10 decision | Clearer intent, reversible |
| Coupon claim via permanent code | Time-limited one-time code | Phase 10 decision | Fraud prevention |

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Table pagination | Custom pagination UI | ProTable built-in pagination | Handles page/size/search reset correctly |
| Batch status update | Individual API calls in loop | ProTable rowSelection + single batch API | Network efficiency, atomicity |
| Image drag-sort | Custom drag implementation | `@dnd-kit/sortable` or `react-sortable-hoc` | Tested, accessible, smooth |
| Status badge rendering | Manual Tag components | ProTable `valueEnum` + `valueType: 'select'` | Consistent with ProTable ecosystem |
| Form validation | ad-hoc JS validation | Ant Design `Form` + `rules` | Built-in error display, submit blocking |
| Date range filtering | Custom picker components | Ant Design `DatePicker.RangePicker` wired to ProTable | Built-in ProTable sync |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | AdminGoodsController GET /list returns IPage<AdminGoodsDTO> with total/timestamp standard format | Backend API Analysis | If format differs, ProTable request handler needs adjustment |
| A2 | Virtual goods auto-complete triggers at payment webhook in OrderServiceImpl | Backend API Analysis | ADMIN-03-07 may need manual trigger if webhook not wired |
| A3 | file-center service hosts image storage and returns URL on upload | Frontend Architecture | If file-center is different, ImageUploader component needs different API |
| A4 | Cost price stored in MallGoods but not exposed in DTO | Common Pitfalls | Frontend workaround may be unnecessary if backend adds costPrice to DTO |

---

## Open Questions

1. **Coupon issuance API (ADMIN-04-05):** Does backend plan to add an `/api/mall/admin/coupon/template/{id}/issue` endpoint? Without this, the "manual issue to specific user" feature cannot be built.

2. **Coupon statistics API (ADMIN-04-06):** Does backend have a separate statistics service for coupon metrics? Could reuse MallCouponTemplate.remainCount / MallUserCoupon usage tracking.

3. **Claim link generation (D-11):** Backend CouponController.claimCoupon uses template ID directly. Where does the one-time code / time-limited link fit? Need design + backend implementation.

4. **Cost price field:** Is `costPrice` stored anywhere accessible? Backend team to confirm if it exists and can be added to DTOs for D-09 frontend validation.

5. **AdminOrderController GET /list:** Is the pagination implementation complete? Controller has TODO comment. Verify before Phase 10 order list implementation.

---

## Environment Availability

Step 2.6: SKIPPED — Phase 10 is primarily frontend work against existing mall-center backend. No new external dependencies beyond existing mall-admin-web package.json dependencies.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (via umi test) |
| Config file | jest.config.js (if exists) or umi test |
| Quick run command | `cd zlt-web/mall-admin-web && npm test -- --passWithNoTests` |
| Full suite command | `cd zlt-web/mall-admin-web && npm run build` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMIN-02-04 | Product list loads with ProTable | smoke | Load page, check table renders | `src/pages/Goods/index.tsx` will be created |
| ADMIN-02-05/06 | Batch publish/unpublish sends correct payload | unit | `jest --testPathPattern=Goods` | TBD |
| ADMIN-03-03 | Price edit calls adjust-amount with negative delta | unit | `jest --testPathPattern=Orders` | TBD |
| ADMIN-10 | Banner list is drag-sortable | manual | Browser drag test | TBD |

### Wave 0 Gaps
- [ ] `src/pages/Goods/__tests__/index.test.tsx` — ProTable smoke
- [ ] `src/pages/Orders/__tests__/index.test.tsx` — Order list smoke
- [ ] `src/pages/Coupons/__tests__/index.test.tsx` — Coupon list smoke
- [ ] `src/pages/Banners/__tests__/index.test.tsx` — Banner list smoke
- [ ] `jest.config.js` — if not already in project

*(If no gaps: "None — existing test infrastructure covers all phase requirements")*

---

## Sources

### Primary (HIGH confidence)
- `zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminGoodsController.java` — verified endpoints and DTO
- `zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminOrderController.java` — verified endpoints, noted TODO on list
- `zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminBannerController.java` — verified endpoints
- `zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminCouponController.java` — verified endpoints, noted missing issuance
- `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/AdminGoodsDTO.java` — verified fields
- `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/BannerDTO.java` — verified fields
- `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/OrderDetailDTO.java` — verified fields, noted missing costPrice
- `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/OrderServiceImpl.java:335` — verified virtual auto-complete

### Secondary (MEDIUM confidence)
- `zlt-web/mall-admin-web/package.json` — confirmed ProTable 2.8.7, zustand 4.5.0, antd 4.24.8
- `zlt-web/mall-admin-web/.umirc.ts` — confirmed proxy config
- `.planning/phases/08-Admin基础框架与小程序首页商品/08-ADMIN-01-PLAN.md` — confirmed Dashboard patterns to replicate

### Tertiary (LOW confidence)
- [ASSUMED] file-center upload response format `{ datas: { url: string } }` — needs verification
- [ASSUMED] `@dnd-kit/sortable` is the best choice for drag-sort — not verified against project constraints

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — based on verified Phase 8 code and existing package.json
- Architecture: MEDIUM — patterns confirmed for ProTable, but some gaps (coupon issuance) require backend
- Pitfalls: MEDIUM — key gaps identified (order list TODO, coupon issuance missing)

**Research date:** 2026-05-09
**Valid until:** 2026-06-08 (30 days — stable backend APIs, frontend patterns well-established)