---
phase: 12
plan: 03
type: execute
wave: 1
depends_on: []
files_modified:
  - mall-mini-program/src/pages/user/index.vue
  - mall-mini-program/src/pages/user/profile.vue
  - mall-mini-program/src/services/user.ts
  - mall-mini-program/src/pages/coupons/index.vue
  - mall-mini-program/src/pages/points/index.vue
  - mall-mini-program/src/pages/favorites/index.vue
autonomous: true
requirements:
  - MINI-09-01
  - MINI-09-02
  - MINI-09-03
  - MINI-09-04
  - MINI-09-05
  - MINI-09-06
  - MINI-09-07

must_haves:
  truths:
    - "User can view and edit personal profile (avatar, nickname, phone)"
    - "User can manage shipping addresses (add, edit, delete, set default)"
    - "User can view my coupons list"
    - "User can view favorites and remove items"
    - "User can view points balance and history"
  artifacts:
    - path: "mall-mini-program/src/pages/user/index.vue"
      provides: "Personal center entry page"
    - path: "mall-mini-program/src/pages/user/profile.vue"
      provides: "Profile editing page"
    - path: "mall-mini-program/src/services/user.ts"
      provides: "User API service layer"
      exports: ["getUserProfile", "updateProfile", "getMemberInfo", "getPointsLog", "getCoupons", "getFavorites", "removeFavorite"]
  key_links:
    - from: "mall-mini-program/src/pages/user/index.vue"
      to: "/api-mall/api/mall/member/info"
      via: "user.ts service"
    - from: "mall-mini-program/src/pages/coupons/index.vue"
      to: "/api-mall/api/mall/member/coupons"
      via: "user.ts service"
---

<objective>
Implement MINI-09 Personal Center page for mini-program, completing stub functions for coupons and points.

Purpose: Complete the personal center page with full functionality for profile, addresses, coupons, favorites, and points.
Output: Working personal center with all sub-pages linked to real APIs.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@mall-mini-program/src/pages/user/index.vue
@mall-mini-program/src/services/user.ts
@mall-mini-program/src/pages/address/index.vue
@zlt-business/mall-center/src/main/java/com/central/mall/service/IMarketingService.java
</context>

<interfaces>
<!-- Key types and contracts the executor needs. Extracted from codebase. -->

From mall-mini-program/src/services/user.ts:
```typescript
export interface UserProfile {
  userId: number
  nickname: string
  avatar: string
  phone?: string
  gender?: number
  birthday?: string
  province?: string
  city?: string
}

export const getUserProfile = (): Promise<UserProfile>
export const updateProfile = (profile: Partial<UserProfile>): Promise<any>
```

From IMarketingService.java (backend):
```java
// Member/Points methods:
Result<?> getMemberInfo(Long userId);       // Returns member info with points balance
Result<?> getPointsLog(Long userId, Map<String, Object> pageDTO);

// Coupon methods:
Result<?> getUserCouponList(Long userId, Integer status, Map<String, Object> pageDTO);
```

Current stubs in user/index.vue:
- goCoupons() shows '优惠券功能开发中' toast - needs real page
- goPoints() shows '积分功能开发中' toast - needs real page
- No favorites page exists
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Extend user service with new API methods</name>
  <files>
    mall-mini-program/src/services/user.ts
  </files>
  <action>
Update `mall-mini-program/src/services/user.ts` to add:

```typescript
// Get member info including points balance (MINI-09-01, MINI-09-07)
export const getMemberInfo = (): Promise<{
  userId: number;
  nickname: string;
  avatar: string;
  phone: string;
  points: number;
  level: number;
}> => {
  return request('/api/mall/member/info', { method: 'GET' });
};

// Get points history (MINI-09-07)
export const getPointsLog = (page: number = 1, pageSize: number = 10): Promise<{
  list: Array<{
    id: number;
    type: 'earn' | 'deduct';
    points: number;
    reason: string;
    createTime: string;
  }>;
  total: number;
}> => {
  return request('/api/mall/member/points/log', {
    method: 'GET',
    params: { page, pageSize }
  });
};

// Get user coupons (MINI-09-04)
export const getMyCoupons = (status?: number): Promise<{
  list: Array<{
    id: number;
    name: string;
    type: string;
    discount: number;
    minAmount: number;
    validStartTime: string;
    validEndTime: string;
    status: 'unused' | 'used' | 'expired';
  }>;
  total: number;
}> => {
  return request('/api/mall/member/coupons', {
    method: 'GET',
    params: { status }
  });
};

// Get favorites (MINI-09-05)
export const getFavorites = (page: number = 1, pageSize: number = 10): Promise<{
  list: Array<{
    id: number;
    goodsId: number;
    goodsName: string;
    price: number;
    image: string;
    createTime: string;
  }>;
  total: number;
}> => {
  return request('/api/mall/member/favorites', {
    method: 'GET',
    params: { page, pageSize }
  });
};

// Remove from favorites (MINI-09-06)
export const removeFavorite = (id: number): Promise<void> => {
  return request(`/api/mall/member/favorites/${id}`, { method: 'DELETE' });
};
```
</action>
  <verify>
    <automated>grep -c "getMemberInfo\|getPointsLog\|getMyCoupons\|getFavorites\|removeFavorite" mall-mini-program/src/services/user.ts</automated>
  </verify>
  <done>User service extended with member info, points, coupons, favorites APIs</done>
