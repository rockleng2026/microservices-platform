# Phase 7: 扩展功能 - Research

**Researched:** 2026-05-08
**Domain:** Redis Lua atomic operations, multi-tenant SaaS merchant model, WeChat mini-program template messages
**Confidence:** MEDIUM

## Summary

Phase 7 implements three independent extensions to the mall-center: (1) Redis Lua atomic stock pre-allocation using Redisson RScript, (2) multi-tenant merchant platform with platform self-operated + merchant settlement model, and (3) WeChat mini-program subscription message notifications for order payment and shipping events. The existing codebase has all necessary infrastructure: Redisson 3.25.0 is already a dependency, TenantInterceptor already supports `x-tenant-header` tenant switching, and WeChatPayUtil provides XML/signature utilities that can be extended for template message API calls.

**Primary recommendation:** Implement stock Lua atomization by injecting RedissonClient into StockServiceImpl and replacing the decrement-check-rollback pattern with a single Lua script via RScript.eval(). For multi-tenant, create a mall_merchant entity following the same MyBatis Plus + tenant_id pattern as existing mall entities. For WeChat messages, add openid to MallOrder (or a user-tenant mapping), create a WeChatTemplateMsgUtil to call the subscribe/send API, and invoke it from PayServiceImpl.processPayCallback and OrderServiceImpl.shipOrder.

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Only `preAllocateStock` gets Lua atomization; real deduct/release/correct unchanged
- **D-02:** Use Redisson RScript to execute Lua, not Spring Data Redis Scripting or raw Jedis
- **D-03:** Platform self-operated + merchant settlement model (platform has independent tenant like `master`)
- **D-04:** Merchant granularity: goods + orders + marketing data isolated by tenant_id; user table and payment config shared
- **D-05:** Admin switches tenant via management console pull-select, Header `x-tenant-header` (TenantInterceptor already supports)
- **D-06:** Two notification scenarios: order payment success + merchant shipping (with express info)
- **D-07:** Push via WeChat official template messages (mini-program subscribe messages), requiring WeChat official platform template ID config
- **D-08:** Trigger timing: payment callback success sends order notification; admin shipping operation sends logistics notification

### Claude's Discretion

- Refund approval/rejection WeChat notifications — not discussed; planner may decide based on standard UX
- Lua script timeout retry logic — planner handles per Redisson RScript default behavior
- Merchant settlement audit flow (auto/manual) — planner decides (Phase 1 recommends manual review)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ADVANCED-02 | Redis Lua atomic stock pre-allocation | Redisson RScript + Lua script design; integration point: IStockService.preAllocateStock() |
| ADVANCED-03 | Multi-tenant merchant platform | TenantInterceptor + x-tenant-header; mall_merchant entity design; AdminMerchantController |
| ADVANCED-04 | WeChat template messages (payment + shipping) | WeChat subscribe/send API endpoint + payload format; integration points: PayServiceImpl.processPayCallback + OrderServiceImpl.shipOrder |

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Redis Lua stock pre-allocation | API/Backend (StockServiceImpl) | Redis | Lua executes on Redis server; only preAllocateStock changes |
| Multi-tenant merchant data | API/Backend | Database | tenant_id isolation at service/query layer; MallMerchant entity |
| WeChat template message dispatch | API/Backend | External WeChat API | mall-center calls WeChat API; no browser/client involvement |
| Admin tenant switching | API/Backend (TenantInterceptor) | Frontend Server | Header-based; TenantInterceptor preHandle sets ThreadLocal |

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| redisson-spring-boot-starter | 3.25.0 | Redis Lua script execution via RScript | Already in parent pom.xml; supports cluster |
| StringRedisTemplate | (Spring Boot built-in) | Current stock operations | Existing; but preAllocateStock will use RScript |
| RestTemplate | (Spring Boot built-in) | WeChat API HTTP calls | Existing pattern in PayServiceImpl |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| MyBatis Plus 3.5.4.1 | 3.5.4.1 | Entity/query generation | All mall entities use this |
| WeChatPayUtil | (existing) | XML parse, signature generation | Reuse for template message API calls |

**No new dependencies required** — redisson-spring-boot-starter already transitively provides RedissonClient.

