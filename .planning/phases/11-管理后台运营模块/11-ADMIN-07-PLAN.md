# ADMIN-07: 物流管理页面

## Phase Goal

**As a** admin operator, **I want to** manage logistics tracking and view delivery status, **so that** I can help customers track their orders and manage shipping operations.

## Plan Overview

| Wave | Type | Files | Purpose |
|------|------|-------|---------|
| 1 | execute | `Logistics/index.tsx`, `Logistics/services/logistics.ts` | Pure frontend foundation |
| 2 | execute | (same files) | Backend integration - tracking + express management |

## Wave 1: Frontend Foundation

### Task 1: Create Logistics Service and Types

**Files:** `zlt-web/mall-admin-web/src/pages/Logistics/services/logistics.ts`

**Action:** Create API service module with:

```typescript
// Express list params
export interface ExpressListParams {
  page?: number;
  pageSize?: number;
  status?: number | null;
  keyword?: string;
}

// Express DTO
export interface ExpressDTO {
  id: number;
  name: string;        // 顺丰/中通/圆通
  code: string;        // SF/YT/YTO
  logo?: string;
  sort: number;
  status: number;
  createTime: string;
}

// Express API functions
// GET /api/mall/admin/express/list
export async function getExpressList(params: ExpressListParams): Promise<PageResponse<ExpressDTO>>
// POST /api/mall/admin/express
export async function createExpress(data: ExpressDTO): Promise<boolean>
// PUT /api/mall/admin/express
export async function updateExpress(data: ExpressDTO): Promise<boolean>
// DELETE /api/mall/admin/express/{id}
export async function deleteExpress(id: number): Promise<boolean>
// PUT /api/mall/admin/express/{id}/status/{status}
export async function updateExpressStatus(id: number, status: number): Promise<boolean>

// Logistics tracking types (from LogisticsTrackDTO)
export interface LogisticsTrace {
  time: string;
  location: string;
  description: string;
}

export interface LogisticsTrackDTO {
  orderId: number;
  orderNo: string;
  waybillNo: string;
  expressCode: string;
  expressName: string;
  status: number;       // 0=pending, 1=in_transit, 2=delivered, 3=returned, 4=exception
  statusDesc: string;
  traces: LogisticsTrace[];
  lastUpdateTime: string;
}

// Tracking API
// GET /api/mall/admin/logistics/tracking?orderId=xxx
export async function getLogisticsTracking(orderId: number): Promise<LogisticsTrackDTO | null>
```

**Verify:** File exists with exported types and functions, no compilation errors.

**Done:** LogisticsService module with Express CRUD and tracking types.

---

### Task 2: Create Logistics Management Page

**Files:** `zlt-web/mall-admin-web/src/pages/Logistics/index.tsx`

**Action:** Create logistics management page with two tabs:

**Tab 1: Logistics Tracking**
- Search by Order ID input + Search button
- Display tracking timeline when order found
- Show: Express name, Waybill No, Current status, Full trace history

**Tab 2: Express Company Management**
- ProTable of express companies (AdminExpressController pattern)
- Columns: Name, Code, Logo, Sort, Status, Actions
- Actions: Edit, Delete, Enable/Disable toggle
- Toolbar: Add Express button + Create/Edit modal

```typescript
// Express status colors
const STATUS_COLORS: Record<number, string> = {
  1: 'success',  // enabled
  0: 'default', // disabled
};

// Status badge
const STATUS_OPTIONS = [
  { label: '全部', value: -1 },
  { label: '已启用', value: 1 },
  { label: '已禁用', value: 0 },
];
```

**Verify:** Page renders with two tabs, no console errors.

**Done:** Logistics page with tracking search and express management.

---

## Wave 2: Backend Integration

### Task 3: Connect to Real APIs

**Files:** `zlt-web/mall-admin-web/src/pages/Logistics/index.tsx`, `zlt-web/mall-admin-web/src/pages/Logistics/services/logistics.ts`

**Action:** Wire up real API calls (per D-10: API_BASE_URL = `/mall-center`):

1. **Tracking API**: GET `/api/mall/admin/logistics/tracking?orderId=xxx`
2. **Express List**: GET `/api/mall/admin/express/list`
3. **Express Create**: POST `/api/mall/admin/express`
4. **Express Update**: PUT `/api/mall/admin/express`
5. **Express Delete**: DELETE `/api/mall/admin/express/{id}`
6. **Express Status**: PUT `/api/mall/admin/express/{id}/status/{status}`

Add Create/Edit modal form validation (name + code required, code unique).

**Verify:** Express CRUD works, tracking query returns data for shipped orders.

**Done:** Logistics page fully functional with backend APIs.

---

## Requirements Coverage

| Requirement | Description | Task |
|-------------|-------------|------|
| ADMIN-07-01 | Query logistics tracking by order | Task 2, 3 |
| ADMIN-07-02 | Display logistics timeline/traces | Task 2, 3 |
| ADMIN-07-03 | Express company CRUD | Task 1, 3 |
| ADMIN-07-04 | Express company enable/disable | Task 3 |
| ADMIN-07-05 | (Express sorting) | Task 1 |
| ADMIN-07-06 | (Express logo management) | Task 3 |

## Must-Haves

**Truths:**
- Admin can search logistics by order ID and see tracking timeline
- Admin can view full delivery trace history
- Admin can manage express companies (CRUD)
- Admin can enable/disable express companies

**Artifacts:**
- `zlt-web/mall-admin-web/src/pages/Logistics/services/logistics.ts` - API service
- `zlt-web/mall-admin-web/src/pages/Logistics/index.tsx` - Page component

**Key Links:**
- Tracking tab uses `getLogisticsTracking(orderId)`
- Express table uses `getExpressList()`, `createExpress()`, `updateExpress()`, `deleteExpress()`

## Output

After completion, create `.planning/phases/11-管理后台运营模块/11-ADMIN-07-SUMMARY.md`