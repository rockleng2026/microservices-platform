# 03-04 PLAN Summary

**Phase:** 03-订单与支付核心
**Plan:** 04
**Wave:** 4
**Status:** ✅ Completed
**Date:** 2026-05-08

---

## Files Created

| File | Purpose |
|------|---------|
| `service/IAdminStockService.java` | Admin stock service interface |
| `service/impl/AdminStockServiceImpl.java` | Stock list, correction, alert implementation |
| `controller/admin/AdminStockController.java` | 4 endpoints for stock management |
| `controller/admin/AdminExpressController.java` | 6 endpoints for logistics CRUD |
| `model/dto/SkuStockDTO.java` | Stock list DTO with threshold status |
| `model/dto/StockCorrectDTO.java` | Manual correction request DTO |
| `model/dto/ExpressDTO.java` | Logistics company DTO |

---

## Requirements Covered

| Requirement | Description | Status |
|-------------|-------------|--------|
| STOCK-04 | Admin can view all SKU stock levels via GET /api/mall/admin/stock | ✅ |
| STOCK-05 | Admin can manually correct stock with reason via PUT /api/mall/admin/stock/{skuId}/correct | ✅ |
| STOCK-06 | Stock below threshold triggers alert notification | ✅ |
| DELIVERY-01 | Admin can maintain logistics companies via CRUD endpoints | ✅ |

---

## Key Implementation Details

### AdminStockController Endpoints
- `GET /api/mall/admin/stock/list` - Paginated stock list with threshold status
- `GET /api/mall/admin/stock/{skuId}` - Single SKU detail with last stock change
- `PUT /api/mall/admin/stock/{skuId}/correct` - Manual correction with validation
- `GET /api/mall/admin/stock/alert/list` - SKUs below threshold

### AdminExpressController Endpoints
- `GET /api/mall/admin/express/list` - List with optional status filter
- `GET /api/mall/admin/express/{id}` - Single detail
- `POST /api/mall/admin/express/` - Create with code uniqueness check
- `PUT /api/mall/admin/express/` - Update
- `DELETE /api/mall/admin/express/{id}` - Soft delete
- `PUT /api/mall/admin/express/{id}/status/{status}` - Enable/disable

### Stock Alert Mechanism
- Threshold defaults to 10 (configurable via mall_settings key: `stock_alert_threshold`)
- After correction, checks if stock <= threshold and logs warning
- Stock status computed as: "正常" (> threshold), "预警" (<= threshold), "无限制" (-1)

### Integration Points
- Uses existing `IStockService.correctStock()` for DB update, Redis sync, and stock log
- Multi-tenant filtering via `TenantInterceptor.getCurrentTenantId()`
- StockLog written with operationType=4 for manual corrections

---

## Verification

| Check | Result |
|-------|--------|
| IAdminStockService has 3 core methods | 3 matches |
| AdminStockController has 4 endpoints | 9 matches |
| AdminExpressController has 5+ endpoints | 5 matches |
| StockCorrectDTO has change, operator, remark | ✅ |
| ExpressDTO has name, code, logo, sort, status | ✅ |

---

## Threat Mitigations

| Threat | Mitigation |
|--------|------------|
| T-03-13 Stock correction exploit | Only admin role; all corrections logged in MallStockLog |
| T-03-14 Stock alert spam | Alerts are logged; actual notification is Phase 4 concern |
| T-03-15 Express API key leak | Express accounts not stored; just name/code/logo for dropdown |