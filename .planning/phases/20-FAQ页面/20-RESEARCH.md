# Phase 20: FAQ页面实现 - Research

**Researched:** 2026-05-21
**Domain:** FAQ页面（HELP-03-01~04）
**Confidence:** HIGH

## Summary

Phase 20 的目标是实现 FAQ 页面，支持 FAQ 列表完整展示、问题/原因/解决方案结构化数据、支持分类浏览。现有系统已有静态硬编码的 FAQ 前端页面（`/mall-help/faq`），但没有后端 API 和数据库支持。Phase 18 的接口文档（ApiDoc）采用了静态 JSON 数据加载方式，作为最接近的参考实现。

本报告基于以下源码调研：
- `zlt-web/portal-web/src/pages/MallHelp/FAQ/index.tsx` — 当前 FAQ 页面（静态数据）
- `zlt-web/portal-web/src/pages/MallHelp/ApiDoc/index.tsx` — 接口文档页面（静态 JSON 模式）
- `sql/menu_page.sql` — 菜单页面表结构
- `sql/mall-help-menu.sql` — 帮助文档菜单配置
- `zlt-web/portal-web/.umirc.ts` — 前端路由配置

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| FAQ 列表展示 | Frontend (React) | — | portal-web 页面渲染 |
| FAQ 数据存储 | Database (central_organization) | — | MySQL 持久化 |
| FAQ CRUD API | Backend (mall-center) | — | Spring Boot Controller |
| 菜单配置 | Database (central_organization) | — | menu_page 表动态菜单 |
| 前端路由 | Frontend (Umi) | — | .umirc.ts 路由注册 |

## User Constraints

### Locked Decisions
- 路由路径 `/mall-help/faq` 已确定
- 菜单配置通过 menu_page/menu_func 管理
- 前端技术栈：React + Ant Design + Umi

### Claude's Discretion
- FAQ 数据是否放在 mall-center 还是独立 service
- 是否需要管理员增删改查界面
- FAQ 数据是否需要缓存

### Deferred Ideas
- 用户贡献 FAQ 功能（不在本次范围内）

## Standard Stack

### Frontend
| Library | Version | Purpose |
|---------|---------|---------|
| React | 18.x | 页面框架 |
| Ant Design | 5.x | UI 组件库 |
| Umi | 4.x | 前端框架/路由 |

### Backend
| Library | Version | Purpose |
|---------|---------|---------|
| Spring Boot | 3.1.6 | 后端框架 |
| MyBatis Plus | 3.5.4.1 | ORM |
| MySQL | 5.7+ | 数据库 |

### Database (central_organization)
| Table | Purpose |
|-------|---------|
| menu_page | 页面/菜单配置 |
| menu_func | 页面功能点/权限 |
| faq（新建） | FAQ 数据存储 |

## Database Table Structure

### menu_page 表结构（已存在）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | bigint(20) | 菜单ID（PK） |
| name | varchar(255) | 菜单名称 |
| parent_id | bigint(20) | 父级ID |
| link_url | varchar(100) | 路由路径 |
| icon | varchar(50) | 图标 |
| sort_order | int(11) | 排序号 |
| status | tinyint(1) | 状态（1启用） |
| tenant_id | varchar(32) | 租户ID |

### menu_func 表结构（已存在）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | int(11) | 权限ID（PK） |
| perm_code | varchar(100) | 权限代码 |
| perm_name | varchar(100) | 权限名称 |
| menu_page_id | int(11) | 关联菜单ID |
| perm_type | tinyint(1) | 权限类型（1按钮/2数据） |

### FAQ 表结构（需新建）

```sql
CREATE TABLE `mall_faq` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT 'FAQ ID',
  `category` varchar(50) NOT NULL COMMENT '分类（dev/biz/config/error）',
  `question` varchar(500) NOT NULL COMMENT '问题',
  `cause` text NULL COMMENT '原因分析',
  `solution` text NULL COMMENT '解决方案',
  `sort_order` int(11) NULL DEFAULT 0 COMMENT '排序号',
  `status` tinyint(1) NULL DEFAULT 1 COMMENT '状态（1启用/0禁用）',
  `view_count` int(11) NULL DEFAULT 0 COMMENT '浏览次数',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `tenant_id` varchar(32) NULL DEFAULT 'default' COMMENT '租户ID',
  `created_by` bigint(20) NULL COMMENT '创建人',
  `updated_by` bigint(20) NULL COMMENT '更新人',
  PRIMARY KEY (`id`),
  INDEX `idx_category`(`category`),
  INDEX `idx_tenant_id`(`tenant_id`),
  INDEX `idx_status`(`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='FAQ表';
