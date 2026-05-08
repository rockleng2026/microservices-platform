# Requirements: Mall-Center 在线商城系统

**Defined:** 2026-05-08
**Core Value:** 为IT硬件经销商提供一套完整的B2C在线销售解决方案，同时支持实物与虚拟商品，一套系统覆盖从商品展示到支付交付的全链路电商能力。

## v1 Requirements

### 商品模块 (GOODS)

- [ ] **GOODS-01**: 用户可以查看商品分类列表（树形结构）
- [ ] **GOODS-02**: 用户可以搜索商品（按名称、分类、关键词模糊搜索）
- [ ] **GOODS-03**: 用户可以浏览商品列表（分类筛选、排序：价格/销量/新品、分页）
- [ ] **GOODS-04**: 用户可以查看商品详情（含多规格SKU选择、库存显示、图文详情）
- [ ] **GOODS-05**: 管理员可以管理商品分类（增删改查、树形结构）
- [ ] **GOODS-06**: 管理员可以发布/编辑商品（基本信息、商品图集、SKU规格、销售价格、库存数量）
- [ ] **GOODS-07**: 管理员可以批量上下架商品
- [ ] **GOODS-08**: 商品支持两种类型：实物商品（需物流）和虚拟商品（即时交付）

### 购物车模块 (CART)

- [ ] **CART-01**: 用户可以将商品加入购物车（选择SKU规格）
- [ ] **CART-02**: 用户可以修改购物车商品数量和规格
- [ ] **CART-03**: 用户可以删除购物车中的商品
- [ ] **CART-04**: 用户可以勾选/取消勾选购物车商品
- [ ] **CART-05**: 用户可以查看购物车合计金额
- [ ] **CART-06**: 购物车中实物与虚拟商品不支持混合结算（需分开下单）

### 订单模块 (ORDER)

- [ ] **ORDER-01**: 用户可以创建订单（从购物车选中项或直接购买）
- [ ] **ORDER-02**: 订单包含收货地址（实物商品必填，虚拟商品可为空）
- [ ] **ORDER-03**: 用户可以查看订单列表（按状态：待付款/待发货/已发货/已完成/已取消）
- [ ] **ORDER-04**: 用户可以查看订单详情（含物流信息）
- [ ] **ORDER-05**: 用户可以取消订单（待付款状态）
- [ ] **ORDER-06**: 用户可以确认收货
- [ ] **ORDER-07**: 管理员可以查看所有订单（多条件筛选：订单号/状态/时间/商品名称）
- [ ] **ORDER-08**: 管理员可以发货（填写运单号、物流公司）
- [ ] **ORDER-09**: 虚拟商品订单支付成功后自动完成，直接进入"已完成"状态

### 支付模块 (PAY)

- [ ] **PAY-01**: 用户可以发起微信JSAPI支付
- [ ] **PAY-02**: 系统可以接收并处理微信支付回调通知
- [ ] **PAY-03**: 支付成功后更新订单状态、扣减库存
- [ ] **PAY-04**: 虚拟商品支付成功后自动生成资源交付记录

### 库存模块 (STOCK)

- [ ] **STOCK-01**: 下单时预占库存（Redis锁防超卖）
- [ ] **STOCK-02**: 支付成功后真实扣减库存
- [ ] **STOCK-03**: 订单超时未支付自动取消并释放库存
- [ ] **STOCK-04**: 管理员可以查看商品SKU库存
- [ ] **STOCK-05**: 管理员可以手动修正库存（增加/减少，记录操作日志）
- [ ] **STOCK-06**: 库存低于阈值时触发预警提醒

### 用户模块 (USER)

- [ ] **USER-01**: 用户可以通过微信OAuth2授权登录
- [ ] **USER-02**: 用户可以管理收货地址（增删改查、设置默认地址）
- [ ] **USER-03**: 用户可以查看个人信息
- [ ] **USER-04**: 管理员可以查看注册用户列表（关联微信信息）
- [ ] **USER-05**: 管理员可以查看用户的订单和消费统计

### 评价模块 (EVAL)

