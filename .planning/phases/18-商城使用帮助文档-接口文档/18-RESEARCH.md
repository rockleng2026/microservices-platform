# Phase 18: 商城使用帮助文档-接口文档 - Research

**Researched:** 2026-05-20
**Domain:** Spring Boot + React Umi documentation generation
**Confidence:** HIGH

## Summary

Phase 18 requires implementing an API documentation module for mall-center in the portal-web admin interface. The frontend will display all mall-center Controller endpoints organized by module tabs (商品模块、订单模块、用户模块、优惠券模块、营销模块等), with each endpoint showing path, method, parameters, response format, and business logic. Documentation data comes from Swagger annotations parsed from Java Controllers (D-01), with Tab-based navigation per module grouping (D-02), and routes under `/mall-help/api` (D-03). Menu configuration uses `central_organization.menu_page` + `menu_func` tables (D-05).

**Primary recommendation:** Build a static JSON file that mirrors the Controller structure, served as a React data source. Use Ant Design Tabs + Descriptions for the documentation display. This avoids dynamic parsing complexity and keeps the implementation straightforward.

---

## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** 接口文档内容从 Controller Java 代码的 Swagger 注解（`@Tag`, `@Operation`）自动解析生成，结合手工补充业务逻辑说明
- **D-02:** 采用 Tab 按模块分组展示接口文档（商品模块、订单模块、用户模块、优惠券模块、营销模块等）
- **D-03:** 在 `/mall-help` 下设置三个子路由：`/mall-help/api`（接口文档）、`/mall-help/menu`（菜单使用说明）、`/mall-help/faq`（FAQ）
- **D-04:** 数据库连接：root/lengfeng847（central_organization 库用于菜单配置），mall-center 服务端口 7010
- **D-05:** 动态菜单通过插入 central_organization.menu_page 和 menu_func 表实现

### Claude's Discretion
- Tab 样式细节（颜色、激活态）、文档详略程度、搜索框样式均可自行决定

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| HELP-01-01 | 页面列出 mall-center 所有 Controller 接口（商品、订单、购物车、用户、优惠券、评价等） | Found 23 Controllers across user-facing and admin namespaces |
| HELP-01-02 | 每个接口显示：接口路径、请求方法、请求参数、响应格式、业务逻辑说明 | Documenting the 5 display fields per endpoint |
| HELP-01-03 | 支持按模块分类浏览和搜索接口 | Tabs per module, search bar filter |
| HELP-01-04 | 接口文档数据可配置，存储在数据库或 JSON 文件中 | JSON file approach chosen (no DB change required for static docs) |
</phase_requirements>

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| API documentation display | Frontend (portal-web React) | — | UI rendering, tab navigation, search |
| Documentation data source | Static JSON file | Java Controller annotations (source only) | JSON mirrors parsed Swagger structure |
| Menu registration | Database (central_organization) | — | menu_page + menu_func INSERT for dynamic menus |
| Documentation structure | Data layer (JSON) | — | Defines endpoint schema for display components |

---

## Standard Stack

### Frontend (portal-web)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 18.x | UI framework | Existing portal-web uses React |
| Umi | 4.x | Routing and layout | Existing portal-web uses Umi 4 |
| Ant Design | 5.x | UI components (Tabs, Descriptions, Input) | Existing portal-web uses Ant Design 5 |
| TypeScript | 5.x | Type safety | Existing portal-web uses TypeScript |

**Installation:** No new packages required — existing dependencies cover all needs.

### Backend (mall-center)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Spring Boot | 3.1.6 | Backend framework | Existing stack |
| springdoc-openapi | 2.x | Swagger annotation parsing | Already in use in Controllers |
| MyBatis Plus | 3.5.4.1 | ORM | Existing stack |

---

## Architecture Patterns

### System Architecture Diagram

```
[Browser] --> [portal-web React App]
                  |
                  |-- /mall-help/* routes (Umi routing)
                  |     |-- /mall-help/api -> ApiDocPage (this phase)
                  |     |-- /mall-help/menu -> (future phase)
                  |     |-- /mall-help/faq  -> (future phase)
                  |
                  +-- Static JSON data file (src/data/api-docs.json)
                        Contains parsed Controller info
                        Grouped by module (Tabs)

[Database] <-- central_organization menu_page + menu_func
                  Menu registration for /mall-help, /mall-help/api, etc.

[mall-center] (port 7010) - Source of truth for Swagger annotations
```

### Recommended Project Structure

