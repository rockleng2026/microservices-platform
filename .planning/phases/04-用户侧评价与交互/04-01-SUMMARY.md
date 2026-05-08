# 04-01 PLAN Summary

**Phase:** 04-用户侧评价与交互
**Plan:** 01
**Wave:** 1
**Status:** ✅ Completed
**Date:** 2026-05-08

---

## Files Created

| File | Purpose |
|------|---------|
| `model/entity/MallEvaluate.java` | Evaluation entity with orderItemId unique constraint |
| `mapper/MallEvaluateMapper.java` | MyBatis-Plus BaseMapper |
| `service/IEvaluateService.java` | Evaluation service interface |
| `service/impl/EvaluateServiceImpl.java` | Evaluation business logic |
| `controller/EvaluateController.java` | REST API endpoints |
| `model/dto/EvaluateDTO.java` | Submit evaluation request |
| `model/dto/EvaluateListDTO.java` | Evaluation list response |

---

## Requirements Covered

| Requirement | Description | Status |
|-------------|-------------|--------|
| EVAL-01 | User can submit evaluation for completed orders (rating, comment, images) | ✅ |
| EVAL-02 | User can view their evaluation history | ✅ |
| EVAL-03 | Goods detail can show evaluation list | ✅ |

---

## Key Implementation Details

### EvaluateController Endpoints
- `POST /api/mall/evaluate` - Submit evaluation (validates star 1-5, content max 500, images max 9)
- `GET /api/mall/evaluate` - User's evaluation history (paginated)
- `GET /api/mall/evaluate/goods/{goodsId}` - Goods evaluation list (paginated)

### Validation Rules
- Order must be status=4 (completed) before evaluation allowed
- orderItemId unique constraint prevents duplicate evaluations
- Images stored as JSON array string in database

### Threat Mitigations
| Threat | Mitigation |
|--------|------------|
| T-04-01 User evaluates another user's order | Validates order.userId == currentUserId |
| T-04-02 XSS in content field | Content stored as text; frontend escapes on display |
| T-04-03 Non-image file upload | file-center validates MIME type |
| T-04-04 Duplicate evaluation | Unique index on orderItemId + service check |
| T-04-05 Evaluation spam | Pagination limits query load |

---

## Verification

| Check | Result |
|-------|--------|
| MallEvaluate has orderItemId field | ✅ |
| IEvaluateService has 3 methods | 3 matches |
| EvaluateController has 3 endpoints | 4 matches (including one for goods) |
| submitEvaluate validates order.status == 4 | ✅ |
| submitEvaluate checks duplicate orderItemId | ✅ |

---

## Dependencies

- Phase 3 completed: MallOrder (status=4), MallOrderItem (orderItemId)
- Next: 04-02 (logistics tracking + admin user management)