---
phase: 12
plan: 04
type: execute
wave: 2
depends_on: ["12-ADMIN-05"]
files_modified:
  - zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminPromotionController.java
  - zlt-business/mall-center/src/main/java/com/central/mall/service/IAdminPromotionService.java
  - zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminPromotionServiceImpl.java
autonomous: true
requirements:
  - ADMIN-05-01
  - ADMIN-05-02
  - ADMIN-05-03
  - ADMIN-05-04
  - ADMIN-05-05
  - ADMIN-05-06

must_haves:
  truths:
    - "Promotion CRUD APIs exist and return correct response format"
    - "Promotion enable/disable API works"
    - "Member points APIs (get/adjust) work correctly"
  artifacts:
    - path: "zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminPromotionController.java"
      provides: "Promotion management REST endpoints"
      exports: ["GET /api/mall/marketing/promotions", "POST /api/mall/marketing/promotions", "PUT /api/mall/marketing/promotions/{id}", "DELETE /api/mall/marketing/promotions/{id}", "PUT /api/mall/marketing/promotions/{id}/toggle", "GET /api/mall/member/points", "POST /api/mall/member/points/adjust"]
  key_links:
    - from: "AdminPromotionController"
      to: "IAdminPromotionService"
      via: "REST endpoint handler"
    - from: "zlt-web/portal-web"
      to: "AdminPromotionController"
      via: "HTTP via API gateway"
---

<objective>
Implement backend APIs for ADMIN-05 Promotion Management and complete integration.

Purpose: Ensure backend promotion and points APIs are implemented and properly integrated.
Output: AdminPromotionController with full CRUD for promotions and points management.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminSettingsController.java
@zlt-business/mall-center/src/main/java/com/central/mall/service/IAdminSettingsService.java
@zlt-business/mall-center/src/main/java/com/central/mall/service/IMarketingService.java
</context>

<interfaces>
From IMarketingService.java:
```java
Result<?> getActivePromotions();
BigDecimal calculatePromotionDiscount(Long activityId, BigDecimal orderAmount);
Result<?> getMemberInfo(Long userId);
Result<?> getPointsLog(Long userId, Map<String, Object> pageDTO);
```

Admin Settings pattern to follow:
```java
@RestController
@RequestMapping("/api/mall/admin/settings")
public class AdminSettingsController {
    private final IAdminSettingsService adminSettingsService;

    @GetMapping
    @Operation(summary = "获取所有系统设置")
    public Result<List<SettingsDTO>> getAllSettings() {
        return Result.succeed(adminSettingsService.getAllSettings());
    }

    @PutMapping
    @Operation(summary = "更新系统设置")
    public Result<Boolean> setSetting(@RequestBody SettingsDTO settingsDTO) {
        boolean success = adminSettingsService.setSetting(...);
        return Result.succeed(success);
    }
}
```

Existing mall_marketing or mall_promotion table needs checking. If not exist, create simple CRUD.
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Check/create promotion database model</name>
  <files>
    zlt-business/mall-center/src/main/java/com/central/mall/model/entity
  </files>
  <action>
Check if Promotion entity exists in mall-center model. Search for:
- mall_promotion or mall_marketing table
- Promotion.java entity class
- AdminPromotionController.java

If not exists:
- Create `Promotion.java` entity with fields: id, name, type (discount/gift/bundle), startTime, endTime, rules (JSON), status (0=disabled, 1=enabled), createTime, updateTime
- Create `PromotionMapper.java` extending BaseMapper
- Register in MyBatis config

If exists, note the exact class name and package for next task.
</action>
  <verify>
    <automated>grep -l "class Promotion\|PromotionController" zlt-business/mall-center/src/main/java/com/central/mall/**/*.java 2>/dev/null | head -5</automated>
  </verify>
  <done>Promotion entity and mapper exist or are created</done>
</task>

<task type="auto">
  <name>Task 2: Create AdminPromotionController and service</name>
  <files>
    zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminPromotionController.java
    zlt-business/mall-center/src/main/java/com/central/mall/service/IAdminPromotionService.java
    zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminPromotionServiceImpl.java
  </files>
  <action>
Create `AdminPromotionController.java`:
```java
@RestController
@RequestMapping("/api/mall/admin/promotions")
@RequiredArgsConstructor
@Tag(name = "管理员-促销管理")
public class AdminPromotionController {
    private final IAdminPromotionService promotionService;

    @GetMapping
    @Operation(summary = "获取促销列表")
    public Result<Page<Promotion>> getPromotionList(
        @RequestParam(defaultValue = "1") Integer page,
        @RequestParam(defaultValue = "10") Integer pageSize,
        @RequestParam(required = false) Integer status // 0=disabled, 1=enabled, null=all
    ) { return Result.succeed(promotionService.getPromotionList(page, pageSize, status)); }

    @PostMapping
    @Operation(summary = "创建促销")
    public Result<Boolean> createPromotion(@RequestBody @Valid Promotion promotion) {
        return Result.succeed(promotionService.createPromotion(promotion));
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新促销")
    public Result<Boolean> updatePromotion(@PathVariable Long id, @RequestBody Promotion promotion) {
        return Result.succeed(promotionService.updatePromotion(id, promotion));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除促销")
    public Result<Boolean> deletePromotion(@PathVariable Long id) {
        return Result.succeed(promotionService.deletePromotion(id));
    }

    @PutMapping("/{id}/toggle")
    @Operation(summary = "启用/禁用促销")
    public Result<Boolean> togglePromotion(@PathVariable Long id) {
        return Result.succeed(promotionService.togglePromotion(id));
    }
}
```

Create `IAdminPromotionService.java`:
- getPromotionList(page, pageSize, status): Page<Promotion>
- createPromotion(promotion): boolean
- updatePromotion(id, promotion): boolean  
- deletePromotion(id): boolean
- togglePromotion(id): boolean (flip status)

Create `AdminPromotionServiceImpl.java` implementing the interface using PromotionMapper.
</action>
  <verify>
    <automated>grep -c "@GetMapping\|@PostMapping\|@PutMapping\|@DeleteMapping" zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminPromotionController.java</automated>
  </verify>
  <done>AdminPromotionController with 5 endpoints exists</done>
</task>

<task type="auto">
  <name>Task 3: Verify service layer integration with portal-web</name>
  <files>
    zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminPromotionController.java
  </files>
  <action>
Test the API endpoints by calling from the admin portal (Wave 1 integration test):

1. Create a promotion via POST /api-mall/api/mall/admin/promotions
2. List promotions via GET /api-mall/api/mall/admin/promotions
3. Toggle promotion status via PUT /api-mall/api/mall/admin/promotions/{id}/toggle

Verify responses match expected format:
- List: { code: 200, datas: { list: [...], total: N } }
- Create/Update/Delete/Toggle: { code: 200, datas: true }

Fix any response format issues in the controller.
</action>
  <verify>
    <automated>grep -c "Result\." zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminPromotionController.java</automated>
  </verify>
  <done>All promotion endpoints return correct Result<T> format</done>
</task>

</tasks>

<verification>
- Promotion CRUD APIs all return correct response format
- Enable/disable toggle works
- Points adjustment API works
</verification>

<success_criteria>
- Admin can create/edit/delete/enable/disable promotions via portal-web
- All API responses are in correct format for frontend consumption
</success_criteria>

<output>
After completion, create `.planning/phases/12-管理后台配置与小程序个人中心/12-ADMIN-05-INTEGRATION-SUMMARY.md`
</output>