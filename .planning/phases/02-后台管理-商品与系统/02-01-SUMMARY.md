# Phase 2 Plan 01: 后台管理-基础架构搭建 Summary

**Phase:** 02-后台管理-商品与系统
**Plan:** 02-01
**Status:** COMPLETED
**Completed:** 2026-05-08

---

## One-Liner

Created 6 database tables, 6 entity classes, 6 mapper interfaces, AesUtil encryption helper, and 10 DTO classes for Phase 2 admin backend foundation.

---

## Tasks Completed

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | Create 6 new database tables | DONE | 896dfed6d |
| 2 | Create 6 entity classes | DONE | d6c811c6d |
| 3 | Create 6 mapper interfaces | DONE | 43db5c153 |
| 4 | Create AesUtil helper | DONE | 5a317dbc7 |
| 5 | Create 8 DTO classes | DONE | a671dd366 |

---

## Deliverables

### Database Tables (6 new)
- `mall_banner` - Banner management with goods/external link types
- `mall_spec` - SKU specification definitions (color, memory, disk)
- `mall_spec_value` - SKU specification value pool
- `mall_express` - Logistics company management
- `mall_settings` - Key-value system config with AES encryption support
- `mall_resource_delivery` - Virtual goods delivery with token-based download

**Total tables in mall_center.sql:** 12 (6 existing + 6 new)

### Entity Classes (6 new)
- `MallBanner.java`
- `MallSpec.java`
- `MallSpecValue.java`
- `MallExpress.java`
- `MallSettings.java`
- `MallResourceDelivery.java`

### Mapper Interfaces (6 new)
- `MallBannerMapper.java`
- `MallSpecMapper.java`
- `MallSpecValueMapper.java`
- `MallExpressMapper.java`
- `MallSettingsMapper.java`
- `MallResourceDeliveryMapper.java`

### AesUtil
- `AesUtil.java` - AES-128-CBC encryption/decryption for sensitive settings fields (D-11)

### DTO Classes (10 total, 8 planned + 2 supporting)
**Planned:**
- `AdminGoodsDTO.java` - Full goods fields with SKU list
- `AdminCategoryDTO.java` - Nested children support
- `BannerDTO.java` - Banner with link types
- `SettingsDTO.java` - Masked sensitive values
- `StatisticsDTO.java` - Dashboard statistics
- `SpecDTO.java` - Spec with value list
- `GoodsCloneDTO.java` - Clone goods to new category
- `BatchStatusDTO.java` - Batch goods status update

**Supporting (referenced by above):**
- `SkuDTO.java` - SKU structure for AdminGoodsDTO
- `SpecValueDTO.java` - Spec value for SpecDTO

---

## Decisions Implemented

| D-ID | Decision | Implementation |
|------|----------|----------------|
| D-02 | SKU规格预定义+值池 | mall_spec + mall_spec_value tables |
| D-03 | 虚拟商品固定库存 | MallResourceDelivery.stock field |
| D-04 | 轮播图混合模式 | MallBanner.linkType + externalUrl |
| D-07 | 下载链接时效token | MallResourceDelivery.token + expireTime |
| D-09 | 50件/批 | BatchStatusDTO for batch operations |
| D-11 | AES加密存储 | AesUtil for settings sensitive fields |

---

## Threat Mitigations

| Threat | Disposition | Mitigation |
|--------|-------------|------------|
| T-02-01 (Tampering - mall_settings) | Mitigated | AES encryption for sensitive fields via AesUtil |
| T-02-02 (Information Disclosure - resource_delivery) | Mitigated | UUID token, expire_time enforced, no PII stored |
| T-02-03 (DoS - Statistics API) | Accepted | Redis cache with 5-min TTL noted for future implementation |

---

## Files Created/Modified

| File | Change |
|------|--------|
| `sql/mall-center/mall_center.sql` | Appended 6 CREATE TABLE + test data |
| `zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallBanner.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallSpec.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallSpecValue.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallExpress.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallSettings.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallResourceDelivery.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallBannerMapper.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallSpecMapper.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallSpecValueMapper.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallExpressMapper.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallSettingsMapper.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/mapper/MallResourceDeliveryMapper.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/utils/AesUtil.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/AdminGoodsDTO.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/AdminCategoryDTO.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/BannerDTO.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/SettingsDTO.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/StatisticsDTO.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/SpecDTO.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/GoodsCloneDTO.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/BatchStatusDTO.java` | NEW |
| `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/SkuDTO.java` | NEW (supporting) |
| `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/SpecValueDTO.java` | NEW (supporting) |

---

## Commits

- `896dfed6d` - feat(02-01): add 6 new tables for admin backend infrastructure
- `d6c811c6d` - feat(02-01): add 6 entity classes for admin backend
- `43db5c153` - feat(02-01): add 6 mapper interfaces for admin backend
- `5a317dbc7` - feat(02-01): add AesUtil for AES-128-CBC encryption
- `a671dd366` - feat(02-01): add 10 DTO classes for admin operations

---

## Self-Check

- [x] 6 new tables added to mall_center.sql with proper indexes and comments
- [x] 6 entity classes with @TableName annotation and all required fields
- [x] 6 mapper interfaces with @Mapper + extends BaseMapper
- [x] AesUtil.java with encrypt/decrypt methods (AES-128-CBC)
- [x] 8+ DTO classes in model/dto/ with correct fields

**Self-Check: PASSED**
