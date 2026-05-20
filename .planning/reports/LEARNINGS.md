---
phase: all
phase_name: "all-phases"
project: "Mall-Center 在线商城系统"
generated: "2026-05-20"
counts:
  decisions: 78
  lessons: 32
  patterns: 41
  surprises: 22
source_phases: "1-17 (v1.0 MVP, v1.2, v2.0)"
---

# Mall-Center 在线商城系统 — 全项目经验教训

**项目:** Mall-Center 在线商城系统
**覆盖范围:** Phase 1-17 (v1.0 MVP + v1.2 + v2.0)
**生成时间:** 2026-05-20

---

## 1. 决策 (Decisions)

### 架构决策

#### 服务与数据库命名
Mall-Center 服务名和数据库命名与平台规范保持一致，端口 7010，数据库 cp_mall。

**Rationale:** 与现有服务命名规范一致，降低认知成本
**Source:** 01-01-SUMMARY.md (D1-D2)

---

#### 多租户隔离策略
商户审批后自动生成 `MERCHANT_{id}` 作为 tenantId，运营层面多租户隔离。

**Rationale:** 运营层面多租户隔离，商户数据通过 TenantInterceptor tenant_id 过滤
**Source:** 07-02-SUMMARY.md, 07-PATTERNS.md

---

#### 虚拟商品特殊处理
虚拟商品订单支付后自动完成，无需发货。混合购物车不支持实物+虚拟同时结算。

**Rationale:** 虚拟商品无需物流，提升交付效率；避免订单类型歧义，简化业务流程
**Source:** 03-02-SUMMARY.md, PROJECT.md

---

#### 库存扣减策略
下单预占+支付成功真实扣减，Redis 原子操作防超卖，订单超时回滚。

**Rationale:** 防止超卖，订单超时自动释放预占库存
**Source:** 03-02-SUMMARY.md (Redis atomic operations)

---

#### 优惠券与促销活动互斥
同一订单只能使用优惠券或促销活动中的一种。

**Rationale:** 避免利润侵蚀，简化业务逻辑
**Source:** PROJECT.md (Key Decisions)

---

#### Spring Data Redis 替代 Redisson
Redisson 3.25.0 的 `RedissonClient.getScript().evalReadOnly()` API 不存在，改用 Spring Data Redis `redisTemplate.execute()` + `DefaultRedisScript` 实现 Lua 原子操作。

**Rationale:** Redisson API 不存在但效果相同
**Source:** 07-VERIFICATION.md, 07-PATTERNS.md

---

#### 微信消息通知容错
支付成功/发货时发送微信模板消息，通知失败记录日志但不影响订单流程。

**Rationale:** Graceful degradation - notification failure logged but does not fail order flow
**Source:** 07-03-SUMMARY.md

---

#### @Lazy 注入解决循环依赖
OrderServiceImpl 和 WeChatTemplateMsgUtil 之间使用 @Lazy 注入避免循环依赖。

**Rationale:** 打破循环依赖
**Source:** 07-03-SUMMARY.md

---

### Phase 8 决策

#### Dashboard 指标卡
Dashboard 顶部 4 个指标卡：订单数/销售额/访客数/转化率，ECharts 折线图支持日/周/月切换。

**Rationale:** D-01, D-02 规范
**Source:** 08-ADMIN-01-SUMMARY.md

---

#### 小程序 TabBar 设计
TabBar 4 个页面（首页/分类/购物车/我的），选中色 #ff5500，图标使用静态占位 PNG。

**Rationale:** D-04, D-05 规范；图标为占位文件
**Source:** 08-MINI-01-SUMMARY.md

---

#### 商品列表布局
2 列网格，图片优先。分类筛选默认展开，排序选项：综合/价格最低/价格最高/销量优先。

**Rationale:** D-06 规范；Filter/sort 变化时 reset page=1
**Source:** 08-MINI-02-SUMMARY.md

---

#### 商品详情规格选择
300px 图片高度，自动选择单一 SKU，禁用无库存规格组合，购买按钮强调色 #ff5500。

**Rationale:** D-07 紧凑布局规范；"立即购买"显示"支付功能开发中"提示
**Source:** 08-MINI-03-SUMMARY.md

---

### Phase 9 决策

