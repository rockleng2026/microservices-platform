---
phase: "10"
plan: "ADMIN-04"
type: execute
wave: 1
depends_on: []
files_modified:
  - zlt-web/mall-admin-web/src/pages/Coupons/index.tsx
  - zlt-web/mall-admin-web/src/pages/Coupons/create.tsx
  - zlt-web/mall-admin-web/src/pages/Coupons/components/IssueModal.tsx
  - zlt-web/mall-admin-web/src/pages/Coupons/services/coupons.ts
  - zlt-web/mall-admin-web/src/stores/useStore.ts
  - zlt-web/mall-admin-web/src/config/api.ts
autonomous: true
requirements:
  - ADMIN-04-01
  - ADMIN-04-02
  - ADMIN-04-03
  - ADMIN-04-04
  - ADMIN-04-05
  - ADMIN-04-06
  - ADMIN-04-07
user_setup: []
must_haves:
  truths:
    - "Admin can view coupon template list with status filter tabs"
    - "Admin can create a new coupon with name, type, discount, validity period, and limits"
    - "Admin can edit an existing coupon template"
    - "Admin can publish or take a coupon offline"
    - "Admin can manually expire a coupon before its validity end date"
    - "Admin can issue a coupon to specific user (BLOCKED: no backend API, skeleton UI only)"
    - "Admin can view coupon usage statistics (BLOCKED: no backend API, skeleton UI only)"
  artifacts:
    - path: "zlt-web/mall-admin-web/src/pages/Coupons/index.tsx"
      provides: "Coupon ProTable list with status tabs, publish/offline, blocked issue/stat buttons"
      min_lines: 200
    - path: "zlt-web/mall-admin-web/src/pages/Coupons/create.tsx"
      provides: "Coupon create/edit form with all template fields"
      min_lines: 200
    - path: "zlt-web/mall-admin-web/src/pages/Coupons/components/IssueModal.tsx"
      provides: "Issue to user Modal (BLOCKED skeleton — no backend API)"
      min_lines: 50
    - path: "zlt-web/mall-admin-web/src/pages/Coupons/components/StatisticsModal.tsx"
      provides: "Statistics Modal (BLOCKED skeleton — no backend API)"
      min_lines: 50
    - path: "zlt-web/mall-admin-web/src/pages/Coupons/services/coupons.ts"
      provides: "Coupon API service layer"
      min_lines: 80
  key_links:
    - from: "zlt-web/mall-admin-web/src/pages/Coupons/index.tsx"
      to: "zlt-web/mall-admin-web/src/pages/Coupons/create.tsx"
      via: "navigate to /coupons/create or /coupons/edit/:id"
    - from: "zlt-web/mall-admin-web/src/pages/Coupons/index.tsx"
      to: "/api/mall/admin/coupon/template/{id}/publish"
      via: "POST to publish coupon"
    - from: "zlt-web/mall-admin-web/src/pages/Coupons/index.tsx"
      to: "/api/mall/admin/coupon/template/{id}/offline"
      via: "POST to take coupon offline"
---

<objective>
实现优惠券管理模块（ADMIN-04）：ProTable 优惠券列表、新建/编辑优惠券、发布/下架、手动发放给用户（BLOCKED）、统计（BLOCKED）、提前失效。

Purpose: 为商城系统提供优惠券管理功能，满足 ADMIN-04-01~07 共7个需求。
Output: 优惠券列表页、优惠券创建/编辑表单、发布/下架功能、手动发放UI骨架、统计UI骨架、提前失效功能。
</objective>

<context>
@.planning/REQUIREMENTS.md (ADMIN-04 requirements)
@.planning/phases/10-管理后台核心模块/10-RESEARCH.md (Backend API analysis for AdminCouponController)
@.planning/phases/10-管理后台核心模块/10-CONTEXT.md
@zlt-web/mall-admin-web/src/pages/Dashboard/index.tsx (ProTable 模式参考)

# Locked Decisions (MUST implement)
- D-10: 优惠券发放：手动发放 + 生成领取链接/码 两种都支持
- D-11: 领取链接：限时一次性码（时间限制）
- D-12: 优惠券状态变化：站内信通知

# CRITICAL BLOCKERS
- ADMIN-04-05 (issue coupon to user): **NO backend API exists** — implement skeleton UI only
- ADMIN-04-06 (coupon statistics): **NO backend API exists** — implement skeleton UI only
- Claim link generation (D-11): **NO backend API exists** — blocked until backend implements
</context>