---

## Architecture Patterns

### System Architecture Diagram

```
[User Mini Program]
    |
    |---> [mall-center:7010] ---(x-tenant-header)----> [TenantInterceptor]
    |                                                     sets ThreadLocal tenant
    |
    | +--StockServiceImpl.preAllocateStock()--------+
    | |  RedissonClient.getScript()                |
    | |  RScript.evalReadOnly() --> [Redis]        | Lua script: DECRBY + check + rollback
    | |  Keys: sku:stock:{skuId}                   |
    | |  Returns: remaining stock or -1 on fail   |
    | +--------------------------------------------+
    |
    | +--AdminMerchantController-------------------+
    | |  mall_merchant table (tenant_id isolated)  |
    | |  GET /list, POST /register, PUT /review    |
    | |  Header: x-tenant-header = merchant tenant |
    | +--------------------------------------------+
    |
    | +--PayServiceImpl.processPayCallback()------+
    | |  updateOrderPaid() --> WeChatTemplateMsgUtil.sendOrderNotify()
    | |  --> POST https://api.weixin.qq.com/...subscribe/send
    | +--------------------------------------------+
    |
    | +--OrderServiceImpl.shipOrder()-------------+
    | |  MallDelivery insert --> WeChatTemplateMsgUtil.sendShippingNotify()
    | |  --> POST https://api.weixin.qq.com/...subscribe/send
    | +--------------------------------------------+
    v
[WeChat Platform API]
```

### Recommended Project Structure

```
zlt-business/mall-center/src/main/java/com/central/mall/
├── config/
│   └── RedissonConfig.java          # RedissonClient bean (if not auto-configured)
├── controller/admin/
│   └── AdminMerchantController.java  # ADVANCED-03: merchant management
├── entity/
│   └── MallMerchant.java            # ADVANCED-03: merchant entity
├── mapper/
│   └── MallMerchantMapper.java       # ADVANCED-03
├── service/
│   ├── impl/
│   │   ├── MerchantServiceImpl.java # ADVANCED-03: merchant business logic
│   │   └── StockServiceImpl.java    # ADVANCED-02: Lua atomic pre-alloc (modified)
│   └── IMerchantService.java         # ADVANCED-03
└── utils/
    └── WeChatTemplateMsgUtil.java   # ADVANCED-04: WeChat template message sender
```

### Pattern 1: Redis Lua Atomic Stock Pre-allocation

**What:** Replace non-atomic decrement-check-rollback with single Lua script via Redisson RScript.

**When to use:** Only in `preAllocateStock()`. Other stock operations (deductRealStock, releaseStock, correctStock) remain unchanged per D-01.

**Lua script logic:**
```lua
-- Keys: KEYS[1] = stock key (sku:stock:{skuId})
-- Args: ARGV[1] = quantity to pre-allocate
local stock = redis.call('GET', KEYS[1])
if stock == false then
    return -1  -- Key not found
end
local newStock = tonumber(stock) - tonumber(ARGV[1])
if newStock < 0 then
    return -1  -- Insufficient stock
end
redis.call('DECRBY', KEYS[1], ARGV[1])
return newStock
```

**Java invocation (via Redisson RScript):**
```java
// Source: [ASSUMED based on Redisson 3.25.0 RScript API]
// Pattern confirmed from training, not verified via Context7 due to docs.redisson.org redirect issues
@Autowired
private RedissonClient redisson;

public boolean preAllocateStock(Long orderId, List<Map<String, Object>> items) {
    RScript<Integer> script = redisson.getScript();
    for (Map<String, Object> item : items) {
        Long skuId = Long.valueOf(item.get("skuId").toString());
        Integer quantity = Integer.valueOf(item.get("quantity").toString());
        
        String stockKey = SKU_STOCK_KEY_PREFIX + skuId;
        // Use evalReadOnly for read-dominant script (alters Redis but is idempotent per-call)
        Integer result = script.evalReadOnly(
            RScriptScriptSource.fromString(LUA_PREALLOCATE_SCRIPT),
            RScriptReturnType.INTEGER,
            List.of(stockKey),
            quantity
        );
        
        if (result != null && result < 0) {
            log.warn("Stock insufficient for SKU {}: requested {}", skuId, quantity);
            return false;
        }
        // Record lock and log...
    }
    return true;
}
```