#### 购物车选择模式
CartStore 使用 `selectedItems: Set<number>` 跟踪选中 skuId；为空时所有商品被视为选中。

**Rationale:** 集合为空时表示全选，简化逻辑
**Source:** 09-01-SUMMARY.md

---

#### 订单确认页布局
AddressDrawer: position fixed bottom，CouponPicker: 全屏弹出，Countdown: 30 分钟倒计时。

**Rationale:** D-02 规范；倒计时 < 5 分钟时红色紧急样式
**Source:** 09-02-SUMMARY.md

---

#### 微信支付流程
submit order -> navigateTo payment page -> POST /pay/create -> wx.requestPayment -> result page

**Rationale:** D-11, D-12 规范；package 字段格式 `prepay_id=${prepay_id}`
**Source:** 09-06-SUMMARY.md

---

#### 退款申请页面
预设原因：不想要了/商品损坏/发错货/与描述不符/其他，图片上传最多 3 张。

**Rationale:** D-17, D-18 规范；取消按钮仅对 status=0 显示
**Source:** 09-05-SUMMARY.md

---

#### 微信登录环境判断
开发环境 config 为空时使用 mock openid；生产环境调用真实微信 API。

**Rationale:** appid/secret 从 Nacos 配置中心获取，不硬编码
**Source:** 09-WXLOGIN-SUMMARY.md

---

### Phase 10 决策

#### Admin 管理台组件选型
ProTable 作为主要列表组件，Modal + ProForm 用于创建/编辑。

**Rationale:** D-01, D-04 规范；ImageUploader 支持最多 5 个文件
**Source:** 10-ADMIN-02-SUMMARY.md

---

#### 订单改价逻辑
前台仅做减少校验，后端 enforce negative adjustAmount；costPrice 字段不在任何 DTO 中。

**Rationale:** D-09 规范；只能减少不能增加
**Source:** 10-ADMIN-03-SUMMARY.md

---

#### 优惠券状态格式
status tab key 直接匹配后端状态值(0/1/2)；折扣显示：`¥faceValue` 或 `${rate*10}折`。

**Rationale:** 避免状态值映射
**Source:** 10-ADMIN-04-SUMMARY.md

---

#### Banner 拖拽排序
使用 HTML5 拖拽 API（原生实现，无需 @dnd-kit），最多 5 个 Banner，UI 层强制限制。

**Rationale:** D-15 规范；D-13 后端 DB 层不限制但 UI 限制
**Source:** 10-ADMIN-10-SUMMARY.md

---

### Phase 11-12 决策

#### 物流状态颜色映射
Express status: ENABLED=success(green), DISABLED=default(gray)；Logistics: PENDING=default, IN_TRANSIT=processing, DELIVERED=success, RETURNED=warning, EXCEPTION=error。

**Source:** 11-ADMIN-07-SUMMARY.md

---

#### 会员管理目录命名
使用 `Member`（非 `User`），符合 mall-admin-web 项目惯例，服务位于 `pages/Member/services/`。

**Source:** 11-ADMIN-08-SUMMARY.md

---

#### 商户状态枚举
MERCHANT_STATUS: 0=pending, 1=approved, 2=rejected, 3=disabled，与后端 numeric values 一致。

**Source:** 11-ADMIN-09-SUMMARY.md

---

#### 促销 API 路径
复用已有的 MallMarketingActivity entity 和 mapper，而非创建新的 Promotion entity。

**Source:** 12-ADMIN-05-INTEGRATION-SUMMARY.md

---

#### 个人中心数据源
使用 `getMemberInfo()` 而非 `getUserProfile()`，因为需要返回 points balance 和 level。

**Source:** 12-MINI-09-SUMMARY.md

---

#### 前后端字段映射
前端期望 `points` 字段但后端返回 `balance`，在响应中添加 `points = balance` 别名。

**Source:** 12-MINI-09-INTEGRATION-SUMMARY.md

---

#### API 响应转换
MallUserFavorite 创建独立 entity 而非复用现有表；需要 API 响应转换匹配前端 TypeScript interfaces。

**Source:** 12-MINI-09-INTEGRATION-SUMMARY.md

---

### Phase 13 决策

#### Playwright 作为 E2E 框架
Admin Web 和 Mini Program 统一使用 Playwright，保持工具链一致。

