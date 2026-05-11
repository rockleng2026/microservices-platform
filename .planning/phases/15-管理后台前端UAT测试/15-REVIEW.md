---
phase: 15-管理后台前端UAT测试
reviewed: 2026-05-11T12:00:00Z
depth: standard
files_reviewed: 17
files_reviewed_list:
  - zlt-web/portal-web/src/pages/MallAdmin/Dashboard/index.tsx
  - zlt-web/portal-web/src/pages/MallAdmin/Goods/index.tsx
  - zlt-web/portal-web/src/pages/MallAdmin/Goods/detail/index.tsx
  - zlt-web/portal-web/src/pages/MallAdmin/Goods/services/goods.ts
  - zlt-web/portal-web/src/pages/MallAdmin/Orders/index.tsx
  - zlt-web/portal-web/src/pages/MallAdmin/Orders/services/orders.ts
  - zlt-web/portal-web/src/pages/MallAdmin/Categories/index.tsx
  - zlt-web/portal-web/src/pages/MallAdmin/Categories/services/categories.ts
  - zlt-web/portal-web/src/pages/MallAdmin/Banners/index.tsx
  - zlt-web/portal-web/src/pages/MallAdmin/Banners/services/banners.ts
  - zlt-web/portal-web/src/pages/MallAdmin/Coupon/index.tsx
  - zlt-web/portal-web/src/pages/MallAdmin/Stock/index.tsx
  - zlt-web/portal-web/src/pages/MallAdmin/Member/index.tsx
  - zlt-web/portal-web/src/stores/mallAdminStore.ts
  - zlt-web/portal-web/src/services/mall-admin/statistics.ts
  - zlt-web/portal-web/src/utils/request.ts
findings:
  critical: 1
  warning: 1
  info: 0
  total: 2
status: issues_found
---

# Phase 15: Code Review Report

**Reviewed:** 2026-05-11T12:00:00Z
**Depth:** standard
**Files Reviewed:** 17
**Status:** issues_found

## Summary

Phase 15 was a UAT testing phase with primary focus on verifying migrated mall-admin pages. The reviewed code consists of 8 page components (Dashboard, Goods, Orders, Categories, Banners, Coupon, Stock, Member) along with their service layers, the mallAdminStore, and the central request utility.

Overall code quality is acceptable with proper error handling and TypeScript typing. However, one critical security vulnerability was identified: an XSS risk in the Goods detail page via `dangerouslySetInnerHTML`. One warning-level issue was found regarding a non-null assertion that could cause runtime errors.

## Critical Issues

### CR-01: Stored XSS via dangerouslySetInnerHTML

**File:** `zlt-web/portal-web/src/pages/MallAdmin/Goods/detail/index.tsx:238`
**Issue:** The `goods.detail` field, which originates from user-controlled API data, is rendered directly as HTML using `dangerouslySetInnerHTML` without sanitization.

```tsx
<div dangerouslySetInnerHTML={{ __html: goods.detail }} style={{ lineHeight: 1.8 }} />
```

This creates a stored XSS vulnerability. An attacker with admin access could embed malicious JavaScript in a product's detail field (e.g., via an `<img src=x onerror=...>` payload) that would execute in every admin's browser when viewing that product.

**Fix:** Use a sanitization library like DOMPurify to sanitize the HTML before rendering:

```tsx
import DOMPurify from 'dompurify';

// Then in the component:
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(goods.detail) }} style={{ lineHeight: 1.8 }} />
```

Or render as plain text to completely eliminate the risk:
```tsx
<div style={{ lineHeight: 1.8 }}>{goods.detail}</div>
```

---

## Warnings

### WR-01: Non-null assertion on potentially undefined API response

**File:** `zlt-web/portal-web/src/pages/MallAdmin/Goods/services/goods.ts:113`
**Issue:** The function uses non-null assertion `response.datas!` which will throw a runtime error if the API returns a response without the `datas` field.

```tsx
export async function getGoodsDetail(id: number): Promise<AdminGoodsDTO> {
  const response = await request<{ datas?: AdminGoodsDTO }>(`${API_BASE}/${id}`, {
    method: 'GET',
  });
  return response.datas!;  // <-- Non-null assertion
}
```

Same issue at line 124 for `getGoodsByDetail`.

Similar patterns exist in other service files, for example:
- `zlt-web/portal-web/src/pages/MallAdmin/Orders/services/orders.ts:168` - `return response.datas || null;` is safer and should be used here too

**Fix:** Use optional chaining with a fallback:

```tsx
return response.datas ?? null;
```

Or provide proper error handling:
```tsx
if (!response.datas) {
  throw new Error('Failed to fetch goods detail');
}
return response.datas;
```

---

## Findings in Test Phase Documentation

The test summary and plan documents (15-ADMIN-UAT-01-SUMMARY.md and 15-ADMIN-UAT-01-PLAN.md) are properly structured and do not contain security issues.

---

## Recommendations

1. **Immediate:** Fix the XSS vulnerability in GoodsDetailPage before any production use. DOMPurify is the standard solution for sanitizing HTML in React.

2. **High Priority:** Review all `dangerouslySetInnerHTML` usage across the codebase and ensure user-generated content is sanitized before rendering.

3. **Medium Priority:** Replace non-null assertions in service layers with proper null checks or fallback values.

4. **Low Priority:** Consider adding `// eslint-disable-next-line react-hooks/exhaustive-deps` or restructuring the Dashboard useEffect to suppress the lint warning about missing dependencies (though in this case the store functions should be stable references).

---

## Positive Findings

1. Authentication is properly handled - the `request.ts` utility correctly attaches Bearer tokens and handles 401 redirects to login.

2. Error handling is generally good across service layers with try/catch blocks and user-facing error messages.

3. TypeScript typing is present and comprehensive for DTOs, parameters, and return values.

4. Input validation is in place for forms (e.g., CategoriesPage uses Form.validateFields before submission).

5. No hardcoded credentials or secrets found in reviewed files.

6. SQL injection is not a concern in frontend-only code.

7. XSS risks are limited to the one identified case in GoodsDetailPage.

---

_Reviewed: 2026-05-11T12:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_