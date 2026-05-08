# Phase 7: 扩展功能 - Context

**Gathered:** 2026-05-08
**Status:** Ready for planning

## Phase Boundary

实现 3 个独立扩展功能：Redis Lua 原子化库存扣减、多商户入驻（平台自营+商户模式）、微信模板消息通知（订单+发货场景）。

## Implementation Decisions

### ADVANCED-02: Redis Lua 库存优化

- **D-01:** 仅对 `preAllocateStock`（预占库存）做 Lua 原子化，消除 decrement→检查→回滚 的竞争窗口
- **D-02:** 使用 **Redisson RScript** 方式执行 Lua 脚本，复用现有 Redisson 客户端，支持集群部署
- **Scope:** 仅预占库存原子化；真实扣减(release/deduct/correct)暂不改动

### ADVANCED-03: 多商户入驻

- **D-03:** 采用 **平台自营 + 商户入驻** 模式，平台有独立 tenant（如 `master`），商户各有独立 tenant_id
- **D-04:** 商户粒度：商品+订单+营销数据按 tenant_id 隔离，用户表/支付配置共享（复用平台统一微信支付）
- **D-05:** 管理员切换商户方式：**管理后台上拉选择商户**，Header 传 `x-tenant-header`（现有 TenantInterceptor 已支持）
- **Scope:** 商户入驻（商户注册/审核/开通），暂不涉及独立支付通道

### ADVANCED-04: 微信模板消息

- **D-06:** 通知场景：**订单支付成功通知** + **商家发货通知**（含快递信息）
- **D-07:** 推送方式：**微信官方模板消息**（小程序订阅消息），需配置微信公众平台模板 ID
- **D-08:** 调用时机：支付回调成功时发订单通知；管理员发货操作时发物流通知

### Claude's Discretion

- 退款审核通过/拒绝是否发微信通知 — 未讨论，**可由 planner 按标准 UX 判断**
- Lua 脚本的超时重试逻辑 — **planner 按 Redisson RScript 默认行为处理**
- 商户入驻的审核流程（自动/人工） — **planner 决定**（一期建议人工审核）

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Redis 库存

- `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/StockServiceImpl.java` — 现有实现，预占/扣减/释放模式

### 多商户

- `zlt-business/mall-center/src/main/java/com/central/mall/config/TenantInterceptor.java` — 现有租户上下文，Header: `x-tenant-header`
- 需求来源：`docs/mall-center/在线销售服务器硬件小程序开发V1.0.md`

### 微信消息

- `zlt-business/mall-center/src/main/java/com/central/mall/utils/WeChatPayUtil.java` — 现有微信工具类，支付签名逻辑
- `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/PayServiceImpl.java` — 支付回调处理

## Existing Code Insights

### Reusable Assets

- **Redisson RScript**: 可直接用于 Lua 脚本执行，复用现有 `redisson-spring-boot-starter`
- **TenantInterceptor**: ThreadLocal 方式管理 tenant，已在所有 Service 中使用
- **WeChatPayUtil**: XML 签名/解析工具，可复用

### Established Patterns

- Redis key 命名：`sku:stock:{skuId}`、`order:stock:lock:{orderId}`
- operationType 枚举：1=预占, 2=真实扣减, 3=释放, 4=手动修正, 5=退款回增
- 微信调用模式：RestTemplate + XML body

### Integration Points

- **Lua 原子化**: `IStockService.preAllocateStock()` — 只改这个方法的实现
- **多商户**: 所有 Service 的 `TenantInterceptor.getCurrentTenantId()` 已埋点，切换 Header 即可
- **微信通知**: `PayServiceImpl.processPayCallback()` 支付成功时调用通知；`AdminOrderController.adminShip()` 发货时调用通知

## Specific Ideas

- 商户入驻后，第一批商品建议由平台运营代上传，商户确认后生效
- 发货通知需要物流公司名称+快递单号，模板消息字段按微信官方格式

## Deferred Ideas

None — discussion stayed within phase scope.

---

*Phase: 7-扩展功能*
*Context gathered: 2026-05-08*