**Source:** 13-ADMIN-E2E-SUMMARY.md, 13-MINI-E2E-SUMMARY.md

---

#### 移动端视口标准
iPhone 13 (375x667) 作为标准移动端视口，覆盖大多数移动用户。

**Source:** 13-MINI-E2E-SUMMARY.md

---

#### 小程序 H5 构建模式测试
微信小程序需要真机客户端，CI 不可访问，使用 H5 build 模式进行测试。

**Source:** 13-MINI-E2E-SUMMARY.md

---

#### Lighthouse CI 性能预算
@lhcli/cli 替代 lighthouse-ci（更好的 npm 集成），Admin Web >= 0.7，Mini Program H5 >= 0.6。

**Source:** 13-UI-PERF-SUMMARY.md

---

#### BasePage 方法重命名
`goto()` 重命名为 `navigate()` 避免与子类方法名冲突。

**Source:** 13-ADMIN-E2E-SUMMARY.md

---

### Phase 15-17 决策

#### 后端嵌套 Map 响应处理
后端 getOrderDetail 返回嵌套 Map {order, items, delivery, address}，前端服务层需要展开转换。

**Source:** 15-ADMIN-UAT-02-SUMMARY.md

---

#### SKU code 唯一性校验
库存创建时检查 SKU code 唯一性防止重复创建。

**Source:** 15-ADMIN-UAT-06-SUMMARY.md

---

#### SQL 注入防护
使用 MyBatis-Plus `leftJoin() + like()` API 参数化查询，替代字符串拼接。

**Source:** 15-ADMIN-UAT-04-SUMMARY.md

---

#### 微信收货地址同步
需要两个独立操作：wx.chooseAddress（从微信获取）+ saveWeChatAddress（持久化到后端）。

**Source:** 17-MINI-PAY-ADDRESS-PLAN-SUMMARY.md

---

#### 支付前需要 wx.login()
支付前必须调用 wx.login() 获取 fresh openId，不能仅使用缓存的 user session。

**Source:** 17-MINI-PAY-ADDRESS-PLAN-SUMMARY.md

---

#### getOrderDetail 包装器
从 generic request() wrapper 改为自定义实现，正确展开后端 Result wrapper {code, msg, datas}。

**Source:** 17-MINI-ORDER-PLAN-SUMMARY.md

---

## 2. 教训 (Lessons)

### Phase 1 教训

#### AuthController 占位符是故意设计的
AuthController.wxLogin() 和所有控制器使用 mock userId=1L 是 Phase 1 的预期状态，真实 WeChat OAuth 需要 zlt-uaa 配置。

**Context:** UserController, CartController, UserAddressController 都有 TODO comments for token integration
**Source:** 01-基础架构搭建-VERIFICATION.md

---

#### Phase 2 数据库表不存在导致统计数据为空
Phase 2 的统计数据 API 返回空数据，因为 mall_order 和 mall_goods_sku 表尚未创建（Phase 3 才创建）。结构已就绪，但无法返回真实数据。

**Context:** 06-02-SUMMARY.md — Phase 6 verification noted this; also appeared in 07-VERIFICATION
**Source:** 06-02-SUMMARY.md, 07-VERIFICATION.md

---

### Phase 2 教训

#### Phase plan 依赖未完全执行导致阻塞
Plan 02-01 和 02-02 未完全执行，导致必要的基础 entity 和 mapper 缺失。Phase 03 发现了 MallSpec/MallSpecValue 相关的缺失依赖。

**Context:** 02-03-SUMMARY.md - "Phase 2 Plan 02-01 and 02-02 were not executed prior to this plan"
**Source:** 02-03-SUMMARY.md (Rule 3 blocking issue)

---

#### MallSettingsMapper 和 MallResourceDeliveryMapper 缺失
Plan 02-01 的 entities 存在但 mappers 缺失，02-04 无法执行。临时创建了这两个 mapper 作为临时修复。

**Context:** 02-04-SUMMARY.md — "Plan 02-01 was not fully executed - entities existed but mappers were missing"
**Source:** 02-04-SUMMARY.md

---

### Phase 6 教训

#### OrderServiceImpl.java 的 pre-existing TODO
`getCurrentUserId()` stub 中有 `TODO: integrate with zlt-uaa auth system` 注释，在 Phase 6 之前就存在，与 Phase 6 目标无关，INFO 级别非阻塞。