**Anti-Patterns to Avoid:**
- **Decrement-then-check-rollback:** The current code at StockServiceImpl lines 48-58 uses `decrement()` then checks `< 0` then `increment()` rollback. This is NOT atomic and has a race window between decrement and rollback where another request can read the wrong value.
- **Using StringRedisTemplate.execute with Scripting:** D-02 explicitly specifies RScript, not Spring Data Redis scripting.

### Pattern 2: Multi-Tenant Merchant Model

**What:** Platform operates as a special tenant; third-party merchants register, are reviewed, then operate under their own tenant_id. All merchant data (goods, orders, marketing) is isolated by tenant_id. User accounts and payment configuration are shared platform-wide.

**When to use:** When building a marketplace or B2B2C platform where the platform owner also sells directly.

**Entity design (MallMerchant):**
```java
// Source: [DESIGNED based on existing mall entity patterns in mall_center.sql]
@Data
@TableName("mall_merchant")
public class MallMerchant {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;           // Merchant's assigned tenant_id (e.g., "MERCHANT_001")
    private String merchantName;       // Business name
    private String contactName;        // Contact person
    private String contactPhone;       // Contact phone
    private String businessLicenseUrl; // Business license image URL
    private Integer status;            // 0=pending, 1=approved, 2=rejected
    private String rejectReason;       // Rejection reason if rejected
    private LocalDateTime applyTime;   // Application time
    private LocalDateTime reviewTime;  // Review time
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

**Admin merchant management endpoints:**
- `GET /api/mall/admin/merchant/list` — list all merchant applications (with status filter)
- `POST /api/mall/admin/merchant/review/{id}` — approve/reject merchant (D-05: manual review recommended)
- `GET /api/mall/admin/merchant/{id}` — merchant detail

**Data isolation:** All existing mall tables (mall_goods, mall_order, mall_marketing_activity, etc.) already have `tenant_id` — merchant's goods/orders automatically appear under their tenant_id when the admin switches tenant via `x-tenant-header`.

### Pattern 3: WeChat Template Message Notification

**What:** Send WeChat mini-program subscription messages to users on order payment success and order shipping.

**When to use:** After payment callback confirms payment; after admin ships an order.

**WeChat API endpoint:**
```
POST https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=ACCESS_TOKEN
```

**Request body:**
```json
{
  "touser": "oXXXX...",        // User's openid (from MallOrder or user-tenant mapping)
  "template_id": "TEMPLATE_ID", // WeChat official platform template ID
  "page": "pages/order/detail?orderId=123",
  "miniprogram_state": "developer",
  "lang": "zh_CN",
  "data": {
    "character_string1": { "value": "ORD123456789" },
    "amount2": { "value": "99.00" },
    "date3": { "value": "2026-05-08 15:30" }
  }
}
```

**Key insight on openid:** The current MallOrder entity does not have an openid field. Options:
1. Add `openid` column to `mall_order` — simplest, stores openid at order creation time (passed from mini-program frontend)
2. Create a `mall_user_openid` mapping table — more normalized, useful if one user has multiple openids across apps

Per D-08, openid should already be available at order creation (passed from mini-program when initiating payment). Recommend adding `openid VARCHAR(64)` to `MallOrder` and `MallOrder` table.

**Access token:** WeChat access_token expires in 7200 seconds. Should be cached in Redis with a TTL. PayServiceImpl already uses WeChat config — a `WeChatAccessTokenUtil` or similar should be created to manage token lifecycle.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Lua script execution on Redis | Build custom Jedis/Spring scripting | Redisson RScript | Cluster-safe, already in dependency tree, read-only eval pattern |
| WeChat HTTP API calls | Build raw HttpURLConnection | RestTemplate (existing in PayServiceImpl) | Already configured, consistent with existing WeChat calls |
| Tenant context propagation | Propagate tenant manually in every method | TenantInterceptor + ThreadLocal | Already implemented and used in all services |
| Access token management | Fetch token on every request | Redis-cached token with TTL | Token has 7200s validity; fetching every time is wasteful |

---

## Common Pitfalls

### Pitfall 1: Race condition in stock pre-allocation
**What goes wrong:** Current `decrement()` then `< 0` check then `increment()` rollback has a window where two concurrent requests can both see positive stock and both proceed.
**Why it happens:** The check and rollback are not atomic with the decrement.
**How to avoid:** Use single Lua script executed atomically via Redisson RScript. The Lua script above performs GET, subtract, check, and DECRBY as a single atomic operation.
**Warning signs:** Stock goes negative (`stockAfterDecr < 0`) appearing in logs frequently.

### Pitfall 2: WeChat access_token expires mid-use
**What goes wrong:** Template message API returns 40001 (invalid credential) because access_token expired.
**Why it happens:** access_token valid for 7200s but no caching mechanism.
**How to avoid:** Cache access_token in Redis with key `wechat:access_token:{appId}` and TTL of 7000s (slightly less than expiry). Refresh proactively when TTL < 5 minutes.

### Pitfall 3: Merchant tenant isolation not enforced
**What goes wrong:** Admin sees other merchant's orders when switching tenants.
**Why it happens:** Some queries might not properly filter by tenant_id.
**How to avoid:** Ensure all mall_* queries (goods, orders, etc.) always include `tenant_id` in WHERE clause via MyBatis Plus tenant plugin or explicit TenantInterceptor.getCurrentTenantId() filtering. The existing codebase already does this via TenantInterceptor ThreadLocal.

### Pitfall 4: Openid not stored at order creation
**What goes wrong:** WeChat notification fails silently because order has no openid.
**Why it happens:** MallOrder currently has no openid column; it was not needed for payment but is needed for template messages.
**How to avoid:** Add openid column to mall_order and populate it when order is created (frontend mini-program passes it).

---

## Code Examples

### Lua Atomic Pre-allocation Script

```lua
-- Stock pre-allocation Lua script
-- KEYS[1]: stock key (e.g., "sku:stock:123")
-- ARGV[1]: quantity to pre-allocate
-- Returns: remaining stock after allocation, or -1 if insufficient/not found
local stock = redis.call('GET', KEYS[1])
if stock == false then
    return -1
