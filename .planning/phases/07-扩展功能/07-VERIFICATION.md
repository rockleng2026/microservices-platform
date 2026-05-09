---
phase: "07-扩展功能"
verified: "2026-05-09T00:00:00Z"
status: passed
score: "7/7 must-haves verified"
overrides_applied: 0
re_verification: false
gaps: []
---

# Phase 07: 扩展功能 Verification Report

**Phase Goal:** Redis Lua atomic stock + platform self-operated + merchant model + WeChat template messages
**Verified:** 2026-05-09
**Status:** PASSED
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Stock pre-allocation uses Redis Lua script executed atomically via Spring Data Redis scripting | VERIFIED | StockServiceImpl.java line 34-53: `LUA_PREALLOCATE_SCRIPT` constant + `redisTemplate.execute(LUA_SCRIPT, List.of(stockKey), ...)` at line 77. No decrement-then-check pattern exists. |
| 2 | No race condition window between decrement and rollback | VERIFIED | The Lua script performs GET -> compare -> DECRBY -> return atomically on Redis server. Single round-trip. |
| 3 | Admin can view merchant applications via paginated list | VERIFIED | AdminMerchantController.java line 33-44: `GET /api/mall/admin/merchant/list` with pagination, status filter, keyword filter |
| 4 | Admin can approve or reject merchant applications | VERIFIED | AdminMerchantController.java line 57-61: `POST /api/mall/admin/merchant/review/{id}` with status + rejectReason |
| 5 | Each merchant operates under their own tenant_id | VERIFIED | MerchantServiceImpl.java line 61-63: on approval, `merchant.setTenantId("MERCHANT_" + id)` auto-generates tenantId |
| 6 | Order payment success triggers WeChat template message to user | VERIFIED | PayServiceImpl.java line 148-153: `weChatTemplateMsgUtil.sendOrderNotify(order)` called in processPayCallback after updateOrderPaid |
| 7 | Admin shipping triggers WeChat template message with logistics details to user | VERIFIED | OrderServiceImpl.java line 299-304: `weChatTemplateMsgUtil.sendShippingNotify(order, expressName, waybillNo)` called in shipOrder |

**Score:** 7/7 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `StockServiceImpl.java` | Lua atomic pre-allocation | VERIFIED | Lines 34-53: LUA_PREALLOCATE_SCRIPT constant; Line 77: `redisTemplate.execute(LUA_SCRIPT, ...)` |
| `MallMerchant.java` | Merchant entity with tenant_id, status, contact fields | VERIFIED | `@TableName("mall_merchant")`, `tenantId` field, STATUS_PENDING/APPROVED/REJECTED constants |
| `MallMerchantMapper.java` | Mapper extending BaseMapper | VERIFIED | `extends BaseMapper<MallMerchant>` |
| `MerchantDTO.java` | DTO matching MallMerchant fields | VERIFIED | All 12 fields present including tenantId, status, rejectReason |
| `IMerchantService.java` | Service interface with 4 methods | VERIFIED | getMerchantPage, getMerchantDetail, reviewMerchant, getByTenantId |
| `MerchantServiceImpl.java` | Service impl with review logic | VERIFIED | @Transactional reviewMerchant, auto-generates MERCHANT_{id}, getByTenantId lookup |
| `AdminMerchantController.java` | REST endpoints GET /list, GET /{id}, POST /review/{id} | VERIFIED | All 3 endpoints present at `/api/mall/admin/merchant` |
| `MallOrder.java` | openid field added | VERIFIED | Line 56: `private String openid;` with Chinese comment |
| `WeChatTemplateMsgUtil.java` | Template message utility | VERIFIED | @Component with sendOrderNotify, sendShippingNotify, sendTemplateMessage, getAccessToken |
| `PayServiceImpl.java` | Calls sendOrderNotify on payment callback | VERIFIED | Lines 43-45: @Lazy WeChatTemplateMsgUtil injection; Lines 148-153: sendOrderNotify call in try-catch |
| `OrderServiceImpl.java` | Calls sendShippingNotify on shipping | VERIFIED | Lines 39-41: @Lazy WeChatTemplateMsgUtil injection; Lines 299-304: sendShippingNotify call in try-catch |

### Key Link Verification

| From | To | Via | Status | Details |
|------|--- | --- | ------ | ------- |
| StockServiceImpl.preAllocateStock | Redis | `redisTemplate.execute(LUA_SCRIPT, List.of(stockKey), ...)` | WIRED | Line 77: atomic Lua script execution |
| AdminMerchantController | MallMerchant | IMerchantService | WIRED | `private final IMerchantService merchantService` at line 31 |
| MerchantServiceImpl | TenantInterceptor | `TenantInterceptor.getCurrentTenantId()` | NOT NEEDED | reviewMerchant does not need tenant context (admin context) |
| MallMerchant | MallMerchantMapper | `baseMapper` (inherited) | WIRED | ServiceImpl provides baseMapper |
| PayServiceImpl.processPayCallback | WeChatTemplateMsgUtil | `weChatTemplateMsgUtil.sendOrderNotify(order)` | WIRED | Lines 148-153: try-catch with order object |
| OrderServiceImpl.shipOrder | WeChatTemplateMsgUtil | `weChatTemplateMsgUtil.sendShippingNotify(order, expressName, waybillNo)` | WIRED | Lines 299-304: try-catch with all 3 params |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------| ---- | ------- | -------- | ------ |
| OrderServiceImpl.java | 45 | `TODO: integrate with zlt-uaa auth system` | INFO | Exists from before Phase 7; unrelated to this phase's goals |

**Note:** The TODO in OrderServiceImpl.java line 45 is in the `getCurrentUserId()` stub method which was present before Phase 7. It does not affect any of the Phase 7 success criteria.

### Human Verification Required

None -- all truths are verifiable programmatically.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| ADVANCED-02 | 07-01 | Redis Lua atomic stock pre-allocation | SATISFIED | StockServiceImpl.java uses `redisTemplate.execute(LUA_SCRIPT, ...)` atomically |
| ADVANCED-03 | 07-02 | Platform self-operated + merchant settlement model | SATISFIED | MallMerchant entity + AdminMerchantController with review workflow + tenantId auto-generation |
| ADVANCED-04 | 07-03 | WeChat template message notifications | SATISFIED | WeChatTemplateMsgUtil with sendOrderNotify + sendShippingNotify; integrated in PayServiceImpl and OrderServiceImpl |

### Deferred Items

None.

### Compilation Check

```bash
mvn compile -f zlt-business/mall-center/pom.xml -q
# Result: PASSED (no output = success)
```

## Deviations from PLAN (Auto-Fixed)

**Plan 07-01 deviation:** The PLAN specified `RedissonClient.getScript().evalReadOnly()` but this API does not exist in Redisson 3.25.0. The implementation correctly substituted Spring Data Redis `redisTemplate.execute()` with `DefaultRedisScript`, which achieves the same atomic Lua execution goal. This is an improvement over the broken Redisson approach.

**Plan 07-02, 07-03:** No deviations. Plans executed exactly as written.

## Gaps Summary

None. All 7 must-have truths are verified as TRUE in the codebase.

---

_Verified: 2026-05-09_
_Verifier: Claude (gsd-verifier)_