**Context:** This TODO appears across multiple phases as a known gap
**Source:** 06-VERIFICATION.md, 07-VERIFICATION.md

---

### Phase 7 教训

#### Redisson API 不存在导致实现替换
`RedissonClient.getScript().evalReadOnly()` API 在 Redisson 3.25.0 中不存在，实现时替换为 Spring Data Redis scripting，效果相同且更稳定。

**Context:** 07-01 critical fix - plan specified Redisson but Redisson API didn't exist
**Source:** 07-VERIFICATION.md (Auto-Fixed Deviation)

---

### Phase 8 教训

#### TabBar 图标是占位文件
TabBar 图标是 67-byte placeholder PNGs，不是真实图标，VERIFICATION 发现为 WARNING 级别。

**Context:** 08-VERIFICATION.md — "TabBar icons are 67-byte placeholder files"
**Source:** 08-VERIFICATION.md

---

#### 认证 gap：hardcoded userId='1'
cart.ts 和 services/cart.ts 中 hardcoded fallback userId '1'，未认证请求被归属于用户 1，WARNING 级别。

**Context:** 08-VERIFICATION.md — "Hardcoded fallback userId '1' means unauthenticated requests attributed to user 1"
**Source:** 08-VERIFICATION.md

---

#### TopProducts API 未实现
TopProducts.tsx 的 API endpoint `/statistics/top-products` 后端未实现，前端组件存在但调用会失败。

**Context:** 08-ADMIN-01-SUMMARY.md — "Known Stubs: TopProducts.tsx API endpoint not yet implemented"
**Source:** 08-ADMIN-01-SUMMARY.md

---

#### window.location.href 而非 useNavigate
BannerSwiper.vue 使用 `window.location.href` 而非 SPA navigate，造成全页刷新，WARNING 级别。

**Source:** 08-VERIFICATION.md

---

### Phase 10 教训

#### Phase 8 Dashboard 虚假完成声明
Phase 8 声称 Dashboard (ADMIN-01) 已完成，但实际仓库中根本不存在 Dashboard 组件。这是 false completion claim，Phase 10 验证时才发现。

**Context:** 10-ADMIN-01-SUMMARY.md (VERIFICATION FAILED) — "Phase 8 claimed Dashboard was complete but files were never created"
**Source:** 10-ADMIN-01-SUMMARY.md

---

#### 3 个 ADMIN-04 功能无后端 API
ADMIN-04-05 (发放优惠券)、ADMIN-04-06 (统计)、D-11 (生成领取链接) 前端骨架已创建但后端 API 缺失，功能不可用。

**Context:** 10-ADMIN-04-SUMMARY.md — "BLOCKED features (3): No backend API"
**Source:** 10-ADMIN-04-SUMMARY.md

---

### Phase 11-12 教训

#### XSS 漏洞：businessLicense URL 未校验
Merchant/index.tsx:442 将 businessLicense URL 直接渲染未校验，若后端返回 `javascript:` URI 可导致存储型 XSS，CRITICAL 级别。

**Context:** 11-VERIFICATION.md — critical security bug not caught during phase execution
**Source:** 11-VERIFICATION.md

---

#### formatMoney 返回 NaN 问题
Member/index.tsx 和 Refund/index.tsx 中 formatMoney 在无效输入时返回 `NaN.toFixed(2)`，WARNING 级别。

**Source:** 11-VERIFICATION.md

---

#### handleViewDetail 静默失败
Merchant/index.tsx:102-116 中 handleViewDetail 捕获异常但不显示 message.error()，WARNING 级别。

**Source:** 11-VERIFICATION.md

---

#### ADMIN-05-INTEGRATION 未验证前后端路径对齐
12-VERIFICATION.md 发现 3 个 BLOCKER：Promotion API 路径错误 (/marketing vs /admin)、Points adjust 路径错误、Profile edit 未连接（代码中 TODO）。

**Context:** ADMIN-05-INTEGRATION plan marked complete without verifying frontend-backend path alignment. Skipped runtime integration test masked this.
**Source:** 12-VERIFICATION.md

---

#### 促销 API 路径不匹配
前端调用 `/api/mall/marketing/promotions` 但后端暴露 `/api/mall/admin/promotions`，所有促销 CRUD 操作都会失败。

