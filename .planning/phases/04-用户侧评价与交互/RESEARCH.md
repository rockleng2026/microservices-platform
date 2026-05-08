# Phase 4: 用户侧评价与交互 - Research

**Researched:** 2026-05-08
**Domain:** E-commerce evaluation + logistics tracking + admin user management
**Confidence:** MEDIUM

## Summary

Phase 4 implements three loosely coupled feature groups: (1) product evaluation after order completion, (2) logistics tracking visualization for shipped orders, and (3) admin-side user management with consumption statistics. The phase builds directly on Phase 3's `MallOrder`, `MallOrderItem`, and `MallDelivery` entities. Key technical decisions include: evaluation records attach to individual `order_item` rows (not the order header) to support multi-SKU orders; logistics tracking uses a polling-based third-party API abstraction layer (not webhooks) since no single provider is locked in; image uploads reuse the existing `file-center` multipart endpoint; and admin user queries join `sys_user` (user-center DB) with `mall_order` aggregates for consumption stats.

**Primary recommendation:** Use a logistics tracking facade pattern with provider abstraction, store evaluation images as JSON array of file URLs via existing upload endpoint, and join user-center's `sys_user` with mall order data for admin user stats.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EVAL-01 | User can evaluate completed order items (rating, comment, images) | Evaluation table design, image upload flow, order eligibility check |
| EVAL-02 | User can view their evaluation history | Evaluation query API, pagination pattern |
| EVAL-03 | Product detail page displays evaluation list (optional) | Goods evaluation aggregation, rating statistics |
| USER-04 | Admin can view registered user list (linked WeChat info) | sys_user table with open_id, user-center query approach |
| USER-05 | Admin can view user order and consumption statistics | Order aggregation queries, join with sys_user |
| DELIVERY-02 | Admin can fill/modify logistics info (waybill, express company) | Already implemented in Phase 3 shipOrder() - confirm completeness |
| DELIVERY-03 | User can view logistics trajectory (shipped orders) | Third-party tracking API integration |
| DELIVERY-04 | Logistics status tracking (in-transit/signed/returned) | Status mapping from API response to internal states |

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Evaluate (submit/list) | API/Backend | — | Business logic, validation, DB write |
| Evaluation images upload | API/Backend | CDN (via file-center) | Proxied through file-center OSS integration |
| Logistics tracking API | API/Backend | External 3rd-party | Facade pattern, polling model |
| Admin user list | API/Backend | Database (user-center) | Cross-service query or direct DB read |
| Admin consumption stats | API/Backend | Database (mall) | Aggregated order queries |
| User view logistics | API/Backend | — | Read delivery records + call tracking API |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Spring Boot | 3.1.6 | Application framework | Project baseline |
| MyBatis Plus | 3.5.4.1 | ORM + query wrappers | Already in use |
| Redisson | 3.25.0 | Redis client (if caching tracking data) | Already in use |
| file-center (existing) | — | Image upload endpoint `/files-anon` | Already exists, MultipartFile upload |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Overt SDK (快递鸟) | 2.1.5 | Logistics tracking API | Primary tracking provider option |
| Jackson | bundled | JSON serialization for images array | Store image URLs as JSON array |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| 快递鸟 | 菜鸟云ceo | 快递鸟 has simpler free tier; 菜鸟 requires more setup |
| JSON array for images | Separate evaluate_image table | Single row per evaluation is simpler; but multi-image queries are harder |
| Direct DB join (sys_user + mall_order) | Feign client to user-center | Direct SQL is faster for read-heavy admin stats; Feign adds latency |

**Installation (if needed):**
```xml
<!-- For logistics tracking API client -->
<dependency>
    <groupId>com.overt</groupId>
    <artifactId>kdniao-sdk</artifactId>
    <version>2.1.5</version>
</dependency>
```

## Architecture Patterns

### System Architecture Diagram

