# Phase 18 Discussion Log

**Phase:** 18 — 商城使用帮助文档-接口文档
**Date:** 2026-05-20
**Mode:** default (interactive)

---

## Areas Discussed

### 1. 接口文档内容来源

- **Options presented:**
  - 代码解析 + 手工补充（从 Swagger 注解自动解析 + 手工补充说明）
  - 手工编写配置（手工维护 JSON/MD 文件）
  - 手工为主（先手工编写，后续考虑自动化）
- **User selected:** 代码解析 + 手工补充
- **Rationale:** 代码即文档，保持一致性，省时且准确

### 2. 页面结构和导航方式

- **Options presented:**
  - Tab 按模块分组（Tab 切换模块，内容分区清晰）
  - 侧边树 + 搜索（左侧菜单树，层级分明，可搜索）
  - 单页 + 筛选器（单页平铺，顶部筛选器快速定位）
- **User selected:** Tab 按模块分组
- **Rationale:** 与现有管理后台页面风格一致，结构清晰

### 3. 路由设计

- **Options presented:**
  - /mall-help 下三子路由（/mall-help/api、/mall-help/menu、/mall-help/faq）
  - 三个独立菜单（各自独立的一级菜单）
- **User selected:** /mall-help 下三子路由
- **Rationale:** 三个子功能在同一个顶级菜单下，逻辑分组清晰

---

## Decisions Captured

- **D-01:** 接口文档从 Controller Java 代码 Swagger 注解自动解析 + 手工补充
- **D-02:** Tab 按模块分组展示接口文档
- **D-03:** 路由 `/mall-help` 下三个子路由（api/menu/faq）
- **D-04:** 数据库 root/lengfeng847，central_organization 库
- **D-05:** 动态菜单通过 central_organization.menu_page + menu_func 表实现

## Deferred Ideas

None.

---

*Discussion completed: 2026-05-20*
*Context file: 18-CONTEXT.md*
*Next step: /gsd-plan-phase 18 ${GSD_WS}*