**Context:** 12-VERIFICATION.md — "3 BLOCKER gaps blocking goal achievement"
**Source:** 12-VERIFICATION.md

---

#### Points adjust API 路径不匹配
前端调用 `POST /api/mall/member/points/adjust` 但后端是 `PUT /api/mall/admin/member/{id}/points`，功能不可用。

**Source:** 12-VERIFICATION.md

---

#### Profile 编辑未连接
profile.vue:220 的 updateProfile 调用被注释掉，UI 存在但编辑不持久化，仅保存到 localStorage。

**Source:** 12-VERIFICATION.md

---

### Phase 13 教训

#### Lighthouse 基线未生成
Dev servers 和后端服务未运行，Lighthouse CI 配置已创建但基线未运行，且 plan 引用的文件路径在项目中不存在。

**Context:** 13-UI-PERF-SUMMARY.md — "Lighthouse baseline not generated: dev servers and backend services were not running"
**Source:** 13-UI-PERF-SUMMARY.md

---

### Phase 15 教训

#### Dashboard 统计数据是硬编码 0
getUserAnalysis() 返回硬编码 0，从未实现真实的数据库查询逻辑，这不是 bug 而是完全未实现的功能。

**Context:** 15-ADMIN-UAT-GAP-01-SUMMARY.md — "getUserAnalysis() had no real database queries, just return statements with 0"
**Source:** 15-ADMIN-UAT-GAP-01-SUMMARY.md

---

#### 订单详情后端返回嵌套 Map
后端 getOrderDetail 返回嵌套 Map {order, items, delivery, address}，前端直接当作 OrderDetailDTO 使用，导致数据无法正确解析。

**Context:** 15-ADMIN-UAT-02-SUMMARY.md — root cause of order detail blank pages
**Source:** 15-ADMIN-UAT-02-SUMMARY.md

---

#### 订单列表无发货入口
订单列表和详情页无发货入口，只有"查看详情"按钮。

**Source:** 15-ADMIN-UAT-02-SUMMARY.md

---

#### 会员管理缺少地址管理
会员管理页面只有积分调整功能，缺少客户地址管理模块。

**Source:** 15-ADMIN-UAT-03-SUMMARY.md

---

#### 所有 API 返回未认证
Phase 15 UAT 期间所有 8 个路由返回 HTTP 200 但 API 调用全部返回 `{"resp_msg":"Not Authenticated"}`，认证未配置但不在 UAT 范围内。

**Context:** 15-ADMIN-UAT-01-SUMMARY.md — "all API calls return Not Authenticated without auth token"
**Source:** 15-ADMIN-UAT-01-SUMMARY.md

---

### Phase 17 教训

#### 微信支付参数映射
timestamp -> timeStamp（大小写），package 字段需要 `prepay_id=` 前缀。

**Context:** WeChat field name mapping differences between backend and JSAPI
**Source:** 17-MINI-PAY-ADDRESS-PLAN-SUMMARY.md

---

#### 微信地址字段映射
userName->receiverName, telNumber->phone, provinceName->province, cityName->city, countyName->district, detailInfo->detail

**Source:** 17-MINI-PAY-ADDRESS-PLAN-SUMMARY.md

---

## 3. 模式 (Patterns)

### 服务层模式

#### MyBatis Plus ServiceImpl 基础模式
ServiceImpl extends ServiceImpl<Mapper, Entity> implements IService<Entity>

**When to use:** 所有新的 service 实现类
**Source:** 01-01-SUMMARY.md, 07-PATTERNS.md

---

#### TenantAware 服务实现
通过 TenantInterceptor.getCurrentTenantId() 获取当前租户 ID，ThreadLocal 存储。

**When to use:** 所有多租户 CRUD 操作
**Source:** 07-PATTERNS.md, 02-后台管理-商品与系统

---

#### @Transactional 事务管理
`@Transactional(rollbackFor = Exception.class)` 确保数据一致性。

**When to use:** 所有涉及多表操作的服务方法
**Source:** 02-03-SUMMARY.md

---

#### DTO 模式
`@Data + implements Serializable`，使用 Lombok 自动生成 getter/setter。

**When to use:** 所有 API 请求/响应 DTO
**Source:** 07-PATTERNS.md

---

