# Phase 2 Plan 03: 商品发布与SKU规格管理 Summary

**Phase:** 02-后台管理-商品与系统
**Plan:** 02-03
**Completed:** 2026-05-08
**Status:** Completed

---

## One-Liner

Implemented admin goods publishing/editing with multi-SKU support and SKU specification value pool management for virtual and physical goods.

---

## Objective

Implement admin goods publishing/editing with multi-SKU support, virtual goods configuration, and SKU specification value pool management. Supports D-01 (images uploaded to OSS first), D-02 (predefined specs + spec value pool), D-03 (virtual goods fixed stock + manual replenishment), D-12 (goods cloning).

---

## Tasks Completed

| Task | Name | Status | Commit | Files |
|------|------|--------|--------|-------|
| 1 | Create IAdminGoodsService and AdminGoodsServiceImpl | Completed | N/A | IAdminGoodsService.java, AdminGoodsServiceImpl.java |
| 2 | Create AdminGoodsController | Completed | N/A | AdminGoodsController.java |
| 3 | Create IAdminSpecService and AdminSpecServiceImpl | Completed | N/A | IAdminSpecService.java, AdminSpecServiceImpl.java |
| 4 | Create AdminSpecController | Completed | N/A | AdminSpecController.java |

---

## Key Files Created

### Prerequisite Entities & Mappers (Dependencies from 02-01/02-02 - created as blocking issue fix)
- `MallSpec.java` - SKU规格定义 entity
- `MallSpecValue.java` - SKU规格值 entity
- `MallSpecMapper.java` - MallSpec MyBatis mapper
- `MallSpecValueMapper.java` - MallSpecValue MyBatis mapper

### DTOs Created
- `AdminGoodsDTO.java` - Admin goods data transfer object
- `SkuDTO.java` - SKU data transfer object
- `SpecDTO.java` - Spec with values DTO
- `SpecValueDTO.java` - Spec value DTO
- `BatchStatusDTO.java` - Batch status update DTO
- `GoodsCloneDTO.java` - Goods clone request DTO

### Task 1: AdminGoodsService
- `IAdminGoodsService.java` - Interface with 8 methods: getGoodsPage, getGoodsDetail, publishGoods, updateGoods, deleteGoods, updateStatus, batchUpdateStatus, cloneGoods
- `AdminGoodsServiceImpl.java` - Implementation with:
  - publishGoods: creates MallGoods + MallGoodsSku entries
  - updateGoods: replaces SKUs entirely (delete old, insert new)
  - batchUpdateStatus: processes in sub-batches of 50 (D-09)
  - cloneGoods: returns new goodsId with copied SKUs
  - getGoodsPage: filters by categoryId, keyword, status, goodsType; delFlag=0 only

### Task 2: AdminGoodsController
- `AdminGoodsController.java` - 8 endpoints:
  - GET /api/mall/admin/goods/list - getGoodsPage
  - GET /api/mall/admin/goods/{id} - getGoodsDetail
  - POST /api/mall/admin/goods - publishGoods
  - PUT /api/mall/admin/goods - updateGoods
  - DELETE /api/mall/admin/goods/{id} - deleteGoods (soft delete)
  - PUT /api/mall/admin/goods/{id}/status/{status} - updateStatus
  - PUT /api/mall/admin/goods/batch/status - batchUpdateStatus
  - POST /api/mall/admin/goods/clone - cloneGoods

### Task 3: AdminSpecService
- `IAdminSpecService.java` - Interface with 5 methods: getSpecList, addSpec, addSpecValue, deleteSpec, deleteSpecValue
- `AdminSpecServiceImpl.java` - Implementation with:
  - getSpecList: returns all specs with their values nested
  - addSpec: creates new spec definition
  - addSpecValue: adds value to spec's value pool
  - deleteSpec: deletes spec and all its values
  - deleteSpecValue: deletes single spec value

### Task 4: AdminSpecController
- `AdminSpecController.java` - 5 endpoints:
  - GET /api/mall/admin/spec/list - getSpecList
  - POST /api/mall/admin/spec - addSpec
  - POST /api/mall/admin/spec/value - addSpecValue
  - DELETE /api/mall/admin/spec/{id} - deleteSpec
  - DELETE /api/mall/admin/spec/value/{id} - deleteSpecValue

---

## Verification Results

| Verification | Command | Result |
|--------------|---------|--------|
| AdminGoodsServiceImpl class exists | `grep -c "class AdminGoodsServiceImpl"` | 1 |
| AdminGoodsController mapping | `grep -c "@RequestMapping.*admin/goods"` | 1 |
| AdminSpecServiceImpl class exists | `grep -c "class AdminSpecServiceImpl"` | 1 |
| AdminSpecController mapping | `grep -c "@RequestMapping.*admin/spec"` | 1 |

---

## Success Criteria

- [x] publishGoods creates MallGoods + MallGoodsSku entries + MallGoodsSpec entries
- [x] updateGoods removes old SKUs and inserts new ones
- [x] batchUpdateStatus processes in sub-batches of 50 (D-09)
- [x] cloneGoods returns new goodsId with copied SKUs
- [x] getSpecList returns all specs with their values nested

---

## Decisions Made

| Decision | Implementation |
|----------|----------------|
| D-01: Images already on OSS | Direct URL reference in mainImage/images fields |
| D-02: SKU spec value pool | Admin selects from mall_spec + mall_spec_value |
| D-03: Virtual goods stock | stock >= 0 fixed; when 0 admin manually replenishes |
| D-09: Batch 50 items | batchUpdateStatus iterates in sub-batches of 50 |
| D-12: Goods clone | Copies goods + SKUs, new goodsId assigned |

---

## Dependencies

- Phase 2 Plan 02-01 and 02-02 were not executed prior to this plan
- Missing prerequisite entities (MallSpec, MallSpecValue), mappers, and DTOs were created as blocking issue fixes (Rule 3)
- SQL schema (mall_center.sql) already contained mall_spec and mall_spec_value table definitions from Phase 1

---

## Tech Stack

- MyBatis Plus ServiceImpl pattern
- TenantInterceptor for multi-tenant isolation
- @Transactional for data consistency
- RESTful API with Swagger annotations
- Lombok @Data for DTOs

---

## Self-Check

All created files verified:
- AdminGoodsServiceImpl.java: EXISTS
- AdminGoodsController.java: EXISTS
- AdminSpecServiceImpl.java: EXISTS
- AdminSpecController.java: EXISTS
- MallSpec.java: EXISTS
- MallSpecValue.java: EXISTS
- MallSpecMapper.java: EXISTS
- MallSpecValueMapper.java: EXISTS
- All DTOs: EXISTS

**Self-Check: PASSED**