```
[User MiniApp] 
    | GET /api/mall/evaluate (list)
    | POST /api/mall/evaluate (submit)
    | GET /api/mall/order/{id}/delivery (tracking)
    v
[mall-center:7010]
    |-- EvaluateController (EVAL-01, EVAL-02)
    |   |-- IEvaluateService --> MallEvaluateMapper --> cp_mall.mall_evaluate
    |   |-- File upload via /files-anon (multipart)
    |
    |-- OrderController (DELIVERY-03, DELIVERY-04)
    |   |-- ILogisticsTrackService --> [LogisticsProvider] --> 3rd-party API
    |   |-- MallDeliveryMapper --> cp_mall.mall_delivery
    |
    |-- admin/AdminUserController (USER-04, USER-05)
        |-- IAdminUserService --> sys_userMapper (user-center) + MallOrderMapper (mall)
            |--> Aggregation: order count, total consumption per user

[file-center:5000]
    |-- /files-anon POST (multipart) --> stores to OSS/S3

[External]
    |-- 快递鸟/KDN100 API --> polling for logistics status
    |-- WeChat API (not implemented in this phase)
```

### Recommended Project Structure
```
zlt-business/mall-center/src/main/java/com/central/mall/
├── controller/
│   ├── EvaluateController.java      # EVAL-01, EVAL-02
│   ├── OrderController.java          # DELIVERY-03, DELIVERY-04 (tracking)
│   └── admin/AdminUserController.java # USER-04, USER-05
├── service/
│   ├── IEvaluateService.java
│   ├── impl/EvaluateServiceImpl.java
│   ├── ILogisticsTrackService.java
│   ├── impl/LogisticsTrackServiceImpl.java
│   ├── IAdminUserService.java
│   └── impl/AdminUserServiceImpl.java
├── mapper/
│   ├── MallEvaluateMapper.java
│   └── MallDeliveryMapper.java
├── model/
│   ├── entity/
│   │   └── MallEvaluate.java
│   ├── dto/
│   │   ├── EvaluateDTO.java
│   │   ├── EvaluateListDTO.java
│   │   └── LogisticsTrackDTO.java
│   └── vo/
│       └── UserStatisticsVO.java
└── utils/
    └── LogisticsTrackUtil.java        # 3rd-party API wrapper facade
```

### Pattern 1: Evaluation Record Per OrderItem

**What:** Each evaluation record attaches to a specific `mall_order_item.id`, not the order header.

**When to use:** When a single order contains multiple SKUs and each needs independent evaluation.

**Example:**
```java
// Each MallOrderItem can have 0 or 1 MallEvaluate
// order_item_id uniquely identifies the purchasable line item
@Data
@TableName("mall_evaluate")
public class MallEvaluate {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;
    private Long orderId;           // For queries by order
    private Long orderItemId;      // Points to specific SKU purchased
    private Long goodsId;          // For goods-level aggregation
    private Long userId;
    private Integer star;          // 1-5
    private String content;        // max 500 chars
    private String images;         // JSON array ["url1","url2"]
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
```

**Anti-pattern to avoid:** Attaching evaluation to the order header only. If a user orders 3 different SKUs, they should evaluate each separately, but one-to-many from order would require complex workarounds.

### Pattern 2: Logistics Tracking Facade

**What:** Abstracts third-party tracking APIs behind an internal interface, mapping provider-specific responses to a unified internal status model.

**When to use:** When logistics provider may change or when testing against mock data.

**Example:**
```java
public interface ILogisticsProvider {
    LogisticsResult query(String expressCode, String waybillNo);
}

public enum DeliveryStatus {
    PENDING,        // 0 = 待发货
    IN_TRANSIT,     // 1 = 在途
    DELIVERED,      // 2 = 签收
    RETURNED,       // 3 = 退回
    EXCEPTION       // 4 = 异常
}
```
[ASSUMED] Status mapping from 快递鸟 API: `State=0` means in transit, `State=2` means signed, `State=4` means returned. Needs official docs confirmation before locking.

### Pattern 3: Image Upload via Proxied File-Center

**What:** Evaluation image uploads go through the existing `file-center` service rather than storing in the mall service directly.

**When to use:** When reuse of existing OSS infrastructure is preferred over building a new upload pipeline.

**Example:**
```java
// In EvaluateController
@PostMapping("/images")
public Result<List<String>> uploadImages(@RequestParam("files") MultipartFile[] files) {
    List<String> urls = new ArrayList<>();
    for (MultipartFile file : files) {
        FileInfo info = fileService.upload(file);  // calls file-center
        urls.add(info.getUrl());
    }
    return Result.succeed(urls);  // frontend stores this JSON array in evaluate.images
}
```

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image storage | Custom file storage in mall-center | file-center (`/files-anon` endpoint) | Already handles OSS/S3, scaling, CDN |
| Logistics API integration | Direct HTTP calls to every carrier | Logistics provider SDK (e.g., 快递鸟) | Normalizes different carrier APIs |
| Order eligibility check | Manual status comparison | Pre-built helper in EvaluateService | Consistency across EVAL-01, EVAL-02 |
| Rating display calculation | Compute avg in Java at query time | SQL aggregation with index | Performance at scale |