<interfaces>
<!-- Key types from mall-center backend (per RESEARCH.md) -->

MallCouponTemplate (from GET /api/mall/admin/coupon/template/list):
```typescript
interface MallCouponTemplate {
  id: Long;
  name: string;
  type: Integer;          // 1=满减券, 2=折扣券
  faceValue: BigDecimal;  // type=1: 减免金额（元）
  discountRate: BigDecimal; // type=2: 折扣率（8折=0.8）
  minAmount: BigDecimal;
  maxDiscount: BigDecimal; // type=2时最高优惠
  totalCount: Integer;
  remainCount: Integer;
  perUserLimit: Integer;
  validType: Integer;     // 1=固定时间, 2=领券后N天
  startTime: LocalDateTime;
  endTime: LocalDateTime;
  validDays: Integer;     // validType=2时有效
  status: Integer;        // 0=下架, 1=发放中, 2=已过期
  createTime: LocalDateTime;
}
```

Coupon template create/update params (POST /template, PUT /template/{id}):
```json
{
  "name": "string",
  "type": 1|2,           // 1=满减券, 2=折扣券
  "faceValue": "100.00", // type=1
  "discountRate": "0.8", // type=2
  "minAmount": "200.00",
  "maxDiscount": "50.00",
  "totalCount": 1000,
  "perUserLimit": 1,
  "validType": 1|2,
  "startTime": "2026-05-01T00:00:00",
  "endTime": "2026-05-31T23:59:59",
  "validDays": 7
}
```

# BLOCKERS — NO Backend API
1. Issue to user (ADMIN-04-05): No endpoint like POST /coupon/template/{id}/issue
2. Coupon statistics (ADMIN-04-06): No statistics aggregation endpoint
3. Claim link generation (D-11): No time-limited claim code endpoint
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: 优惠券列表页（ADMIN-04-04）</name>
  <files>zlt-web/mall-admin-web/src/pages/Coupons/index.tsx, zlt-web/mall-admin-web/src/pages/Coupons/services/coupons.ts</files>
  <action>
    创建优惠券列表页（ProTable + 状态Tab筛选）：

    1. src/pages/Coupons/services/coupons.ts（API 服务层）：
       - GET /api/mall/admin/coupon/template/list (status?)
         返回: MallCouponTemplate[] （注意：后端无分页）
       - POST /api/mall/admin/coupon/template 接受 coupon params
       - PUT /api/mall/admin/coupon/template/{id} 接受 coupon params
       - POST /api/mall/admin/coupon/template/{id}/publish （无请求体）
       - POST /api/mall/admin/coupon/template/{id}/offline （无请求体）
       - DELETE /api/mall/admin/coupon/template/{id} （未确认是否有此 endpoint）

    2. src/pages/Coupons/index.tsx（优惠券列表页）：
       - 使用 antd Tabs 组件实现状态筛选：
         - 全部（不传 status）
         - 发放中（status=1）
         - 已下架（status=0）
         - 已过期（status=2）
       - ProTable columns:
         - name (优惠券名称)
         - type (类型：满减券/折扣券，valueEnum: {1: '满减券', 2: '折扣券'})
         - faceValue / discountRate (面值/折扣率)
         - minAmount (最低消费)
         - totalCount (总数量)
         - remainCount (剩余数量)
         - perUserLimit (每人限领)
         - validType (有效类型: 固定时间/领券后N天)
         - status (状态，valueEnum: {0: {text: '下架', status: 'Default'}, 1: {text: '发放中', status: 'Success'}, 2: {text: '已过期', status: 'Error'}})
         - createTime (创建时间)
       - 工具栏：
         - "创建优惠券" 按钮 → navigate to /coupons/create
       - 行操作：
         - "编辑" 按钮 → navigate to /coupons/edit/:id
         - "发布" 按钮（status=0 时显示）→ POST /publish
         - "下架" 按钮（status=1 时显示）→ POST /offline
         - "提前失效" 按钮（status=1 时显示）→ POST /offline（复用）
         - "发放" 按钮（ADMIN-04-05）→ 打开 IssueModal（BLOCKED: no API）
         - "统计" 按钮（ADMIN-04-06）→ 打开 StatisticsModal（BLOCKED: no API）
         - "生成链接" 按钮（D-11）→ 生成领取链接（BLOCKED: no API）
       - rowKey="id"
  </action>
  <verify>
    <automated>grep -l "MallCouponTemplate" zlt-web/mall-admin-web/src/pages/Coupons/services/coupons.ts && grep -c "Tabs" zlt-web/mall-admin-web/src/pages/Coupons/index.tsx</automated>
  </verify>
  <done>优惠券列表页完成，支持状态Tab筛选和操作按钮，ADMIN-04-04 满足</done>
