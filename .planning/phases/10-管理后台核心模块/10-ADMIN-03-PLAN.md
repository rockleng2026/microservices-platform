---
phase: "10"
plan: "ADMIN-03"
type: execute
wave: 1
depends_on: []
files_modified:
  - zlt-web/mall-admin-web/src/pages/Orders/index.tsx
  - zlt-web/mall-admin-web/src/pages/Orders/detail.tsx
  - zlt-web/mall-admin-web/src/pages/Orders/components/PriceEditor.tsx
  - zlt-web/mall-admin-web/src/pages/Orders/components/ShipModal.tsx
  - zlt-web/mall-admin-web/src/pages/Orders/components/CloseModal.tsx
  - zlt-web/mall-admin-web/src/pages/Orders/services/orders.ts
  - zlt-web/mall-admin-web/src/stores/useStore.ts
  - zlt-web/mall-admin-web/src/config/api.ts
autonomous: true
requirements:
  - ADMIN-03-01
  - ADMIN-03-02
  - ADMIN-03-03
  - ADMIN-03-04
  - ADMIN-03-05
  - ADMIN-03-06
  - ADMIN-03-07
user_setup: []
must_haves:
  truths:
    - "Admin can view paginated order list with status tab filters and date range"
    - "Admin can view complete order detail including items, address, payment, and delivery info"
    - "Admin can modify order price by direct input (decrease only, no cost price validation available)"
    - "Admin can add internal notes to an order"
    - "Admin can close an order with a reason selected from preset options"
    - "Admin can ship an order by entering express company and waybill number"
    - "Virtual goods orders auto-complete after payment (backend behavior)"
  artifacts:
    - path: "zlt-web/mall-admin-web/src/pages/Orders/index.tsx"
      provides: "Order ProTable list with status tabs, date filter, search"
      min_lines: 200
    - path: "zlt-web/mall-admin-web/src/pages/Orders/detail.tsx"
      provides: "Order detail page with items, address, payment, delivery, actions"
      min_lines: 250
    - path: "zlt-web/mall-admin-web/src/pages/Orders/components/PriceEditor.tsx"
      provides: "Direct price input editor with decrease-only validation"
      min_lines: 100
    - path: "zlt-web/mall-admin-web/src/pages/Orders/components/ShipModal.tsx"
      provides: "Express delivery input Modal"
      min_lines: 80
    - path: "zlt-web/mall-admin-web/src/pages/Orders/components/CloseModal.tsx"
      provides: "Close order Modal with reason select"
      min_lines: 80
    - path: "zlt-web/mall-admin-web/src/pages/Orders/services/orders.ts"
      provides: "Order API service layer"
      min_lines: 80
  key_links:
    - from: "zlt-web/mall-admin-web/src/pages/Orders/index.tsx"
      to: "zlt-web/mall-admin-web/src/pages/Orders/detail.tsx"
      via: "navigate to /orders/detail/:id on row click"
    - from: "zlt-web/mall-admin-web/src/pages/Orders/detail.tsx"
      to: "zlt-web/mall-admin-web/src/pages/Orders/components/PriceEditor.tsx"
      via: "import PriceEditor, show on price edit action"
    - from: "zlt-web/mall-admin-web/src/pages/Orders/components/PriceEditor.tsx"
      to: "/api/mall/admin/order/{id}/adjust-amount"
      via: "POST with adjustAmount (must be negative)"
---

<objective>
实现订单管理模块（ADMIN-03）：ProTable 订单列表（状态Tab筛选+日期范围）、订单详情页、改价功能、备注功能、关单功能。

Purpose: 为商城系统提供完整的订单管理功能，满足 ADMIN-03-01~07 共7个需求。
Output: 订单列表页（多Tab筛选）、订单详情页（包含改价/备注/关单操作）、虚拟商品自动完成（后端处理）。
</objective>

<context>
@.planning/REQUIREMENTS.md (ADMIN-03 requirements)
@.planning/phases/10-管理后台核心模块/10-RESEARCH.md (Backend API analysis for AdminOrderController)
@.planning/phases/10-管理后台核心模块/10-CONTEXT.md
@zlt-web/mall-admin-web/src/pages/Dashboard/index.tsx (ProTable 模式参考)

# Locked Decisions (MUST implement)
- D-07: 订单改价交互：输入框直接修改，订单详情页金额旁直接可编辑
- D-08: 改价提交：可选原因 + 确认（不强制填写原因，但提交时需确认）
- D-09: 改价校验：前端无法验证成本价（costPrice 字段不存在于 DTO），后端仅拒绝正数 adjustAmount，前端只做基本数字校验