**Key insight:** The file-center is already a microservice with OSS integration. Sending evaluation images through it is cleaner than adding a local upload handler in mall-center, and it keeps all file storage in one place.

## Common Pitfalls

### Pitfall 1: Evaluating Non-Completable Orders
**What goes wrong:** User tries to evaluate an order that is not yet completed (status != 4).
**Why it happens:** No validation that order must be in "completed" status before evaluation is allowed.
**How to avoid:** In EvaluateService.submit(), check `order.status == 4` (completed) and throw RuntimeException if not.
**Warning signs:** Users complaining they cannot evaluate, or evaluate records appearing for non-completed orders.

### Pitfall 2: Duplicate Evaluation Per OrderItem
**What goes wrong:** User submits evaluation twice for the same order_item, creating duplicate records.
**Why it happens:** No unique constraint or check preventing re-evaluation.
**How to avoid:** Add unique index on `(order_item_id)` in `mall_evaluate` table, or check in service layer before insert.
**Warning signs:** Multiple evaluation records for same item in DB.

### Pitfall 3: Logistics API Unavailable / Timeout
**What goes wrong:** Third-party tracking API (e.g., 快递鸟) is down or times out, breaking the user's delivery status view.
**Why it happens:** Direct coupling between user request and external API call.
**How to avoid:** Use async polling with caching: check Redis cache first, if stale (> 30min) or missing, call API in background, return cached or "查询中" status.
**Warning signs:** Slow response or 504 on delivery status endpoint.

### Pitfall 4: Tracking Waybill Not Yet Assigned
**What goes wrong:** User tries to check logistics on an order that has been shipped (status=3) but admin has not yet filled in waybill number.
**Why it happens:** Admin ships order but waybill number is left blank.
**How to avoid:** Require waybill number as mandatory in AdminOrderController.shipOrder(). The existing ShipOrderDTO already enforces this.
**Warning signs:** Empty waybillNo in mall_delivery for shipped orders.

## Code Examples

### Evaluation Submission Flow
```java
// Source: Based on existing OrderServiceImpl pattern + docs
@Override
@Transactional
public boolean submitEvaluate(Long userId, EvaluateDTO dto) {
    // 1. Validate order exists and belongs to user
    MallOrder order = orderMapper.selectById(dto.getOrderId());
    if (order == null || !order.getUserId().equals(userId)) {
        throw new RuntimeException("Order not found");
    }
    // 2. Validate order is completed
    if (order.getStatus() != 4) {
        throw new RuntimeException("Only completed orders can be evaluated");
    }
    // 3. Check not already evaluated
    LambdaQueryWrapper<MallEvaluate> wrapper = new LambdaQueryWrapper<>();
    wrapper.eq(MallEvaluate::getOrderItemId, dto.getOrderItemId());
    if (evaluateMapper.selectCount(wrapper) > 0) {
        throw new RuntimeException("Already evaluated");
    }
    // 4. Insert evaluation
    MallEvaluate evaluate = new MallEvaluate();
    evaluate.setTenantId(order.getTenantId());
    evaluate.setOrderId(order.getId());
    evaluate.setOrderItemId(dto.getOrderItemId());
    evaluate.setGoodsId(dto.getGoodsId());
    evaluate.setUserId(userId);
    evaluate.setStar(dto.getStar());
    evaluate.setContent(dto.getContent());
    evaluate.setImages(JSON.toJSONString(dto.getImages()));
    evaluate.setCreateTime(LocalDateTime.now());
    evaluateMapper.insert(evaluate);
    return true;
}
```

