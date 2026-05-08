# Phase 2: 后台管理-商品与系统 - Context

**Gathered:** 2026-05-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 delivers the admin backend for mall-center: product category management, product publishing/editing with multi-SKU support, banner carousel management, statistics dashboard, and virtual goods configuration.
</domain>

<decisions>
## Implementation Decisions

### 商品发布配置

- **D-01:** 图片上传方式 — 先上传后选择。图片先上传到OSS，保存商品时直接引用URL。
- **D-02:** SKU规格管理 — 预定义规格+规格值池。颜色、内存、硬盘等规格名称预定义，每个规格有可选值列表。发布商品时勾选规格并设置对应价格/库存。
- **D-03:** 虚拟商品库存 — 固定库存+人工补货。虚拟商品需要设置具体库存数量（区别于实物商品的无限模式），卖完需管理员手动增加。

### 轮播图管理

- **D-04:** 轮播图链接 — 混合模式（内部商品+外部URL）。通过字段区分链接类型，支持内部商品详情页和外部营销活动URL。

### 统计卡片

- **D-05:** 数据计算策略 — 准实时统计（Redis缓存，每5分钟刷新）。兼顾性能和实时性，适合中等规模系统。
- **D-06:** 统计指标 — 完整7指标。核心5指标（今日订单数、销售额、待发货数、今日新用户、较昨日涨跌）+ 浏览量（PV）+ 平均客单价。

### 虚拟商品交付

- **D-07:** 资源交付形式 — 下载链接。支付成功后生成含时效token的下载链接（如7天有效），展示在订单详情页。
- **D-08:** 资源有效期 — 固定过期时间。管理员配置固定过期天数，支付成功后从订单完成时间起算有效期，过期不可下载。

### 批量操作与交互

- **D-09:** 批量上下架 — 50件/批。超过50件时分批处理，兼顾可用性和服务器压力。

### 分类树管理

- **D-10:** 分类操作 — 增删改+排序。支持新增/编辑/删除分类，支持拖拽或序号调整排序，支持设置分类图标。

### 微信支付配置

- **D-11:** 敏感参数存储 — 加密存储+AES。app-id、mch-id、api-key等使用AES加密后存储，配置界面脱敏展示（api-key显示后4位），管理员可见。

### 商品管理

- **D-12:** 商品克隆 — 支持克隆。商品列表提供「克隆」按钮，复制商品信息（可改分类/价格），SKU规格一并复制，减少重复录入。

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

- `.planning/ROADMAP.md` — Phase 2 goals, requirements GOODS-05~08, SYS-01~03, VIRTUAL-02~04
- `.planning/PROJECT.md` — Core value proposition and platform foundation
- `.planning/REQUIREMENTS.md` — Full requirement traceability
- `zlt-business/mall-center/` — Phase 1 implementation (reusable patterns, service structure)
- `sql/mall-center/mall_center.sql` — Existing database schema (6 tables: mall_category, mall_goods, mall_goods_spec, mall_goods_sku, mall_cart, mall_user_address)

### Phase 1 Artifacts
- `.planning/phases/01-基础架构搭建/01-01-SUMMARY.md` — Phase 1 implementation summary
- `.planning/phases/01-基础架构搭建/01-基础架构搭建-VERIFICATION.md` — Phase 1 verification report

</canonical_refs>

## Existing Code Insights

### Reusable Assets
- `MallCategory.java`, `MallGoods.java`, `MallGoodsSku.java` — existing entity classes to extend with admin fields
- `MallGoodsMapper.java`, `MallCategoryMapper.java` — existing mappers to reuse
- `IGoodsService.java`, `GoodsServiceImpl.java` — extend with admin-level methods

### Established Patterns
- TenantInterceptor already configured in Phase 1 — admin endpoints must respect same tenant isolation
- REST endpoint convention: `/api/mall/admin/...` vs user-facing `/api/mall/...`
- Service layer uses `ServiceImpl<Mapper, Entity>` pattern from MyBatis Plus

### Integration Points
- Admin controllers connect to existing `IGoodsService`, `ICategoryService` (to be created) for business logic
- Statistics dashboard queries `mall_order` table (Phase 3) with Redis caching
- Virtual goods delivery (D-07, D-08) ties to `MallResourceDelivery` table to be created in Phase 2

</code_context>

<specifics>
## Specific Ideas

- 轮播图支持外部URL时需要新增字段：`link_type`（goods/external）和`external_url`
- 虚拟商品交付链接格式：`/api/mall/resource/download/{deliveryId}?token={token}&expire={timestamp}`
- 统计数据缓存KEY设计：`stats:daily:{tenantId}:{date}`，每5分钟更新
- SKU规格值池需要新建 `mall_spec`（规格定义）和 `mall_spec_value`（规格值）两张表
</specifics>

<deferred>
## Deferred Ideas

### Ideas Deferred to Later Phases
- 订单统计数据查询（依赖mall_order表，Phase 3）
- 微信模板消息通知用户（Phase 3虚拟商品交付时）
- Elasticsearch商品搜索优化（Phase 5 ADVANCED-01）
- 商品浏览量（PV）统计需引入埋点或日志系统

</deferred>

---

*Phase: 2-后台管理-商品与系统*
*Context gathered: 2026-05-08*