# Critical Blocker
- AdminOrderController GET /list has TODO comment — may not be fully implemented
- Verify backend implementation before frontend order list implementation
</context>

<interfaces>
<!-- Key types from mall-center backend (per RESEARCH.md) -->

OrderListDTO (from GET /api/mall/admin/order/list):
```typescript
interface OrderListDTO {
  id: Long;
  orderNo: string;
  userId: Long;
  goodsType: Integer;      // 1=实物, 2=虚拟
  goodsTypeDesc: string;
  totalAmount: BigDecimal;
  payAmount: BigDecimal;
  status: Integer;         // 1=待付款, 2=已付款, 3=已发货, 4=已完成, 5=已取消
  statusDesc: string;
  itemCount: Integer;
  remark: string;
  payTime: LocalDateTime;
  shipTime: LocalDateTime;
  createTime: LocalDateTime;
}
```

OrderDetailDTO (from GET /api/mall/admin/order/{id}):
```typescript
interface OrderDetailDTO {
  id: Long;
  orderNo: string;
  userId: Long;
  goodsType: Integer;
  goodsTypeDesc: string;
  totalAmount: BigDecimal;
  freightAmount: BigDecimal;
  payAmount: BigDecimal;
  status: Integer;
  statusDesc: string;
  remark: string;
  payTime: LocalDateTime;
  shipTime: LocalDateTime;
  completeTime: LocalDateTime;
  createTime: LocalDateTime;
  // Address (physical goods)
  addressId: Long;
  addressName: string;
  addressPhone: string;
  addressDetail: string;
  // Items
  items: OrderItemDTO[];
  // Delivery
  delivery: DeliveryDTO | null;
}

interface OrderItemDTO {
  id: Long;
  goodsId: Long;
  goodsName: string;
  skuId: Long;
  specs: string;           // JSON: "{\"颜色\":\"红色\"}"
  price: BigDecimal;
  quantity: Integer;
  subtotal: BigDecimal;
  image: string;
}

interface DeliveryDTO {
  expressCode: string;
  expressName: string;
  waybillNo: string;
  createTime: LocalDateTime;
}
```

AdminAdjustOrderDTO (for POST /{id}/adjust-amount):
```typescript
interface AdminAdjustOrderDTO {
  orderId: Long;
  adjustAmount: BigDecimal;  // NOTE: must be NEGATIVE (减价), positive rejected by backend
  reason?: string;
}
```

# D-09 Critical Limitation
The `costPrice` field does NOT exist in any DTO. Frontend cannot perform true cost-price validation per D-09 requirement.
- Frontend workaround: only validate adjustAmount is negative (delta must reduce price)
- Backend behavior: only accepts negative adjustAmount (positive = rejected)
- Note: ADMIN-03-03 cannot fully implement D-09 requirement without costPrice field
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: 订单列表页 ProTable（ADMIN-03-01）</name>
  <files>zlt-web/mall-admin-web/src/pages/Orders/index.tsx, zlt-web/mall-admin-web/src/pages/Orders/services/orders.ts</files>
  <action>
    创建订单列表页（ProTable + 状态Tab + 日期筛选）：

    1. src/pages/Orders/services/orders.ts（API 服务层）：
       - GET /api/mall/admin/order/list (page, pageSize, orderNo?, status?, startTime?, endTime?, keyword?)
         返回: IPage<OrderListDTO>
       - GET /api/mall/admin/order/{id} 返回 OrderDetailDTO
       - POST /api/mall/admin/order/{id}/adjust-amount 接受 {orderId, adjustAmount, reason?}
       - POST /api/mall/admin/order/{id}/admin-remark 接受 {remark}
       - POST /api/mall/admin/order/{id}/close 接受 {reason}
       - POST /api/mall/admin/order/{id}/ship 接受 {expressCode, expressName, waybillNo}

    2. src/pages/Orders/index.tsx（订单列表页）：
       - 使用 antd Tabs 组件实现状态筛选：
         - 全部（status 不传）
         - 待付款（status=1）
         - 已付款（status=2）
         - 已发货（status=3）
         - 已完成（status=4）
         - 已取消（status=5）
       - ProTable columns:
         - orderNo (订单号，copyable)
         - userId (用户ID)
         - goodsTypeDesc (商品类型)
         - totalAmount (订单总额，valueType: 'money')
         - payAmount (实付金额，valueType: 'money')
         - statusDesc (状态描述，带颜色标签)
         - createTime (下单时间)
       - 搜索栏：orderNo 订单号搜索、keyword 用户ID/手机号、DatePicker.RangePicker 日期范围
       - 分页：pageSize: 20，showSizeChanger: false
       - 行操作：查看详情按钮 → navigate to /orders/detail/:id
       - rowKey="id"

    3. 更新 src/config/api.ts 添加订单相关 API 常量
    4. 更新 src/stores/useStore.ts 添加 orders 状态和 fetchOrderList、fetchOrderDetail 等方法

    NOTE: AdminOrderController GET /list has TODO comment — verify backend implementation before testing
  </action>
  <verify>
    <automated>grep -l "OrderListDTO" zlt-web/mall-admin-web/src/pages/Orders/services/orders.ts && grep -c "Tabs" zlt-web/mall-admin-web/src/pages/Orders/index.tsx</automated>
  </verify>
  <done>订单列表页 ProTable 完成，支持状态Tab筛选和日期范围搜索，ADMIN-03-01 满足</done>
