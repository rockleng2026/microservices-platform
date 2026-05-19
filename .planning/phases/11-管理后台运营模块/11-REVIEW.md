---
phase: 11-管理后台运营模块
reviewed: 2026-05-19T00:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - zlt-web/mall-admin-web/src/pages/Logistics/services/logistics.ts
  - zlt-web/mall-admin-web/src/pages/Member/index.tsx
  - zlt-web/mall-admin-web/src/pages/Member/services/member.ts
  - zlt-web/mall-admin-web/src/pages/Merchant/index.tsx
  - zlt-web/mall-admin-web/src/pages/Refund/index.tsx
  - zlt-web/mall-admin-web/src/pages/Refund/services/refund.ts
findings:
  critical: 3
  warning: 4
  info: 0
  total: 7
status: issues_found
---

# Phase 11: Code Review Report

**Reviewed:** 2026-05-19
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Reviewed all 6 TypeScript/React source files for the admin mall backend module covering Refund audit (ADMIN-06), Logistics tracking (ADMIN-07), Member management (ADMIN-08), and Merchant management (ADMIN-09). Three critical issues were found: a stored XSS vulnerability via unvalidated business license URLs in the Merchant page, NaN displayed to users in two `formatMoney` functions, and silent NaN propagation via `parseInt` in the tab status handler. Four warnings include silent error handling failures and columns defined inside the component body.

## Critical Issues

### CR-01: Stored XSS via Unvalidated Business License URL

**File:** `zlt-web/mall-admin-web/src/pages/Merchant/index.tsx:442`
**Issue:** The `businessLicense` URL is rendered directly as an `<a href>` without validation. If the backend stores a `javascript:` URI or a data URI containing script content, it will execute when the admin clicks the link. React does not sanitize `href` attribute values against `javascript:` schemes.
**Fix:**
```tsx
// Add URL validation before rendering
{selectedMerchant.businessLicense ? (
  /^https?:\/\//i.test(selectedMerchant.businessLicense) ? (
    <a href={selectedMerchant.businessLicense} target="_blank" rel="noopener noreferrer">
      查看营业执照
    </a>
  ) : (
    <span>链接格式异常</span>
  )
) : '-'}
```

### CR-02: NaN Displayed to Users When formatMoney Receives Invalid Input

**File:** `zlt-web/mall-admin-web/src/pages/Member/index.tsx:26`
**File:** `zlt-web/mall-admin-web/src/pages/Refund/index.tsx:47`
**Issue:** Both `formatMoney` functions call `parseFloat(amount)` and then `num.toFixed(2)`. If `amount` is an unparseable string (e.g., empty string, garbage data from API), `parseFloat` returns `NaN` and `NaN.toFixed(2)` returns the string `"NaN"`, which renders directly in the UI as "NaN".
**Fix:**
```tsx
// Member/index.tsx:24-27 and Refund/index.tsx:45-48
const formatMoney = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '¥0.00';
  return `¥${num.toFixed(2)}`;
};
```

### CR-03: parseInt Returns NaN for Invalid Tab Keys in getStatusValue

**File:** `zlt-web/mall-admin-web/src/pages/Merchant/index.tsx:58`
**Issue:** `parseInt(key, 10)` returns `NaN` for any non-numeric string. The function checks `key === 'all'` but passes `NaN` to the API for any other invalid key. Since tab keys come from the `TABS` configuration array, they should always be valid, but there is no defensive validation. `NaN` comparisons (`NaN === NaN`) are always false, so the `if (key === 'all') return null` guard would not protect against a malformed key.
**Fix:**
```tsx
const getStatusValue = (key: string): number | null => {
  if (key === 'all') return null;
  const val = parseInt(key, 10);
  return isNaN(val) ? null : val;
};
```

## Warnings

### WR-01: Silent Error in handleViewDetail with No User Feedback

**File:** `zlt-web/mall-admin-web/src/pages/Merchant/index.tsx:102-116`
**Issue:** `handleViewDetail` catches exceptions in the `getMerchantDetail` call but does not call `message.error()`. The admin sees no indication that fetching the detail failed. By contrast, `handleViewDetail` in Member/index.tsx (line 213) properly calls `message.error('获取会员详情失败')`.
**Fix:** Add `message.error('获取商户详情失败')` inside the catch block at line 112.

### WR-02: Columns Defined Inside Component Body

**File:** `zlt-web/mall-admin-web/src/pages/Merchant/index.tsx:238`
**Issue:** `const columns: ColumnsType<MerchantDTO> = [...]` is defined inside the `MerchantListPage` component body, meaning the columns array is recreated on every render. This adds unnecessary re-render cost. Should be outside the component or memoized with `useMemo`.
**Fix:**
```tsx
// Move outside the component
const getMerchantColumns = (onView: ..., onApprove: ..., ...): ColumnsType<MerchantDTO> => [...];

// Or memoize inside
const columns = useMemo(() => [...], [actionLoading, activeTab, ...]);
```

### WR-03: Refund Detail Modal Renders User-Provided Text Without Explicit Safety

**File:** `zlt-web/mall-admin-web/src/pages/Refund/index.tsx:327-340`
**Issue:** Fields `refundReason` and `refundDesc` are rendered directly in the modal. While React escapes text content in JSX children by default, rendering these as plain text is the correct approach and is safe. However, the modal does not enforce any length or content validation on these fields server-side (only UI-level `maxLength` on the reject TextArea in the Reject Modal, but no server-side enforcement is visible in the API layer). A large payload could cause layout issues.
**Fix:** Add `maxLength` validation on the backend and enforce it in the API service. On the frontend, add `maxLength={500}}` to the `refundReason` and `refundDesc` display if truncated.

### WR-04: getMemberDetail Conflates Network Errors and Not-Found Cases

**File:** `zlt-web/mall-admin-web/src/pages/Member/services/member.ts:91-103`
**Issue:** Both a failed HTTP request and a successful "member not found" response return `null`. This makes debugging harder and makes callers unable to distinguish between "could not reach server" and "member does not exist." The calling code in Member/index.tsx (lines 206-211) handles this by checking `if (detail)` and showing an error, but the underlying issue is that the service layer conflates the two error modes.
**Fix:** Consider throwing on network errors and returning `null` only for not-found:
```tsx
export async function getMemberDetail(id: number): Promise<MemberDTO | null> {
  const response = await request<ApiResponse<MemberDTO>>(
    `${API_BASE_URL}/api/mall/admin/member/${id}`,
    { method: 'GET' }
  );
  if (response.code !== 200) {
    throw new Error(response.msg || 'Failed to get member detail');
  }
  return response.datas || null;
}
```

---

_Reviewed: 2026-05-19_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
