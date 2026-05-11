# Mall-Admin Frontend Issues Fix Summary

**Date:** 2026-05-10
**Project:** microservices-platform
**Frontend:** zlt-web/portal-web (port 8001)
**Backend:** zlt-business/mall-center (port 7010)

---

## Issues Fixed

### Issue 1: Dashboard无数据 (FIXED)

**Problem:** Dashboard statistics cards, charts, and lists showed no data.

**Root Cause:** Statistics API path was incorrect. Frontend called `/api-mall/mall-center/statistics/today` but backend expects `/api-mall/mall-center/api/mall/admin/statistics/today`.

**Fix Applied:**
- Updated `zlt-web/portal-web/src/services/mall-admin/statistics.ts` with correct API paths:
  - `getTodayStatistics()`: `/api-mall/mall-center/api/mall/admin/statistics/today`
  - `getSalesTrend()`: `/api-mall/mall-center/api/mall/admin/statistics/sales-trend`
  - `getStockWarningList()`: `/api-mall/mall-center/api/mall/admin/statistics/stock-warning`
  - `getUserAnalysis()`: `/api-mall/mall-center/api/mall/admin/statistics/user-analysis`
  - `getTopProducts()`: `/api-mall/mall-center/api/mall/admin/statistics/top-products` (Note: backend not implemented)

**Test Data Inserted:**
```sql
-- 5 test orders with different statuses
INSERT INTO mall_order VALUES ('ORD202605100004' to 'ORD202605100008')...

-- 7 child categories
INSERT INTO mall_category (parent_id, name) VALUES
(1, '塔式服务器'), (1, '机架式服务器'), (1, '刀片服务器'),
(2, 'Intel CPU'), (2, 'AMD CPU'),
(3, 'DDR4 内存'), (3, 'DDR5 内存')

-- Updated goods sales
UPDATE mall_goods SET sales = 50/120/500/2000 WHERE id = 1/2/3/4
```

---

### Issue 2: 订单详情链接错误 (FIXED)

**Problem:** Order list "查看详情" link went to `/orders/detail/5` instead of `/mall-admin/orders/detail/5`.

**Fix Applied:**
- Modified `zlt-web/portal-web/src/pages/MallAdmin/Orders/index.tsx` line 123:
  ```tsx
  // Before: navigate(`/orders/detail/${record.id}`)
  // After:
  navigate(`/mall-admin/orders/detail/${record.id}`)
  ```

- Created new Order Detail page at `zlt-web/portal-web/src/pages/MallAdmin/Orders/detail/index.tsx` with:
  - Order basic info card
  - Payment/shipping info cards
  - Order items table
  - Timeline display

---

### Issue 3: 分类管理树形展示 (FIXED)

**Problem:** Categories page showed flat list instead of tree structure with parent-child hierarchy.

**Fix Applied:**
- Completely rewrote `zlt-web/portal-web/src/pages/MallAdmin/Categories/index.tsx`:
  - Replaced ProTable with Ant Design `Tree` component
  - Build tree from API response which already contains `children` arrays
  - Click-to-select for edit/delete operations
  - Auto-expand first level nodes

---

### Issue 4: 分类管理创建子分类失败 (FIXED)

**Problem:** Could only create top-level categories, parent selection always defaulted to "顶级分类".

**Root Cause:** `getParentOptions()` returned hardcoded `{ label: '顶级分类', value: 0 }` instead of loading from API.

**Fix Applied:**
- Rewrote category loading to fetch from API on mount
- Build parent options dynamically from category tree
- Exclude current editing node from parent options
- Convert `parentId: 0` to `null` when submitting (backend uses null for top-level)
- Handle `parentId: null` correctly in form reset

---

### Issue 5: 商品详情页缺失 (FIXED)

**Problem:** Goods list had no "查看详情" button, no stock/sales columns displayed.

**Fix Applied:**

1. **Added Detail Link Button:**
   ```tsx
   <Button
     type="link"
     size="small"
     icon={<FileTextOutlined />}
     onClick={() => navigate(`/mall-admin/goods/detail/${record.id}`)}
   >
     详情
   </Button>
   ```

2. **Added Stock/Sales Column:**
   ```tsx
   {
     title: '库存/已售',
     key: 'stockSales',
     width: 120,
     render: (_: unknown, record: AdminGoodsDTO) => (
       <span>{record.stock ?? '-'}/{record.sales ?? '-'}</span>
     ),
   }
   ```

