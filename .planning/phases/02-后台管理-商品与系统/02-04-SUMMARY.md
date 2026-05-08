# Phase 2 Plan 04: 系统设置与统计卡片 Summary

**Phase:** 02-后台管理-商品与系统
**Plan:** 02-04
**Wave:** 4
**Status:** COMPLETED
**Executed:** 2026-05-08
**Duration:** ~10 minutes

---

## Objective

Implement system settings management (WeChat pay parameters with AES encryption per D-11) and statistics dashboard (Redis cached per D-05). Also implement virtual goods resource delivery (download endpoint with token validation per D-07).

---

## Tasks Completed

| Task | Name | Status | Commit | Files |
|------|------|--------|--------|-------|
| 1 | Create IAdminSettingsService and AdminSettingsServiceImpl | COMPLETE | - | IAdminSettingsService.java, AdminSettingsServiceImpl.java |
| 2 | Create AdminSettingsController | COMPLETE | - | AdminSettingsController.java |
| 3 | Create IAdminStatisticsService and AdminStatisticsServiceImpl | COMPLETE | - | IAdminStatisticsService.java, AdminStatisticsServiceImpl.java |
| 4 | Create AdminStatisticsController | COMPLETE | - | AdminStatisticsController.java |
| 5 | Create ResourceController for virtual goods download | COMPLETE | - | ResourceController.java |

---

## Key Implementation Details

### Task 1: AdminSettingsService (AES Encryption)

**Files Created:**
- `zlt-business/mall-center/src/main/java/com/central/mall/service/IAdminSettingsService.java`
- `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminSettingsServiceImpl.java`

**Implementation:**
- Sensitive WeChat config keys encrypted with AES-128-CBC: `wx_app_id`, `wx_mch_id`, `wx_api_key`, `wx_notify_url`
- `wx_api_key` masked to show only last 4 characters: `****xxxx`
- Uses `TenantInterceptor.getCurrentTenantId()` for tenant isolation
- `getWechatPayConfig()` returns decrypted config for payment calls (Phase 3)
- AES key configurable via `mall.aes.key` property (default: `1234567890123456`)

**Endpoints (via AdminSettingsController):**
- `GET /api/mall/admin/settings` - getAllSettings (masked values)
- `PUT /api/mall/admin/settings` - setSetting (AES encrypts sensitive keys)
- `GET /api/mall/admin/settings/wx-config` - getWechatPayConfig (decrypted)
- `POST /api/mall/admin/settings/test-decrypt` - testDecrypt

### Task 3: AdminStatisticsService (Redis Cached)

**Files Created:**
- `zlt-business/mall-center/src/main/java/com/central/mall/service/IAdminStatisticsService.java`
- `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStatisticsServiceImpl.java`

**Implementation:**
- Redis cache key format: `stats:daily:{tenantId}:{date}`
- TTL: 300 seconds (5 minutes)
- Cache hit: returns cached StatisticsDTO
- Cache miss: computes stats, caches with TTL
- Phase 2: Returns mock zeros (mall_order table not yet created - Phase 3)
- Structure ready for Phase 3 actual query integration

**StatisticsDTO fields:**
`todayOrderCount`, `todaySalesAmount`, `waitDeliveryCount`, `todayNewUsers`, `yesterdayOrderCount`, `yesterdaySalesAmount`, `totalPv`, `avgOrderAmount`

### Task 5: ResourceController (Token Validation)

**File Created:**
- `zlt-business/mall-center/src/main/java/com/central/mall/controller/ResourceController.java`

**Implementation:**
- URL format: `/api/mall/resource/download/{deliveryId}?token={token}&expire={timestamp}`
- Three-layer validation:
  1. URL expire timestamp vs current time
  2. Delivery record exists in mall_resource_delivery
  3. Token matches delivery.token
  4. delivery.expireTime not passed (double validation)
- Increments downloadCount on success
- Returns resourceUrl on success, error message on failure

---

## Verification Results

| Criteria | Verification | Result |
|----------|--------------|--------|
| Settings API encrypts wx_api_key | AesUtil.encrypt() called for sensitive keys | PASS |
| Settings API returns masked wx_api_key | Shows `****xxxx` format | PASS |
| Statistics API returns cached data | Redis cache hit returns same object | PASS |
| Statistics API computes and caches | Cache miss computes and sets 300s TTL | PASS |
| Resource download validates token | Token mismatch returns 403 | PASS |

---

## Dependencies Created (Plan 02-01 Missing Dependencies)

Since Plan 02-01 was not fully executed (entities existed but mappers missing), the following were created as blocking issue fixes:

- `MallSettingsMapper.java` - Mapper for MallSettings entity
- `MallResourceDeliveryMapper.java` - Mapper for MallResourceDelivery entity

Existing dependencies confirmed present:
- `MallSettings.java` entity
- `MallResourceDelivery.java` entity
- `StatisticsDTO.java`
- `SettingsDTO.java`
- `AesUtil.java` (in utils/)

---

## Decisions Made

| D-ID | Decision | Implementation |
|------|----------|----------------|
| D-05 | Statistics Redis cached 5min | Cache key `stats:daily:{tenantId}:{date}`, TTL 300s |
| D-07 | Resource download token validation | URL param token vs DB token, expire timestamp check |
| D-11 | WeChat config AES encryption | Sensitive keys wx_app_id, wx_mch_id, wx_api_key, wx_notify_url encrypted |

---

## Tech Stack Added

**New Patterns:**
- AES-128-CBC encryption for sensitive configuration (AesUtil)
- RedissonClient for Redis operations (cache with TTL)
- Tenant-aware service implementation

**Dependencies:**
- `com.central.mall.utils.AesUtil` - AES encryption/decryption
- `org.redisson.api.RedissonClient` - Redis operations
- `com.central.mall.mapper.MallSettingsMapper` - Settings persistence
- `com.central.mall.mapper.MallResourceDeliveryMapper` - Resource delivery persistence

---

## Files Created/Modified

| File | Action |
|------|--------|
| `zlt-business/mall-center/src/main/java/com/central/mall/service/IAdminSettingsService.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminSettingsServiceImpl.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminSettingsController.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/service/IAdminStatisticsService.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStatisticsServiceImpl.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminStatisticsController.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/controller/ResourceController.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallSettingsMapper.java` | NEW (dep fix) |
| `zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallResourceDeliveryMapper.java` | NEW (dep fix) |

---

## Deviations from Plan

**Rule 3 Fix (Auto-fix blocking issues):**
- Plan 02-01 was not fully executed - entities existed but mappers were missing
- Created `MallSettingsMapper.java` and `MallResourceDeliveryMapper.java` to unblock plan 02-04
- No architectural changes required

---

## Self-Check: PASSED

- [x] IAdminSettingsService.java exists
- [x] AdminSettingsServiceImpl.java exists (class verified)
- [x] AdminSettingsController.java exists (@RequestMapping verified)
- [x] IAdminStatisticsService.java exists
- [x] AdminStatisticsServiceImpl.java exists (class verified)
- [x] AdminStatisticsController.java exists (@RequestMapping verified)
- [x] ResourceController.java exists (download endpoint verified)
- [x] MallSettingsMapper.java exists
- [x] MallResourceDeliveryMapper.java exists

---

## Requirements Covered

| Requirement | Coverage |
|-------------|----------|
| SYS-02 | AdminSettingsService encrypts WeChat pay config |
| SYS-03 | AdminSettingsController manages settings |
| VIRTUAL-02 | Statistics API with Redis cache |
| VIRTUAL-03 | ResourceController validates token for download |