end
local current = tonumber(stock)
local quantity = tonumber(ARGV[1])
if current < quantity then
    return -1
end
local remaining = current - quantity
redis.call('DECRBY', KEYS[1], quantity)
return remaining
```

### WeChat Template Message Send (Simplified)

```java
// Source: [WebFetch - https://developers.weixin.qq.com/miniprogram/dev/server/API/mp-message-management/subscribe-message/api_sendmessage.html]
// REST endpoint confirmed: POST https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=ACCESS_TOKEN
// Verified 2026-05-08

public boolean sendTemplateMessage(String openid, String templateId, String page, Map<String, String> data) {
    String url = "https://api.weixin.qq.com/cgi-bin/message/subscribe/send";
    
    Map<String, Object> body = new HashMap<>();
    body.put("touser", openid);
    body.put("template_id", templateId);
    body.put("page", page);
    body.put("miniprogram_state", "developer");
    body.put("lang", "zh_CN");
    
    // data format: { "key1": { "value": "content" }, ... }
    Map<String, Map<String, String>> dataMap = new HashMap<>();
    for (Map.Entry<String, String> entry : data.entrySet()) {
        Map<String, String> item = new HashMap<>();
        item.put("value", entry.getValue());
        dataMap.put(entry.getKey(), item);
    }
    body.put("data", dataMap);
    
    // Use access_token from cache
    String token = weChatAccessTokenService.getAccessToken();
    String fullUrl = url + "?access_token=" + token;
    
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(body), headers);
    
    ResponseEntity<String> response = restTemplate.postForEntity(fullUrl, entity, String.class);
    Map<String, Object> result = objectMapper.readValue(response.getBody(), Map.class);
    
    return "0".equals(String.valueOf(result.get("errcode")));
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redis decrement-then-check-rollback | Redis Lua atomic script via RScript | Phase 7 | Eliminates stock over-decommit race |
| Single-tenant mall | Multi-tenant with shared platform | Phase 7 | Enables B2B2C marketplace model |
| No post-payment notifications | WeChat template messages | Phase 7 | Improves user experience and engagement |

