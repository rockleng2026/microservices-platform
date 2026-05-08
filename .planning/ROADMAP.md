# Roadmap: Mall-Center 在线商城系统

> 版本: 1.0
> 创建日期: 2026-05-08
> 基于平台: central-platform v6.0.0

---

## 概览

**[5 phases]** | **[39 requirements mapped]** | All v1 requirements covered ✓

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|-----------------|
| 1 | 基础架构搭建 | 完成mall-center服务创建、数据库设计、基础CRUD能力 | GOODS-01~04, CART-01~06, USER-01~03, VIRTUAL-01 | 4 |
| 2 | 后台管理-商品与系统 | 完成管理后台商品管理、分类管理、系统设置、虚拟商品配置 | GOODS-05~08, SYS-01~03, VIRTUAL-02~04 | 5 |
| 3 | 订单与支付核心 | 完成订单创建/流转/管理、微信支付集成、库存安全扣减、物流配置 | ORDER-01~09, PAY-01~04, STOCK-01~06, DELIVERY-01 | 5 |
| 4 | 用户侧评价与交互 | 完成评价模块、客户管理功能 | EVAL-01~03, USER-04~05, DELIVERY-02~04 | 4 |
| 5 | 营销扩展（可选） | 预留扩展能力 | MARKETING-01~03, REFUND-01~04, ADVANCED-01~04 | - |

---

## Phase 1: 基础架构搭建

**Goal:** 完成mall-center服务创建、数据库设计、用户侧商品浏览与购物车基础功能

**Mode:** mvp

**Success Criteria:**
1. mall-center服务成功注册到Nacos，端口7010，数据库cp_mall建表完成
2. 用户可以查看商品分类树和商品列表（含搜索、筛选、排序、分页）
3. 用户可以查看商品详情，选择SKU规格
4. 用户可以将商品加入购物车，修改数量，勾选删除
5. 用户可通过微信授权登录（网关+uaa集成）

**Requirements:**
- GOODS-01: 用户可以查看商品分类列表（树形结构）
- GOODS-02: 用户可以搜索商品（按名称、分类、关键词模糊搜索）
- GOODS-03: 用户可以浏览商品列表（分类筛选、排序：价格/销量/新品、分页）
- GOODS-04: 用户可以查看商品详情（含多规格SKU选择、库存显示、图文详情）
- CART-01: 用户可以将商品加入购物车（选择SKU规格）
- CART-02: 用户可以修改购物车商品数量和规格
- CART-03: 用户可以删除购物车中的商品
- CART-04: 用户可以勾选/取消勾选购物车商品
- CART-05: 用户可以查看购物车合计金额
- CART-06: 购物车中实物与虚拟商品不支持混合结算（需分开下单）
- USER-01: 用户可以通过微信OAuth2授权登录
- USER-02: 用户可以管理收货地址（增删改查、设置默认地址）
- USER-03: 用户可以查看个人信息
- VIRTUAL-01: 虚拟商品无需收货地址

**Backend Files:**
```
zlt-business/mall-center/
├── MallCenterApplication.java
├── config/
│   ├── WebMvcConfig.java
│   ├── MyBatisConfig.java
│   └── TenantInterceptor.java
├── controller/
│   ├── GoodsController.java
│   ├── CartController.java
│   ├── UserAddressController.java
│   └── UserController.java
├── mapper/
├── model/entity/
│   ├── MallCategory.java
│   ├── MallGoods.java
│   ├── MallGoodsSku.java
│   ├── MallCart.java
│   └── MallUserAddress.java
├── service/
└── resources/
    ├── application.yml
    └── mapper/
```

**Database Tables:**
- mall_category (商品分类)
- mall_goods (商品信息，含goods_type区分实物/虚拟)
- mall_goods_spec (商品规格定义)
- mall_goods_sku (商品SKU)
- mall_cart (购物车)
- mall_user_address (收货地址)

---

## Phase 2: 后台管理-商品与系统

**Goal:** 完成管理后台商品管理、分类管理、系统设置、虚拟商品完整配置

**Success Criteria:**
1. 管理员可以增删改查商品分类（树形结构）
2. 管理员可以发布/编辑商品，支持多SKU规格配置，支持选择实物/虚拟类型
3. 管理员可以批量上下架商品
4. 管理员可以配置首页轮播图
5. 管理员可以查看统计卡片（今日订单数、销售额、待发货数）
6. 虚拟商品可配置资源链接/文件ID/有效期