</task>

<task type="auto">
  <name>Task 2: 订单详情页（ADMIN-03-02, ADMIN-03-06）</name>
  <files>zlt-web/mall-admin-web/src/pages/Orders/detail.tsx</files>
  <action>
    创建订单详情页：

    1. src/pages/Orders/detail.tsx：
       - 路由：/orders/detail/:id（需要在 .umirc.ts 中配置）
       - 调用 GET /api/mall/admin/order/{id} 获取订单详情
       - 展示：
         - 订单状态卡片（statusDesc + 状态时间线）
         - 订单基本信息：订单号、用户ID、下单时间、支付时间等
         - 商品信息：OrderItemDTO 列表（商品名称、规格、数量、单价、小计）
         - 金额信息：商品总额、运费、应付金额、实付金额
         - 收货地址（实物订单）：姓名、电话、地址
         - 物流信息（已发货）：快递公司、运单号
         - 订单备注：管理员备注字段
       - 操作按钮：
         - "发货" 按钮（status=2 已付款时显示）→ 打开 ShipModal
         - "改价" 按钮（status=1,2,3 时显示）→ 打开 PriceEditor
         - "备注" 按钮 → 输入备注提交 POST /{id}/admin-remark
         - "关单" 按钮（status=1,2 时显示）→ 打开 CloseModal
         - "返回" 按钮 → history.back()
  </action>
  <verify>
    <automated>grep -l "OrderDetailDTO" zlt-web/mall-admin-web/src/pages/Orders/detail.tsx && grep -c "statusDesc" zlt-web/mall-admin-web/src/pages/Orders/detail.tsx</automated>
  </verify>
  <done>订单详情页完成，显示完整订单信息和操作按钮，ADMIN-03-02/06 满足</done>
</task>

<task type="auto">
  <name>Task 3: 改价功能（ADMIN-03-03）</name>
  <files>zlt-web/mall-admin-web/src/pages/Orders/components/PriceEditor.tsx</files>
  <action>
    创建改价组件（直接输入框修改 + 可选原因 + 确认）：

    1. src/pages/Orders/components/PriceEditor.tsx：
       - 作为 ProTable 行内操作或详情页金额旁边的编辑图标触发
       - 显示当前 payAmount 和一个 InputNumber 输入框（新金额）
       - 金额变化计算：显示 "调价: ¥{old} → ¥{new} ({delta})"
       - 原因输入：TextArea（可选，不强制填写）
       - 确认按钮：Modal.confirm 或 Drawer 底部按钮
       - 校验逻辑（D-07/D-08）：
         - 新金额必须 >= 0（基本校验）
         - 新金额必须 < 当前金额（只能是减价，后端限制 adjustAmount 必须为负）
         - 如果新金额 > 当前金额，显示警告"改价只能是减少金额"
       - D-09 注意：无法获取 costPrice，无法做成本价校验。前端只做减价校验，后端会拒绝正数 adjustAmount。
       - 提交：POST /api/mall/admin/order/{id}/adjust-amount
         payload: { orderId: id, adjustAmount: newAmount - payAmount, reason: reason || '' }
         adjustAmount 必须是负数（减少金额）
       - 成功后刷新订单详情，更新金额显示
  </action>
  <verify>
    <automated>grep -l "adjust-amount" zlt-web/mall-admin-web/src/pages/Orders/components/PriceEditor.tsx && grep -c "adjustAmount" zlt-web/mall-admin-web/src/pages/Orders/components/PriceEditor.tsx</automated>
  </verify>
  <done>改价功能完成，支持输入框直接修改和可选原因，ADMIN-03-03 满足（D-09 前端成本价校验无法实现，仅能做减价校验）</done>