</task>

<task type="auto">
  <name>Task 2: Create coupons page</name>
  <files>
    mall-mini-program/src/pages/coupons/index.vue
  </files>
  <action>
Create `mall-mini-program/src/pages/coupons/index.vue` (MINI-09-04):

- Tabs: 全部 / 未使用 / 已使用 / 已过期
- Each coupon card shows:
  - Coupon name, type (discount/fixed), discount amount
  - Min order amount requirement
  - Valid period (start - end)
  - Status badge (green: unused, gray: used, red: expired)
- Pull-down refresh and infinite scroll pagination
- Empty state when no coupons

Wire goCoupons() in user/index.vue to navigateTo('/pages/coupons/index')

Update user/index.vue goCoupons:
```typescript
const goCoupons = () => {
  uni.navigateTo({ url: '/pages/coupons/index' })
}
```
</action>
  <verify>
    <automated>grep -c "getMyCoupons\|uni.navigateTo.*coupons" mall-mini-program/src/pages/coupons/index.vue mall-mini-program/src/pages/user/index.vue</automated>
  </verify>
  <done>Coupons page shows user coupon list with tab filters</done>
</task>

<task type="auto">
  <name>Task 3: Create points page</name>
  <files>
    mall-mini-program/src/pages/points/index.vue
  </files>
  <action>
Create `mall-mini-program/src/pages/points/index.vue` (MINI-09-07):

- Header: Shows current points balance prominently
- Points history list (chronological):
  - Each item: type icon (+/-), points amount, reason, date
  - Group by date
- Pull-down refresh and infinite scroll pagination
- Empty state when no history

Wire goPoints() in user/index.vue:
```typescript
const goPoints = () => {
  uni.navigateTo({ url: '/pages/points/index' })
}
```
</action>
  <verify>
    <automated>grep -c "getPointsLog\|points.*balance" mall-mini-program/src/pages/points/index.vue</automated>
  </verify>
  <done>Points page shows balance and points history</done>
</task>

<task type="auto">
  <name>Task 4: Update user/index.vue to load member info</name>
  <files>
    mall-mini-program/src/pages/user/index.vue
  </files>
  <action>
Update `mall-mini-program/src/pages/user/index.vue`:

In onShow(), replace local userInfo loading with:
```typescript
onShow(async () => {
  const token = uni.getStorageSync('token')
  if (token) {
    try {
      const memberInfo = await getMemberInfo()
      userInfo.value = memberInfo
      uni.setStorageSync('userInfo', memberInfo)
    } catch (e) {
      // Fallback to cached
      userInfo.value = uni.getStorageSync('userInfo') || { nickname: '用户' }
    }
  } else {
    userInfo.value = null
  }
})
```

This ensures MINI-09-01: user can view personal avatar, nickname, phone - from real API.
</action>
  <verify>
    <automated>grep -c "getMemberInfo\|onShow" mall-mini-program/src/pages/user/index.vue</automated>
  </verify>
  <done>User index page loads member info from API on show</done>
</task>

<task type="auto">
  <name>Task 5: Create favorites page</name>
  <files>
    mall-mini-program/src/pages/favorites/index.vue
  </files>
  <action>
Create `mall-mini-program/src/pages/favorites/index.vue` (MINI-09-05, MINI-09-06):

- Grid layout: 2 columns, product cards
- Each card: image, name, price, delete button
- Delete button: calls removeFavorite(id), removes from list on success
- Pull-down refresh and infinite scroll pagination
- Empty state when no favorites
- Tap card navigates to product detail

Add to pages.json:
```json
{
  "path": "pages/favorites/index",
  "style": { "navigationBarTitleText": "我的收藏" }
}
```
</action>
  <verify>
    <automated>grep -c "getFavorites\|removeFavorite" mall-mini-program/src/pages/favorites/index.vue</automated>
  </verify>
  <done>Favorites page shows grid of liked products with delete option</done>
</task>

</tasks>

<verification>
- User index page loads real member info on show
- goCoupons() navigates to coupons page showing user coupons with tabs
- goPoints() navigates to points page showing balance and history
- goFavorites() navigates to favorites page showing liked products
- Profile edit page allows updating nickname and avatar
- Address management (existing page) accessible from user center
</verification>

<success_criteria>
- User can view personal avatar, nickname, phone (MINI-09-01)
- User can edit personal profile (nickname) (MINI-09-02)
- User can manage shipping addresses (add, edit, delete, set default) (MINI-09-03)
- User can view my coupons list (MINI-09-04)
- User can view my favorites (wishlist) (MINI-09-05)
- User can remove item from favorites (MINI-09-06)
- User can view my points balance and points history (MINI-09-07)
</success_criteria>

<output>
After completion, create `.planning/phases/12-管理后台配置与小程序个人中心/12-MINI-09-SUMMARY.md`
</output>