#### Mapper 模式
`@Mapper + extends BaseMapper<Entity>`，MyBatis Plus 自动提供 CRUD。

**When to use:** 所有新的 mapper 接口
**Source:** 07-PATTERNS.md

---

#### Entity 模式
`@Data + @TableName + @TableId`，Lombok 注解。

**When to use:** 所有新的实体类
**Source:** 07-PATTERNS.md

---

#### Controller 模式
`@RestController + @RequestMapping + @RequiredArgsConstructor + @Tag`（Swagger）

**When to use:** 所有 REST 控制器
**Source:** 07-PATTERNS.md

---

### Redis 缓存模式

#### Redis Lua 原子库存预占
GET -> compare -> DECRBY -> return 在 Redis server 端单次往返，消除并发竞态。

**When to use:** 库存扣减等并发敏感操作
**Source:** 07-PATTERNS.md (ADVANCED-02)

---

#### Redis 缓存键模式
`sku:stock:{skuId}` 当前库存，`order:stock:lock:{orderId}` 订单预占 hash，`stats:daily:{tenantId}:{date}` 日统计。

**When to use:** 缓存键命名规范
**Source:** 03-02-SUMMARY.md, 02-04-SUMMARY.md

---

#### Redis 缓存 TTL 模式
统计缓存 5 分钟 TTL (`TTL 300s`)，物流追踪 30 分钟 TTL。

**When to use:** 缓存过期策略
**Source:** 02-04-SUMMARY.md (D-05), 04-02-SUMMARY.md (logistics 30min)

---

#### 无限库存跳过 Redis
`stock=-1` 表示无限库存，跳过所有 Redis 操作。

**When to use:** 虚拟商品或无库存限制场景
**Source:** 03-02-SUMMARY.md

---

### 微信集成模式

#### WeChat API 容错降级
通知失败记录日志但不影响订单/支付主流程（graceful degradation）。

**When to use:** 微信模板消息、微信支付回调等非关键路径
**Source:** 07-03-SUMMARY.md, 07-PATTERNS.md

---

#### @Lazy 注入打破循环依赖
OrderServiceImpl 和 WeChatTemplateMsgUtil 之间使用 `@Lazy` 注入。

**When to use:** 两个服务相互依赖时
**Source:** 07-03-SUMMARY.md

---

#### WeChat 支付包格式
`package: "prepay_id=${prepay_id}"`（下划线小写），timestamp 字段名 `timeStamp`（大写 S）。

**When to use:** 微信 JSAPI 支付
**Source:** 09-02-SUMMARY.md, 09-06-SUMMARY.md, 17-MINI-PAY-ADDRESS-PLAN-SUMMARY.md

---

#### 微信登录开发/生产判断
config 空时使用 mock openid，否则调用真实微信 API，appid/secret 从 Nacos 获取。

**When to use:** 微信小程序登录
**Source:** 09-WXLOGIN-SUMMARY.md

---

### 前端模式

#### 小程序 TabBar 样式
4 items，selectedColor #ff5500，使用静态图片图标。

**When to use:** 微信小程序底部导航
**Source:** 08-MINI-01-SUMMARY.md (D-04, D-05)

---

#### 商品列表筛选/排序
FilterBar sticky + scrollable grid，筛选/排序变化时 reset page=1，下拉加载更多。

**When to use:** 商品列表分页场景
**Source:** 08-MINI-02-SUMMARY.md

---

#### 商品详情 SKU 规格解析
解析 "颜色:黑色;内存:256GB" 格式为 group/option/selected 结构，自动禁用无库存组合。

**When to use:** 多规格商品选择
**Source:** 08-MINI-03-SUMMARY.md

---

#### 规格选择器 v-model 模式
QuantityStepper v-model binding，min=1, max=stock，自动禁用边界值。

**When to use:** 数量选择器
**Source:** 08-MINI-03-SUMMARY.md

---

#### scroll-view 下拉刷新
`refresher-enabled + refresher-triggered` 实现下拉刷新，而非 `uni.startPullDownRefresh`。

**When to use:** 小程序页面下拉刷新
**Source:** 09-04-SUMMARY.md

---

#### scroll-view 无限滚动
`@scrolltolower` 事件触发分页加载，page++ 后追加到列表。

**When to use:** 列表无限滚动
**Source:** 08-MINI-02-SUMMARY.md

---

