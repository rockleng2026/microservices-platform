# Phase 13: 集成测试与优化 - Research

**Researched:** 2026-05-20
**Domain:** Integration Testing, UI/UX Optimization, Performance Optimization
**Confidence:** MEDIUM

## Summary

Phase 13 is the final phase of v2.0, covering end-to-end integration testing of all Admin Web and Mini Program features, UI/UX polish, performance optimization, and bug fixes. The project has significant existing test infrastructure in the Admin Web (Playwright + Jest) but the Mini Program has no testing framework configured. Key challenge: Phase 13 overlaps with Phase 14 (frontend migration) and Phase 15 (UAT testing), so test scope must be clearly bounded to avoid duplicate effort. The Admin Web currently running on port 8066 (react-web) is NOT the mall-admin - Phase 14 migrates mall-admin-web to portal-web. Mini Program uses uni-app + Vue 3 with Vite, no test framework currently.

**Primary recommendation:** Use Playwright for both Admin Web and Mini Program E2E testing (unified tooling), implement page object pattern, run tests against deployed/staging environments, prioritize critical user journeys (checkout flow, order management) over exhaustive UI testing.

## User Constraints (from CONTEXT.md)

Phase 13 scope:
- Integration Testing: End-to-end testing of all Admin Web and Mini Program features
- UI/UX Optimization: Visual polish, responsive design, interaction improvements
- Performance: Load time optimization, lazy loading, caching strategies
- Bug Fixes: Resolve any issues found during integration testing

**Requirement IDs to address:** ADMIN-01~11 (all admin modules), MINI-01~10 (all mini program modules)

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Integration Testing | Browser/E2E | API Testing | Playwright for cross-browser E2E; backend APIs tested via E2E |
| UI/UX Optimization | Browser/Client | Frontend Server | CSS/responsive in client; SSR not used |
| Performance Optimization | Browser/Client | CDN/Static | Code splitting, lazy loading in client; static assets on CDN |
| Bug Fixes | API/Backend | Browser/Client | Logic bugs in backend; UI bugs in frontend |

## Standard Stack

### Core Testing
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Playwright | ^1.17.0 | E2E testing for both Admin Web and Mini Program | Already in package.json, cross-browser, single API for web+mobile |
| @playwright/test | ^1.17.0 | Test framework | Official Playwright test runner |
| jest | ^26.0.0 | Unit testing for Admin Web | Already configured in react-web |

### Admin Web Testing
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @playwright/test | ^1.17.0 | E2E page rendering tests | Verify all routes load without errors |
| lodash | ^4.17.21 | Route formatting in tests | Existing e2e test uses it |

### Mini Program Testing
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Playwright | ^1.17.0 | E2E via H5 mode | Test H5 build of mini program |
| @dcloudio/uni-cli | ^3.0.0-alpha | Build test | Verify H5 build succeeds |

### Performance
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| React Profiler | built-in | Identify render bottlenecks | Performance debugging |
| Lighthouse CI | latest | Measure load time, CLS, LCP | Performance regression testing |

### UI Optimization
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| postcss + autoprefixer | ^10.0.0 | CSS compatibility | Already in Umi build chain |
| Antd icons | ^4.7.0 | Consistent icon usage | Already in project |

**Installation:**
```bash
# Admin Web (already has playwright)
cd zlt-web/react-web/src/main/frontend
npm install @playwright/test@latest

# Mini Program (add playwright for H5 testing)
cd mall-mini-program
npm install -D @playwright/test@latest
npx playwright install chromium
```