### Logistics Status Query (with caching)
```java
// Source: [ASSUMED] Common caching pattern for external API
public LogisticsTrackDTO getLogisticsInfo(Long orderId) {
    String cacheKey = "logistics:" + orderId;
    LogisticsTrackDTO cached = redisTemplate.get(cacheKey);
    if (cached != null) return cached;

    MallDelivery delivery = deliveryMapper.selectOne(
        new LambdaQueryWrapper<MallDelivery>().eq(MallDelivery::getOrderId, orderId));

    if (delivery == null || delivery.getWaybillNo() == null) {
        return LogisticsTrackDTO.empty();  // not shipped yet
    }

    // Call third-party API (e.g., 快递鸟)
    LogisticsResult result = logisticsProvider.query(delivery.getExpressCode(), delivery.getWaybillNo());
    LogisticsTrackDTO dto = mapToDTO(result, delivery);

    // Cache for 30 minutes
    redisTemplate.set(cacheKey, dto, Duration.ofMinutes(30));
    return dto;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Evaluation per order (single row) | Evaluation per order_item (multiple rows per order) | Common in modern e-commerce | Enables per-SKU rating and reviews |
| Manual logistics status update | Third-party API polling | 2015+ (快递鸟 popularized) | Real-time tracking without admin manual entry |
| Direct DB read for user stats | Aggregated query with index optimization | Always | Avoids N+1 queries for admin user list |

**Deprecated/outdated:**
- Manual logistics status entry by admin (DELIVERY-02): Already automated via third-party API
- Single image per evaluation: Modern e-commerce requires gallery support (JSON array images field)

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | 快递鸟 SDK is available as `kdniao-sdk` 2.1.5 on Maven | Logistics Integration | SDK may be unavailable or API changed - fallback to HTTP client |
| A2 | sys_user table in user-center DB is accessible from mall-center service | USER-04/USER-05 | Cross-database query may need Feign or replication; verify JDBC connectivity |
| A3 | Order status 4 = completed is final state before EVAL-01 eligibility | Evaluation | If status lifecycle changes, evaluation eligibility check breaks |
| A4 | Image upload via file-center stores permanent CDN URLs | Evaluation Images | If file-center uses temp URLs, evaluation images go stale |

## Open Questions

1. **Logistics provider selection**: Should we use 快递鸟 (KDN100) or another provider (菜鸟/京东)? What is the expected call volume and does it fit the free tier?
   - What we know: MallExpress table has code/name for express companies
   - What's unclear: Which tracking API to integrate, authentication credentials setup
   - Recommendation: Start with 快递鸟 as it has a free tier and simple REST API

2. **Image upload limits**: Should we limit number of images per evaluation (e.g., max 9)?
   - What we know: images stored as TEXT (JSON array), file-center handles upload
   - What's unclear: Frontend validation or backend enforcement?
   - Recommendation: Backend enforce max 9 images, each max 5MB, total max 20MB per submission

3. **Evaluation visibility**: Can users edit/delete evaluations after submission?
   - What we know: EVAL-01 only mentions submit, EVAL-02 mentions view
   - What's unclear: No edit/delete mentioned - treat as immutable once submitted
   - Recommendation: Make evaluations immutable (no edit/delete in v1)

4. **Admin user stats cross-database**: Is direct SQL join between sys_user (user-center) and mall_order (mall) acceptable or should we use a Feign client?
   - What we know: Both use MySQL, same server (can use different DBs)
   - What's unclear: Multi-tenancy when joining - user-center has tenant_id per record or per connection?
   - Recommendation: Direct DB read for admin (bypasses tenant isolation for admin operations)

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| file-center service | EVAL-01 (image upload) | Yes | running on 5000 | Accept image URLs directly |
| MySQL (cp_mall) | EVAL, DELIVERY, USER stats | Yes | 8.0.x | — |
| Redis | Caching tracking results | Yes (via Redisson 3.25.0) | configured | In-memory cache |
| 快递鸟/KDN100 API | DELIVERY-03/04 | Not integrated | — | Manual status or mock data |
| MallExpress entity | DELIVERY-02 (already exists) | Yes | implemented in Phase 3 | — |

**Missing dependencies with no fallback:**
- 快递鸟 API credentials and SDK: planner must include setup step for this

**Missing dependencies with fallback:**
- Third-party tracking API: can return "物流信息查询中" with cached data as fallback

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | JUnit 4 (existing project standard) |
| Config file | none — see Wave 0 |
| Quick run command | `mvn test -Dtest=EvaluateServiceTest -pl zlt-business/mall-center` |
| Full suite command | `mvn test -pl zlt-business/mall-center` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| EVAL-01 | Submit evaluation for completed order item | unit | `mvn test -Dtest=EvaluateServiceTest#testSubmitEvaluate` | no |
| EVAL-01 | Reject evaluation for non-completed order | unit | `mvn test -Dtest=EvaluateServiceTest#testRejectInvalidStatus` | no |
| EVAL-01 | Reject duplicate evaluation | unit | `mvn test -Dtest=EvaluateServiceTest#testDuplicateEvaluate` | no |
| EVAL-02 | List user evaluations with pagination | unit | `mvn test -Dtest=EvaluateServiceTest#testListUserEvaluates` | no |
| USER-04 | Admin user list with WeChat info | integration | `mvn test -Dtest=AdminUserServiceTest#testUserList` | no |
| USER-05 | User consumption statistics | unit | `mvn test -Dtest=AdminUserServiceTest#testUserStats` | no |
| DELIVERY-02 | Confirm shipOrder updates delivery record | unit | `mvn test -Dtest=OrderServiceTest#testShipOrder` | no |
| DELIVERY-03 | Get logistics info with caching | unit | `mvn test -Dtest=LogisticsTrackServiceTest#testGetLogistics` | no |
| DELIVERY-04 | Map tracking status to internal states | unit | `mvn test -Dtest=LogisticsTrackServiceTest#testStatusMapping` | no |