#### 订单状态颜色映射
orange (pending_payment), blue (paid/shipped), green (delivered/completed), gray (cancelled), red (refunding)。

**When to use:** 订单状态标签颜色
**Source:** 09-04-SUMMARY.md

---

#### 底部固定操作栏
position fixed bottom，白色背景，CSS transform translateY 动画实现 drawer 弹出效果。

**When to use:** 地址选择、优惠券选择等底部弹出面板
**Source:** 09-02-SUMMARY.md, 09-03-SUMMARY.md

---

#### 倒计时计时器
setInterval 每秒更新，onUnmounted 时 clear，< 5 分钟时红色紧急样式。

**When to use:** 订单支付倒计时
**Source:** 09-02-SUMMARY.md

---

#### ProTable + valueEnum
Ant Design ProTable 使用 valueEnum 做状态/类型过滤。

**When to use:** 管理后台列表页
**Source:** 10-ADMIN-02-SUMMARY.md, 10-ADMIN-03-SUMMARY.md

---

#### Modal + ProForm
创建/编辑使用 Modal 弹出 + ProForm 表单。

**When to use:** 管理后台 CRUD 操作
**Source:** 10-ADMIN-02-SUMMARY.md

---

#### HTML5 拖拽排序
原生 drag-and-drop API 实现 Banner 排序，无需 @dnd-kit，适合小列表场景（≤5 items）。

**When to use:** Banner/图片等小列表排序
**Source:** 10-ADMIN-10-SUMMARY.md (D-15)

---

#### Page Object Model (E2E)
BasePage 提供 navigate(), clickButton(), fillForm(), getTableRows(), waitForSelector()，子页面对象继承并实现页面特定操作。

**When to use:** Playwright E2E 测试
**Source:** 13-ADMIN-E2E-SUMMARY.md

---

#### 移动端 E2E 视口
iPhone 13 (375x667) 作为标准移动端测试视口。

**When to use:** 小程序 H5 E2E 测试
**Source:** 13-MINI-E2E-SUMMARY.md

---

### 安全模式

#### AES-128-CBC 加密敏感配置
AesUtil 对微信支付参数等敏感配置加密存储，数据库中不存储明文。

**When to use:** 微信 app_id, mch_id, api_key 等敏感字段
**Source:** 02-01-SUMMARY.md (D-11), 02-04-SUMMARY.md (D-11)

---

#### MyBatis-Plus 参数化查询防注入
使用 `leftJoin() + like()` 而非字符串拼接，防止 SQL 注入。

**When to use:** 所有涉及用户输入的查询
**Source:** 15-ADMIN-UAT-04-SUMMARY.md

---

### API 响应转换模式

#### 后端 Result 包装器展开
后端返回 `{code, msg, datas}` 包装，前端服务层需要正确 unwrap 到具体数据类型。

**When to use:** 前后端 API 响应不一致时
**Source:** 17-MINI-ORDER-PLAN-SUMMARY.md

---

#### 前后端字段别名映射
前端期望 `points` 后端返回 `balance`，在响应中添加 points = balance 别名。

**When to use:** 前后端字段名不一致
**Source:** 12-MINI-09-INTEGRATION-SUMMARY.md

---

### 订单状态机模式

#### 订单状态流转
1=待付款, 2=已付款, 3=已发货, 4=已完成, 5=已取消，扩展 6=退款中, 7=已退款, 8=退款拒绝。

**When to use:** 订单状态判断和流转
**Source:** 03-01-SUMMARY.md

---

#### 物流状态映射
0=待发货, 1=在途, 2=签收, 3=退回, 4=异常。

**When to use:** 物流状态显示
**Source:** 04-02-SUMMARY.md

---

## 4. 意外发现 (Surprises)

### Phase 2 意外：依赖计划未执行
Phase 2 的 plan 02-01 和 02-02 在 Phase 3 开始时未完全执行，导致 MallSpec/MallSpecValue 等必要实体缺失。这是跨 phase 的依赖管理问题。

**Impact:** Phase 3 需临时创建缺失的 entities/mappers 作为临时修复
**Source:** 02-03-SUMMARY.md, 02-04-SUMMARY.md

---

### Phase 7 意外：Redisson API 不存在
Plan 07-01 指定使用 `RedissonClient.getScript().evalReadOnly()`，但 Redisson 3.25.0 中该 API 不存在，需临时替换为 Spring Data Redis。

