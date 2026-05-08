# Phase 6: 订单增强与管理端完善 - Context

**Gathered:** 2026-05-08
**Status:** Ready for planning
**Source:** 规划讨论

<domain>
## Phase Boundary

Phase 6 包含两个子方向：
1. **订单增强** — 管理员关单、改价、备注 + 用户延长收货
2. **管理端数据看板** — 销售趋势、库存预警、用户分析

</domain>

<decisions>
### Phase 5 已完成（锁定）
- REFUND-01~10 退款模块已实现
- MARKETING-01~09 营销模块已实现
- COMPILE-01 Result.succeed() 已修复，编译通过

### Phase 6 范围（新增决策）
### 订单增强
- ORDER-EXT-01: 管理员可关闭已发货订单（强制关闭，不退款）
- ORDER-EXT-02: 管理员可修改订单金额（优惠折让，不能高于原价）
- ORDER-EXT-03: 订单备注字段（remark），用户和管理员各自可添加

### 数据看板
- STAT-01: 销售趋势按日/周/月维度展示
- STAT-02: 库存预警 — SKU库存低于阈值时出现在预警列表
- STAT-03: 用户分析 — 新增用户数、活跃度

### 订单增强
- 不实现"延长收货"（ORDER-07）— 用户确认收货是主动行为，不需要延长
- 管理员关单仅限已发货状态，待付款/已付款未发货走用户取消流程
- 管理员改价需要记录操作日志（who/when/old/new）

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase 5 计划文件
- `.planning/phases/05-修复编译与营销/05-01-PLAN.md` — 编译修复参考
- `.planning/phases/05-修复编译与营销/05-02-PLAN.md` — 退款模块参考
- `.planning/phases/05-修复编译与营销/05-03-PLAN.md` — 营销模块参考

### 订单相关
- `zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallOrder.java` — 订单实体，现有status字段
- `zlt-business/mall-center/src/main/java/com/central/mall/service/IOrderService.java` — 订单服务接口
- `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/OrderServiceImpl.java` — 订单服务实现
- `zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminOrderController.java` — 管理端订单控制器

### 统计相关
- `zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminStatisticsController.java` — 现有统计控制器
- `zlt-business/mall-center/src/main/java/com/central/mall/service/IAdminStatisticsService.java` — 统计服务接口

</canonical_refs>

<specifics>
## Specific Ideas

1. MallOrder.remark 已存在，直接复用或扩展
2. AdminOrderController 已有分页查询，在其基础上扩展关单/改价接口
3. AdminStatisticsController 已有今日统计，扩展为趋势/库存/用户三个维度
4. 订单改价需要 tenantId + adminId 操作日志记录

</specifics>

<deferred>
## Deferred Ideas

- ORDER-07（延长收货）暂不实现，用户确认收货是主动行为
- 销售趋势需要历史数据积累，初期可只做基础 SQL 统计

</deferred>

---

*Phase: 06-订单增强与管理端完善*
*Context gathered: 2026-05-08 via 规划讨论*