```

**字段说明：**
- `question` — 问题描述
- `cause` — 原因分析（富文本或纯文本）
- `solution` — 解决方案（富文本或纯文本）
- `category` — 分类（dev=开发类，biz=业务类，config=配置类，error=常见错误）
- `sort_order` — 同分类内的排序
- `view_count` — 浏览次数（可选）

## Existing FAQ Implementation

### 当前 FAQ 页面（静态数据）

**文件：** `zlt-web/portal-web/src/pages/MallHelp/FAQ/index.tsx`

**结构：**
- 4 个分类硬编码：`dev`, `biz`, `config`, `error`
- 每条 FAQ 包含 `q`（问题）和 `a`（答案数组）字段
- 搜索功能：过滤问题和答案
- 使用 `details/summary` 展开收起

**缺陷：**
- 数据硬编码，无法动态管理
- 无后端 API
- 无增删改查界面
- 每条 FAQ 只有问题/答案，无独立的原因/解决方案字段

## API Design

### FAQ Controller（mall-center）

**Base Path:** `/api-mall/faqs`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api-mall/faqs` | 分页获取 FAQ 列表 |
| GET | `/api-mall/faqs/:id` | 获取单条 FAQ |
| GET | `/api-mall/faqs/categories` | 获取所有分类 |
| POST | `/api-mall/faqs` | 新增 FAQ（管理员） |
| PUT | `/api-mall/faqs/:id` | 更新 FAQ（管理员） |
| DELETE | `/api-mall/faqs/:id` | 删除 FAQ（管理员） |

### Response Format

```json
{
  "resp_code": 0,
  "resp_msg": "success",
  "datas": {
    "records": [
      {
        "id": 1,
        "category": "dev",
        "question": "接口文档在哪里可以找到？",
        "cause": "需要在后台管理左侧菜单点击相应入口",
        "solution": "在后台管理左侧菜单点击「商城使用帮助文档」→「接口文档」",
        "sortOrder": 1,
        "status": 1,
        "viewCount": 0
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

## Frontend Page Design

### FAQ 列表页（分类侧边栏 + 问题列表）

**布局：** 左右两栏
- 左侧：分类列表（固定）
- 右侧：问题卡片列表

**交互流程：**
1. 进入页面 → 调用 `/api-mall/faqs/categories` 获取分类
2. 默认选中第一个分类 → 调用 `/api-mall/faqs?category=dev` 获取该分类 FAQ
3. 点击分类切换 → 更新右侧列表
4. 点击问题 → 展开查看原因/解决方案
5. 搜索框 → 全局搜索所有分类的 FAQ

**组件结构：**
```
FAQPage
├── FAQHeader（标题 + 搜索框）
├── FAQContent
│   ├── FAQCategorySidebar（左侧分类）
│   └── FAQList（右侧问题列表）
│       └── FAQItem（单个问题卡片）
│           ├── Question（问题标题，点击展开）
│           └── Answer（原因+解决方案）
```

### 前端 API 调用

在 `zlt-web/portal-web/src/services/` 下新建 `mall-admin/faq.ts`：

```typescript
import { request } from '@/utils/request';

const API_BASE = '/api-mall';

export async function getFaqList(params: {
  category?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}) {
  return request(`${API_BASE}/faqs`, { params });
}

export async function getFaqCategories() {
  return request(`${API_BASE}/faqs/categories`);
}

export async function getFaqById(id: number) {
  return request(`${API_BASE}/faqs/${id}`);
}
```

## Menu Configuration

### 现有菜单配置（mall-help-menu.sql）

```sql
-- 父菜单 ID=900
INSERT INTO menu_page VALUES (900, '商城使用帮助文档', 0, '/mall-help', '商城使用帮助文档', NULL, 'question-circle', 90, 1, 0, NOW(), 'default');