**Frontend changes (portal-web):**
```
zlt-web/portal-web/src/
├── pages/
│   └── MallHelp/                    # NEW - Phase 18 focus
│       ├── index.tsx                # Redirect or container
│       ├── ApiDoc/index.tsx         # 接口文档页面
│       ├── ApiDoc/data/
│       │   └── api-docs.json        # 接口文档数据（手工整理）
│       └── components/
│           └── ApiEndpointCard.tsx  # 单个接口展示组件
├── stores/
│   └── mallHelpStore.ts             # (optional) if state management needed
└── .umirc.ts                        # Add /mall-help routes
```

**Database changes:**
```
central_organization.menu_page - INSERT help docs menu entries
```

**No new npm packages needed.**

### Pattern 1: Tab + Search Documentation Layout
**What:** Ant Design Tabs component with Search filtering across modules
**When to use:** When documentation is organized by categorical modules
**Example:**
```tsx
// Source: Adapted from existing MallAdmin Dashboard pattern
import { Tabs, Input, Card } from 'antd';
const { TabPane } = Tabs;

const ApiDocPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('goods');
  const [searchText, setSearchText] = useState('');

  return (
    <div style={{ padding: 24 }}>
      <h1>接口文档</h1>
      <Input.Search placeholder="搜索接口..." onChange={e => setSearchText(e.target.value)} style={{ marginBottom: 16 }} />
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {modules.map(m => (
          <TabPane tab={m.label} key={m.key}>
            {/* filtered list of endpoints */}
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};
```

### Pattern 2: Endpoint Card with Descriptions
**What:** Ant Design Descriptions component showing endpoint metadata
**When to use:** When each API endpoint needs structured attribute display
**Example:**
```tsx
import { Descriptions, Tag } from 'antd';

// Per endpoint card:
<Card title={`${method} ${path}`}>
  <Descriptions column={1} bordered size="small">
    <Descriptions.Item label="接口名称">{summary}</Descriptions.Item>
    <Descriptions.Item label="请求方法"><Tag color="blue">{method}</Tag></Descriptions.Item>
    <Descriptions.Item label="路径">{path}</Descriptions.Item>
    <Descriptions.Item label="参数">
      {parameters.map(p => `${p.name} (${p.in}): ${p.description}`).join(', ')}
    </Descriptions.Item>
    <Descriptions.Item label="响应格式">{responseSchema}</Descriptions.Item>
    <Descriptions.Item label="业务逻辑">{businessLogic}</Descriptions.Item>
  </Descriptions>
</Card>
```

### Pattern 3: Static JSON Documentation Data
**What:** Hard-coded JSON file with pre-parsed Controller information
**When to use:** When Swagger parsing at runtime is unnecessary for static documentation
**Example:**
```json
{
  "modules": [
    {
      "key": "goods",
      "label": "商品模块",
      "controllers": [
        {
          "name": "GoodsController",
          "description": "小程序端商品接口",
          "endpoints": [
            {
              "method": "GET",
              "path": "/api/mall/goods/categories",
              "summary": "获取分类树",
              "parameters": [],
              "responseFormat": "Result<List<Map<String, Object>>>",
              "businessLogic": "调用 goodsService.getCategoryTree() 返回商品分类树形结构"
            }
          ]
        }
      ]
    }
  ]
}
```

### Anti-Patterns to Avoid
- **Parsing Swagger at runtime:** Unnecessary complexity for static documentation. Use pre-built JSON instead.
- **Over-engineering search:** A simple `filter()` on endpoint list is sufficient for HELP-01-03 requirements.
- **Mixing phases in one PR:** HELP-02 (菜单使用说明) and HELP-03 (FAQ) are separate phases — do not mix into this PR.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| API documentation generation | Custom Java parser for Swagger annotations | Manual JSON curation | Swagger parsing adds complexity; controllers are already well-annotated |
| Search functionality | Elasticsearch or complex filtering | Simple React `filter()` on JSON | HELP-01-03 only needs basic text search |
| Dynamic menu loading | Backend API for menu config | Direct SQL INSERT into menu_page | Menu registration is one-time setup |

**Key insight:** This is static documentation — no runtime API introspection needed. Curate the JSON once and serve it directly.

---

## Common Pitfalls

### Pitfall 1: Incomplete Controller Coverage
**What goes wrong:** Only part of the Controllers are documented, leading to incomplete API reference.
**Why it happens:** 23 Controllers exist (11 user-facing + 16 admin). Missing some during manual documentation.
**How to avoid:** Create a checklist from Glob results before documenting.
**Warning signs:** Controllers without matching module tabs.

### Pitfall 2: URL Path Misalignment
**What goes wrong:** Documented paths don't match actual routes (e.g., missing `/api/mall` prefix).
**Why it happens:** Some Controllers use path mappings at class level (`@RequestMapping("/api/mall/...")`).
**How to avoid:** Always concatenate class-level + method-level paths.
**Warning signs:** 404 errors when testing documented endpoints.