**Requirements:**
- GOODS-05: 管理员可以管理商品分类（增删改查、树形结构）
- GOODS-06: 管理员可以发布/编辑商品（基本信息、商品图集、SKU规格、销售价格、库存数量）
- GOODS-07: 管理员可以批量上下架商品
- GOODS-08: 商品支持两种类型：实物商品（需物流）和虚拟商品（即时交付）
- SYS-01: 管理员可以管理首页轮播图
- SYS-02: 管理员可以配置微信支付参数（app-id、mch-id、api-key、notify-url）
- SYS-03: 管理员可以查看今日订单数、销售额、待发货等统计卡片
- VIRTUAL-02: 虚拟商品支付成功后自动交付资源（链接/文件/密钥）
- VIRTUAL-03: 虚拟商品可设置资源有效期
- VIRTUAL-04: 虚拟商品库存可设为无限制（stock=-1跳过库存校验）

**Backend Files:**
```
controller/admin/
├── AdminGoodsController.java
├── AdminCategoryController.java
├── AdminBannerController.java
└── AdminSettingsController.java
service/
├── IAdminGoodsService.java
├── IAdminCategoryService.java
└── impl/
model/dto/
├── AdminGoodsDTO.java
├── AdminCategoryDTO.java
└── BannerDTO.java
```

**Database Tables:**
- mall_banner (轮播图)
- mall_express (物流公司配置)
- mall_settings (系统配置)

---

## Phase 3: 订单与支付核心

**Goal:** 完成订单创建/流转/管理、微信JSAPI支付集成、库存安全扣减、物流配置

**Success Criteria:**
1. 用户可以创建订单（从购物车或直接购买），实物订单需选择收货地址
2. 用户可以发起微信JSAPI支付
3. 系统正确处理微信支付回调，更新订单状态、扣减库存
4. 虚拟商品订单支付成功后自动完成并生成交付记录
5. 用户可以查看订单列表（按状态筛选）、订单详情、物流轨迹
6. 管理员可以查看/筛选所有订单，执行发货操作
7. 库存扣减使用Redis预占机制，防止超卖
8. 订单超时未支付自动取消释放库存

**Requirements:**
- ORDER-01: 用户可以创建订单（从购物车选中项或直接购买）
- ORDER-02: 订单包含收货地址（实物商品必填，虚拟商品可为空）
- ORDER-03: 用户可以查看订单列表（按状态：待付款/待发货/已发货/已完成/已取消）
- ORDER-04: 用户可以查看订单详情（含物流信息）
- ORDER-05: 用户可以取消订单（待付款状态）
- ORDER-06: 用户可以确认收货
- ORDER-07: 管理员可以查看所有订单（多条件筛选：订单号/状态/时间/商品名称）
- ORDER-08: 管理员可以发货（填写运单号、物流公司）
- ORDER-09: 虚拟商品订单支付成功后自动完成，直接进入"已完成"状态
- PAY-01: 用户可以发起微信JSAPI支付
- PAY-02: 系统可以接收并处理微信支付回调通知
- PAY-03: 支付成功后更新订单状态、扣减库存
- PAY-04: 虚拟商品支付成功后自动生成资源交付记录
- STOCK-01: 下单时预占库存（Redis锁防超卖）
- STOCK-02: 支付成功后真实扣减库存
- STOCK-03: 订单超时未支付自动取消并释放库存
- STOCK-04: 管理员可以查看商品SKU库存
- STOCK-05: 管理员可以手动修正库存（增加/减少，记录操作日志）
- STOCK-06: 库存低于阈值时触发预警提醒
- DELIVERY-01: 管理员可以维护物流公司配置

**Backend Files:**
```
controller/
├── OrderController.java
└── admin/AdminOrderController.java
service/
├── IOrderService.java
├── IStockService.java
├── IPayService.java
└── impl/
    ├── OrderServiceImpl.java (含库存预占/释放逻辑)
    ├── StockServiceImpl.java (含Redis锁)
    └── PayServiceImpl.java (含微信支付SDK集成)
model/entity/
├── MallOrder.java
├── MallOrderItem.java
├── MallDelivery.java
├── MallResourceDelivery.java
└── MallStockLog.java
utils/
└── WeChatPayUtil.java
```

**Database Tables:**
- mall_order (订单主表)
- mall_order_item (订单明细)
- mall_delivery (物流信息)
- mall_resource_delivery (虚拟商品交付记录)
- mall_stock_log (库存操作日志)