</task>

<task type="auto">
  <name>Task 4: 备注和关单功能（ADMIN-03-04, ADMIN-03-05）</name>
  <files>zlt-web/mall-admin-web/src/pages/Orders/components/CloseModal.tsx</files>
  <action>
    创建备注功能和关单 Modal：

    1. 备注功能（在 detail.tsx 内实现）：
       - "备注" 按钮打开 TextArea 输入框
       - 提交 POST /api/mall/admin/order/{id}/admin-remark {remark: string}
       - 成功后更新备注显示

    2. src/pages/Orders/components/CloseModal.tsx：
       - Modal + Select + TextArea
       - 关单原因必选（Select 下拉）：
         - "买家主动取消"
         - "库存不足"
         - "商品已下架"
         - "地址信息有误"
         - "其他"
       - 其他原因时 TextArea 补充说明（可选）
       - 确认提交：POST /api/mall/admin/order/{id}/close {reason: string}
       - 成功后关闭 Modal，刷新订单列表

    3. src/pages/Orders/components/ShipModal.tsx（发货功能）：
       - Modal + Form (Input)
       - 快递公司：Input（expressName）
       - 快递编码：Input（expressCode）
       - 运单号：Input（waybillNo）
       - 提交：POST /api/mall/admin/order/{id}/ship
  </action>
  <verify>
    <automated>grep -l "admin-remark" zlt-web/mall-admin-web/src/pages/Orders/detail.tsx && grep -l "close" zlt-web/mall-admin-web/src/pages/Orders/components/CloseModal.tsx</automated>
  </verify>
  <done>备注和关单功能完成，ADMIN-03-04/05 满足</done>
</task>

<task type="auto">
  <name>Task 5: 虚拟商品自动完成说明（ADMIN-03-07）</name>
  <files>zlt-web/mall-admin-web/src/pages/Orders/detail.tsx</files>
  <action>
    ADMIN-03-07 说明：虚拟商品自动完成由后端处理（OrderServiceImpl.java:335），前端无需额外实现。

    在订单详情页显示虚拟商品状态流程说明：
    - 虚拟商品订单（goodsType=2）支付成功后，后端自动将状态改为已完成（status=4）
    - 管理员查看虚拟订单时，状态已为已完成，无额外操作

    前端只需在详情页说明中显示：
    - "虚拟商品订单在支付成功后自动完成，无需手动确认收货"

    不需要创建新的前端代码文件。
  </action>
  <verify>
    <automated>grep -l "虚拟商品" zlt-web/mall-admin-web/src/pages/Orders/detail.tsx</automated>
  </verify>
  <done>虚拟商品自动完成说明已添加到订单详情页，ADMIN-03-07 满足（后端自动处理）</done>
</task>

</tasks>

<verification>
1. 订单列表页 ProTable 可加载订单数据，支持状态Tab筛选和日期范围搜索
2. 订单详情页正确显示订单所有信息（商品、地址、金额、物流、备注）
3. 改价功能可修改订单金额，仅限减价，后端正确响应
4. 备注功能可提交管理员备注
5. 关单功能可选择原因关闭订单
6. 发货功能可填写快递信息
7. 虚拟商品订单在支付后自动完成（后端行为）
</verification>

<success_criteria>
| Requirement | What constitutes done |
|-------------|----------------------|
| ADMIN-03-01 | Order list ProTable loads with tabs (全部/待付款/已付款/已发货/已完成/已取消) and date range filter |
| ADMIN-03-02 | Order detail page shows all items, address, payment, delivery info |
| ADMIN-03-03 | Price editor allows direct input with optional reason; only decreasing price allowed (negative adjustAmount); D-09 cost validation not possible without costPrice field |
| ADMIN-03-04 | Admin remark submits via POST /{id}/admin-remark |
| ADMIN-03-05 | Close order selects reason and submits via POST /{id}/close |
| ADMIN-03-06 | Order detail shows status flow (statusDesc) |
| ADMIN-03-07 | Virtual goods auto-complete is backend behavior; frontend displays explanation |
</success_criteria>

<output>
After completion, create `.planning/phases/10-管理后台核心模块/10-ADMIN-03-SUMMARY.md`
</output>