**Deprecated/outdated:**
- None for this phase.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Redisson RScript API: `redisson.getScript()` returns `RScript`, then `evalReadOnly(scriptSource, returnType, keys, args)` — not verified via Context7 (docs redirect to redisson.pro which returned 404) | Architecture Patterns | RScript method signatures may differ; planner must verify Redisson JavaDoc or source before implementing |
| A2 | WeChat subscribe/send API accepts `data` as `{"key": {"value": "content"}}` nested format — verified via WebFetch but API docs page was navigation-only | Code Examples | If nested format is wrong, errcode 47003 (parameter error) will occur; use `/cgi-bin/message/subscribe/send` docs directly |
| A3 | MallOrder does not currently have openid column — verified by reading MallOrder.java source | Common Pitfalls | If openid exists elsewhere (e.g., user-center), the mall_order column addition is unnecessary |
| A4 | Redis key for stock pre-allocation lock: `order:stock:lock:{orderId}` used for Redis hash records — existing code confirmed this | Architecture Patterns | None — this is already in the codebase |
| A5 | Admin merchant review is manual (human-in-the-loop) — per Claude's discretion recommendation | Architecture Patterns | If auto-approval is desired instead, different flow needed |
| A6 | No existing mall_merchant table — not found in mall_center.sql or entity directory | Architecture Patterns | If table already exists elsewhere, entity creation is unnecessary |

**If A1 is wrong:** The planner must use the correct RScript method signatures from Redisson 3.25.0 JavaDoc. The core pattern (Lua atomic decrement + check) is still correct even if the Java API differs.

---

## Open Questions

1. **Where is user openid stored?**
   - What we know: MallOrder does not have openid field; openid is passed from mini-program frontend during payment initiation (PayServiceImpl.initiatePay takes openId parameter); no MallUser entity in mall-center
   - What's unclear: Where is the user's openid actually persisted? Is it in a central user-center service outside mall-center?
   - Recommendation: Add `openid VARCHAR(64)` column to `mall_order` table, populated at order creation time from the authenticated user context. This is the simplest approach and aligns with the mini-program flow.

2. **How to manage WeChat access_token?**
   - What we know: PayServiceImpl uses `@Value("${wechat.pay.app-id}")` etc. but does not manage access_token; WeChat token expires in 7200s
   - What's unclear: Should access_token be stored in Redis with key `wechat:access_token:{appId}`? Should there be a WeChatAccessTokenService?
   - Recommendation: Create a `WeChatAccessTokenService` that fetches token from `https://api.weixin.qq.com/cgi-bin/token` and caches in Redis with TTL.

3. **Merchant review flow: auto or manual?**
   - What we know: D-05 says admin management console tenant switching; Phase 1 recommendation is manual review
   - What's unclear: What data does the platform need to review? Business license? Contact info?
   - Recommendation: Manual review with at minimum: merchant name, contact name, contact phone, business license URL. Status: 0=pending, 1=approved, 2=rejected.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Redis/Redisson | Stock Lua scripts, token caching | Yes (confirmed in pom.xml) | 3.25.0 | — |
| MySQL | Merchant table, order queries | Yes (existing mall-center) | — | — |
| WeChat API | Template messages | External | — | Mock mode for dev |
| RestTemplate | WeChat HTTP calls | Yes (existing PayServiceImpl) | — | — |

**Missing dependencies with no fallback:**
- None identified.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | JUnit 5 (Spring Boot test dependency expected) |
| Config file | None detected — existing mall-center has no test infrastructure |
| Quick run command | Not applicable (no existing tests) |
| Full suite command | Not applicable |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ADVANCED-02 | Lua script atomically decrements stock without race | unit | `mvn test -Dtest=StockServiceTest#testPreAllocateStockAtomic` | NO |
| ADVANCED-02 | Lua script returns -1 when stock insufficient | unit | `mvn test -Dtest=StockServiceTest#testPreAllocateStockInsufficient` | NO |
| ADVANCED-03 | Merchant registration creates mall_merchant record | integration | `mvn test -Dtest=MerchantServiceTest#testRegister` | NO |
| ADVANCED-03 | TenantInterceptor correctly switches tenant context | unit | `mvn test -Dtest=TenantInterceptorTest` | NO |
| ADVANCED-04 | WeChat template message sent on payment callback | integration | `mvn test -Dtest=PayServiceTest#testProcessPayCallbackSendsMessage` | NO |
| ADVANCED-04 | WeChat template message sent on shipping | integration | `mvn test -Dtest=OrderServiceTest#testShipOrderSendsMessage` | NO |

