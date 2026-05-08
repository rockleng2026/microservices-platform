---
phase: "01-基础架构搭建"
reviewed: 2026-05-08T12:00:00Z
depth: standard
files_reviewed: 33
files_reviewed_list:
  - zlt-business/mall-center/src/main/java/com/central/mall/config/MyBatisConfig.java
  - zlt-business/mall-center/src/main/java/com/central/mall/config/TenantInterceptor.java
  - zlt-business/mall-center/src/main/java/com/central/mall/config/WebMvcConfig.java
  - zlt-business/mall-center/src/main/java/com/central/mall/controller/AuthController.java
  - zlt-business/mall-center/src/main/java/com/central/mall/controller/CartController.java
  - zlt-business/mall-center/src/main/java/com/central/mall/controller/GoodsController.java
  - zlt-business/mall-center/src/main/java/com/central/mall/controller/UserAddressController.java
  - zlt-business/mall-center/src/main/java/com/central/mall/controller/UserController.java
  - zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallCartMapper.java
  - zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallCategoryMapper.java
  - zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallGoodsMapper.java
  - zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallGoodsSkuMapper.java
  - zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallGoodsSpecMapper.java
  - zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallUserAddressMapper.java
  - zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallCart.java
  - zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallCategory.java
  - zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallGoods.java
  - zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallGoodsSku.java
  - zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallGoodsSpec.java
  - zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallUserAddress.java
  - zlt-business/mall-center/src/main/java/com/central/mall/service/ICartService.java
  - zlt-business/mall-center/src/main/java/com/central/mall/service/IGoodsService.java
  - zlt-business/mall-center/src/main/java/com/central/mall/service/IUserAddressService.java
  - zlt-business/mall-center/src/main/java/com/central/mall/service/impl/CartServiceImpl.java
  - zlt-business/mall-center/src/main/java/com/central/mall/service/impl/GoodsServiceImpl.java
  - zlt-business/mall-center/src/main/java/com/central/mall/service/impl/UserAddressServiceImpl.java
  - zlt-business/mall-center/src/main/resources/application.yml
  - zlt-gateway/sc-gateway/src/main/resources/application.yml
findings:
  critical: 6
  warning: 9
  info: 5
  total: 20
status: issues_found
---

# Phase 1: Code Review Report

**Reviewed:** 2026-05-08
**Depth:** standard
**Files Reviewed:** 33
**Status:** issues_found

## Summary

The mall-center Phase 1 implementation has 6 critical security issues that must be fixed before production. The most severe is the hardcoded `userId = 1L` used in all authenticated endpoints, which effectively bypasses all authentication. Additionally, multiple endpoints lack authorization checks, allowing users to access or modify other users' data (IDOR vulnerabilities). The tenant isolation is also not enforced at the service layer despite tenant interceptor being in place.

## Critical Issues

### CR-01: Authentication Bypass via Hardcoded User ID

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/controller/CartController.java:26,36,43,69`
**Issue:** All controller methods use `Long userId = 1L` instead of extracting the real user ID from the security context. Every authenticated request operates as user ID 1, meaning all users share the same identity.
```java
Long userId = 1L; // TODO: 从Token获取
```
Same pattern in: `getCartList()` line 36, `getCartTotal()` line 43, `clearChecked()` line 69.

**Fix:**
Extract user ID from the security context (e.g., from JWT token or `SecurityContextHolder`):
```java
Long userId = getCurrentUserId(); // Implement real user extraction
```

---

### CR-02: IDOR - Address Update Without Ownership Check

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/controller/UserAddressController.java:37-42`
**Issue:** `updateAddress()` allows updating ANY address by ID without verifying ownership. An attacker can modify other users' addresses.
```java
@PutMapping("/{id}")
public Result<Void> updateAddress(@PathVariable Long id, @RequestBody MallUserAddress address) {
    address.setId(id);
    userAddressService.updateById(address);  // No userId check!
    return Result.success();
}
```

**Fix:**
```java
@PutMapping("/{id}")
public Result<Void> updateAddress(@PathVariable Long id, @RequestBody MallUserAddress address) {
    Long userId = getCurrentUserId(); // from security context
    // Verify address belongs to current user
    MallUserAddress existing = userAddressService.getById(id);
    if (existing == null || !existing.getUserId().equals(userId)) {
        return Result.fail("Address not found or access denied");
    }
    address.setId(id);
    address.setUserId(userId); // Prevent userId override
    userAddressService.updateById(address);
    return Result.success();
}
```

---

