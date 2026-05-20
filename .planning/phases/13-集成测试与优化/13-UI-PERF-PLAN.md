---
phase: "13"
plan_id: "13-UI-PERF"
wave: "2"
depends_on: "13-ADMIN-E2E, 13-MINI-E2E"
autonomous: true
files_modified:
  - "zlt-web/portal-web/src/main/frontend/src/pages/welcome/index.tsx"
  - "zlt-web/portal-web/src/main/frontend/src/pages/products/index.tsx"
  - "zlt-web/portal-web/src/main/frontend/src/pages/order/index.tsx"
  - "zlt-web/portal-web/src/main/frontend/src/pages/coupon/index.tsx"
  - "mall-mini-program/src/pages/home/index.vue"
  - "mall-mini-program/src/pages/product-list/index.vue"
  - "mall-mini-program/src/pages/product-detail/index.vue"
  - "mall-mini-program/src/pages/cart/index.vue"
  - "mall-mini-program/src/pages/user/index.vue"
  - "zlt-web/portal-web/src/main/frontend/lighthouse.config.js"
  - "mall-mini-program/lighthouse.config.js"
requirements_addressed:
  - "ADMIN-01-01"
  - "ADMIN-01-02"
  - "ADMIN-01-03"
  - "ADMIN-01-04"
  - "ADMIN-01-05"
  - "ADMIN-02-01"
  - "ADMIN-02-10"
  - "ADMIN-03-01"
  - "ADMIN-03-02"
  - "ADMIN-04-01"
  - "ADMIN-04-06"
  - "ADMIN-05-01"
  - "ADMIN-06-01"
  - "ADMIN-07-01"
  - "ADMIN-08-01"
  - "ADMIN-09-01"
  - "ADMIN-10-01"
  - "ADMIN-11-03"
  - "MINI-01-01"
  - "MINI-01-05"
  - "MINI-02-01"
  - "MINI-03-01"
  - "MINI-04-01"
  - "MINI-05-01"
  - "MINI-06-01"
  - "MINI-07-01"
  - "MINI-08-01"
  - "MINI-09-01"
---

# Plan 13-UI-PERF: UI/Performance Optimization and Bug Fixes

## Objective

Optimize UI/UX and performance for both Admin Web and Mini Program, fix bugs discovered during integration testing, and establish performance baselines using Lighthouse.

## Context

- Phase 13 is the final integration phase - bugs may be discovered during E2E testing
- UI/UX issues may include responsive layout, visual consistency, interaction polish
- Performance issues may include slow load times, missing lazy loading, large bundle sizes
- Lighthouse will be used to establish before/after performance baselines

## Tasks

### Task 1: Run Lighthouse baseline audit for Admin Web

<read_first>
- zlt-web/portal-web/src/main/frontend/package.json
- zlt-web/portal-web/src/main/frontend/src/pages/welcome/index.tsx
- zlt-web/portal-web/src/main/frontend/config/routes.ts
</read_first>

<action>
Install Lighthouse and create config:

```bash
cd D:/code/microservices-platform/zlt-web/portal-web/src/main/frontend
npm install -D @lhci/cli@latest
```

Create `zlt-web/portal-web/src/main/frontend/lighthouse.config.js`:

```javascript
module.exports = {
  ci: {
    collection: {
      url: [
        'http://localhost:8066/welcome',
        'http://localhost:8066/products',
        'http://localhost:8066/orders',
      ],
      preset: 'desktop',
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.7 }],
        'categories:accessibility': ['error', { minScore: 0.8 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
```

Run baseline audit:

```bash
# Start Admin Web dev server first (port 8066)
npm run start &
sleep 15
npx lhci autorun
```

Save baseline report to `.planning/phases/13-集成测试与优化/lighthouse-admin-baseline.json`.
</action>

<acceptance_criteria>
- `lighthouse.config.js` exists in Admin Web with performance thresholds (LCP < 2.5s, CLS < 0.1)
- Baseline Lighthouse report generated for Admin Web
- Report shows performance score, LCP, CLS, FCP values
</acceptance_criteria>

### Task 2: Run Lighthouse baseline audit for Mini Program (H5)

<read_first>
- mall-mini-program/package.json
- mall-mini-program/vite.config.js
- mall-mini-program/pages.json
</read_first>

<action>
Install Lighthouse in Mini Program:

```bash
cd D:/code/microservices-platform/mall-mini-program
npm install -D @lhci/cli@latest
```

Create `mall-mini-program/lighthouse.config.js`:

```javascript
module.exports = {
  ci: {
    collection: {
      url: [
        'http://localhost:5173/',
        'http://localhost:5173/pages/product-list/index',
        'http://localhost:5173/pages/product-detail/index',
      ],
      preset: 'perf',
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.6 }],
        'categories:accessibility': ['error', { minScore: 0.7 }],
        'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 5000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.15 }],
      },
    },
  },
};
```

