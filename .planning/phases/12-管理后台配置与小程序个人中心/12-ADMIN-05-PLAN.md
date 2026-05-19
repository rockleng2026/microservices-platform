---
phase: 12
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - zlt-web/portal-web/src/pages/MallAdmin/Promotion/index.tsx
  - zlt-web/portal-web/src/pages/MallAdmin/Promotion/components/PromotionTable.tsx
  - zlt-web/portal-web/src/pages/MallAdmin/Promotion/components/PromotionModal.tsx
  - zlt-web/portal-web/src/pages/MallAdmin/Promotion/components/PointsModal.tsx
  - zlt-web/portal-web/src/services/mall-admin/promotion.ts
  - zlt-web/portal-web/src/stores/mallAdminStore.ts
autonomous: true
requirements:
  - ADMIN-05-01
  - ADMIN-05-02
  - ADMIN-05-03
  - ADMIN-05-04
  - ADMIN-05-05
  - ADMIN-05-06

must_haves:
  truths:
    - "Admin can create/edit/delete promotion activities"
    - "Admin can view paginated promotion list with status filter"
    - "Admin can enable or disable promotions"
    - "Admin can view and adjust member points balance"
  artifacts:
    - path: "zlt-web/portal-web/src/pages/MallAdmin/Promotion/index.tsx"
      provides: "Promotion management page with CRUD operations"
    - path: "zlt-web/portal-web/src/services/mall-admin/promotion.ts"
      provides: "Promotion API service layer"
      exports: ["getPromotionList", "createPromotion", "updatePromotion", "deletePromotion", "togglePromotion", "getPointsRules", "adjustPoints"]
  key_links:
    - from: "zlt-web/portal-web/src/pages/MallAdmin/Promotion/index.tsx"
      to: "/api-mall/api/mall/marketing/promotions"
      via: "promotion.ts service"
    - from: "zlt-web/portal-web/src/pages/MallAdmin/Promotion/index.tsx"
      to: "/api-mall/api/mall/member/points"
      via: "promotion.ts service"
---

<objective>
Implement ADMIN-05 Promotion Management page for admin portal.

Purpose: Provide admin interface to manage promotional activities (discounts, gifts, bundles) and member points.
Output: Promotion management page with full CRUD, status filtering, enable/disable, and points management.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@zlt-web/portal-web/src/pages/MallAdmin/Dashboard/index.tsx
@zlt-web/portal-web/src/pages/MallAdmin/Coupon/index.tsx
@zlt-web/portal-web/src/services/mall-admin/statistics.ts
@zlt-business/mall-center/src/main/java/com/central/mall/service/IMarketingService.java
</context>

<interfaces>
<!-- Key types and contracts the executor needs. Extracted from codebase. -->

From zlt-web/portal-web/src/stores/mallAdminStore.ts:
```typescript
interface MallAdminStore {
  // Statistics state
  statistics: any;
  salesTrend: any[];
  stockWarnings: any[];
  userAnalysis: any;
  loading: boolean;
  fetchStatistics: () => Promise<void>;
  fetchSalesTrend: (type: 'day' | 'week' | 'month') => Promise<void>;
}
```

