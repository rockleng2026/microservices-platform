# Phase 9: 小程序交易流程 - Context

**Gathered:** 2026-05-09
**Status:** Ready for planning

<domain>
## Phase Boundary

实现小程序完整交易流程：购物车增删改查、订单确认（地址+优惠券+总价）、微信JSAPI支付、订单列表/详情/取消、退款申请。

**Phase 9 delivers:**
- 购物车页面：增删改查、滑动删除、全选结算、混合商品不限制
- 订单确认页：地址选择（底部抽屉）、优惠券选择、商品+运费+优惠汇总、订单备注、提交后跳转收银台
- 收银台页：订单信息展示、倒计时保留、微信支付调起
- 支付结果页：成功/失败专门页面
- 订单列表：5个Tab（全部/待付款/待发货/待收货/已完成）、下拉刷新+上拉分页
- 订单详情：状态→商品→物流→支付→操作按钮顺序
- 退款申请：预设原因+其他填写、图片上传（最多3张）

</domain>

<decisions>
## Implementation Decisions

### 购物车（MINI-04）

- **D-01:** 购物车采用**混合模式**：未登录用户用本地存储（uni.setStorageSync），已登录用户用服务端持久化，登录瞬间同步本地到服务端
- **D-02: 混合商品不限制** — MINI-04-07 的混合商品警告机制**不需要实现**，购物车允许实物+虚拟商品共存
- **D-03:** 商品删除交互：**左滑显示删除按钮**（类似淘宝/京东），符合用户习惯
- **D-04:** 全选逻辑：**底部栏全选复选框**，传统设计，勾选后结算按钮变可点击
- **D-05:** 空购物车：显示**插画+文案+去逛逛按钮**，引导用户返回首页

### 订单确认（MINI-05）

- **D-06:** 收货地址：点击地址区域**弹出底部抽屉面板**选择地址，支持新增/编辑/删除（推荐用 position fixed + 动画实现）
- **D-07:** 优惠券选择：**点击输入框弹出优惠券列表**，用户手动选择，选中后回填显示
- **D-08:** 优惠券互斥：后端已实现同一订单只能使用一张优惠券，前端仅负责展示和选择
- **D-09:** 订单提交后**跳转收银台页**（而非直接调起支付），收银台展示订单详情+30分钟倒计时
- **D-10:** 待支付订单支持**重试支付**（MINI-10-05），用户可在收银台或订单列表重新调起支付

### 微信支付（MINI-10）

- **D-11:** 支付流程：提交订单 → 跳转收银台 → 用户点击"微信支付" → 前端调 `/pay/create` 获取 `prepay_id` → 调 `wx.requestPayment({ prepay_id })` → 展示支付结果页
- **D-12:** 支付结果：**专门的支付结果页**展示成功/失败状态，支持查看订单或返回首页

### 订单列表（MINI-06）

- **D-13:** Tab设计：**5个Tab** — 全部 | 待付款 | 待发货 | 待收货 | 已完成
- **D-14:** 数据加载：**下拉刷新 + 上拉分页**，每页10条

### 订单详情（MINI-07）

- **D-15:** 页面布局顺序：**订单状态横幅 → 商品列表 → 收货地址 → 支付信息 → 操作按钮**（从上到下）
- **D-16:** 取消订单：**仅在待付款状态显示"取消订单"按钮**，其他状态不显示

### 退款申请（MINI-08）

- **D-17:** 退款原因：**预设原因列表 + "其他"可填写**，预设项包括：不想要了/商品损坏/发错货/与描述不符/其他
- **D-18:** 图片上传：**最多上传3张图片**，支持删除重传

### Claude's Discretion