### Pitfall 3: Menu Not Appearing After Insert
**What goes wrong:** Menu page inserted but not visible to users.
**Why it happens:** `menu_func` entries missing or workposition.menu_ids not updated.
**How to avoid:** Ensure both menu_page and menu_func are inserted, and verify tenant_id matches.
**Warning signs:** Menu visible in DB but not in portal sidebar.

---

## Code Examples

Verified patterns from official sources:

### Tab Navigation with Module Groups
```tsx
// Source: Adapted from existing MallAdmin Dashboard Tabs pattern
// portal-web/src/pages/MallAdmin/Dashboard/index.tsx
import { Tabs } from 'antd';

const modules = [
  { key: 'goods', label: '商品模块' },
  { key: 'order', label: '订单模块' },
  { key: 'user', label: '用户模块' },
  { key: 'coupon', label: '优惠券模块' },
  { key: 'marketing', label: '营销模块' },
];

<Tabs>
  {modules.map(m => (
    <Tabs.TabPane tab={m.label} key={m.key}>
      {/* Filtered endpoint list */}
    </Tabs.TabPane>
  ))}
</Tabs>
```

### Menu Page SQL Insert (D-05)
```sql
-- Source: sql/mall-admin-menu-init.sql (existing pattern)
INSERT INTO `menu_page` (`id`, `name`, `parent_id`, `link_url`, `description`, `icon`, `sort_order`, `status`, `delflag`, `created_at`, `tenant_id`)
VALUES (500, '商城使用帮助文档', 0, '/mall-help', '商城接口文档和使用说明', 'question', 14, 1, 0, NOW(), 'default')
ON DUPLICATE KEY UPDATE `name` = '商城使用帮助文档', `link_url` = '/mall-help';

INSERT INTO `menu_page` (`id`, `name`, `parent_id`, `link_url`, `description`, `icon`, `sort_order`, `status`, `delflag`, `created_at`, `tenant_id`)
VALUES
(501, '接口文档', 500, '/mall-help/api', 'mall-center Controller接口文档', 'api', 1, 1, 0, NOW(), 'default'),
(502, '菜单使用说明', 500, '/mall-help/menu', '商城功能模块使用说明', 'book', 2, 1, 0, NOW(), 'default'),
(503, 'FAQ', 500, '/mall-help/faq', '常见问题解答', 'question-circle', 3, 1, 0, NOW(), 'default');
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Dynamic Swagger UI at /swagger-ui.html | Static documentation page in portal | v2.1 (this milestone) | More user-friendly, integrated into admin sidebar |
| Hardcoded in-memory endpoint list | JSON file per module | v2.1 (this milestone) | Easier to maintain, separates data from UI |

**Deprecated/outdated:**
- None relevant to this phase.

---

## Assumptions Log

> List all claims tagged `[ASSUMED]` in this research. The planner and discuss-phase use this
> section to identify decisions that need user confirmation before execution.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Menu page IDs 500-503 are available and not in use | Database menu INSERT | Collision would fail INSERT; need to check or use different range |
| A2 | Portal-web Umi config allows new /mall-help routes without conflict | Route registration | Conflict would cause 404 or overwrite existing route |
| A3 | HELP-01-04 "可配置" means JSON file is acceptable (vs DB) | Requirements interpretation | User might expect DB-backed editable docs; JSON requires code change to modify |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

---

## Open Questions

1. **Menu ID range selection**
   - What we know: Existing mall-admin uses 400-408, saleops-optimizer uses 300-309, other ranges used elsewhere
   - What's unclear: Whether ID 500-503 is safe or conflicts with existing menus
   - Recommendation: Check current max ID in menu_page before inserting, or use IDs far above current range (e.g., 900+)

2. **HELP-01-04 "接口文档数据可配置" implementation choice**
   - What we know: D-01 says documentation from Swagger annotations, but static JSON is simpler
   - What's unclear: Whether user expects editable documentation (DB-backed) or static display
   - Recommendation: Use static JSON now, with note that DB-backed editing is future enhancement

3. **Admin vs User Controller documentation scope**
   - What we know: 16 Admin Controllers + 11 User Controllers = 27 total
   - What's unclear: Should documentation include both admin and user-facing endpoints, or just admin?
   - Recommendation: Document both — HELP-01-01 says "mall-center 所有 Controller 接口"

---

## Environment Availability

> Skip this section if the phase has no external dependencies (code/config-only changes).

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js (npm) | portal-web dev/build | Verified (project uses npm) | 20.x (assumed) | — |
| MySQL client | menu_page INSERT verification | (not checked) | — | Direct SQL execution |
| portal-web node_modules | Running dev server | Verified (node_modules exists) | — | — |

**Missing dependencies with no fallback:**
- None identified for this phase.

**Missing dependencies with fallback:**
- None identified for this phase.

---

## Validation Architecture

> Skip this section entirely if workflow.nyquist_validation is explicitly set to false in .planning/config.json. If the key is absent, treat as enabled.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright (existing portal-web testing setup) |
| Config file | `playwright.config.ts` |
| Quick run command | `npm run test:e2e -- --grep "api-doc"` |
| Full suite command | `npm run test:e2e` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| HELP-01-01 | Page lists mall-center Controller interfaces grouped by module | Smoke | `playwright test tests/mall-help.spec.ts --grep "HELP-01-01"` | No |
| HELP-01-02 | Each endpoint shows path, method, params, response format, business logic | Smoke | `playwright test tests/mall-help.spec.ts --grep "HELP-01-02"` | No |
| HELP-01-03 | Search box filters interfaces across modules | Smoke | `playwright test tests/mall-help.spec.ts --grep "HELP-01-03"` | No |
| HELP-01-04 | Documentation data configurable via JSON file | Unit | N/A (static data file check) | No |

### Sampling Rate
- **Per task commit:** None (documentation UI, no unit test needed)
- **Per wave merge:** None
- **Phase gate:** Smoke test: `playwright test tests/mall-help.spec.ts` (if file created)

### Wave 0 Gaps
- [ ] `tests/mall-help.spec.ts` — smoke tests for HELP-01-01, HELP-01-02, HELP-01-03
- [ ] `playwright.config.ts` — already exists, no change needed
- Framework install: already installed (node_modules + playwright in devDependencies)

---

## Security Domain

> Required when `security_enforcement` is enabled (absent = enabled). Omit only if explicitly `false` in config.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V5 Input Validation | No | Not an API — documentation display only |
| V4 Access Control | Yes | Menu access controlled via workposition.menu_ids assignment |
| V2 Authentication | No | Existing portal-web auth handles this |

### Known Threat Patterns for {stack}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized menu access | Information Disclosure | Menu visibility controlled by backend workposition.menu_ids check |

---

## Sources

### Primary (HIGH confidence)
- `zlt-business/mall-center/src/main/java/com/central/mall/controller/*.java` — Swagger-annotated Controllers
- `zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/*.java` — Admin Controllers
- `sql/menu_page.sql` — menu_page table structure reference
- `sql/mall-admin-menu-init.sql` — menu INSERT patterns
- `zlt-web/portal-web/.umirc.ts` — Umi routing configuration
- `zlt-web/portal-web/src/pages/MallAdmin/Dashboard/index.tsx` — Ant Design Tabs pattern in existing code

### Secondary (MEDIUM confidence)
- Ant Design 5.x documentation (Tabs, Descriptions, Input.Search components)

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All libraries verified in existing project
- Architecture: HIGH — Direct mapping from CONTEXT.md decisions
- Pitfalls: MEDIUM — Based on existing project patterns, not external verification

**Research date:** 2026-05-20
**Valid until:** 2026-06-20 (30 days — stable domain)

---

## Controller Coverage Checklist

> Use this to ensure all Controllers are documented in api-docs.json

**User-facing Controllers (11):**
- [ ] GoodsController — `/api/mall/goods`
- [ ] ResourceController — `/api/mall/resource`
- [ ] AuthController — `/api/mall/auth`
- [ ] UserController — `/api/mall/user`
- [ ] UserAddressController — `/api/mall/address`
- [ ] CartController — `/api/mall/cart`
- [ ] OrderController — `/api/mall/order`
- [ ] RefundController — `/api/mall/refund`
- [ ] CouponController — `/api/mall/coupon`
- [ ] EvaluateController — `/api/mall/evaluate`
- [ ] MemberController — `/api/mall/member`

**Admin Controllers (16):**
- [ ] AdminBannerController — `/api/mall/admin/banner`
- [ ] AdminCategoryController — `/api/mall/admin/category`
- [ ] AdminExpressController — `/api/mall/admin/express`
- [ ] AdminGoodsController — `/api/mall/admin/goods`
- [ ] AdminMerchantController — `/api/mall/admin/merchant`
- [ ] AdminRefundController — `/api/mall/admin/refund`
- [ ] AdminSettingsController — `/api/mall/admin/settings`
- [ ] AdminSpecController — `/api/mall/admin/spec`
- [ ] AdminStatisticsController — `/api/mall/admin/statistics`
- [ ] AdminUserController — `/api/mall/admin/user`
- [ ] AdminOrderController — `/api/mall/admin/order`
- [ ] AdminMemberController — `/api/mall/admin/member`
- [ ] AdminStockController — `/api/mall/admin/stock`
- [ ] AdminCouponController — `/api/mall/admin/coupon`
- [ ] AdminPromotionController — `/api/mall/admin/promotion`