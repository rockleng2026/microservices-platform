# ADMIN-09: 商户管理页面

## Phase Goal

**As a** admin operator, **I want to** manage merchant accounts (review, approve, disable), **so that** I can control who can sell on the platform and ensure platform integrity.

## Plan Overview

| Wave | Type | Files | Purpose |
|------|------|-------|---------|
| 1 | execute | `Merchant/index.tsx`, `Merchant/services/merchant.ts` | Pure frontend foundation |
| 2 | execute | (same files) | Backend integration - review/status actions |

## Wave 1: Frontend Foundation

### Task 1: Create Merchant Service and Types

**Files:** `zlt-web/mall-admin-web/src/pages/Merchant/services/merchant.ts`

**Action:** Create API service module with:

```typescript
// Merchant status constants (per ADMIN-09 requirements)
export const MERCHANT_STATUS = {
  PENDING_REVIEW: 0,   // 待审核
  APPROVED: 1,          // 已通过
  REJECTED: 2,          // 已拒绝
  DISABLED: 3,          // 已禁用
} as const;

export const MERCHANT_STATUS_TEXT: Record<number, string> = {
  [MERCHANT_STATUS.PENDING_REVIEW]: '待审核',
  [MERCHANT_STATUS.APPROVED]: '已通过',
  [MERCHANT_STATUS.REJECTED]: '已拒绝',
  [MERCHANT_STATUS.DISABLED]: '已禁用',
};

// Merchant DTO (per MerchantDTO from backend)
export interface MerchantDTO {
  id: number;
  merchantName: string;
  merchantCode: string;       // 商户编码
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  businessLicense?: string;   // 营业执照
  status: number;
  statusDesc: string;
  rejectReason?: string;      // 拒绝原因
  reviewTime?: string;
  createTime: string;
  updateTime?: string;
}

// Merchant list params
export interface MerchantListParams {
  page?: number;
  pageSize?: number;
  status?: number | null;
  keyword?: string;           // merchant name or code
}

// Merchant review DTO
export interface MerchantReviewDTO {
  status: number;            // 1=approve, 2=reject
  rejectReason?: string;      // required when rejecting
}

// Merchant API functions (AdminMerchantController)
// GET /api/mall/admin/merchant/list
export async function getMerchantList(params: MerchantListParams): Promise<PageResponse<MerchantDTO>>
// GET /api/mall/admin/merchant/{id}
export async function getMerchantDetail(id: number): Promise<MerchantDTO | null>
// POST /api/mall/admin/merchant/review/{id}
export async function reviewMerchant(id: number, data: MerchantReviewDTO): Promise<boolean>
```

**Verify:** File exists with exported types and functions, no compilation errors.

**Done:** MerchantService module with complete TypeScript types and API functions.

---

### Task 2: Create Merchant Management Page

**Files:** `zlt-web/mall-admin-web/src/pages/Merchant/index.tsx`

**Action:** Create merchant management page with:

1. **Status Tabs**: All | Pending Review | Approved | Rejected | Disabled (ADMIN-09-01)

2. **Search Filters** (ADMIN-09-01):
   - Keyword input (merchant name/code)
   - Status dropdown

3. **Merchant Table**:
   - Columns: ID, Merchant Name, Code, Contact, Phone, Status, Apply Time, Actions
   - Status tag with color coding

4. **Actions** (ADMIN-09-02, 03, 04):
   - **View Details** button -> Modal with full merchant info
   - **Approve** button (for pending) -> Confirm modal
   - **Reject** button (for pending) -> Reject reason input modal
   - **Disable** button (for approved) -> Confirm modal
   - **Enable** button (for disabled) -> Confirm modal

5. **Detail Modal**:
   - Full merchant information display
   - Business license image if available
   - Review history

```typescript
// Status tag colors
const STATUS_COLORS: Record<number, string> = {
  [MERCHANT_STATUS.PENDING_REVIEW]: 'warning',
  [MERCHANT_STATUS.APPROVED]: 'success',
  [MERCHANT_STATUS.REJECTED]: 'error',
  [MERCHANT_STATUS.DISABLED]: 'default',
};

// Tabs config
const TABS = [
  { key: 'all', label: '全部' },
  { key: String(MERCHANT_STATUS.PENDING_REVIEW), label: '待审核' },
  { key: String(MERCHANT_STATUS.APPROVED), label: '已通过' },
  { key: String(MERCHANT_STATUS.REJECTED), label: '已拒绝' },
  { key: String(MERCHANT_STATUS.DISABLED), label: '已禁用' },
];
```

**Verify:** Page renders with tabs, table, and action modals, no console errors.

**Done:** Merchant page with status tabs and action modals (placeholder handlers).

---

## Wave 2: Backend Integration

### Task 3: Connect to Real APIs

**Files:** `zlt-web/mall-admin-web/src/pages/Merchant/index.tsx`, `zlt-web/mall-admin-web/src/pages/Merchant/services/merchant.ts`

**Action:** Wire up real API calls (per D-10: API_BASE_URL = `/mall-center`):

1. **List API**: GET `/api/mall/admin/merchant/list`
2. **Detail API**: GET `/api/mall/admin/merchant/{id}`
3. **Review API**: POST `/api/mall/admin/merchant/review/{id}`
   - Body: `{ status: 1, rejectReason: "" }` for approve
   - Body: `{ status: 2, rejectReason: "xxx" }` for reject

**Review flow:**
- Approve -> Call `reviewMerchant(id, { status: 1 })`
- Reject -> Call `reviewMerchant(id, { status: 2, rejectReason: "xxx" })`
- Disable -> Call `reviewMerchant(id, { status: 3 })`
- Enable -> Call `reviewMerchant(id, { status: 1 })`

Add validation: reject reason required when rejecting.

**Verify:** Approve/Reject buttons work, status updates correctly after review.

**Done:** Merchant page fully functional with backend APIs.

---

## Requirements Coverage

| Requirement | Description | Task |
|-------------|-------------|------|
| ADMIN-09-01 | Merchant list with search/filter | Task 1, 2 |
| ADMIN-09-02 | Merchant detail view | Task 2, 3 |
| ADMIN-09-03 | Approve merchant | Task 3 |
| ADMIN-09-04 | Reject merchant | Task 3 |
| ADMIN-09-05 | Enable/disable merchant | Task 3 |

## Must-Haves

**Truths:**
- Admin can see all merchants in paginated list
- Admin can filter by status (tabs)
- Admin can view detailed merchant information
- Admin can approve or reject pending merchants
- Admin can disable or re-enable merchants

**Artifacts:**
- `zlt-web/mall-admin-web/src/pages/Merchant/services/merchant.ts` - API service
- `zlt-web/mall-admin-web/src/pages/Merchant/index.tsx` - Page component

**Key Links:**
- Tab change triggers `getMerchantList()` with status filter
- Approve calls `reviewMerchant(id, { status: 1 })`
- Reject calls `reviewMerchant(id, { status: 2, rejectReason: "xxx" })`
- Disable calls `reviewMerchant(id, { status: 3 })`

## Output

After completion, create `.planning/phases/11-管理后台运营模块/11-ADMIN-09-SUMMARY.md`