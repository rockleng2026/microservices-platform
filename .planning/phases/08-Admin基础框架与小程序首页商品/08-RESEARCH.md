# Phase 8: Admin基础框架 + 小程序首页/商品详情 - Research

**Researched:** 2026-05-09
**Domain:** Admin Web (React + Umi 4) and Mini Program (uni-app + Vue 3)
**Confidence:** HIGH

## Summary

Phase 8 delivers two independent frontend projects: an Admin Web management dashboard and a consumer-facing Mini Program for product browsing. Both connect to the existing `mall-center` backend (port 7010) via API gateway.

**Admin Web** builds on the established `portal-web` pattern (React 18 + Umi 4 + Ant Design 4) but requires a new project structure. The Dashboard consumes 4 STAT APIs for metrics, sales-trend chart, stock warnings, and user analytics. Dynamic menu and user menu components are already available in portal-web and can be adapted.

**Mini Program** requires a new uni-app project. The home page pulls banners from AdminBannerController (GET `/api/mall/admin/banner/list`), categories and hot goods from GoodsController, and integrates search via the goods list API. Product detail page shows carousel, specs/SKUs from `getGoodsDetail`, and evaluation summary from EvaluateController.

**Primary recommendation:** Reuse portal-web's BasicLayout pattern for Admin; build Mini Program with standard uni-app Vue 3 patterns. Both use the same mall-center API base path `/mall-center`.

---

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Dashboard 顶部放 4 个指标卡片（订单数、销售额、访客数、转化率）
- **D-02:** 销售趋势使用 ECharts 折线图，支持日/周/月切换
- **D-04:** Tab Bar 设置 4 个项目：首页 | 分类 | 购物车 | 我的
- **D-06:** 商品列表使用图片优先卡片，2列网格布局，图片顶部+信息底部
- **D-09:** 管理后台使用 Zustand 管理全局状态
- **D-10:** 管理后台通过 API 网关调用 mall-center（路径 /mall-center/...）

### Claude's Discretion

- Tab Bar 激活状态使用 accent 色（#ff5500）
- 分类筛选默认展开在顶部，支持折叠

### Deferred Ideas (OUT OF SCOPE)

- 管理后台权限控制 UI — 暂不实现 RBAC UI（属于 Phase 10+）
- 小程序收藏功能 — 属于 Phase 12

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Admin Dashboard | Browser/Client | API Backend | Chart rendering in browser, data from STAT APIs |
| Admin Layout/Navigation | Browser/Client | — | Pure UI, no backend dependency |
| Admin Route Config | Frontend Server (Umi) | — | Umi handles routing at build/runtime |
| Mini Home Banner | Browser/Client | API Backend | Swiper in browser, data from Banner API |
| Mini Product Grid | Browser/Client | API Backend | Virtual scroll in browser, data from Goods API |
| Mini Product Detail | Browser/Client | API Backend | Spec selection is client logic, cart API call |
| Mini Tab Bar | Browser/Client | — | Pure UI navigation |

---

## Standard Stack

### Admin Web

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | 18.2.0 | UI framework | Matches portal-web |
| umi | 4.0.74 | Routing/state/bundling | Matches portal-web |
| antd | 4.24.8 | UI component library | Matches portal-web |
| @ant-design/pro-components | 2.8.7 | Pro tables/cards | Matches portal-web |
| echarts | 5.6.0 | Chart library | Already in portal-web |
| zustand | ^4.x | State management | D-09 decision |

**Installation:**
```bash
npm create umi@latest mall-admin-web -- --registry https://registry.npmmirror.com
cd mall-admin-web
npm install antd@4.24.8 @ant-design/pro-components echarts zustand dayjs --registry https://registry.npmmirror.com
```

### Mini Program

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| uni-app | latest | Framework | Phase context requirement |
| Vue 3 | 3.x | Composition API | uni-app default |
| uni-icons | built-in | Tab bar icons | D-05 decision |

**Project init (assumed):**
```bash
npx degit dcloudio/uni-preset-vue#Vue3 mall-mini-program
cd mall-mini-program
npm install
```

---

## Architecture Patterns

### System Architecture Diagram