From mall-center IMarketingService.java:
```java
// Promotion methods available:
Result<?> getActivePromotions();
BigDecimal calculatePromotionDiscount(Long activityId, BigDecimal orderAmount);

// Member/Points methods:
Result<?> getMemberInfo(Long userId);
Result<?> getPointsLog(Long userId, Map<String, Object> pageDTO);
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Create promotion service and store additions</name>
  <files>
    zlt-web/portal-web/src/services/mall-admin/promotion.ts
    zlt-web/portal-web/src/stores/mallAdminStore.ts
  </files>
  <action>
Create `zlt-web/portal-web/src/services/mall-admin/promotion.ts` with:
- `getPromotionList(params)`: GET /api-mall/api/mall/marketing/promotions (paginated, filter by status)
- `createPromotion(data)`: POST /api-mall/api/mall/marketing/promotions
- `updatePromotion(id, data)`: PUT /api-mall/api/mall/marketing/promotions/{id}
- `deletePromotion(id)`: DELETE /api-mall/api/mall/marketing/promotions/{id}
- `togglePromotion(id, enabled)`: PUT /api-mall/api/mall/marketing/promotions/{id}/toggle
- `getPointsRules()`: GET /api-mall/api/mall/member/points-rules
- `adjustPoints(userId, points, reason)`: POST /api-mall/api/mall/member/points/adjust

Add to `mallAdminStore.ts`:
- `promotions`, `promotionLoading`, `promotionStats` state
- `fetchPromotions(params)`, `createPromotion(data)`, `updatePromotion(id, data)`, `deletePromotion(id)`, `togglePromotion(id, enabled)`
- `fetchPointsRules()`, `adjustPoints(userId, points, reason)`
</action>
  <verify>
    <automated>grep -c "getPromotionList\|createPromotion\|togglePromotion\|adjustPoints" zlt-web/portal-web/src/services/mall-admin/promotion.ts</automated>
  </verify>
  <done>Promotion service and store methods exist and export correctly</done>
</task>

<task type="auto">
  <name>Task 2: Create promotion page components</name>
  <files>
    zlt-web/portal-web/src/pages/MallAdmin/Promotion/index.tsx
    zlt-web/portal-web/src/pages/MallAdmin/Promotion/components/PromotionTable.tsx
    zlt-web/portal-web/src/pages/MallAdmin/Promotion/components/PromotionModal.tsx
    zlt-web/portal-web/src/pages/MallAdmin/Promotion/components/PointsModal.tsx
  </files>
  <action>
Create `zlt-web/portal-web/src/pages/MallAdmin/Promotion/index.tsx`:
- Page title: "促销管理"
- Tabs: "促销活动" | "会员积分"
- Use ProTable for promotion list (ADMIN-05-04)
- Filter by status: 全部/启用/禁用/已过期
- Action buttons: 新建活动, 刷新
- Enable/disable toggle per row (ADMIN-05-05)
- Edit/Delete actions per row (ADMIN-05-02, ADMIN-05-03)

Create `PromotionTable.tsx`:
- Columns: 活动名称, 类型(discount/gift/bundle), 开始时间, 结束时间, 状态, 操作
- Status badges: 启用(green)/禁用(gray)/已过期(red)
- Row actions: 编辑, 删除, 启用/禁用 toggle

Create `PromotionModal.tsx`:
- Form fields: 活动名称, 类型(select), 开始时间, 结束时间, 适用商品, 规则配置(JSON)
- Support create (ADMIN-05-01) and edit (ADMIN-05-02)
- Validation: name required, dates required, type required

Create `PointsModal.tsx`:
- Fields: 用户ID/手机号, 调整积分数量(+/-), 操作原因
- Shows current points balance before adjustment (ADMIN-05-06)
- Submit calls adjustPoints API
</action>
  <verify>
    <automated>grep -c "ProTable\|Modal\|Form\|DatePicker" zlt-web/portal-web/src/pages/MallAdmin/Promotion/index.tsx</automated>
  </verify>
  <done>Promotion page with table, create/edit modal, points modal complete</done>
</task>

<task type="auto">
  <name>Task 3: Register route and menu</name>
  <files>
    zlt-web/portal-web/src/pages/MallAdmin/Promotion/index.tsx
    zlt-web/portal-web/src/router/index.tsx
  </files>
  <action>
Add route for `/mall-admin/promotion` in the router config to load Promotion page component.

Add menu item in mall-admin layout sidebar:
- path: /mall-admin/promotion
- name: 促销管理
- icon: GiftOutlined
</action>
  <verify>
    <automated>grep -c "Promotion\|/mall-admin/promotion" zlt-web/portal-web/src/router/index.tsx</automated>
  </verify>
  <done>Route registered, menu item visible in sidebar</done>
</task>

</tasks>

<verification>
- Promotion page accessible at /mall-admin/promotion
- ProTable loads promotion list with status filter
- Create button opens modal, form submits successfully
- Edit opens modal with existing data
- Delete shows confirmation, removes item on confirm
- Enable/Disable toggle updates status
- Points tab shows member points management
</verification>

<success_criteria>
- Admin can create a new promotion with name, type, dates, rules (ADMIN-05-01)
- Admin can edit existing promotion (ADMIN-05-02)
- Admin can delete a promotion (ADMIN-05-03)
- Admin can view paginated promotion list with status filter (ADMIN-05-04)
- Admin can enable or disable a promotion (ADMIN-05-05)
- Admin can view points rules and adjust user points (ADMIN-05-06)
</success_criteria>

<output>
After completion, create `.planning/phases/12-管理后台配置与小程序个人中心/12-ADMIN-05-SUMMARY.md`
</output>