</task>

<task type="auto">
  <name>Task 2: 创建/编辑优惠券表单（ADMIN-04-01, ADMIN-04-02）</name>
  <files>zlt-web/mall-admin-web/src/pages/Coupons/create.tsx</files>
  <action>
    创建优惠券创建/编辑页面：

    1. src/pages/Coupons/create.tsx：
       - 路由：/coupons/create（新建）、/coupons/edit/:id（编辑，id 存在则加载数据）
       - 使用 antd Form + InputNumber + DatePicker + Radio
       - 表单字段：
         - name (优惠券名称，Input，必填)
         - type (优惠券类型：Radio，1=满减券 2=折扣券)
         - faceValue (满减金额，InputNumber，type=1 时显示，必填)
         - discountRate (折扣率，InputNumber，type=2 时显示，0-1 之间如 0.8 代表 8 折)
         - maxDiscount (最高优惠，InputNumber，type=2 时显示)
         - minAmount (最低消费金额，InputNumber，必填)
         - totalCount (总数量，InputNumber，必填)
         - perUserLimit (每人限领，InputNumber，默认1)
         - validType (有效类型：Radio，1=固定时间 2=领券后N天)
         - startTime + endTime (DatePicker.RangePicker，validType=1 时显示)
         - validDays (天数，InputNumber，validType=2 时显示)
       - 底部按钮：
         - "保存" → 提交 POST /template（新建）或 PUT /template/{id}（编辑）
         - "取消" → history.back()
  </action>
  <verify>
    <automated>grep -l "validType" zlt-web/mall-admin-web/src/pages/Coupons/create.tsx && grep -c "type.*1.*满减" zlt-web/mall-admin-web/src/pages/Coupons/create.tsx</automated>
  </verify>
  <done>创建/编辑优惠券表单完成，支持两种优惠券类型和有效期设置，ADMIN-04-01/02 满足</done>
</task>

<task type="auto">
  <name>Task 3: 手动发放给用户 UI 骨架（ADMIN-04-05 BLOCKED）</name>
  <files>zlt-web/mall-admin-web/src/pages/Coupons/components/IssueModal.tsx</files>
  <action>
    创建发放给用户 Modal（UI 骨架，仅限 BLOCKED 状态）：

    1. src/pages/Coupons/components/IssueModal.tsx：
       - Modal 组件（disabled 状态，因为无后端 API）
       - 表单字段：
         - userId (用户ID，InputNumber)
         - phone (手机号，Input，可选作为备选查询)
       - "发放" 按钮（disabled，hover 提示"后端 API 暂未实现"）
       - 说明文字：
         - "ADMIN-04-05 手动发放优惠券给指定用户"
         - "BLOCKED: 后端 AdminCouponController 无 /issue 接口"
         - "需后端实现 POST /coupon/template/{id}/issue {userId} 后方可使用"

    2. 在 Coupons/index.tsx 中的"发放"按钮：
       - 按钮显示但点击后打开 IssueModal（骨架）
       - Modal 内显示"后端 API 暂未实现，敬请期待"提示

    3. 标记为 BLOCKED，不实现实际功能
  </action>
  <verify>
    <automated>grep -l "BLOCKED" zlt-web/mall-admin-web/src/pages/Coupons/components/IssueModal.tsx && grep -c "IssueModal" zlt-web/mall-admin-web/src/pages/Coupons/index.tsx</automated>
  </verify>
  <done>手动发放 UI 骨架完成，标记为 BLOCKED，ADMIN-04-05 待后端实现</done>
</task>