Run baseline audit against H5 build:

```bash
# Start H5 dev server (port 5173)
npm run dev:h5 &
sleep 15
npx lhci autorun
```

Save baseline report to `.planning/phases/13-集成测试与优化/lighthouse-mini-baseline.json`.
</action>

<acceptance_criteria>
- `lighthouse.config.js` exists in Mini Program with mobile performance thresholds
- Baseline Lighthouse report generated for Mini Program H5
- Report shows mobile performance score, LCP, CLS, FCP values
</acceptance_criteria>

### Task 3: Fix Admin Web UI/UX Issues

<read_first>
- zlt-web/portal-web/src/main/frontend/src/pages/welcome/index.tsx
- zlt-web/portal-web/src/main/frontend/src/pages/products/index.tsx
- zlt-web/portal-web/src/main/frontend/src/layouts/SecurityLayout.tsx
</read_first>

<action>
Based on Lighthouse audit and E2E testing findings, fix UI issues. Common issues to check and fix:

1. **Dashboard responsiveness:**
   - Check if metric cards stack properly on smaller screens
   - Verify charts render correctly at different viewport sizes

2. **Product management page:**
   - Ensure table columns are properly aligned
   - Verify batch action buttons are accessible

3. **Order management:**
   - Check status filter tabs are visible and clickable
   - Verify order detail modal/page loads without layout shift

4. **Performance fixes:**
   - Add `loading="lazy"` to image tags where applicable
   - Check for unnecessary re-renders using React Profiler
   - Verify code splitting is working (routes loaded on demand)

Apply specific fixes based on actual Lighthouse report findings.
</action>

<acceptance_criteria>
- Dashboard is responsive at 1024px, 768px, and 375px widths
- Product table renders without layout shift
- All interactive elements (buttons, links) have proper hover/focus states
- Lighthouse performance score for Admin Web meets threshold (>= 0.7)
</acceptance_criteria>

### Task 4: Fix Mini Program UI/UX Issues

<read_first>
- mall-mini-program/src/pages/home/index.vue
- mall-mini-program/src/pages/product-list/index.vue
- mall-mini-program/src/pages/product-detail/index.vue
- mall-mini-program/src/pages/cart/index.vue
- mall-mini-program/src/pages/user/index.vue
</read_first>

<action>
Based on Lighthouse audit and E2E testing findings, fix UI issues for Mini Program:

1. **Home page:**
   - Verify banner carousel is visible and swipeable
   - Ensure category tiles are properly spaced and tappable
   - Check recommended products section renders correctly

2. **Product list:**
   - Verify filter/sort controls are accessible
   - Check product cards show correct image, name, price
   - Ensure "load more" pagination works smoothly

3. **Product detail:**
   - Verify image carousel has proper indicators
   - Ensure specification selectors are easy to tap
   - Check "add to cart" button is prominently displayed

4. **Cart:**
   - Verify items display correctly with correct prices
   - Ensure quantity adjustment controls are functional
   - Check checkout button is visible and properly styled

5. **Personal center:**
   - Verify user avatar and info display correctly
   - Check address management is intuitive
   - Ensure coupons and favorites sections are accessible

Apply specific fixes based on actual testing findings.
</action>

<acceptance_criteria>
- Home page is visually consistent and functional on iPhone viewport (375x667)
- Product cards display correctly with images, names, prices
- All interactive elements are properly sized for touch (min 44px tap targets)
- Lighthouse performance score for Mini Program H5 meets threshold (>= 0.6)
</acceptance_criteria>

### Task 5: Apply Performance Optimizations

<read_first>
- zlt-web/portal-web/src/main/frontend/config/config.ts
- zlt-web/portal-web/src/main/frontend/.eslintrc.js
- mall-mini-program/vite.config.js
</read_first>

<action>
Apply performance optimizations based on Lighthouse findings:

**Admin Web:**
1. **Code splitting:** Verify Umi is splitting bundles by route. Check if `dynamic import` is used for heavy components.

2. **Image optimization:** Add lazy loading to product images:
```html
<img loading="lazy" src={src} alt={alt} />
```

3. **Bundle size:** Check `npm run analyze` output if available to identify large dependencies.

4. **Caching:** Verify static assets have proper cache headers (handled by server, but confirm in config).

**Mini Program (H5):**
1. **Vite build optimization:** Check vite.config.js for:
```javascript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['vue', 'vue-router', 'pinia'],
      },
    },
  },
}
```

2. **Lazy loading:** Use dynamic imports for pages that are not immediately needed.