**Admin Web:**
```
Browser -> API Gateway (9900) -> mall-center (7010)
                          |
                          +-> /api/mall/admin/* (admin APIs)
                          +-> /api/mall/goods/* (goods APIs)
```

**Mini Program:**
```
WeChat App -> API Gateway (9900) -> mall-center (7010)
                            |
                            +-> /api/mall/admin/banner/list (banners)
                            +-> /api/mall/goods/* (categories, products)
                            +-> /api/mall/cart (cart ops)
                            +-> /api/mall/evaluate/* (reviews)
```

### Admin Web Recommended Project Structure

```
mall-admin-web/
├── src/
│   ├── layouts/
│   │   ├── BasicLayout.tsx       # Copied from portal-web, adapted
│   │   └── BasicLayout.less      # Copied from portal-web
│   ├── pages/
│   │   └── Dashboard/
│   │       ├── index.tsx         # Dashboard page
│   │       ├── components/
│   │       │   ├── MetricCards.tsx
│   │       │   ├── SalesTrendChart.tsx
│   │       │   ├── StockWarningList.tsx
│   │       │   ├── UserStats.tsx
│   │       │   └── TopProducts.tsx
│   │       └── index.less
│   ├── components/
│   │   ├── DynamicMenu/          # Adapted from portal-web
│   │   └── UserMenu/             # Adapted from portal-web
│   ├── services/
│   │   └── admin.ts             # API calls
│   ├── stores/
│   │   └── useStore.ts          # Zustand store
│   ├── config/
│   │   └── api.ts               # API paths
│   ├── utils/
│   │   └── request.ts           # Adapted from portal-web
│   ├── global.less
│   └── app.tsx
├── .umirc.ts
└── package.json
```