- [ ] **EVAL-01**: 用户可以对已完成的订单商品进行评价（评分、评论、图片）
- [ ] **EVAL-02**: 用户可以查看自己的评价记录
- [ ] **EVAL-03**: 商品详情页展示评价列表（可选）

### 物流模块 (DELIVERY)

- [ ] **DELIVERY-01**: 管理员可以维护物流公司配置
- [ ] **DELIVERY-02**: 管理员可以填写/修改订单物流信息（运单号、物流公司）
- [ ] **DELIVERY-03**: 用户可以查看物流轨迹（已发货订单）
- [ ] **DELIVERY-04**: 物流状态追踪（在途/签收/退回）

### 系统设置模块 (SYS)

- [ ] **SYS-01**: 管理员可以管理首页轮播图
- [ ] **SYS-02**: 管理员可以配置微信支付参数（app-id、mch-id、api-key、notify-url）
- [ ] **SYS-03**: 管理员可以查看今日订单数、销售额、待发货等统计卡片

### 虚拟商品模块 (VIRTUAL)

- [ ] **VIRTUAL-01**: 虚拟商品无需收货地址
- [ ] **VIRTUAL-02**: 虚拟商品支付成功后自动交付资源（链接/文件/密钥）
- [ ] **VIRTUAL-03**: 虚拟商品可设置资源有效期
- [ ] **VIRTUAL-04**: 虚拟商品库存可设为无限制（stock=-1跳过库存校验）

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### 营销模块 (MARKETING)

- **MARKETING-01**: 优惠券管理（满减券、折扣券）
- **MARKETING-02**: 促销活动（限时折扣、团购）
- **MARKETING-03**: 会员等级与折扣

### 退款模块 (REFUND)

- **REFUND-01**: 用户发起退款申请
- **REFUND-02**: 管理员审核退款请求
- **REFUND-03**: 微信支付退款接口对接（原路退款）
- **REFUND-04**: 退款后回增库存

### 高级功能 (ADVANCED)

- **ADVANCED-01**: 商品搜索接入Elasticsearch提升体验
- **ADVANCED-02**: Redis Lua脚本进一步提升库存扣减并发性能
- **ADVANCED-03**: 多租户商户入驻（运营层面支持切换租户）
- **ADVANCED-04**: 模板消息通知（微信消息通知用户）

## Out of Scope

| Feature | Reason |
|---------|--------|
| 优惠券/满减活动一期 | 营销工具非核心功能，二期扩展 |
| 退款流程自动化一期 | 人工审核退款即可满足初期需求 |
| 多租户商户入驻一期 | 表结构已支持但运营层面先单租户 |
| 会员精细化权限控制一期 | 复用平台现有用户体系即可 |
| 视频/直播带货 | 非核心需求，大幅增加复杂度 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| GOODS-01 ~ GOODS-08 | Phase 1 | Pending |
| CART-01 ~ CART-06 | Phase 1 | Pending |
| USER-01 ~ USER-03 | Phase 1 | Pending |
| GOODS-05 ~ GOODS-07 | Phase 2 | Pending |
| SYS-01 ~ SYS-03 | Phase 2 | Pending |
| ORDER-01 ~ ORDER-06 | Phase 2 | Pending |
| ORDER-07 ~ ORDER-08 | Phase 3 | Pending |
| PAY-01 ~ PAY-04 | Phase 3 | Pending |
| STOCK-01 ~ STOCK-06 | Phase 3 | Pending |
| DELIVERY-01 ~ DELIVERY-04 | Phase 3 | Pending |
| EVAL-01 ~ EVAL-03 | Phase 4 | Pending |
| USER-04 ~ USER-05 | Phase 4 | Pending |
| VIRTUAL-01 ~ VIRTUAL-04 | Phase 2 | Pending |
| MARKETING-01 ~ MARKETING-03 | Phase 5 | Pending |
| REFUND-01 ~ REFUND-04 | Phase 5 | Pending |
| ADVANCED-01 ~ ADVANCED-04 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 39 total
- Mapped to phases: 39
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-08*
*Last updated: 2026-05-08 after initial definition*