3. **Image compression:** Ensure images are properly compressed in the build.

4. **Tree shaking:** Verify unused code is not included in final bundle.

Run final Lighthouse audit to confirm improvements.
</action>

<acceptance_criteria>
- Admin Web Lighthouse performance score improved by at least 10% from baseline
- Mini Program H5 Lighthouse performance score improved by at least 10% from baseline
- No new accessibility issues introduced
- Both applications maintain functionality after optimizations
</acceptance_criteria>

### Task 6: Document Bug Fixes and Create Summary

<read_first>
- zlt-web/portal-web/src/main/frontend/src/pages/welcome/index.tsx (modified files)
- mall-mini-program/src/pages/home/index.vue (modified files)
</read_first>

<action>
Compile all bug fixes and optimization results into a summary document.

Create `zlt-web/portal-web/src/main/frontend/TESTING_SUMMARY.md`:

```markdown
# Phase 13 Testing Summary

## E2E Test Results

### Admin Web
| Module | Tests | Passed | Failed |
|--------|-------|--------|--------|
| Dashboard (ADMIN-01) | 3 | X | Y |
| Product (ADMIN-02) | 10 | X | Y |
| Order (ADMIN-03) | 7 | X | Y |
| Coupon (ADMIN-04) | 7 | X | Y |
| Promotion (ADMIN-05) | 6 | X | Y |
| Refund (ADMIN-06) | 6 | X | Y |
| Logistics (ADMIN-07) | 6 | X | Y |
| User (ADMIN-08) | 4 | X | Y |
| Merchant (ADMIN-09) | 5 | X | Y |
| Banner (ADMIN-10) | 5 | X | Y |
| WeChat Config (ADMIN-11) | 2 | X | Y |

### Mini Program
| Module | Tests | Passed | Failed |
|--------|-------|--------|--------|
| Home (MINI-01) | 7 | X | Y |
| Product List (MINI-02) | 5 | X | Y |
| Product Detail (MINI-03) | 9 | X | Y |
| Cart (MINI-04) | 7 | X | Y |
| Order Confirm (MINI-05) | 9 | X | Y |
| Order List (MINI-06) | 5 | X | Y |
| Order Detail (MINI-07) | 5 | X | Y |
| Refund (MINI-08) | 6 | X | Y |
| Personal Center (MINI-09) | 7 | X | Y |
| Payment (MINI-10) | 5 | X | Y |

## Performance Audit

### Admin Web
| Metric | Baseline | After | Change |
|--------|----------|-------|--------|
| Performance Score | X | Y | +Z% |
| LCP | Xms | Yms | Z% |
| CLS | X | Y | Z% |

### Mini Program H5
| Metric | Baseline | After | Change |
|--------|----------|-------|--------|
| Performance Score | X | Y | +Z% |
| LCP | Xms | Yms | Z% |
| CLS | X | Y | Z% |

## Bugs Fixed

| Bug ID | Description | Module | Fix Applied |
|--------|-------------|--------|-------------|
| B-01 | [description] | [module] | [fix] |
| B-02 | [description] | [module] | [fix] |

## UI/UX Improvements

| Improvement | Module | Before | After |
|-------------|--------|--------|-------|
| [description] | [module] | [before] | [after] |
```
</action>

<acceptance_criteria>
- TESTING_SUMMARY.md created in Admin Web directory
- All E2E test results documented
- Lighthouse before/after comparison documented
- All bugs fixed documented with descriptions
</acceptance_criteria>

## Verification

| Criteria | Test |
|----------|------|
| Admin Web Lighthouse passes threshold | `npx lhci autorun` shows performance >= 0.7 |
| Mini Program H5 Lighthouse passes threshold | `npx lhci autorun` shows performance >= 0.6 |
| E2E test results documented | TESTING_SUMMARY.md contains all results |
| Bug fixes documented | TESTING_SUMMARY.md lists all fixed bugs |
| UI improvements documented | TESTING_SUMMARY.md lists visual improvements |

## must_haves

- Lighthouse baseline reports for both Admin Web and Mini Program
- Lighthouse after-optimization reports showing improvement
- Admin Web performance score >= 0.7 (desktop)
- Mini Program H5 performance score >= 0.6 (mobile)
- TESTING_SUMMARY.md with complete E2E results, performance data, and bug list
- No critical bugs remaining in tested functionality

## Notes

- **E2E test stability:** If tests are flaky, increase retries in playwright.config.ts
- **Lighthouse CI:** Requires both dev servers to be running during audit
- **Bug prioritization:** Focus on critical path bugs (checkout flow, order management) before cosmetic fixes
- **Accessibility:** Both applications should meet WCAG 2.1 AA standards after fixes