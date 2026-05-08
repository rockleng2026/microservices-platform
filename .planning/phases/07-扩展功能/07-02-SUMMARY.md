---
phase: "07-扩展功能"
plan: "02"
subsystem: "mall-center"
tags: ["multi-tenant", "merchant", "settlement"]
dependency_graph:
  requires: []
  provides: ["MallMerchant entity + Mapper + DTO + Service + Controller for multi-tenant merchant platform"]
  affects: ["MallGoods", "TenantInterceptor"]
tech_stack:
  added: ["MallMerchant", "MallMerchantMapper", "MerchantDTO", "IMerchantService", "MerchantServiceImpl", "AdminMerchantController"]
  patterns: ["Multi-tenant merchant isolation via tenant_id", "Admin merchant review workflow"]
key_files:
  created:
    - "zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallMerchant.java"
    - "zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallMerchantMapper.java"
    - "zlt-business/mall-center/src/main/java/com/central/mall/model/dto/MerchantDTO.java"
    - "zlt-business/mall-center/src/main/java/com/central/mall/service/IMerchantService.java"
    - "zlt-business/mall-center/src/main/java/com/central/mall/service/impl/MerchantServiceImpl.java"
    - "zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminMerchantController.java"
decisions:
  - "Merchant tenantId auto-generated as MERCHANT_{id} on approval"
  - "Admin reviews merchant applications via POST /review/{id}"
  - "Merchant data isolated via existing TenantInterceptor tenant_id filtering"
metrics:
  duration: "planned"
  completed_date: "2026-05-08"
---

# Phase 07 Plan 02: Multi-tenant Merchant Platform Summary

## One-liner

Multi-tenant merchant platform with MallMerchant entity, admin review workflow, and tenant_id-based data isolation.

## Objective

Build multi-tenant merchant platform supporting platform self-operated + merchant settlement model. Allow third-party merchants to register, be reviewed by admin, and operate under their own tenant_id. Goods, orders, and marketing data are automatically isolated via existing TenantInterceptor tenant_id filtering.

## Completed Tasks

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Create MallMerchant entity and MallMerchantMapper | f3fde06c2 | MallMerchant.java, MallMerchantMapper.java |
| 2 | Create MerchantDTO and IMerchantService interface | 5858bd33a | MerchantDTO.java, IMerchantService.java |
| 3 | Create MerchantServiceImpl and AdminMerchantController | ad6b9b2a0 | MerchantServiceImpl.java, AdminMerchantController.java |

## What Was Built

### MallMerchant Entity
- Fields: id, tenantId, merchantName, contactName, contactPhone, businessLicenseUrl, status, rejectReason, applyTime, reviewTime, createTime, updateTime
- Status constants: STATUS_PENDING=0, STATUS_APPROVED=1, STATUS_REJECTED=2
- Follows MallGoods.java pattern with `@TableName("mall_merchant")`

### MallMerchantMapper
- Extends `BaseMapper<MallMerchant>`

### MerchantDTO
- Mirror of MallMerchant fields for data transfer
- Implements `Serializable`

### IMerchantService Interface
- `getMerchantPage(IPage, Map)` - paginated merchant list with filters
- `getMerchantDetail(Long)` - full merchant detail
- `reviewMerchant(Long, Integer, String)` - approve/reject with rejectReason
- `getByTenantId(String)` - lookup by tenant_id

### MerchantServiceImpl
- `getMerchantPage`: filters by status/keyword, orders by applyTime desc
- `reviewMerchant`: @Transactional, auto-generates tenantId as `MERCHANT_{id}` on approval
- `getByTenantId`: LambdaQueryWrapper lookup

### AdminMerchantController
- `GET /api/mall/admin/merchant/list` - paginated merchant list
- `GET /api/mall/admin/merchant/{id}` - merchant detail
- `POST /api/mall/admin/merchant/review/{id}` - review merchant (inline MerchantReviewDTO)

## Threat Flags

(None - merchant review is admin-only, tenant_id generation uses internal ID not user input)

## Deviations from Plan

### Auto-fixed Issues

(None - plan executed exactly as written)

## Verification

```bash
# Files exist
ls -la zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallMerchant.java
ls -la zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallMerchantMapper.java
ls -la zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminMerchantController.java

# Commits exist
git log --oneline | head -3
```

## Known Stubs

(None)

## Self-Check: PASSED

- MallMerchant.java: FOUND with @TableName("mall_merchant"), tenantId field, status constants
- MallMerchantMapper.java: FOUND with extends BaseMapper<MallMerchant>
- AdminMerchantController.java: FOUND with @RequestMapping("/api/mall/admin/merchant")
- All 3 commits present in git history