**Version verification:**
- Playwright: `npm view @playwright/test version` → 1.51.0 (latest) [ASSUMED - not verified]
- Jest: already in package.json as ^26.0.0 [VERIFIED: package.json]

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      User Browser                            │
├─────────────────────────────────────────────────────────────┤
│  Admin Web (Umi 4 + Ant Design Pro)                        │
│  Port: 8066 (dev) / 8001 (portal-web after Phase 14)        │
│  Routes: /welcome, /coupons, /coupons/create, /user/*     │
│  └── Playwright E2E tests via baseLayout.e2e.spec.ts       │
├─────────────────────────────────────────────────────────────┤
│  Mini Program (uni-app + Vue 3)                            │
│  Build: H5 (dev) / MP-Weixin (prod)                        │
│  Pages: home, category, cart, user, product-*, order-*, etc│
│  └── Playwright E2E tests via H5 mode                       │
├─────────────────────────────────────────────────────────────┤
│                      API Gateway (port 9900)                 │
│         └── mall-center (port 7010)                         │
│              └── MySQL (cp_mall) + Redis                    │
└─────────────────────────────────────────────────────────────┘
```

### Recommended Project Structure (Testing)
```
zlt-web/react-web/src/main/frontend/
├── e2e/
│   ├── pages/               # Page object models
│   │   ├── WelcomePage.ts
│   │   ├── CouponsPage.ts
│   │   └──...
│   ├── specs/               # Test specs
│   │   ├── admin-flow.spec.ts
│   │   └──...
│   ├── helpers/             # Test utilities
│   │   └── login.ts
│   └── playwright.config.ts
└── tests/                   # Jest unit tests
    └── setupTests.js

mall-mini-program/
├── e2e/                     # H5 E2E tests
│   ├── pages/
│   ├── specs/
│   └── playwright.config.ts
└── tests/                   # Unit tests
```

### Pattern 1: Playwright Page Object Model
**What:** Encapsulate page locators and actions in page classes
**When to use:** All E2E tests to reduce duplication and improve maintainability
**Example:**
```typescript
// Source: [ASSUMED - standard Playwright pattern]
class CouponsPage {
  constructor(readonly page: Page) {}

  async goto() {
    await this.page.goto('/coupons');
  }

  async createCoupon(data: CouponData) {
    await this.page.click('[data-testid="create-btn"]');
    // fill form...
  }
}
```

### Pattern 2: Critical User Journey Testing
**What:** Prioritize test coverage by user journey importance
**When to use:** When full coverage is impractical within phase time
**Priority order:**
1. Checkout flow (add to cart → checkout → payment → order list) - highest revenue impact
2. Order management (create → view → fulfill → complete) - core business loop
3. Product browsing (home → list → detail → cart) - discovery path
4. Admin operations (login → dashboard → CRUD operations) - operational efficiency

### Pattern 3: Visual Regression Testing
**What:** Capture screenshots and compare against baselines
**When to use:** UI/UX optimization phase to catch unintended visual changes
**Tools:** Playwright screenshot comparison or dedicated tools like Percy

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cross-browser testing | Custom Selenium grid | Playwright | Native support for Chromium/Firefox/WebKit, single API |
| Mobile testing | Appium for mini-program | Playwright with viewport simulation | Easier setup, works with H5 build |
| Screenshot diffing | Custom image comparison | Playwright screenshot + pixelmatch | Built-in, reliable |
| Test data management | Manual SQL insertion | API calls via Playwright | More realistic, tests the full stack |
| CI test reporting | Custom reporters | Playwright HTML reporter | Built-in, comprehensive |

**Key insight:** Playwright is already in the Admin Web project. Using it for Mini Program H5 testing creates unified tooling across the entire v2.0 frontend.

## Runtime State Inventory

> Phase 13 is a greenfield integration phase, not a rename/refactor. No runtime state inventory needed.

## Common Pitfalls

### Pitfall 1: Overlapping Test Scope with Phase 14/15
**What goes wrong:** Phase 13 tests the wrong Admin Web (pre-migration vs post-migration)
**Why it happens:** Phase 14 migrates mall-admin-web to portal-web. Phase 15 does UAT on the migrated version. Phase 13 may run before migrations complete.
**How to avoid:** Scope Phase 13 to test existing react-web Admin Web thoroughly, defer mall-admin specific testing to Phase 15
**Warning signs:** Test failures that only affect mall-admin routes, not the current react-web routes

### Pitfall 2: Testing Against Wrong Environment
**What goes wrong:** Tests pass locally but fail in staging/production
**Why it happens:** Hardcoded localhost URLs, missing env-specific API endpoints
**How to avoid:** Use environment variables for BASE_URL, test against staging before declaring success
**Warning signs:** Tests always run on localhost:8066 regardless of deployment target

### Pitfall 3: Unstable E2E Tests (Flaky Tests)
**What goes wrong:** Tests fail intermittently due to timing issues
**Why it happens:** Missing waitForSelector, race conditions, network variability
**How to avoid:** Use Playwright's auto-wait features, add explicit waits only when necessary, run tests with --retries flag
**Warning signs:** Random failures in CI but not locally

### Pitfall 4: Mini Program Testing via MP-Weixin Directly
**What goes wrong:** Can't automate WeChat MP simulator from CI
**Why it happens:** WeChat MP requires WeChat client, not accessible in headless CI
**How to avoid:** Test Mini Program via H5 build (`npm run dev:h5`) in Playwright, reserve MP-Weixin for manual testing
**Warning signs:** Attempting to use appium or WeChat-specific automation tools

### Pitfall 5: UI Optimization Without Performance Baseline
**What goes wrong:** Changes feel "better" but have no measurement
**Why it happens:** No before/after metrics, subjective assessments
**How to avoid:** Run Lighthouse before and after UI changes, set thresholds for LCP, CLS, FCP
**Warning signs:** "Obviously faster" claims without data

## Code Examples

Verified patterns from official sources:

### Admin Web E2E Route Test (existing pattern)
```typescript
// Source: zlt-web/react-web/src/main/frontend/src/e2e/baseLayout.e2e.spec.ts
import type { Page } from '@playwright/test';
import { expect, test } from '@playwright/test';
const { uniq } = require('lodash');
const RouterConfig = require('../../config/routes').default;

const BASE_URL = `http://localhost:${process.env.PORT || 8001}`;

const testPage = (path: string, page: Page) => async () => {
  await page.evaluate(() => {
    localStorage.setItem('antd-pro-authority', '["admin"]');
  });
  await page.goto(`${BASE_URL}${path}`);
  await page.waitForSelector('footer', { timeout: 2000 });
  const haveFooter = await page.evaluate(() => document.getElementsByTagName('footer').length > 0);
  expect(haveFooter).toBeTruthy();
};
```

### Playwright Mobile Viewport
```typescript
// Source: [ASSUMED - Playwright documentation]
test('mini program home on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
  await page.goto('http://localhost:5173'); // H5 dev server
  // test mobile-specific interactions...
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Selenium WebDriver | Playwright | 2020+ | Faster, more reliable auto-wait |
| Protractor (Angular) | Playwright | 2022+ | Protractor deprecated, Playwright recommended |
| Manual mini-program testing | H5 + Playwright | 2024+ | Automatable CI, faster feedback |
| Jest for E2E | Playwright | 2023+ | Playwright has built-in test runner, better DX |

**Deprecated/outdated:**
- Protractor: No longer maintained, use Playwright or Cypress
- Puppeteer only: Lacks cross-browser support of Playwright

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Playwright 1.17.0 in Admin Web is the correct version to use | Standard Stack | Tests may need version upgrade |
| A2 | Mini Program H5 build is testable via Playwright | Architecture Patterns | WeChat MP specific features may not work in H5 |
| A3 | Phase 13 runs after Phase 14/15 are complete | User Constraints | Test scope may need adjustment |
| A4 | Admin Web runs on port 8066 (react-web) not 8001 (portal-web) | Environment | UAT Phase 15 tests portal-web on 8001 |

**If this table is empty:** All claims in this research were verified or cited — no user confirmation needed.

## Open Questions

1. **Phase ordering clarification**
   - What we know: Phase 13 is "集成测试与优化", Phase 14 is "前端工程合并", Phase 15 is "管理后台前端UAT测试"
   - What's unclear: Does Phase 13 test the old react-web Admin (before Phase 14 migration) or the migrated portal-web Admin (Phase 14 output)?
   - Recommendation: Phase 13 should test the current react-web Admin thoroughly. Phase 15 should do UAT on the migrated portal-web after Phase 14 completes.

2. **Mini Program testing scope**
   - What we know: Mini Program has no test infrastructure
   - What's unclear: Should we add unit tests (Vitest) or just E2E (Playwright H5)?
   - Recommendation: Start with Playwright E2E via H5 build, add unit tests for complex business logic if time permits.

3. **Performance benchmark targets**
   - What we know: Need load time optimization, lazy loading, caching
   - What's unclear: What are the acceptable LCP, CLS, FID thresholds?
   - Recommendation: Use Lighthouse "Good" thresholds (LCP < 2.5s, CLS < 0.1, FID < 100ms) as targets.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Admin Web, Mini Program build | ✓ | >=12 (Admin Web), >=18 (recommended) | — |
| npm | Package installation | ✓ | 10.x | — |
| Playwright | E2E testing | ✓ (Admin Web) | 1.17.0 | Install latest |
| Chromium | Playwright browser | ✓ (via playwright install) | latest | Firefox, WebKit |
| Java | mall-center backend | ? | ? | Backend must be running for E2E |
| MySQL | Data layer | ? | ? | — |
| Redis | Caching | ? | ? | — |
| Nacos | Registry | ? | ? | — |

**Missing dependencies with no fallback:**
- Java, MySQL, Redis, Nacos status unknown — need to verify backend is running before E2E tests

**Missing dependencies with fallback:**
- None identified

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Playwright (for both Admin Web and Mini Program H5) |
| Config file | zlt-web/react-web/src/main/frontend/playwright.config.ts |
| Quick run command | `cd zlt-web/react-web/src/main/frontend && npx playwright test` |
| Full suite command | `cd zlt-web/react-web/src/main/frontend && npx playwright test --reporter=list` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADMIN-01-01~05 | Dashboard metrics display | E2E | Playwright route test + data assertion | ✅ baseLayout.e2e.spec.ts |
| ADMIN-02-01~10 | Product CRUD | E2E | Page object + form interaction test | ❌ Need new spec |
| ADMIN-03-01~07 | Order management | E2E | Order list + detail + action tests | ❌ Need new spec |
| ADMIN-04-01~07 | Coupon CRUD + issue | E2E | Coupon page + create + issue tests | ❌ Need new spec |
| ADMIN-05-01~06 | Promotion management | E2E | Promotion page tests | ❌ Need new spec |
| ADMIN-06-01~06 | Refund audit | E2E | Refund list + approve/reject tests | ❌ Need new spec |
| ADMIN-07-01~06 | Logistics management | E2E | Logistics page tests | ❌ Need new spec |
| ADMIN-08-01~04 | User management | E2E | User list + detail tests | ❌ Need new spec |
| ADMIN-09-01~05 | Merchant management | E2E | Merchant list + approve tests | ❌ Need new spec |
| ADMIN-10-01~05 | Banner management | E2E | Banner CRUD tests | ❌ Need new spec |
| ADMIN-11-01~03 | WeChat config | Manual | Not automatable - needs WeChat API access | N/A |
| MINI-01-01~07 | Home page | E2E | H5 home page load + interactions | ❌ Need new spec |
| MINI-02-01~05 | Product list | E2E | Filter + sort + search tests | ❌ Need new spec |
| MINI-03-01~09 | Product detail | E2E | Spec selection + add to cart tests | ❌ Need new spec |
| MINI-04-01~07 | Shopping cart | E2E | Cart operations tests | ❌ Need new spec |
| MINI-05-01~09 | Order confirmation | E2E | Address + coupon + submit tests | ❌ Need new spec |
| MINI-06-01~05 | Order list | E2E | Tab filters + cancel/confirm tests | ❌ Need new spec |
| MINI-07-01~05 | Order detail | E2E | Order info + logistics display | ❌ Need new spec |
| MINI-08-01~06 | Refund application | E2E | Refund form + cancel tests | ❌ Need new spec |
| MINI-09-01~07 | Personal center | E2E | Profile + addresses + coupons tests | ❌ Need new spec |
| MINI-10-01~05 | WeChat payment | E2E (mock) | Payment initiation + callback | ❌ Need new spec |

### Sampling Rate
- **Per task commit:** `npx playwright test` (smoke test, 5 minutes)
- **Per wave merge:** `npx playwright test --reporter=list` (full suite, 15-20 minutes)
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `zlt-web/react-web/src/main/frontend/src/e2e/pages/WelcomePage.ts` — Page object for Welcome
- [ ] `zlt-web/react-web/src/main/frontend/src/e2e/pages/CouponsPage.ts` — Page object for Coupons
- [ ] `zlt-web/react-web/src/main/frontend/src/e2e/specs/coupon-crud.spec.ts` — Coupon CRUD test
- [ ] `zlt-web/react-web/src/main/frontend/src/e2e/helpers/login.ts` — Admin login helper
- [ ] `mall-mini-program/e2e/` — H5 E2E test structure (NEW)
- [ ] `mall-mini-program/e2e/playwright.config.ts` — Mini program test config
- [ ] `mall-mini-program/e2e/specs/home.spec.ts` — Mini program home test
- [ ] `mall-mini-program/e2e/specs/checkout.spec.ts` — Checkout flow test
- [ ] Framework install: `npx playwright install chromium` — if not already installed

*(If no gaps: "None — existing test infrastructure covers all phase requirements")*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | Yes | Session stored in localStorage (antd-pro-authority), tested via E2E |
| V3 Session Management | Yes | Session timeout, token refresh |
| V4 Access Control | Yes | Admin vs user role testing, route protection |
| V5 Input Validation | Yes | Form submission testing, edge cases |
| V6 Cryptography | No | No client-side crypto in scope |

### Known Threat Patterns for React + Umi

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via user input | Reflected XSS | React auto-escapes, Content-Security-Policy header |
| CSRF on API calls | Tampering | Token-based auth, SameSite cookies |
| SQL injection | Information Disclosure | Parameterized queries (backend), E2E tests for injection attempts |
| Sensitive data in URL | Information Disclosure | POST for sensitive data, no tokens in URL params |

## Sources

### Primary (HIGH confidence)
- `zlt-web/react-web/src/main/frontend/package.json` — Admin Web dependencies, Playwright version
- `zlt-web/react-web/src/main/frontend/playwright.config.ts` — Existing Playwright config
- `zlt-web/react-web/src/main/frontend/src/e2e/baseLayout.e2e.spec.ts` — Existing E2E pattern
- `zlt-web/react-web/src/main/frontend/config/routes.ts` — Admin Web route definitions
- `mall-mini-program/pages.json` — Mini Program page structure
- `mall-mini-program/vite.config.js` — Mini Program build config
- `mall-mini-program/package.json` — Mini Program dependencies

### Secondary (MEDIUM confidence)
- Phase 15 UAT plan documents — Understanding testing scope
- Umi 3 documentation — Testing integration
- Playwright official docs — Best practices

### Tertiary (LOW confidence)
- Playwright 1.17.0 latest version — Not verified in this session, needs `npm view @playwright/test version`
- Performance benchmark thresholds — Based on Lighthouse defaults, not project-specific

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM - Playwright is confirmed in package.json, but version 1.17.0 may be outdated
- Architecture: MEDIUM - Clear separation of Admin Web vs Mini Program testing, but Phase overlap needs clarification
- Pitfalls: MEDIUM - Common patterns identified, but phase ordering risk is significant

**Research date:** 2026-05-20
**Valid until:** 2026-06-20 (30 days - stable domain, project-specific)