-- 子菜单
INSERT INTO menu_page VALUES (903, 'FAQ', 900, '/mall-help/faq', '常见问题与解决方案', NULL, 'solution', 3, 1, 0, NOW(), 'default');
```

### 当前路由配置（.umirc.ts）

```typescript
{
  path: '/mall-help',
  name: '商城使用帮助文档',
  routes: [
    {
      path: '/mall-help',
      redirect: '/mall-help/api',
    },
    {
      path: '/mall-help/faq',
      name: 'FAQ',
      component: '@/pages/MallHelp/FAQ',
      hideInMenu: true,  // 从侧边栏隐藏，通过父菜单进入
    },
  ],
}
```

**注意：** 当前 FAQ 页面设置了 `hideInMenu: true`，用户通过父级菜单"商城使用帮助文档"进入后，可以在下拉菜单中看到"FAQ"选项（取决于前端动态菜单组件的实现）。

## Code Examples

### 参考：ApiDoc 页面数据加载模式

**文件：** `zlt-web/portal-web/src/pages/MallHelp/ApiDoc/index.tsx`

```typescript
import apiDocsData from './data/api-docs.json';

const modulesData = apiDocsData.modules as Module[];

// 在组件中直接使用
const currentModule = useMemo(() => {
  return modulesData.find((m) => m.key === activeTab);
}, [activeTab]);
```

### 参考：分类配置

```typescript
const categories = [
  { key: 'dev', label: '开发类' },
  { key: 'biz', label: '业务类' },
  { key: 'config', label: '配置类' },
  { key: 'error', label: '常见错误' },
];
```

## Common Pitfalls

### Pitfall 1: FAQ 数据未与前端分类同步
**What goes wrong:** 新增分类后前端分类列表不更新
**How to avoid:** 分类应从后端 API 获取，或与前端分类配置保持一致

### Pitfall 2: 搜索功能跨分类不完整
**What goes wrong:** 搜索只查当前分类，实际需求是查所有分类
**How to avoid:** 搜索 API 应支持 `keyword` 全局搜索参数

### Pitfall 3: 展开收起状态丢失
**What goes wrong:** 页面刷新后所有 FAQ 收起，用户体验差
**How to avoid:** 首次加载时默认展开第一项（`open={idx === 0}`）

## Don't Hand-Roll

| Problem | Don't Build | Use Instead |
|---------|-------------|-------------|
| HTTP 请求封装 | 自己写 fetch 包装 | 使用已有的 `@/utils/request` |
| 分页 | 自己实现分页逻辑 | 使用 Ant Design Table 内置分页 |
| 数据库 CRUD | 手写 JDBC | MyBatis Plus |

## Security Domain

### Input Validation
- FAQ 字段长度限制（question <= 500, cause/solution 用 TEXT）
- SQL 注入防护：MyBatis Plus 参数绑定
- XSS 防护：前端 React 默认转义

### Access Control
- FAQ 读取：所有登录用户可访问
- FAQ 管理：需要管理员权限（可通过 menu_func 权限码控制）

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| MySQL | central_organization 数据库 | Yes | 5.7.44 | — |
| Node.js | portal-web 构建 | Yes | 18+ | — |
| Java 17+ | mall-center | Yes | 17 | — |

## Sources

- `zlt-web/portal-web/src/pages/MallHelp/FAQ/index.tsx` — 现有 FAQ 页面
- `zlt-web/portal-web/src/pages/MallHelp/ApiDoc/index.tsx` — ApiDoc 参考实现
- `zlt-web/portal-web/.umirc.ts` — 路由配置
- `sql/menu_page.sql` — 菜单表结构
- `sql/mall-help-menu.sql` — 帮助文档菜单配置
- `sql/central_organization_init.sql` — central_organization 初始化

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — 基于现有系统源码验证
- Architecture: HIGH — 基于现有 Phase 18 ApiDoc 实现参考
- Pitfalls: MEDIUM — 基于 FAQ 页面常见问题推断

**Research date:** 2026-05-21
**Valid until:** 2026-06-21