---
phase: 12
plan: 05
type: execute
wave: 2
depends_on: ["12-ADMIN-11"]
files_modified:
  - mall-mini-program/src/pages/user/index.vue
  - mall-mini-program/src/pages/user/profile.vue
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
    - "Mini-program personal center fully integrated with backend APIs"
    - "User profile editing works end-to-end"
  artifacts:
    - path: "mall-mini-program/src/services/user.ts"
      provides: "User service fully wired to backend"
  key_links:
    - from: "mall-mini-program/src/pages/user/index.vue"
      to: "/api-mall/api/mall/member/info"
      via: "user.ts getMemberInfo()"
---

<objective>
Complete MINI-09 integration - ensure user center pages call real backend APIs and handle responses correctly.

Purpose: Verify end-to-end flow from mini-program user center to mall-center backend APIs.
Output: All personal center features working with real data.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@mall-mini-program/src/pages/user/index.vue
@mall-mini-program/src/pages/user/profile.vue
@mall-mini-program/src/services/user.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Verify getMemberInfo API and wire to user index</name>
  <files>
    mall-mini-program/src/services/user.ts
  </files>
  <action>
Verify backend has /api/mall/member/info endpoint returning member info including points balance.

Check in mall-center MemberController or MallMemberController for:
- getMemberInfo() method that returns user profile with points

If endpoint exists but returns different structure than expected:
```typescript
// UserProfile should include:
interface UserProfile {
  userId: number;
  nickname: string;
  avatar: string;
  phone?: string;
  points?: number;  // Add if available
  level?: number;   // Add if available
}
```

Update user.ts getMemberInfo() to match actual API response structure.

Ensure user/index.vue onShow() calls getMemberInfo() to load member data.
</action>
  <verify>
    <automated>grep -c "getMemberInfo" mall-mini-program/src/services/user.ts</automated>
  </verify>
  <done>getMemberInfo returns correct member info structure</done>
</task>

<task type="auto">
  <name>Task 2: Verify coupon list API</name>
  <files>
    mall-mini-program/src/pages/coupons/index.vue
  </files>
  <action>
Check backend for /api/mall/member/coupons endpoint returning user's coupon list.

Look in:
- MemberController.java
- CouponController.java
- MallMemberService.java

The API should return:
```json
{
  "code": 200,
  "datas": {
    "list": [
      {
        "id": 1,
        "name": "新人券",
        "type": "discount",
        "discount": 10,
        "minAmount": 100,
        "validStartTime": "2026-05-01",
        "validEndTime": "2026-05-31",
        "status": "unused"
      }
    ],
    "total": 1
  }
}
```

If endpoint doesn't exist, implement in MemberController:
```java
@GetMapping("/coupons")
public Result<?> getUserCoupons(@RequestParam(required = false) Integer status) {
    // Get from user's claimed coupons
}
```

Update coupons page to use correct API response structure.
</action>
  <verify>
    <automated>grep -l "coupons\|Coupon" zlt-business/mall-center/src/main/java/com/central/mall/controller/*.java 2>/dev/null | head -3</automated>
  </verify>
  <done>Coupon list API returns correctly formatted data</done>
</task>

<task type="auto">
  <name>Task 3: Verify points log API</name>
  <files>
    mall-mini-program/src/pages/points/index.vue
  </files>
  <action>
Check backend for /api/mall/member/points/log endpoint.

The IMarketingService.getPointsLog() signature:
```java
Result<?> getPointsLog(Long userId, Map<String, Object> pageDTO);
```

Verify this endpoint is exposed in MemberController or MallMemberController.

The API should return:
```json
{
  "code": 200,
  "datas": {
    "list": [
      {
        "id": 1,
        "type": "earn",
        "points": 100,
        "reason": "订单完成奖励",
        "createTime": "2026-05-19 10:00:00"
      }
    ],
    "total": 1
  }
}
```

If endpoint not exposed, add to MemberController:
```java
@GetMapping("/points/log")
public Result<?> getPointsLog(@RequestParam(defaultValue = "1") Integer page,
                              @RequestParam(defaultValue = "10") Integer pageSize) {
    // Get current user from token, call marketingService.getPointsLog(userId, params)
}
```

Update points page to match actual API response structure.
</action>
  <verify>
    <automated>grep -l "points.*log\|getPoints" zlt-business/mall-center/src/main/java/com/central/mall/**/*.java 2>/dev/null | head -3</automated>
  </verify>
  <done>Points log API exists and returns correctly formatted data</done>
</task>

<task type="auto">
  <name>Task 4: Verify favorites API</name>
  <files>
    mall-mini-program/src/pages/favorites/index.vue
  </files>
  <action>
Check backend for /api/mall/member/favorites endpoint.

Search for:
- FavoriteController.java
- MallMemberService.getFavorites()

If not exists, implement:
- Create Favorite entity/table: mall_user_favorite (id, user_id, goods_id, create_time)
- Create FavoriteMapper, FavoriteService
- Add MemberController endpoints:
  - GET /favorites - list user's favorites
  - DELETE /favorites/{id} - remove from favorites

The API response:
```json
{
  "code": 200,
  "datas": {
    "list": [
      {
        "id": 1,
        "goodsId": 100,
        "goodsName": "商品名称",
        "price": 199.00,
        "image": "/uploads/goods/1.jpg"
      }
    ],
    "total": 1
  }
}
```

Update favorites page to use correct API.
</action>
  <verify>
    <automated>grep -l "favorite\|Favorite" zlt-business/mall-center/src/main/java/com/central/mall/**/*.java 2>/dev/null | head -3</automated>
  </verify>
  <done>Favorites API exists and returns correctly formatted data</done>
</task>

</tasks>

<verification>
- User index page loads member info from real API
- Coupons page shows user's coupons with correct status
- Points page shows balance and history
- Favorites page shows liked products
- All pages handle empty states correctly
</verification>

<success_criteria>
- All mini-program personal center features call real backend APIs
- Response data correctly displayed in UI
- Error handling works for all API calls
</success_criteria>

<output>
After completion, create `.planning/phases/12-管理后台配置与小程序个人中心/12-MINI-09-INTEGRATION-SUMMARY.md`
</output>