### CR-03: IDOR - Address Delete Without Ownership Check

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/controller/UserAddressController.java:45-49`
**Issue:** `deleteAddress()` can delete any address by ID without verifying ownership.
```java
@DeleteMapping("/{id}")
public Result<Void> deleteAddress(@PathVariable Long id) {
    userAddressService.removeById(id);  // No userId check!
    return Result.success();
}
```

**Fix:**
```java
@DeleteMapping("/{id}")
public Result<Void> deleteAddress(@PathVariable Long id) {
    Long userId = getCurrentUserId();
    MallUserAddress address = userAddressService.getById(id);
    if (address == null || !address.getUserId().equals(userId)) {
        return Result.fail("Address not found or access denied");
    }
    userAddressService.removeById(id);
    return Result.success();
}
```

---

### CR-04: IDOR - Cart Item Update Without Ownership Check

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/controller/CartController.java:47-56`
**Issue:** `updateCart()` can modify any cart item by ID without verifying ownership.
```java
@PutMapping("/{id}")
public Result<Void> updateCart(@PathVariable Long id, @RequestBody Map<String, Object> params) {
    if (params.containsKey("quantity")) {
        cartService.updateQuantity(id, Integer.valueOf(params.get("quantity").toString()));
    }
    // ...
}
```

**Fix:** Verify cart item belongs to the current user before allowing updates.

---

### CR-05: IDOR - Cart Item Delete Without Ownership Check

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/controller/CartController.java:59-63`
**Issue:** `deleteCartItem()` can delete any cart item by ID without verifying ownership.

**Fix:** Add ownership verification before deletion.

---

### CR-06: SQL Injection via String Concatenation in LIMIT

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/GoodsServiceImpl.java:176`
**Issue:** Using string concatenation for LIMIT parameter is dangerous and not safe against injection.
```java
.last("LIMIT " + limit);
```

**Fix:** Use MyBatis Plus's built-in pagination instead:
```java
wrapper.last(false); // Clear any previous last()
Page<MallGoods> page = new Page<>(1, limit);
return baseMapper.selectPage(page, wrapper);
```
Or use `limit(limit)` method if available.

---

## Warnings

