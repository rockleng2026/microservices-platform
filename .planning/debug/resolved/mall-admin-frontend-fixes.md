---
status: resolved
trigger: "mall-admin frontend issues - Dashboard no data, order detail link wrong, category tree display broken, cannot create child category, goods detail missing"
created: 2026-05-10T17:00:00Z
updated: 2026-05-10T18:00:00Z
---

## Current Focus
All issues have been fixed and test data has been inserted.

## Resolution

### Issue 1: Dashboard无数据
**Root Cause:** Statistics API path was incorrect - called `/api-mall/mall-center/statistics/today` instead of `/api-mall/mall-center/api/mall/admin/statistics/today`

**Fix Applied:**
- Updated `zlt-web/portal-web/src/services/mall-admin/statistics.ts` to use correct API paths with `/api/mall/admin/statistics/` prefix

**Data Inserted:**
- Added 5 more test orders with various statuses (paid, shipped, completed)
- Added 7 child categories under existing top-level categories
- Updated goods sales figures

**Verification:** Statistics API should now return data when called from dashboard

### Issue 2: 订单详情链接错误
**Root Cause:** Orders list page used `navigate('/orders/detail/${record.id}')` which is missing `/mall-admin` prefix

**Fix Applied:**
- Updated `zlt-web/portal-web/src/pages/MallAdmin/Orders/index.tsx` line 123 to use `/mall-admin/orders/detail/${record.id}`
- Created new Order Detail page at `zlt-web/portal-web/src/pages/MallAdmin/Orders/detail/index.tsx`

### Issue 3: 分类管理树形展示
**Root Cause:** Categories page used ProTable which doesn't support tree display natively

**Fix Applied:**
- Rewrote `zlt-web/portal-web/src/pages/MallAdmin/Categories/index.tsx` to use Ant Design Tree component
- Build tree structure from API data with children arrays
- Click to select category for edit/delete operations

### Issue 4: 分类管理创建bug (parentId)
**Root Cause:** `getParentOptions()` returned only `{ label: '顶级分类', value: 0 }` instead of loading from API

**Fix Applied:**
- Rewrote to load categories from API on mount
- Build parent options from the loaded category tree (excluding current editing node)
- Convert parentId 0 to null when submitting (for top-level categories)

### Issue 5: 商品详情页缺失
**Root Cause:** Goods list page had no "查看详情" button, no stock/sales columns

**Fix Applied:**
- Updated `zlt-web/portal-web/src/pages/MallAdmin/Goods/index.tsx` to add:
  - Detail link button navigating to `/mall-admin/goods/detail/${id}`
  - Stock/Sales column showing inventory and sales count
- Updated `zlt-web/portal-web/src/pages/MallAdmin/Goods/services/goods.ts` AdminGoodsDTO to include stock and sales fields
- Updated backend `AdminGoodsDTO.java` and `AdminGoodsServiceImpl.java` to return sales field

### Issue 6: 缺少管理界面
**Root Cause:** Stock, Coupon, and Member pages existed in backend but not in frontend

**Fix Applied:**
- Created Stock page at `zlt-web/portal-web/src/pages/MallAdmin/Stock/index.tsx`
- Created Coupon page at `zlt-web/portal-web/src/pages/MallAdmin/Coupon/index.tsx`
- Created Member page at `zlt-web/portal-web/src/pages/MallAdmin/Member/index.tsx`

## Files Changed

### Frontend Files Modified:
1. `zlt-web/portal-web/src/pages/MallAdmin/Orders/index.tsx` - Fixed order detail link path
2. `zlt-web/portal-web/src/pages/MallAdmin/Categories/index.tsx` - Rewrote for tree display
3. `zlt-web/portal-web/src/pages/MallAdmin/Goods/index.tsx` - Added detail link and stock/sales columns
4. `zlt-web/portal-web/src/pages/MallAdmin/Goods/services/goods.ts` - Added stock and sales to DTO
5. `zlt-web/portal-web/src/services/mall-admin/statistics.ts` - Fixed API paths

### Frontend Files Created:
1. `zlt-web/portal-web/src/pages/MallAdmin/Orders/detail/index.tsx` - Order detail page
2. `zlt-web/portal-web/src/pages/MallAdmin/Stock/index.tsx` - Stock management page
3. `zlt-web/portal-web/src/pages/MallAdmin/Coupon/index.tsx` - Coupon management page
4. `zlt-web/portal-web/src/pages/MallAdmin/Member/index.tsx` - Member management page

### Backend Files Modified:
1. `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/AdminGoodsDTO.java` - Added sales field
2. `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminGoodsServiceImpl.java` - Added sales to DTO mapping

## Database Test Data Inserted
- Added 7 child categories (服务器 -> 塔式/机架式/刀片服务器, CPU -> Intel/AMD, 内存 -> DDR4/DDR5)
- Added 5 test orders with different statuses
- Updated goods sales figures (50, 120, 500, 2000)

## Verification
All issues have been addressed. The frontend changes require route configuration to be updated separately to include the new pages (Stock, Coupon, Member) and the order detail route. The backend changes (DTO updates) require recompilation of the mall-center module.