<task type="auto">
  <name>Task 4: 优惠券统计 UI 骨架（ADMIN-04-06 BLOCKED）</name>
  <files>zlt-web/mall-admin-web/src/pages/Coupons/components/StatisticsModal.tsx</files>
  <action>
    创建统计 Modal（UI 骨架，仅限 BLOCKED 状态）：

    1. src/pages/Coupons/components/StatisticsModal.tsx：
       - Modal 组件（disabled 状态，因为无后端 API）
       - 显示统计数据字段（静态占位）：
         - 已发放数量（显示 "-" 或 "后端 API 暂未实现"）
         - 已使用数量（显示 "-"）
         - 未使用数量（显示 "-"）
         - 使用率（显示 "-"）
       - 说明：
         - "ADMIN-04-06 优惠券使用统计"
         - "BLOCKED: 后端无统计聚合 endpoint"
         - "需后端实现统计接口后填充数据"

    2. 在 Coupons/index.tsx 中的"统计"按钮：
       - 按钮显示，点击后打开 StatisticsModal（骨架）

    3. 标记为 BLOCKED，不实现实际功能
  </action>
  <verify>
    <automated>grep -l "BLOCKED" zlt-web/mall-admin-web/src/pages/Coupons/components/StatisticsModal.tsx && grep -c "StatisticsModal" zlt-web/mall-admin-web/src/pages/Coupons/index.tsx</automated>
  </verify>
  <done>统计 UI 骨架完成，标记为 BLOCKED，ADMIN-04-06 待后端实现</done>
</task>

<task type="auto">
  <name>Task 5: 生成领取链接（BLOCKED D-11）</name>
  <files>zlt-web/mall-admin-web/src/pages/Coupons/index.tsx</files>
  <action>
    实现生成领取链接功能（BLOCKED，无后端 API）：

    1. 在 Coupons/index.tsx 添加"生成链接"按钮：
       - 按钮点击后显示提示："后端 API 暂未实现，无法生成领取链接"
       - D-11 要求：限时一次性码，有时间限制
       - 需后端实现：生成一次性 claim code，设置过期时间，返回链接

    2. 说明当前无法实现的原因：
       - 后端 CouponController.claimCoupon 接受 templateId + userId，无 claim code 概念
       - 无生成限时链接的 endpoint
       - 标记为 BLOCKED，待后端实现后完成
  </action>
  <verify>
    <automated>grep -l "领取链接" zlt-web/mall-admin-web/src/pages/Coupons/index.tsx | head -3</automated>
  </verify>
  <done>生成领取链接标记为 BLOCKED，待后端实现</done>
</task>

<task type="auto">
  <name>Task 6: 提前失效功能（ADMIN-04-07）</name>
  <files>zlt-web/mall-admin-web/src/pages/Coupons/index.tsx</files>
  <action>
    实现提前失效功能：

    1. 在 Coupons/index.tsx 行操作中添加"提前失效"按钮：
       - 仅在 status=1（发放中）时显示
       - 点击后 Modal.confirm 确认："确定要提前失效此优惠券吗？"
       - 确认后调用 POST /api/mall/admin/coupon/template/{id}/offline
       - 成功后刷新列表，状态变为"已下架"

    2. 复用已有的下架 API（publish 的逆操作）
  </action>
  <verify>
    <automated>grep -l "offline" zlt-web/mall-admin-web/src/pages/Coupons/index.tsx | head -5</automated>
  </verify>
  <done>提前失效功能完成，复用下架 API，ADMIN-04-07 满足</done>
</task>

</tasks>

<verification>
1. 优惠券列表页 ProTable 可加载优惠券数据，支持状态Tab筛选
2. 创建优惠券表单可正常提交，优惠券出现在列表
3. 编辑优惠券表单可修改并保存
4. 发布/下架操作正常响应
5. 提前失效功能调用 offline API 成功
6. 手动发放 Modal 显示为 BLOCKED 骨架
7. 统计 Modal 显示为 BLOCKED 骨架
8. 生成链接按钮提示 BLOCKED
</verification>

<success_criteria>
| Requirement | What constitutes done |
|-------------|----------------------|
| ADMIN-04-01 | Create coupon form submits all fields via POST /template |
| ADMIN-04-02 | Edit coupon form pre-fills data and submits PUT /template/{id} |
| ADMIN-04-03 | Delete coupon — backend endpoint unconfirmed; mark as TODO |
| ADMIN-04-04 | Coupon ProTable list loads with status filter tabs |
| ADMIN-04-05 | **BLOCKED** — Issue to user Modal shows skeleton UI; backend no /issue API |
| ADMIN-04-06 | **BLOCKED** — Statistics Modal shows skeleton UI; backend no statistics API |
| ADMIN-04-07 | Early expire calls POST /offline |
</success_criteria>

<output>
After completion, create `.planning/phases/10-管理后台核心模块/10-ADMIN-04-SUMMARY.md`
</output>