### Sampling Rate
- **Per task commit:** `mvn test -pl zlt-business/mall-center -Dtest=*ServiceTest -x`
- **Per wave merge:** Full test suite
- **Phase gate:** All tests green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `mall-center/src/test/java/com/central/mall/service/EvaluateServiceTest.java` — covers EVAL-01, EVAL-02
- [ ] `mall-center/src/test/java/com/central/mall/service/AdminUserServiceTest.java` — covers USER-04, USER-05
- [ ] `mall-center/src/test/java/com/central/mall/service/LogisticsTrackServiceTest.java` — covers DELIVERY-03, DELIVERY-04
- [ ] `mall-center/src/test/java/com/central/mall/service/OrderServiceTest.java` — covers DELIVERY-02 (shipOrder)
- [ ] `mall-center/src/test/java/com/central/mall/controller/EvaluateControllerTest.java` — covers EVAL-01, EVAL-02 HTTP layer
- [ ] Framework install: JUnit already in mall-center pom via parent starter

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | Existing OAuth2 token validation in gateway |
| V3 Session Management | no | No session state in evaluation module |
| V4 Access Control | yes | EVAL-01/02: user can only evaluate their own orders; USER-04/05: admin only |
| V5 Input Validation | yes | star (1-5 integer), content (max 500 chars), images (max 9, max 5MB each) |
| V6 Cryptography | no | No crypto operations in evaluation/logistics |

### Known Threat Patterns for Evaluation Module

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| User evaluates another user's order | Tampering | Validate order.userId == currentUserId before insert |
| Submitting HTML/script in content field | XSS | Content stored as text, frontend escapes on display; consider server-side HTML sanitize |
| Uploading non-image files as evaluation photos | Information Disclosure | Validate MIME type on upload (image/jpeg, image/png, image/webp) |
| Admin scraping other tenant's user data | Information Disclosure | TenantInterceptor required for USER-04/05 queries |

## Sources

### Primary (HIGH confidence)
- MallOrder, MallOrderItem, MallDelivery entities — verified by reading source files
- OrderServiceImpl.shipOrder() — confirmed DELIVERY-02 already implemented
- file-center FileController — confirmed /files-anon multipart upload exists
- sys_user table in user-center.sql — confirmed open_id field for WeChat linkage

### Secondary (MEDIUM confidence)
- [mall-center design doc](file:///D:/code/microservices-platform/docs/mall-center/在线销售服务器硬件小程序开发V1.0.md) — contains mall_evaluate table design
- [ROADMAP.md](file:///D:/code/microservices-platform/.planning/ROADMAP.md) — Phase 4 requirements and success criteria
- [CLAUDE.md](file:///D:/code/microservices-platform/CLAUDE.md) — table naming convention and stack version

### Tertiary (LOW confidence)
- 快递鸟 SDK version 2.1.5 — not verified in Maven Central; needs official confirmation
- Status mapping from 快递鸟 API (State values) — [ASSUMED] based on common industry conventions

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM — file-center and existing entities verified; tracking SDK not yet confirmed
- Architecture: MEDIUM — evaluation pattern clear; logistics facade pattern standard but provider not locked
- Pitfalls: MEDIUM — common issues identified; duplicate evaluation uniqueness constraint confirmed

**Research date:** 2026-05-08
**Valid until:** 2026-06-07 (30 days — stable domain, no fast-moving changes expected)