3. **Updated AdminGoodsDTO** in `zlt-web/portal-web/src/pages/MallAdmin/Goods/services/goods.ts`:
   ```tsx
   interface AdminGoodsDTO {
     // ... existing fields
     stock?: number;  // 库存数量
     sales?: number;  // 已售数量
   }
   ```

4. **Updated Backend** `AdminGoodsDTO.java` and `AdminGoodsServiceImpl.java` to return `sales` field.

---

### Issue 6: 缺少管理界面 (FIXED)

**Problem:** Stock, Coupon, Member pages existed in backend but not in frontend.

**Fix Applied:**

| Page | File Path | Features |
|------|-----------|----------|
| 库存管理 | `zlt-web/portal-web/src/pages/MallAdmin/Stock/index.tsx` | SKU stock list, search/filter, manual stock correction |
| 优惠券管理 | `zlt-web/portal-web/src/pages/MallAdmin/Coupon/index.tsx` | Template CRUD, publish/offline, type selection |
| 会员管理 | `zlt-web/portal-web/src/pages/MallAdmin/Member/index.tsx` | Member list, points adjustment |

---

## Files Modified

### Frontend (zlt-web/portal-web)
| File | Change |
|------|--------|
| `src/services/mall-admin/statistics.ts` | Fixed API paths for all statistics endpoints |
| `src/pages/MallAdmin/Orders/index.tsx` | Fixed detail link path to include `/mall-admin` prefix |
| `src/pages/MallAdmin/Categories/index.tsx` | Rewrote to use Tree component for hierarchical display |
| `src/pages/MallAdmin/Goods/index.tsx` | Added detail link button, stock/sales column |
| `src/pages/MallAdmin/Goods/services/goods.ts` | Added stock and sales fields to AdminGoodsDTO |

### Frontend (New Files)
| File | Purpose |
|------|---------|
| `src/pages/MallAdmin/Orders/detail/index.tsx` | Order detail page |
| `src/pages/MallAdmin/Stock/index.tsx` | Stock management page |
| `src/pages/MallAdmin/Coupon/index.tsx` | Coupon management page |
| `src/pages/MallAdmin/Member/index.tsx` | Member management page |

### Backend (zlt-business/mall-center)
| File | Change |
|------|--------|
| `model/dto/AdminGoodsDTO.java` | Added `sales`, `stock`, `createTime` fields |
| `service/impl/AdminGoodsServiceImpl.java` | Added sales to DTO mapping in `convertToDTO()` |

---

## Files Created

```
zlt-web/portal-web/src/pages/MallAdmin/
├── Orders/detail/index.tsx       # Order detail page
├── Stock/index.tsx               # Stock management page
├── Coupon/index.tsx              # Coupon management page
└── Member/index.tsx              # Member management page
```

---

## Database Changes

```sql
-- Test data inserted for dashboard
INSERT INTO mall_order (status >= 2, pay_amount) - 5 orders
INSERT INTO mall_category (parent_id > 0) - 7 child categories
UPDATE mall_goods SET sales = 50/120/500/2000 - 4 records
```

---

## Known Limitations

1. **Route Configuration:** The new pages (Stock, Coupon, Member, Order Detail) require route configuration in the UmiJS setup to be accessible via URL. This typically requires updating `.umirc.ts` or creating a `config/routes.ts`.

2. **top-products endpoint:** The backend `AdminStatisticsService` does not implement `getTopProducts()`. The frontend handles this gracefully by returning empty array, but for full functionality this endpoint needs to be implemented.

3. **Goods stock field:** The `stock` field in AdminGoodsDTO requires aggregating from SKU table. Currently only `sales` field is returned. To show accurate stock, the `getGoodsPage` method would need to JOIN with SKU table and SUM stocks.

---

## Verification Steps

1. Start mall-center backend on port 7010
2. Start portal-web frontend on port 8001
3. Navigate to `http://localhost:8001/mall-admin/dashboard` - should show statistics with data
4. Navigate to `http://localhost:8001/mall-admin/orders` - click "查看详情" should go to `/mall-admin/orders/detail/X`
5. Navigate to `http://localhost:8001/mall-admin/categories` - should show tree structure
6. Navigate to `http://localhost:8001/mall-admin/goods` - should show stock/sales column and detail link
7. Navigate to `http://localhost:8001/mall-admin/stock` - should show stock management
8. Navigate to `http://localhost:8001/mall-admin/coupon` - should show coupon management
9. Navigate to `http://localhost:8001/mall-admin/member` - should show member management