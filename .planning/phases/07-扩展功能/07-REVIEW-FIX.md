---
phase: 07-扩展功能
fixed_at: 2026-05-09T00:22:30Z
review_path: .planning/phases/07-扩展功能/07-REVIEW.md
iteration: 1
findings_in_scope: 9
fixed: 8
skipped: 1
status: partial
---
# Phase 7: Code Review Fix Report

**Fixed at:** 2026-05-09T00:22:30Z
**Source review:** .planning/phases/07-扩展功能/07-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 9 (2 Critical + 7 Warning)
- Fixed: 8
- Skipped: 1

## Fixed Issues

### CR-01: Payment callback does not verify transaction amount

**Files modified:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/PayServiceImpl.java`
**Commit:** ba0c6c4c1
**Applied fix:** Added amount verification in `processPayCallback()` method before calling `updateOrderPaid()`. The callback's `total_fee` is now compared against the order's expected pay amount (multiplied by 100 for fen conversion). Mismatch triggers error log and returns false.

### CR-02: WeChat access token always returns empty string

**Files modified:** `zlt-business/mall-center/src/main/java/com/central/mall/utils/WeChatTemplateMsgUtil.java`
**Commit:** ba0c6c4c1
**Applied fix:** Implemented `getAccessToken()` with Redis caching. Token is fetched from WeChat OAuth API (`https://api.weixin.qq.com/cgi-bin/token`) and cached in Redis with key `wechat:access_token:{appId}`. Cache expires 60 seconds before token expiration.

### WR-01: Null safety issue in MerchantServiceImpl.reviewMerchant

**Files modified:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/MerchantServiceImpl.java`
**Commit:** c24b8b60a
**Applied fix:** Changed `status.equals(MallMerchant.STATUS_APPROVED)` to `status != null && status.equals(MallMerchant.STATUS_APPROVED)`.

### WR-02: Inconsistent status comparison patterns

**Files modified:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/OrderServiceImpl.java`
**Commit:** c24b8b60a
**Applied fix:** Changed all direct integer literal comparisons (`order.getStatus() != 1`) to use constant comparisons with `Integer.valueOf(MallOrder.STATUS_*).equals(order.getStatus())`. Updated lines 236, 258, 277, 392, and 422.

### WR-03: Silent cart item skipping in createOrder

**Files modified:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/OrderServiceImpl.java`
**Commit:** c24b8b60a
**Applied fix:** Added warning log when cart item is skipped: `log.warn("Skipping cart item {}: not found or not owned by user {}", cartId, userId)`.

### WR-04: Goods entity used without null check after SKU lookup

**Files modified:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/OrderServiceImpl.java`
**Commit:** c24b8b60a
**Applied fix:** Added null check after `goodsMapper.selectById(sku.getGoodsId())`: `if (goods == null) { throw new RuntimeException("Goods not found for SKU: " + sku.getId()); }`.

### WR-06: WeChat configuration allows empty strings

**Files modified:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/PayServiceImpl.java`
**Commit:** ba0c6c4c1
**Applied fix:** Added validation at start of `initiatePay()`: `if (appId == null || appId.isEmpty() || mchId == null || mchId.isEmpty() || apiKey == null || apiKey.isEmpty()) { throw new RuntimeException("WeChat Pay configuration incomplete: appId, mchId, and apiKey are required"); }`.

### WR-07: RestTemplate created with new instead of injection

**Files modified:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/PayServiceImpl.java`, `zlt-business/mall-center/src/main/java/com/central/mall/utils/WeChatTemplateMsgUtil.java`
**Commit:** ba0c6c4c1
**Applied fix:** Changed `private final RestTemplate restTemplate = new RestTemplate();` to `private final RestTemplate restTemplate;` in both files. Spring now injects RestTemplate via constructor (PayServiceImpl uses `@RequiredArgsConstructor`, WeChatTemplateMsgUtil uses explicit constructor with `@Autowired`).

## Skipped Issues

### WR-05: getCurrentUserId is a hardcoded stub returning 1L

**File:** `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/OrderServiceImpl.java`
**Reason:** Spring Security is not a dependency in this project. The suggested fix using `SecurityContextHolder.getContext()` would cause compilation failure. This is a TODO for when zlt-uaa integration is implemented.
**Original issue:** The stub always returns `1L` instead of getting the real user ID from the security context.

---

_Fixed: 2026-05-09T00:22:30Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