---

## Phase 4: 用户侧评价与交互

**Goal:** 完成评价模块、客户管理功能

**Success Criteria:**
1. 用户可以对已完成的订单商品进行评价（评分、评论、图片）
2. 用户可以查看自己的评价记录
3. 商品详情页展示评价列表
4. 管理员可以查看注册用户列表及消费统计
5. 用户可以查看物流轨迹（已发货订单）

**Requirements:**
- EVAL-01: 用户可以对已完成的订单商品进行评价（评分、评论、图片）
- EVAL-02: 用户可以查看自己的评价记录
- EVAL-03: 商品详情页展示评价列表（可选）
- USER-04: 管理员可以查看注册用户列表（关联微信信息）
- USER-05: 管理员可以查看用户的订单和消费统计
- DELIVERY-02: 管理员可以填写/修改订单物流信息（运单号、物流公司）
- DELIVERY-03: 用户可以查看物流轨迹（已发货订单）
- DELIVERY-04: 物流状态追踪（在途/签收/退回）

**Backend Files:**
```
controller/
├── EvaluateController.java
└── admin/AdminUserController.java
service/
├── IEvaluateService.java
└── IAdminUserService.java
model/entity/
├── MallEvaluate.java
└── MallExpress.java
```

---

## Phase 5: 营销扩展（可选）

**Goal:** 预留扩展能力，一期暂不实现

**Requirements:**
- MARKETING-01: 优惠券管理（满减券、折扣券）
- MARKETING-02: 促销活动（限时折扣、团购）
- MARKETING-03: 会员等级与折扣
- REFUND-01: 用户发起退款申请
- REFUND-02: 管理员审核退款请求
- REFUND-03: 微信支付退款接口对接（原路退款）
- REFUND-04: 退款后回增库存
- ADVANCED-01: 商品搜索接入Elasticsearch提升体验
- ADVANCED-02: Redis Lua脚本进一步提升库存扣减并发性能
- ADVANCED-03: 多租户商户入驻（运营层面支持切换租户）
- ADVANCED-04: 模板消息通知（微信消息通知用户）

---

## Dependencies

```
Phase 1 (基础架构)
    ↓
Phase 2 (后台管理) — 依赖 Phase 1 的数据库和服务基础
    ↓
Phase 3 (订单支付) — 依赖 Phase 1 的商品和用户基础
    ↓
Phase 4 (评价交互) — 依赖 Phase 3 的订单基础
    ↓
Phase 5 (营销扩展) — 依赖 Phase 3 的订单和支付基础
```

---

## Technical Notes

### 微信登录集成
- 小程序通过 wx.login() 获取 code → 传给后端 /api/mall/auth/login
- 后端调用微信接口换取 openid/session_key
- 绑定/创建用户记录，生成平台 JWT Token 返回
- 网关校验 Token，用户信息写入 ThreadLocal

### 库存扣减方案
```
1. 下单时：Redis DECRBY sku:stock:{skuId} {quantity}
   - 若结果 < 0，INCRBY 回滚，返回库存不足
   - 若结果 >= 0，写入 order:stock:lock:{orderId} 记录预占
2. 支付成功：数据库真实扣减 stock - quantity
3. 订单取消/超时：Redis INCRBY sku:stock:{skuId} {quantity}，删除预占记录
```

### 微信支付流程
```
1. 用户下单 → 创建订单记录（status=1待付款）
2. 用户点击支付 → 调用 /api/mall/order/{id}/pay
3. 后端调用微信统一下单API，获取 prepay_id
4. 返回 {timeStamp, nonceStr, package, signType, paySign} 给小程序
5. 小程序调用 wx.requestPayment()
6. 微信支付成功 → 回调通知 /api/mall/order/pay/callback
7. 后端验证签名，更新订单状态，扣减库存
```

### 虚拟商品交付
```
1. 支付回调时检测 order.goodsType == 2
2. 订单状态直接改为 4(已完成)
3. 写入 mall_resource_delivery 记录（url/expire）
4. 可选：发送微信模板消息通知用户
```

---

## 执行说明

**Phase 1 完成后：**
```bash
/gsd-plan-phase 1  # 详细规划 Phase 1 的实现任务
```

**Phase 2 完成后：**
```bash
/gsd-complete-milestone  # 归档 Phase 1，开始 Phase 2
```

---
*Roadmap created: 2026-05-08*
*Last updated: 2026-05-08 after initial creation*
