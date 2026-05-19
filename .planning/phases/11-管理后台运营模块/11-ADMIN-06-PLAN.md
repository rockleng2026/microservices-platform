# ADMIN-06: 退款审核页面

## Phase Goal

**As a** admin operator, **I want to** review and process refund requests from customers, **so that** I can manage order refunds efficiently and provide good customer service.

## Plan Overview

| Wave | Type | Files | Purpose |
|------|------|-------|---------|
| 1 | execute | `Refund/index.tsx`, `Refund/services/refund.ts` | Pure frontend foundation - list page + API service types |
| 2 | execute | (same files) | Backend integration - approve/reject actions, real data |

## Wave 1: Frontend Foundation

### Task 1: Create Refund Service and Types

**Files:** `zlt-web/mall-admin-web/src/pages/Refund/services/refund.ts`

**Action:** Create API service module with:

```typescript
// Refund status constants (per ADMIN-06-01)
export const REFUND_STATUS = {
  PENDING: 1,      // 待审核
  APPROVED: 2,      // 已通过
  REJECTED: 3,      // 已拒绝
  COMPLETED: 4,     // 已退款
} as const;

export const REFUND_STATUS_TEXT: Record<number, string> = {
  [REFUND_STATUS.PENDING]: '待审核',
  [REFUND_STATUS.APPROVED]: '已通过',
  [REFUND_STATUS.REJECTED]: '已拒绝',
  [REFUND_STATUS.COMPLETED]: '已退款',
};

// DTOs
export interface RefundListDTO {
  id: number;
  orderId: number;
  orderNo: string;
  userId: number;
  userName: string;
  refundAmount: string;
  refundReason: string;
  refundDesc: string;
  status: number;
  statusDesc: string;
  applyTime: string;
  handleTime?: string;
  handleRemark?: string;
}

export interface RefundListParams {
  page?: number;
  pageSize?: number;
  orderId?: number;
  status?: number | null;
  startTime?: string;
  endTime?: string;
}

// API functions using request utility
// GET /api/mall/admin/refund/list
export async function getRefundList(params: RefundListParams): Promise<PageResponse<RefundListDTO>>
// POST /api/mall/admin/refund/{id}/approve
export async function approveRefund(id: number, remark?: string): Promise<boolean>
// POST /api/mall/admin/refund/{id}/reject
export async function rejectRefund(id: number, remark?: string): Promise<boolean>
```

**Verify:** File exists with exported types and functions, no compilation errors.

**Done:** RefundService module with complete TypeScript types and API functions.

---

### Task 2: Create Refund List Page

**Files:** `zlt-web/mall-admin-web/src/pages/Refund/index.tsx`

**Action:** Create refund audit page with ProTable following Orders page pattern:

1. **Tabs by status** (ADMIN-06-02): All | Pending | Approved | Rejected | Completed
2. **Filter bar**: Order ID, date range, status dropdown
3. **Table columns**: Order No, User, Amount, Reason, Status, Apply Time, Actions
4. **Actions**: View details modal, Approve button, Reject button with reason input
5. **Batch operations**: None per requirements

```typescript
// Status tag colors
const STATUS_COLORS: Record<number, string> = {
  [REFUND_STATUS.PENDING]: 'warning',
  [REFUND_STATUS.APPROVED]: 'processing',
  [REFUND_STATUS.REJECTED]: 'error',
  [REFUND_STATUS.COMPLETED]: 'success',
};
```

**Verify:** Page renders with tabs and table, no console errors.

**Done:** Refund list page with status tabs, search filters, and action buttons (placeholder handlers).

---

## Wave 2: Backend Integration

### Task 3: Connect to Real APIs

**Files:** `zlt-web/mall-admin-web/src/pages/Refund/index.tsx`, `zlt-web/mall-admin-web/src/pages/Refund/services/refund.ts`

**Action:** Wire up real API calls (per D-10: API_BASE_URL = `/mall-center`):

1. **List API**: GET `/api/mall/admin/refund/list` with params
2. **Approve API**: POST `/api/mall/admin/refund/{id}/approve?remark=xxx`
3. **Reject API**: POST `/api/mall/admin/refund/{id}/reject?remark=xxx`

Add loading states and error handling with `message.error()`.

**Verify:** `curl http://localhost:8080/mall-center/api/mall/admin/refund/list` returns mock data, approve/reject actions work.

**Done:** Refund page fully functional with backend APIs - approve triggers actual refund flow, reject rejects with reason.

---

## Requirements Coverage

| Requirement | Description | Task |
|-------------|-------------|------|
| ADMIN-06-01 | Refund list multi-condition filter | Task 1, 2 |
| ADMIN-06-02 | Status tabs (Pending/Approved/Rejected/Completed) | Task 2 |
| ADMIN-06-03 | View refund details | Task 2 |
| ADMIN-06-04 | Approve refund | Task 3 |
| ADMIN-06-05 | Reject refund | Task 3 |
| ADMIN-06-06 | Auto-trigger refund on approve | Task 3 |

## Must-Haves

**Truths:**
- Admin can see all refund requests in paginated list
- Admin can filter by order ID, status, date range
- Admin can approve or reject pending refunds with remarks
- Approve action triggers actual refund process

**Artifacts:**
- `zlt-web/mall-admin-web/src/pages/Refund/services/refund.ts` - API service
- `zlt-web/mall-admin-web/src/pages/Refund/index.tsx` - Page component

**Key Links:**
- Page uses `getRefundList()` from service
- Approve button calls `approveRefund(id, remark)`
- Reject button calls `rejectRefund(id, remark)`

## Output

After completion, create `.planning/phases/11-管理后台运营模块/11-ADMIN-06-SUMMARY.md`