### Wave 0 Gaps
- [ ] `src/test/java/com/central/mall/service/impl/StockServiceImplTest.java` — ADVANCED-02 Lua script unit tests
- [ ] `src/test/java/com/central/mall/service/impl/MerchantServiceTest.java` — ADVANCED-03 merchant service tests
- [ ] `src/test/java/com/central/mall/service/impl/WeChatTemplateMsgServiceTest.java` — ADVANCED-04 WeChat message tests
- [ ] `src/test/resources/application.yml` — test profile with mock WeChat config
- [ ] Framework install: Maven test dependency check — confirm `spring-boot-starter-test` in mall-center pom.xml

*(If no gaps: "None — existing test infrastructure covers all phase requirements")*

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | N/A — WeChat auth handled by mini-program platform |
| V3 Session Management | no | N/A — no sessions; stateless tenant header |
| V4 Access Control | yes | TenantInterceptor enforces tenant isolation; admin endpoints require existing auth |
| V5 Input Validation | yes | All DTOs use `@Validated` (existing pattern in AdminOrderController) |
| V6 Cryptography | yes | WeChat API calls use HTTPS; sensitive config (API keys) via environment variables |

### Known Threat Patterns for Phase Stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Merchant registers with fake business info | Information Disclosure | Platform manual review (D-05) before activating merchant |
| Tenant ID spoofing via x-tenant-header | Elevation / Tampering | Backend must validate tenant_id belongs to authenticated admin (existing auth system) |
| WeChat template message spam | Denial of Service | Rate limit per user (one message per event per order) |
| Lua script infinite loop / blocking | Denial of Service | Redisson RScript has timeout; Redis has `lua-time-limit` (default 5s) |
| WeChat API access_token theft | Information Disclosure | Token transmitted over HTTPS only; stored server-side in Redis |

---

## Sources

### Primary (HIGH confidence)
- `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/StockServiceImpl.java` — current preAllocateStock implementation (lines 32-78) showing the race condition pattern
- `zlt-business/mall-center/src/main/java/com/central/mall/config/TenantInterceptor.java` — existing tenant ThreadLocal implementation
- `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/PayServiceImpl.java` — existing WeChat API call pattern using RestTemplate
- `zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminOrderController.java` — shipOrder endpoint and ShipOrderDTO structure
- `sql/mall-center/mall_center.sql` — existing mall entity schema patterns
- pom.xml — Redisson 3.25.0 confirmed

### Secondary (MEDIUM confidence)
- [WebFetch: developers.weixin.qq.com - subscribe message send API](https://developers.weixin.qq.com/miniprogram/dev/server/API/mp-message-management/subscribe-message/api_sendmessage.html) — endpoint and parameter structure verified via WebFetch

### Tertiary (LOW confidence)
- [ASSUMED] Redisson RScript API method signatures (evalReadOnly, RScriptScriptSource, RScriptReturnType) — documentation page redirected to redisson.pro which returned 404, confirmed from training knowledge only
- [ASSUMED] Lua script logic for atomic decrement — standard Redis Lua pattern, not verified against a specific Redisson example

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Redisson 3.25.0 confirmed in pom.xml; RestTemplate existing; no new dependencies needed
- Architecture: MEDIUM — Lua script logic correct from training; RScript API method signatures not verified via Context7 (redisson.org redirect issue)
- Pitfalls: MEDIUM — race condition analysis based on reading current code; mitigation patterns standard

**Research date:** 2026-05-08
**Valid until:** 2026-06-07 (30 days — Redisson API stable, WeChat API stable)