**Impact:** 实现替换，无功能损失，但 plan 与实现不一致
**Source:** 07-VERIFICATION.md

---

### Phase 8 意外：TabBar 图标是占位文件
验证时发现 TabBar 图标是 67-byte placeholder PNGs，不是真实图标。

**Impact:** UI 功能不完整但 plan 声称完成
**Source:** 08-VERIFICATION.md

---

### Phase 8 意外：认证 gap 未被发现
Hardcoded userId='1' 作为 fallback，认证请求被错误归属于用户 1。

**Impact:** 安全/数据问题，WARNING 级别
**Source:** 08-VERIFICATION.md

---

### Phase 10 意外：Phase 8 Dashboard 虚假完成
Phase 8 声称 Dashboard 已完成 (ADMIN-01-01~05)，但仓库中根本不存在相关文件。Mall-admin-web path 是计划但未构建的目标。

**Impact:** 重大 - Phase 10 验证失败，需重新实现 Dashboard
**Source:** 10-ADMIN-01-SUMMARY.md

---

### Phase 11 意外：关键安全漏洞未被 phase 捕获
XSS 漏洞（CRITICAL）在 phase 执行时未被发现，businessLicense URL 渲染无校验。

**Impact:** 安全漏洞遗留到 verification 阶段才发现
**Source:** 11-VERIFICATION.md

---

### Phase 12 意外：3 个 Blocker 同一根因
所有 3 个 blocker 来自同一根本原因：ADMIN-05-INTEGRATION plan 标记完成但未验证前后端路径对齐，跳过 runtime integration test 掩盖了问题。

**Impact:** 促销 CRUD、积分调整、个人信息编辑全部失败
**Source:** 12-VERIFICATION.md

---

### Phase 12 意外：Profile 编辑看似正常但实际不工作
Profile 编辑 UI 存在，API 服务函数存在，但实际调用被注释掉为 TODO，页面看起来功能正常但编辑不持久化。

**Impact:** 用户体验欺骗性很强
**Source:** 12-VERIFICATION.md

---

### Phase 13 意外：E2E 测试依赖真实后端数据
"Tests fail because they require actual backend data and authentication. This is expected" — 测试基础设施就绪但环境未配置。

**Impact:** CI 中测试失败是预期的，不代表基础设施问题
**Source:** 13-MINI-E2E-SUMMARY.md

---

### Phase 13 意外：Lighthouse 基线从未运行
Dev servers 未运行，plan 引用的文件路径不存在，Lighthouse CI 配置存在但从未生成基线。

**Impact:** 性能预算无法验证
**Source:** 13-UI-PERF-SUMMARY.md

---

### Phase 15 意外：Dashboard 统计是硬编码 0
getUserAnalysis() 完全未实现，不是 bug 是 missing implementation，之前所有 phase 都未发现。

**Impact:** Dashboard 统计数据永远显示 0
**Source:** 15-ADMIN-UAT-GAP-01-SUMMARY.md

---

### Phase 15 意外：所有 API 返回未认证但 UI 显示正常
所有 8 个路由 HTTP 200 但 API 调用全部返回 Not Authenticated，页面看起来功能正常但实际数据为空。

**Impact:** 认证配置缺失不在 UAT 范围内
**Source:** 15-ADMIN-UAT-01-SUMMARY.md

---

### Phase 17 意外：wx.login() 必须在支付前调用
支付前必须调用 wx.login() 获取 fresh openId，不能仅使用缓存的 user session。

**Impact:** 支付流程需要额外步骤
**Source:** 17-MINI-PAY-ADDRESS-PLAN-SUMMARY.md

---

### Phase 17 意外：微信地址同步是两个独立操作
wx.chooseAddress（从微信获取）和 saveWeChatAddress（持久化到后端）是两个独立操作，必须链式调用。

**Impact:** 需要两个 API 调用而非一个
**Source:** 17-MINI-PAY-ADDRESS-PLAN-SUMMARY.md

---

*文档生成时间: 2026-05-20*
*提取范围: Phase 1-17 全项目经验教训*
*源文件: .planning/phases/*-SUMMARY.md, *-VERIFICATION.md, *-PLAN.md 等 60+ 个文件*