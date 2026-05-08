---
phase: 07-扩展功能
reviewed: 2026-05-08T00:00:00Z
depth: standard
files_reviewed: 11
files_reviewed_list:
  - zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminMerchantController.java
  - zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallMerchantMapper.java
  - zlt-business/mall-center/src/main/java/com/central/mall/model/dto/MerchantDTO.java
  - zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallMerchant.java
  - zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallOrder.java
  - zlt-business/mall-center/src/main/java/com/central/mall/service/IMerchantService.java
  - zlt-business/mall-center/src/main/java/com/central/mall/service/impl/MerchantServiceImpl.java
  - zlt-business/mall-center/src/main/java/com/central/mall/service/impl/OrderServiceImpl.java
  - zlt-business/mall-center/src/main/java/com/central/mall/service/impl/PayServiceImpl.java
  - zlt-business/mall-center/src/main/java/com/central/mall/service/impl/StockServiceImpl.java
  - zlt-business/mall-center/src/main/java/com/central/mall/utils/WeChatTemplateMsgUtil.java
findings:
  critical: 2
  warning: 7
  info: 5
  total: 14
status: issues_found
---
# Phase 7: Code Review Report

**Reviewed:** 2026-05-08T00:00:00Z
**Depth:** standard
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Reviewed 11 Java files from the mall-center module. Found 2 critical security issues (payment callback amount not validated, WeChat token always empty), 7 warnings (null safety issues, inconsistent status comparisons, silent failures), and 5 info items (magic numbers, dead code, unused variables). The payment callback verification and WeChat integration issues require immediate attention before production use.

## Critical Issues

### CR-01: Payment callback does not verify transaction amount

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/PayServiceImpl.java:114-161`
**Issue:** The `processPayCallback` method parses WeChat payment callback XML but never validates that the callback's `total_fee` matches the order's expected pay amount. A malicious actor could send a callback with a lower amount and receive goods at a reduced price.

**Fix:**
```java
String totalFeeStr = callbackData.get("total_fee");
if (totalFeeStr != null) {
    long callbackAmount = Long.parseLong(totalFeeStr);
    long orderAmount = order.getPayAmount().multiply(new BigDecimal("100")).longValue();
    if (callbackAmount != orderAmount) {
        log.error("Payment callback amount mismatch: orderId={}, expected={}, got={}",
                orderId, orderAmount, callbackAmount);
        return false;
    }
}
```
This check should be added before calling `orderService.updateOrderPaid()`.

---

### CR-02: WeChat access token always returns empty string

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/utils/WeChatTemplateMsgUtil.java:120-129`
**Issue:** The `getAccessToken()` method always returns an empty string, and even acknowledges in a comment "Placeholder - in production, fetch and cache token". The `sendTemplateMessage` method constructs the URL with this empty token: `TEMPLATE_MSG_URL + "?access_token=" + getAccessToken()`, which will always fail. WeChat template notifications are non-functional.

**Fix:**
```java
private String getAccessToken() {
    if (appId == null || appId.isEmpty()) {
        return "";
    }
    String cacheKey = "wechat:access_token:" + appId;
    String cachedToken = redisTemplate.opsForValue().get(cacheKey);
    if (cachedToken != null) {
        return cachedToken;
    }
    // Fetch from WeChat OAuth API
    String url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + appId + "&secret=" + appSecret;
    try {
        ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
        if (response.getBody() != null && response.getBody().containsKey("access_token")) {
            String token = (String) response.getBody().get("access_token");
            Integer expiresIn = (Integer) response.getBody().get("expires_in");
            redisTemplate.opsForValue().set(cacheKey, token, Duration.ofSeconds(expiresIn - 60));
            return token;
        }
    } catch (Exception e) {
        log.error("Failed to get WeChat access token", e);
    }
    return "";
}
```
(Requires adding RedisTemplate as a dependency)

---

## Warnings