- 收银台倒计时：30分钟有效期，超时后订单自动关闭（后端实现），前端展示"订单已过期"
- 退款状态展示：用户可在退款申请页查看退款进度（待审核/已通过/已拒绝）
- 订单号复制：一键复制订单号到剪贴板
- 虚拟商品订单：收货地址不展示或显示"无需收货"

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### 项目文档
- `.planning/PROJECT.md` — 技术栈确认（uni-app + Vue 3，小程序端口7010）
- `.planning/REQUIREMENTS.md` — Phase 9 的 37 个需求（MINI-04/05/06/07/08/10）
- `.planning/ROADMAP.md` — Phase 9 成功标准
- `.planning/phases/08-Admin基础框架与小程序首页商品/08-UI-SPEC.md` — UI 设计规范（颜色/字体/间距/组件样式）
- `.planning/phases/08-Admin基础框架与小程序首页商品/08-CONTEXT.md` — Phase 8 决策（D-04 Tab Bar、D-05 uni-icons、D-06 卡片布局）

### 小程序现有代码
- `mall-mini-program/src/stores/cart.ts` — 现有购物车状态管理（需扩展支持混合模式）
- `mall-mini-program/src/config/api.ts` — API_BASE = `/mall-center`，CART_API = `/api/mall/cart`
- `mall-mini-program/src/pages/product-detail/index.vue` — 商品详情页（buyNow 目前仅提示"支付功能开发中"）
- `mall-mini-program/pages.json` — 已有 pages/cart/index（空文件）、pages/home/category/cart/user 已配置

### 后端 API（参考）
- `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/PayServiceImpl.java` — 支付回调处理（支付流程参考）
- `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/StockServiceImpl.java` — 库存扣减模式（下单预占+支付扣减）
- `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/RefundServiceImpl.java` — 退款流程（退款申请/审核参考）

### Phase 9 页面清单
新增页面：
- `pages/cart/index.vue` — 购物车页
- `pages/checkout/index.vue` — 订单确认/结算页
- `pages/payment/index.vue` — 收银台页
- `pages/payment/result.vue` — 支付结果页
- `pages/order-list/index.vue` — 订单列表页
- `pages/order-detail/index.vue` — 订单详情页
- `pages/refund/apply.vue` — 退款申请页
- `pages/address/list.vue` — 地址列表（底部抽屉）
- `pages/address/edit.vue` — 地址编辑

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `mall-mini-program/src/stores/cart.ts` — CartStore 类，需扩展为混合模式（本地+服务端）
- `mall-mini-program/src/services/cart.ts` — addToCart API 服务，需补充获取购物车列表接口
- Phase 8 的 ProductCard、QuantityStepper 组件可复用
- `mall-mini-program/src/pages/product-detail/index.vue` 的 BuyBar 设计可参考

### Established Patterns
- Tab Bar：4个项目，selectedColor #ff5500（已确定 per Phase 8 D-04）
- 颜色系统：accent #ff5500（价格/CTA），destructive #ff4d4f（删除/取消），per UI-SPEC
- 商品卡片：2列网格，图片1:1，圆角8px
- 状态管理：Zustand（Admin）/ 小程序用 Class-based Store（现有 cartStore 模式）
- API 请求：uni.request 封装，返回 Promise

### Integration Points
- 购物车 → 订单确认：cartStore.getItems() 传递选中商品
- 订单确认 → 收银台：navigateTo + query 传递 orderId
- 收银台 → 支付结果：redirectTo 跳转
- 订单列表 → 订单详情：navigateTo + query 传递 orderId
- 订单详情 → 退款申请：navigateTo + query 传递 orderId

</code_context>

<specifics>
## Specific Ideas

- 收银台倒计时用"订单保留30分钟"展示
- 订单列表 Card 设计：订单号、状态标签、商品缩略图、金额、创建时间
- 退款进度用状态标签展示：申请中 / 已通过 / 已拒绝
- 支付结果页成功态：绿色对勾 + "支付成功"；失败态：红色叉 + "支付失败" + 重试按钮
- 收货地址为空时显示"请添加收货地址"占位

</specifics>

<deferred>
## Deferred Ideas

- 收货地址管理页（新增/编辑/删除/设默认）— 属于 MINI-05 地址管理功能，但地址列表可复用到 MINI-09 个人中心
- 小程序收藏功能 — MINI-09 个人中心的一部分，属于 Phase 12

</deferred>

---

*Phase: 09-小程序交易流程*
*Context gathered: 2026-05-09*
