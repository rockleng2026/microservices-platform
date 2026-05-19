# ADMIN-08: 用户管理页面

## Phase Goal

**As a** admin operator, **I want to** view user information and statistics, **so that** I can manage customer accounts and analyze user behavior.

## Plan Overview

| Wave | Type | Files | Purpose |
|------|------|-------|---------|
| 1 | execute | `Member/index.tsx`, `Member/services/member.ts` | Pure frontend foundation |
| 2 | execute | (same files) | Backend integration - real user data |

**Note:** Using `Member` as directory name per existing project convention (MallAdmin has Member page directory).

## Wave 1: Frontend Foundation

### Task 1: Create Member Service and Types

**Files:** `zlt-web/mall-admin-web/src/pages/Member/services/member.ts`

**Action:** Create API service module with:

```typescript
// User/Member list params
export interface MemberListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;      // user ID or name
  status?: number | null;
  startTime?: string;
  endTime?: string;
}

// Member DTO
export interface MemberDTO {
  id: number;
  userId: number;
  nickname: string;
  phone: string;
  email?: string;
  avatar?: string;
  gender: number;        // 0=unknown, 1=male, 2=female
  genderDesc: string;
  birthday?: string;
  level: number;         // 会员等级
  levelName: string;
  points: number;        // 积分
  totalOrders: number;   // 累计订单
  totalAmount: string;   // 累计消费
  lastLoginTime: string;
  createTime: string;
  status: number;        // 1=normal, 0=disabled
}

// User statistics DTO (per ADMIN-08-04)
export interface UserStatisticsDTO {
  totalUsers: number;
  newUsersToday: number;
  activeUsers: number;
  totalOrders: number;
  totalAmount: string;
}

// Member API functions
// GET /api/mall/admin/member/list (or /api/mall/admin/user/list)
export async function getMemberList(params: MemberListParams): Promise<PageResponse<MemberDTO>>
// GET /api/mall/admin/member/{id}
export async function getMemberDetail(id: number): Promise<MemberDTO | null>
// GET /api/mall/admin/member/statistics
export async function getMemberStatistics(): Promise<UserStatisticsDTO>
// PUT /api/mall/admin/member/{id}/status
export async function updateMemberStatus(id: number, status: number): Promise<boolean>
```

**Verify:** File exists with exported types and functions, no compilation errors.

**Done:** MemberService module with complete TypeScript types and API functions.

---

### Task 2: Create Member Management Page

**Files:** `zlt-web/mall-admin-web/src/pages/Member/index.tsx`

**Action:** Create member management page with:

1. **Statistics Cards Row** (ADMIN-08-04):
   - Total Users, New Today, Active Users, Total Orders, Total Amount

2. **Member List Table** (ADMIN-08-01, 02):
   - ProTable with search: keyword (user ID/name), date range
   - Columns: User ID, Nickname, Phone, Level, Points, Orders, Total Amount, Last Login, Status, Actions
   - Actions: View details, Disable/Enable toggle

3. **Detail Modal** (ADMIN-08-03):
   - Full user info display
   - Order history summary
   - Points adjustment option

```typescript
// Gender options
const GENDER_OPTIONS = [
  { label: '未知', value: 0 },
  { label: '男', value: 1 },
  { label: '女', value: 2 },
];

// Status tag
const STATUS_COLORS: Record<number, string> = {
  1: 'success',
  0: 'error',
};
```

**Verify:** Page renders with statistics cards and table, no console errors.

**Done:** Member page with stats row and user list table.

---

## Wave 2: Backend Integration

### Task 3: Connect to Real APIs

**Files:** `zlt-web/mall-admin-web/src/pages/Member/index.tsx`, `zlt-web/mall-admin-web/src/pages/Member/services/member.ts`

**Action:** Wire up real API calls (per D-10: API_BASE_URL = `/mall-center`):

1. **Statistics API**: GET `/api/mall/admin/member/statistics`
2. **Member List**: GET `/api/mall/admin/member/list`
3. **Member Detail**: GET `/api/mall/admin/member/{id}`
4. **Status Update**: PUT `/api/mall/admin/member/{id}/status`

**Note:** If `/api/mall/admin/member/*` endpoints don't exist, use `/api/mall/admin/user/*` per backend implementation.

Add loading states and error handling with `message.error()`.

**Verify:** Statistics cards show real data, member list loads with pagination.

**Done:** Member page fully functional with backend APIs.

---

## Requirements Coverage

| Requirement | Description | Task |
|-------------|-------------|------|
| ADMIN-08-01 | Member list with search/filter | Task 1, 2 |
| ADMIN-08-02 | Member detail view | Task 2, 3 |
| ADMIN-08-03 | Member status management (enable/disable) | Task 3 |
| ADMIN-08-04 | User statistics display | Task 2, 3 |

## Must-Haves

**Truths:**
- Admin can see user statistics in dashboard cards
- Admin can search members by keyword
- Admin can view detailed member information
- Admin can disable/enable member accounts

**Artifacts:**
- `zlt-web/mall-admin-web/src/pages/Member/services/member.ts` - API service
- `zlt-web/mall-admin-web/src/pages/Member/index.tsx` - Page component

**Key Links:**
- Statistics cards use `getMemberStatistics()`
- Table uses `getMemberList(params)`
- Status toggle uses `updateMemberStatus(id, status)`

## Output

After completion, create `.planning/phases/11-管理后台运营模块/11-ADMIN-08-SUMMARY.md`