### WR-01: Null safety issue in MerchantServiceImpl.reviewMerchant

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/MerchantServiceImpl.java:61`
**Issue:** The code calls `status.equals(MallMerchant.STATUS_APPROVED)` without first checking if `status` is null. While `MerchantReviewDTO` has `@NotNull` annotation, this is only enforced at the controller level via `@Validated` - the service implementation does not validate input and could receive null via direct call.

**Fix:**
```java
if (status != null && status.equals(MallMerchant.STATUS_APPROVED)) {
```

---

### WR-02: Inconsistent status comparison patterns

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/OrderServiceImpl.java:236, 258, 277, 316, 392, 422`
**Issue:** Status comparisons use a mix of direct integer literals (`order.getStatus() != 1`) and `Integer.valueOf(3).equals(order.getStatus())` pattern. This inconsistency makes the code harder to maintain and error-prone.

**Fix:** Use constant comparisons consistently throughout:
```java
if (!Integer.valueOf(MallOrder.STATUS_PENDING).equals(order.getStatus())) {
```

---

### WR-03: Silent cart item skipping in createOrder

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/OrderServiceImpl.java:70-72`
**Issue:** When a cart item does not belong to the current user, the code silently skips it with `continue`. This could result in an order being created with fewer items than expected, with no error feedback to the user. If all items are skipped, the order will fail with "No items provided for order" but without clarity on why.

**Fix:** Log a warning or count skipped items to provide better debugging:
```java
if (cart == null || !cart.getUserId().equals(userId)) {
    log.warn("Skipping cart item {}: not found or not owned by user {}", cartId, userId);
    continue;
}
```

---

### WR-04: Goods entity used without null check after SKU lookup

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/OrderServiceImpl.java:99-108`
**Issue:** `MallGoods goods = goodsMapper.selectById(sku.getGoodsId())` can return null if the goods record is missing or deleted. The code immediately calls `goods.getName()`, `goods.getMainImage()` without null checks, which will throw NullPointerException.

**Fix:** Add null check after fetching goods:
```java
MallGoods goods = goodsMapper.selectById(sku.getGoodsId());
if (goods == null) {
    throw new RuntimeException("Goods not found for SKU: " + sku.getId());
}
```

---

### WR-05: getCurrentUserId is a hardcoded stub returning 1L

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/OrderServiceImpl.java:47-49`
**Issue:** The stub always returns `1L`. This is acknowledged with a TODO comment but is a significant gap - all order operations will be attributed to user ID 1 until properly integrated with the auth system.

**Fix:** When integrating with zlt-uaa, replace with:
```java
private Long getCurrentUserId() {
    SecurityContext context = SecurityContextHolder.getContext();
    if (context != null && context.getAuthentication() != null) {
        return Long.valueOf(context.getAuthentication().getName());
    }
    throw new RuntimeException("User not authenticated");
}
```

---

### WR-06: WeChat configuration allows empty strings

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/PayServiceImpl.java:61-62, 91, 254`
**Issue:** Configuration values can be empty strings (e.g., `appId != null ? appId : ""`), which causes the payment flow to proceed with invalid parameters. The `buildMockPayParams` fallback masks these issues in development but should not silently produce invalid output in staging.

**Fix:** Validate required config and fail fast:
```java
if (appId == null || appId.isEmpty() || mchId == null || mchId.isEmpty() || apiKey == null || apiKey.isEmpty()) {
    throw new RuntimeException("WeChat Pay configuration incomplete: appId, mchId, and apiKey are required");
}
```

---

### WR-07: RestTemplate created with new instead of injection

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/PayServiceImpl.java:47`
**File:** `zlt-business/mall-center/src/main/java/com/central/mall/utils/WeChatTemplateMsgUtil.java:21-22`
**Issue:** Both classes create `RestTemplate` instances using `new RestTemplate()` instead of dependency injection. This bypasses any connection pooling, timeout configuration, or interceptors configured in the Spring context.

**Fix:** Inject RestTemplate via constructor or field injection, allowing Spring to manage the bean lifecycle.

---

## Info

### IN-01: Magic number - low stock threshold hardcoded

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/StockServiceImpl.java:252`
**Issue:** The threshold value `10` is hardcoded. This should be a configurable property.

**Fix:**
```java
@Value("${stock.low-threshold:10}")
private int lowStockThreshold;

return currentStock < lowStockThreshold;
```

---

### IN-02: Magic number - payment IP address hardcoded

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/PayServiceImpl.java:68`
**Issue:** `spbill_create_ip` is hardcoded to `"127.0.0.1"`. In production, this should be the actual client IP.

**Fix:** Extract from request context or make configurable.

---

### IN-03: Duplicate goods lookup in createOrder cart path

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/OrderServiceImpl.java:84-85`
**Issue:** `goodsMapper.selectById(cart.getGoodsId())` is called twice - once for `getName()` and once for `getMainImage()`. This results in two identical database queries.

**Fix:**
```java
MallGoods goods = goodsMapper.selectById(cart.getGoodsId());
item.put("goodsName", goods.getName());
item.put("goodsImage", goods.getMainImage());
```

---

### IN-04: Unused variable in generateOrderNo

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/OrderServiceImpl.java:373`
**Issue:** `new Random().nextInt(1000)` is called to generate a random suffix, but the order number already contains the orderId which provides uniqueness. The random suffix adds minimal entropy and may not be necessary given the orderId.

**Fix:** Either remove the random suffix or use `ThreadLocalRandom.current()` instead of creating a new Random instance.

---

### IN-05: Commented-out code indicates incomplete implementation

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/OrderServiceImpl.java:349`
**Issue:** `// resourceUrl, fileId, token would be populated from goods virtualUrl/virtualFileId` comment indicates these fields are not being set in `MallResourceDelivery`.

**Fix:** Complete the implementation or log a warning that virtual delivery information is incomplete.

---

_Reviewed: 2026-05-08T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_