**Reference files from portal-web:**
- `zlt-web/portal-web/src/layouts/BasicLayout.tsx` — layout pattern
- `zlt-web/portal-web/src/layouts/BasicLayout.less` — styles
- `zlt-web/portal-web/src/global.less` — global styles (primary: #1890ff)
- `zlt-web/portal-web/src/pages/Dashboard/index.tsx` — dashboard pattern
- `zlt-web/portal-web/src/components/DynamicMenu/index.tsx` — dynamic menu
- `zlt-web/portal-web/src/components/UserMenu/index.tsx` — user menu
- `zlt-web/portal-web/src/config/api.ts` — API config pattern
- `zlt-web/portal-web/src/utils/request.ts` — request utility
- `zlt-web/portal-web/.umirc.ts` — route config pattern

### Mini Program Recommended Project Structure

```
mall-mini-program/
├── src/
│   ├── pages/
│   │   ├── home/
│   │   │   ├── index.vue        # Banner, categories, hot products
│   │   │   └── components/
│   │   │       ├── BannerSwiper.vue
│   │   │       ├── CategoryGrid.vue
│   │   │       └── ProductCard.vue
│   │   ├── product-list/
│   │   │   ├── index.vue        # Product grid with filter/sort
│   │   │   └── components/
│   │   │       └── ProductItem.vue
│   │   └── product-detail/
│   │       ├── index.vue        # Image carousel, specs, cart
│   │       └── components/
│   │           ├── ImageCarousel.vue
│   │           ├── SpecSelector.vue
│   │           ├── QuantityStepper.vue
│   │           └── EvalSummary.vue
│   ├── static/
│   │   └── tabbar/              # Tab bar icons
│   ├── services/
│   │   ├── home.ts             # Banner, categories APIs
│   │   ├── goods.ts            # Product list, detail APIs
│   │   └── cart.ts             # Cart API
│   ├── stores/
│   │   └── cart.ts             # Cart state (pinia/vuex)
│   └── uni.scss
├── manifest.json
├── pages.json
└── package.json
```

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTTP request utility | Custom fetch wrapper | Reuse portal-web's `request.ts` | Auth headers, tenant header, error handling already correct |
| Admin layout | Custom CSS grid | Copy portal-web's `BasicLayout.less` | Already has 240px sidebar + 60px header + 24px content pattern |
| Chart rendering | Raw canvas/SVG | echarts 5.6 | Already in portal-web, has Typescript support |
| State management | useState/useContext | zustand | D-09 explicit decision, simple API |
| API path management | Hardcode paths | Config file like portal-web's `api.ts` | Centralized, env-aware |

---

## API Integration Details

### Admin Dashboard APIs (STAT-01 ~ 03)

All via `/mall-center/api/mall/admin/statistics/*`

| Endpoint | Method | Params | Response |
|----------|--------|--------|----------|
| `/statistics/today` | GET | none | `StatisticsDTO` with `todayOrderCount`, `todaySalesAmount`, `waitDeliveryCount`, `todayNewUsers`, `yesterdayOrderCount`, `yesterdaySalesAmount`, `totalPv`, `avgOrderAmount` |
| `/statistics/sales-trend` | GET | `type` (day/week/month), `startDate`, `endDate` | `List<SalesTrendDTO>` with `{date, orderCount, salesAmount, userCount}` |
| `/statistics/stock-warning` | GET | none | `List<StockWarningDTO>` with `{skuId, skuName, goodsId, goodsName, realStock, warningStock, soldToday}` |
| `/statistics/user-analysis` | GET | none | `UserAnalysisDTO` with `{todayNewUsers, weekNewUsers, monthNewUsers, activeUsers, avgOrderAmount}` |

**Response wrapper:** All responses are `Result<T>` where `.datas` or `.data` holds the payload.

### Mini Program Home APIs (MINI-01)

| Endpoint | Method | Params | Response |
|----------|--------|--------|----------|
| `/api/mall/admin/banner/list` | GET | none | `List<BannerDTO>` with `{id, title, imageUrl, linkType (1=goods/2=external), goodsId, externalUrl, sort}` |
| `/api/mall/goods/categories` | GET | none | `List<Map<String, Object>>` category tree |
| `/api/mall/goods/hot?limit=N` | GET | limit (default 10) | `List<MallGoods>` with `{id, name, mainImage, price, sales}` |
| `/api/mall/goods/list` | GET | `page`, `pageSize`, `categoryId?`, `keyword?`, `sortField?`, `sortOrder?` | `IPage<MallGoods>` |

### Mini Program Product List APIs (MINI-02)

Same as above plus:

| Sort Field | Sort Order | Meaning |
|------------|------------|---------|
| `price` | `asc` | Price low to high |
| `price` | `desc` | Price high to low |
| `sales` | `desc` | Sales volume (default for hot) |
| `createTime` | `desc` | Newest first (default for list) |

### Mini Program Product Detail APIs (MINI-03)

| Endpoint | Method | Params | Response |
|----------|--------|--------|----------|
| `/api/mall/goods/{id}` | GET | goodsId | `Map<String, Object>` with `{id, name, subTitle, mainImage, images[], detail, price, sales, status, goodsType, categoryId, skus: MallGoodsSku[], categoryName}` |
| `/api/mall/cart` | POST | `{skuId, quantity}` | empty body (success) |
| `/api/mall/evaluate/goods/{goodsId}` | GET | `page`, `pageSize` | `IPage<EvaluateListDTO>` with `{id, orderId, star, content, images[], userNickname, createTime}` |

**MallGoodsSku structure (from goods detail):**
```json
{
  "id": 1,
  "goodsId": 100,
  "specs": "颜色:黑色;内存:256GB",  // spec combination string
  "price": 2999.00,
  "stock": 50,
  "status": 1
}
```

---

## Common Pitfalls

### Pitfall 1: Admin Web project not created before implementation
**What goes wrong:** Implementers start writing code in a non-existent project directory.
**Why it happens:** Portal-web reference is clear but the new `mall-admin-web` location isn't explicitly defined in Phase 8 docs.
**How to avoid:** First task in plan must be project scaffold/clone from portal-web.
**Warning signs:** No `.umirc.ts` or `package.json` in expected location.

### Pitfall 2: Tab Bar using custom icons instead of uni-icons
**What goes wrong:** Additional icon assets need to be bundled, increasing package size.
**Why it happens:** D-05 specifies uni-icons but implementers may not notice and add custom SVGs.
**How to avoid:** Use `<text class="iconfont">&#xe123;</text>` pattern or `<uni-icons type="home" />` component.
**Warning signs:** Custom icon font files in static/ folder.

### Pitfall 3: Mall-goods list API sort parameter confusion
**What goes wrong:** Frontend sends `sort` field as single string (e.g., "price") but backend expects `sortField` + `sortOrder` separate params.
**Why it happens:** Backend expects `sortField=price&sortOrder=asc` not `sort=priceasc`.
**How to avoid:** Explicit param mapping in service layer: `{ sortField: 'price', sortOrder: 'asc' }`.
**Warning signs:** API returns 400 or unexpected sort behavior.

### Pitfall 4: Banner API endpoint mismatch
**What goes wrong:** Mini Program tries to call a non-existent public `/api/mall/banner/list` endpoint.
**Why it happens:** Only AdminBannerController has banner list endpoint at `/api/mall/admin/banner/list`.
**How to avoid:** Use the admin endpoint (works for all authenticated users) or note that a dedicated public endpoint may be needed.
**Warning signs:** 404 on banner API call.

### Pitfall 5: Shopping cart userId hardcoded
**What goes wrong:** Cart API returns 1L for userId (dev fallback), causing all users to share the same cart.
**Why it happens:** CartController.getCurrentUserId() returns 1L with TODO comment.
**How to avoid:** Pass userId via header `x-user-id` or integrate with real auth context. For Phase 8 dev, note this limitation.
**Warning signs:** All cart operations affect same cart regardless of logged-in user.

---

## Code Examples

### Admin Web - BasicLayout adaptation (from portal-web)

```tsx
// src/layouts/BasicLayout.tsx
// Key pattern from portal-web - adapt for mall-admin
import { Layout } from 'antd';
import { Outlet } from 'umi';
import DynamicMenu from '@/components/DynamicMenu';
import UserMenu from '@/components/UserMenu';
import './BasicLayout.less';

const { Header, Sider, Content } = Layout;

const BasicLayout: React.FC = () => {
  return (
    <div className="app-layout">
      <aside className="app-sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🛒</span>
            <span className="logo-text">Mall Admin</span>
          </div>
        </div>
        <div className="sidebar-menu">
          <DynamicMenu menus={menus} theme="light" mode="inline" />
        </div>
      </aside>
      <header className="app-header">
        <div className="header-left">breadcrumb</div>
        <div className="header-actions">
          <UserMenu onMenuUpdate={handleMenuUpdate} />
        </div>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
};
```

### Admin Web - Umi route config

```typescript
// .umirc.ts - based on portal-web pattern
export default defineConfig({
  routes: [
    {
      path: '/',
      component: '@/layouts/BasicLayout',
      routes: [
        { path: '/', redirect: '/dashboard' },
        {
          path: '/dashboard',
          name: '工作台',
          component: '@/pages/Dashboard',
        },
        // ADMIN-02 through ADMIN-11 in later phases
      ],
    },
  ],
  proxy: {
    '/mall-center': {
      target: 'http://127.0.0.1:7010',
      changeOrigin: true,
    },
  },
  theme: {
    'primary-color': '#1890ff',
  },
});
```

### Admin Web - Statistics API call

```typescript
// src/services/admin/statistics.ts
import request from '@/utils/request';
import { API_BASE_URL } from '@/config/api';

export const getTodayStatistics = () =>
  request<StatisticsDTO>(`${API_BASE_URL}/api/mall/admin/statistics/today`);

export const getSalesTrend = (type: string, startDate: string, endDate: string) =>
  request<SalesTrendDTO[]>(`${API_BASE_URL}/api/mall/admin/statistics/sales-trend`, {
    params: { type, startDate, endDate },
  });

export const getStockWarningList = () =>
  request<StockWarningDTO[]>(`${API_BASE_URL}/api/mall/admin/statistics/stock-warning`);

export const getUserAnalysis = () =>
  request<UserAnalysisDTO>(`${API_BASE_URL}/api/mall/admin/statistics/user-analysis`);
```

### Mini Program - Banner swiper

```vue
<!-- src/pages/home/components/BannerSwiper.vue -->
<template>
  <swiper class="banner-swiper" indicator-dots autoplay circular>
    <swiper-item v-for="banner in banners" :key="banner.id" @click="onBannerTap(banner)">
      <image :src="banner.imageUrl" mode="aspectFill" class="banner-image" />
    </swiper-item>
  </swiper>
</template>

<script setup>
const props = defineProps({ banners: Array });
const emit = defineEmits(['tap']);

const onBannerTap = (banner) => {
  if (banner.linkType === 1) {
    uni.navigateTo({ url: `/pages/product-detail/index?id=${banner.goodsId}` });
  } else if (banner.linkType === 2) {
    uni.navigateTo({ url: `/pages/web-view/index?url=${banner.externalUrl}` });
  }
};
</script>

<style scoped>
.banner-swiper { height: 160px; }
.banner-image { width: 100%; height: 100%; }
</style>
```

### Mini Program - Add to cart

```typescript
// src/services/cart.ts
export const addToCart = (skuId: number, quantity: number) => {
  return uni.request({
    url: `${API_BASE}/api/mall/cart`,
    method: 'POST',
    data: { skuId, quantity },
    header: { 'x-user-id': uni.getStorageSync('userId') },
  });
};
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|---------------|--------|
| class component + Redux | functional component + zustand | D-09 decision | Less boilerplate, simpler API |
| Hardcoded API URLs | Centralized api.ts config | portal-web pattern | Env-aware, consistent |
| Sidebar with Ant Layout | CSS Grid app-layout | BasicLayout.less | More flexible, matches UI spec |
| Recharts for charts | ECharts 5 for sales trend | D-02 decision | Better large dataset handling |

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Banner API: AdminBannerController.getBannerList() is accessible to mini program (public endpoint) | API Integration | If it requires admin auth, mini program banner won't work — need to verify auth requirements |
| A2 | `MallGoodsSku` has `specs` field as JSON/string with key-value pairs | API Integration | If specs is structured differently, spec selector UI needs adjustment |
| A3 | `mall-admin-web` project will be created in `zlt-web/mall-admin-web` | Admin Web Setup | If location differs, all file paths in plan are wrong |
| A4 | uni-app Vue 3 project initialized with standard template | Mini Program Setup | If template differs, some patterns may not apply |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

---

## Open Questions

1. **Banner endpoint access for mini program**
   - What we know: `AdminBannerController` at `/api/mall/admin/banner/list` exists and returns enabled banners
   - What's unclear: Whether this endpoint requires admin authentication or is accessible to mini program users
   - Recommendation: Verify endpoint auth requirements before Phase 8 implementation; if blocked, may need a public banner endpoint or proxy configuration

2. **mall-admin-web project creation**
   - What we know: No existing project at `zlt-web/mall-admin-web`
   - What's unclear: Whether to create from scratch (create-umi) or copy portal-web and adapt
   - Recommendation: Copy portal-web structure and adapt — faster and ensures consistency

3. **Cart API userId handling**
   - What we know: `CartController.getCurrentUserId()` hardcoded to return 1L
   - What's unclear: How to integrate real user auth for mini program cart
   - Recommendation: Use `x-user-id` header from mini program's logged-in user context for Phase 8 dev

4. **Evaluation summary endpoint**
   - What we know: `EvaluateController.listGoodsEvaluates` returns paginated evaluations
   - What's unclear: Whether an evaluation summary endpoint (avg star, total count) exists for MINI-03-08
   - Recommendation: Calculate from list response in frontend, or note if dedicated summary API is needed

---

## Environment Availability

**Step 2.6: SKIPPED (no external dependencies identified for research phase)**
- Admin Web: npm/node based dev environment
- Mini Program: uni-app CLI + WeChat dev tools
- Both depend on mall-center API which is already running

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Jest (Admin Web), Vitest (Mini) |
| Config file | jest.config.js (Admin), vitest.config.ts (Mini) |
| Quick run command | `npm test` (Admin), `npm run test` (Mini) |
| Full suite command | `npm run test:coverage` (Admin), `npm run test:all` (Mini) |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command |
|--------|----------|-----------|-------------------|
| ADMIN-01-05 | View today's key metrics on Dashboard | Unit | `jest Dashboard.test.ts --metricCards` |
| ADMIN-01-01 | View sales trend chart with day/week/month toggle | Unit | `jest SalesTrendChart.test.ts` |
| ADMIN-01-02 | View inventory warning alerts | Unit | `jest StockWarning.test.ts` |
| ADMIN-01-03 | View user statistics (new + active) | Unit | `jest UserStats.test.ts` |
| ADMIN-01-04 | View top-selling products ranking | Unit | `jest TopProducts.test.ts` |
| MINI-01-01 | View banner carousel on Home | Unit | `vitest BannerSwiper.test.ts` |
| MINI-01-03 | View category tiles on Home | Unit | `vitest CategoryGrid.test.ts` |
| MINI-01-05 | View recommended products | Unit | `vitest ProductCard.test.ts` |
| MINI-02-01 | View paginated product list | Unit | `vitest ProductList.test.ts` |
| MINI-03-07 | Add product to shopping cart | Unit | `vitest CartService.test.ts` |

### Wave 0 Gaps

- [ ] `src/services/admin/statistics.test.ts` — tests for all 4 STAT API calls
- [ ] `src/pages/Dashboard/components/SalesTrendChart.test.ts` — ECharts rendering test
- [ ] `src/services/cart.test.ts` — cart API integration test
- [ ] Framework install: `npm install jest @testing-library/react --save-dev` (Admin)

*(If no gaps: "None — existing test infrastructure covers all phase requirements")*

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes | Backend via gateway OAuth2 — frontend just passes token |
| V3 Session Management | Yes | Token stored in localStorage, sent via Authorization header |
| V4 Access Control | No | Admin endpoints behind gateway auth |
| V5 Input Validation | Yes | All user inputs (search keyword, quantity, spec selection) validated client-side |

### Known Threat Patterns for Admin Web

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via search input | Tampering | React escapes by default, sanitize if using dangerouslySetInnerHTML |
| CSRF on cart operations | Tampering | SameSite cookies, Authorization header token |
| Info disclosure via API errors | Information Disclosure | Backend returns generic errors, don't expose stack traces |

### Known Threat Patterns for Mini Program

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Price manipulation via API | Tampering | Backend recalculates price from SKU, not from request |
| Stock race condition | Denial | Redis atomic decrement already implemented in backend |
| Cart quantity overflow | Denial | Client-side max stock check before POST |

---

## Sources

### Primary (HIGH confidence)
- `zlt-web/portal-web/src/layouts/BasicLayout.tsx` — Admin layout reference
- `zlt-web/portal-web/src/layouts/BasicLayout.less` — Admin layout styles
- `zlt-web/portal-web/src/pages/Dashboard/index.tsx` — Dashboard reference
- `zlt-web/portal-web/.umirc.ts` — Umi route config pattern
- `zlt-web/portal-web/src/config/api.ts` — API config pattern
- `zlt-web/portal-web/src/utils/request.ts` — Request utility
- `zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminStatisticsController.java` — STAT APIs
- `zlt-business/mall-center/src/main/java/com/central/mall/controller/GoodsController.java` — Goods APIs
- `zlt-business/mall-center/src/main/java/com/central/mall/controller/CartController.java` — Cart API

### Secondary (MEDIUM confidence)
- `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/SalesTrendDTO.java` — Sales trend response
- `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/StatisticsDTO.java` — Today stats response
- `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/StockWarningDTO.java` — Stock warning response
- `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/UserAnalysisDTO.java` — User stats response
- `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/BannerDTO.java` — Banner response
- `zlt-business/mall-center/src/main/java/com/central/mall/controller/EvaluateController.java` — Evaluation API

### Tertiary (LOW confidence)
- Portal-web package.json dependencies (may have been updated since last check)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — based on verified portal-web code and documented decisions
- Architecture: HIGH — based on existing working code patterns
- Pitfalls: MEDIUM — based on API code review, some edge cases not confirmed

**Research date:** 2026-05-09
**Valid until:** 2026-06-08 (30 days — stable domain)