# Phase 18: 商城使用帮助文档-接口文档 - Context

**Gathered:** 2026-05-20
**Status:** Ready for planning

<domain>
## Phase Boundary

实现商城使用帮助文档系统的**接口文档**模块（Phase 18 of v2.1）。在管理后台 React 应用中增加商城使用帮助文档菜单，下设三个子菜单（接口文档、菜单使用说明、FAQ）。本 phase 专注于接口文档：列出 mall-center 所有 Controller 接口，描述每个接口的路径、方法、参数、响应格式和内部实现逻辑。

</domain>

<decisions>
## Implementation Decisions

### 接口文档内容来源
- **D-01:** 接口文档内容从 Controller Java 代码的 Swagger 注解（`@Tag`, `@Operation`）自动解析生成，结合手工补充业务逻辑说明
- 理由：代码即文档，保持一致性，省时且准确

### 页面结构和导航
- **D-02:** 采用 Tab 按模块分组展示接口文档（商品模块、订单模块、用户模块、优惠券模块、营销模块等）
- 理由：与现有管理后台页面风格一致，结构清晰

### 路由设计
- **D-03:** 在 `/mall-help` 下设置三个子路由：`/mall-help/api`（接口文档）、`/mall-help/menu`（菜单使用说明）、`/mall-help/faq`（FAQ）
- 理由：三个子功能在同一个顶级菜单下，逻辑分组清晰

### 数据库连接
- **D-04:** 数据库连接：root/lengfeng847（central_organization 库用于菜单配置）
- mall-center 服务端口：7010

### 菜单配置实现
- **D-05:** 动态菜单通过插入 central_organization.menu_page 和 menu_func 表实现
- 文档页面为 React 组件，路由 `/mall-help` 下三个子路由

### Claude's Discretion
- Tab 样式细节（颜色、激活态）、文档详略程度、搜索框样式均可自行决定

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Phase Context
- `.planning/PROJECT.md` — v2.1 milestone goals, tech stack (React + Umi + Ant Design)
- `.planning/REQUIREMENTS.md` — HELP-01-01~04 interface document requirements
- `.planning/ROADMAP.md` — Phase 18 goal and success criteria
- `.planning/STATE.md` — current milestone state

### Codebase
- `zlt-business/mall-center/src/main/java/com/central/mall/controller/` — mall-center 所有 Controller（接口文档数据源）
- `zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/` — Admin 后台 Controller（@Tag 注解标注）
- `zlt-business/mall-center/src/main/java/com/central/mall/controller/GoodsController.java` — 示例：用户侧商品 Controller
- `zlt-business/mall-center/src/main/java/com/central/mall/controller/OrderController.java` — 示例：用户侧订单 Controller

### Frontend
- `zlt-web/portal-web/src/pages/` — portal-web 现有页面结构（参考）
- `zlt-web/portal-web/src/app.tsx` — Umi 路由配置参考

### Database
- `central_organization` 库 `menu_page` + `menu_func` 表 — 动态菜单配置表

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `@Tag` 和 `@Operation` 注解：自动提取接口名称和描述
- `Result<T>` 统一响应包装：描述响应格式
- Swagger UI 已集成：可直接参考现有 Swagger 文档

### Established Patterns
- RESTful 风格：`GET /list`、`POST /{id}`、`PUT /{id}`、`DELETE /{id}`
- 分页模式：`page` + `pageSize` + 筛选参数
- 统一响应：`Result.succeed(data)` / `Result.failed(message)`

### Integration Points
- 数据库：central_organization 库 menu_page/menu_func 表
- 后端 API：mall-center 微服务（端口 7010）
- 前端框架：portal-web（React + Umi + Ant Design）

</code_context>

<specifics>
## Specific Ideas

- 接口列表按模块分组（商品、订单、购物车、用户、优惠券、评价、营销等）
- 每个接口显示：接口路径、请求方法、请求参数、响应格式、业务逻辑说明
- 三个子菜单共享同一顶级菜单"商城使用帮助文档"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 18-商城使用帮助文档-接口文档*
*Context gathered: 2026-05-20*