### WR-01: Tenant Isolation Not Enforced at Service Layer

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/*.java`
**Issue:** `TenantInterceptor` extracts tenant ID from header into `ThreadLocal`, but service methods do not use `TenantInterceptor.getCurrentTenantId()` to filter queries. All queries bypass tenant filtering.
```java
// TenantInterceptor sets TENANT_CONTEXT, but service does:
LambdaQueryWrapper<MallCart> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(MallCart::getUserId, userId);  // No tenant filter!
```

**Fix:** Add tenant filter in all service methods:
```java
String tenantId = TenantInterceptor.getCurrentTenantId();
if (tenantId != null) {
    wrapper.eq(MallCart::getTenantId, tenantId);
}
```

---

### WR-02: NullPointerException Risk in CartController.addToCart

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/controller/CartController.java:27-28`
**Issue:** No null checks before calling `.toString()` on map values.
```java
Long skuId = Long.valueOf(params.get("skuId").toString());
Integer quantity = Integer.valueOf(params.get("quantity").toString());
```
If `skuId` or `quantity` is null, this throws NPE.

**Fix:**
```java
if (!params.containsKey("skuId") || !params.containsKey("quantity")) {
    return Result.fail("Missing required parameters");
}
Long skuId = Long.valueOf(params.get("skuId").toString());
Integer quantity = Integer.valueOf(params.get("quantity").toString());
```

---

### WR-03: TenantInterceptor Swallows All Exceptions

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/config/TenantInterceptor.java:38-41`
**Issue:** Catches Exception and returns `true`, masking security-relevant failures.
```java
} catch (Exception e) {
    log.error("处理租户信息时发生异常", e);
    return true;  // Allows request to proceed even on error
}
```

**Fix:** Either re-throw the exception or return `false` if tenant validation is critical.

---

### WR-04: UserAddressServiceImpl.setDefault Performs N+1 Updates

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/UserAddressServiceImpl.java:34-36`
**Issue:** Clearing default addresses performs individual UPDATE for each record.
```java
for (MallUserAddress address : defaultAddresses) {
    address.setIsDefault(0);
    baseMapper.updateById(address);  // N queries
}
```

**Fix:** Use batch update:
```java
if (!defaultAddresses.isEmpty()) {
    List<Long> ids = defaultAddresses.stream().map(MallUserAddress::getId).collect(Collectors.toList());
    lambdaUpdate().in(MallUserAddress::getId, ids).set(MallUserAddress::getIsDefault, 0).update();
}
```

---

### WR-05: Missing @TableId Annotation on Entity IDs

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/model/entity/*.java`
**Issue:** Entity classes extend `Model<>` but do not have `@TableId` annotation on `id` field. MyBatis Plus may not correctly handle ID generation strategies.

**Fix:** Add explicit `@TableId` annotation to all entity IDs:
```java
@TableId
private Long id;
```

---

### WR-06: getGoodsPage SortField Not Validated

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/GoodsServiceImpl.java:98-99`
**Issue:** `sortField` is used directly from params without validation, allowing invalid column names to cause SQL errors.
```java
String sortField = params.get("sortField") != null ? params.get("sortField").toString() : "createTime";
```

**Fix:** Validate against allowed sort fields:
```java
private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("createTime", "price", "sales", "updateTime");
String sortField = params.get("sortField") != null ? params.get("sortField").toString() : "createTime";
if (!ALLOWED_SORT_FIELDS.contains(sortField)) {
    sortField = "createTime";
}
```

---

### WR-07: No Authorization Check in setDefault

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/UserAddressServiceImpl.java:41`
**Issue:** Although this method checks `address.getUserId().equals(userId)`, the controller passes hardcoded `userId = 1L`, negating the check.

---

### WR-08: Cart Item Update Methods Lack Ownership Check

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/CartServiceImpl.java:125-141`
**Issue:** `updateQuantity()` and `updateChecked()` do not verify the cart belongs to the calling user before updating.

---

### WR-09: CartController.put/{id} Missing User Verification

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/controller/CartController.java:47-56`
**Issue:** The endpoint does not verify the cart item belongs to the current user.

---

## Info

### IN-01: Unused Import in GoodsServiceImpl

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/GoodsServiceImpl.java:17`
**Issue:** `org.springframework.util.StringUtils` is imported but `StringUtils.hasText()` is not used directly (uses `toString()` instead).

---

### IN-02: MallGoodsSkuMapper Not Used in GoodsServiceImpl

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/GoodsServiceImpl.java:28`
**Issue:** `MallGoodsSkuMapper` is injected but `skuMapper` is not used in `getCategoryTree()` or `getGoodsPage()`. It's only used in `getGoodsDetail()` and `getGoodsSkus()`.

---

### IN-03: MallGoodsSpecMapper Never Used

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallGoodsSpecMapper.java`
**Issue:** `MallGoodsSpecMapper` is defined but never injected or used in any service.

---

### IN-04: UserController.getAddressList Returns Null

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/controller/UserController.java:33-36`
**Issue:** Returns `null` instead of actual address list - placeholder implementation.

---

### IN-05: Mock Token in AuthController

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/controller/AuthController.java:28`
**Issue:** Login returns `MOCK_TOKEN_*` - acceptable for Phase 1 but must implement real JWT before production.

---

## Severity Classification

| ID | Severity | Description |
|----|----------|-------------|
| CR-01 | BLOCKER | Authentication bypass via hardcoded userId=1L |
| CR-02 | BLOCKER | IDOR in updateAddress - can modify any user's address |
| CR-03 | BLOCKER | IDOR in deleteAddress - can delete any user's address |
| CR-04 | BLOCKER | IDOR in updateCart - can modify any cart item |
| CR-05 | BLOCKER | IDOR in deleteCartItem - can delete any cart item |
| CR-06 | BLOCKER | SQL injection risk via LIMIT string concatenation |
| WR-01 | WARNING | Tenant isolation not enforced at service layer |
| WR-02 | WARNING | NPE risk in addToCart parameter parsing |
| WR-03 | WARNING | TenantInterceptor swallows exceptions |
| WR-04 | WARNING | N+1 update problem in setDefault |
| WR-05 | WARNING | Missing @TableId on entity IDs |
| WR-06 | WARNING | SortField not validated |
| WR-07 | WARNING | setDefault authorization ineffective due to hardcoded userId |
| WR-08 | WARNING | updateQuantity/updateChecked lack ownership check |
| WR-09 | WARNING | CartController.put/{id} lacks ownership check |
| IN-01 | INFO | Unused import in GoodsServiceImpl |
| IN-02 | INFO | Unused field skuMapper in getCategoryTree |
| IN-03 | INFO | MallGoodsSpecMapper never used |
| IN-04 | INFO | UserController.getAddressList returns null placeholder |
| IN-05 | INFO | AuthController returns mock token |

---

_Reviewed: 2026-05-08_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_