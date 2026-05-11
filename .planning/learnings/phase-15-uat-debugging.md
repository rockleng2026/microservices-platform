# Phase 15 UAT调试经验总结

## 问题诊断流程

### 1. 工作台数据不展示 - 完整排查链

**问题现象**: 点击工作台，页面无数据，F12控制台无请求发出

**排查步骤**:
1. 检查组件是否正确导入 store → 路径正确
2. 检查 store 是否正确导入 API → 正确
3. 检查 API 文件是否导入 request → **发现缺失！** `ReferenceError: request is not defined`
4. 检查 API 路径是否正确 → 发现多了一层 `mall-center`

**根本原因**:
- `statistics.ts` 使用了 `request` 函数但没有导入
- API路径配置错误：`/api-mall/mall-center/api/...` 应为 `/api-mall/api/...`
- 网关 `StripPrefix=1` 会去掉 `/api-mall`，所以路径不能包含服务名

**修复记录**:
```
statistics.ts:
- 添加 import { request } from '@/utils/request';
- MALL_CENTER_API 从 '/api-mall/mall-center' 改为 '/api-mall'

API参数问题:
- sales-trend 后端要求 startDate/endDate 参数（必须）
- top-products 后端接口不存在，暂时返回空数组
```

---

## 常见错误模式

### 前端 `ReferenceError: xxx is not defined`
- 原因：使用了函数/变量但忘记导入
- 排查：检查文件顶部的 import 语句

### API 404 但 curl 能通
- 原因：请求路径错误或代理配置问题
- 排查：
  1. curl 直接测后端：`curl http://localhost:9900/api-mall/...`
  2. 检查网关的 StripPrefix 配置
  3. 确认前端请求路径是否包含多余路径（如 mall-center）

### 后端参数校验失败
- 原因：前端只传了部分参数，后端要求全部参数
- 排查：检查 Controller 的 @RequestParam 是否有 required=true（默认）
- 修复：为可选参数提供默认值

---

## 网关路由知识

### 关键配置
```yaml
- id: mall-center
  uri: lb://mall-center
  predicates:
    - Path=/api-mall/**
  filters:
    - StripPrefix=1
```

### 实际路由效果
| 前端请求 | 网关处理 | 后端实际收到 |
|---------|---------|-------------|
| /api-mall/api/mall/admin/... | StripPrefix=1 | /api/mall/admin/... |

**重要**: 前端不要在路径里加 `mall-center`，网关已经做了路由转换

---

## 后端接口检查清单

当发现 API 404时：
1. 确认后端 Controller 的 `@RequestMapping` 路径
2. 确认前端请求路径与之一致
3. 检查参数是否齐全（@RequestParam required 默认 true）
4. 检查 HTTP 方法是否正确（GET/POST）

---

## 数据库菜单相关

### 菜单权限机制
- `menu_page` 表：菜单页面定义
- `workposition.menu_ids` 字段：以逗号分隔的菜单ID列表
- 使用 `FIND_IN_SET` 查询

### 添加商城管理菜单步骤
1. 在 `menu_page` 表插入菜单记录（设置好 parent_id）
2. 在 `workposition.menu_ids` 中追加菜单ID
3. 重新登录或刷新页面

---

## Git 提交规范

```
fix(phase-15-uat): 简短描述
- 具体问题1
- 具体问题2
- 修复内容
```

---

## 项目结构速查

```
前端请求路径规范:
/api-mall/...     → 网关路由到 mall-center
/api-uaa/...      → 网关路由到 auth-center
/api-portal/...   → 网关路由到 portal

后端接口路径:
/api/mall/admin/...   → mall-center AdminController
/api/mall/...         → mall-center UserController
```
