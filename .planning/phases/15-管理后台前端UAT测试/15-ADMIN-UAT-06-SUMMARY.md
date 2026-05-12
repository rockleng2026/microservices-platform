---
phase: 15-管理后台前端UAT测试
plan: 06
subsystem: stock-management
tags: [backend, feature, api]
key-files:
  - zlt-business/mall-center/src/main/java/com/central/mall/model/dto/StockCreateDTO.java
  - zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminStockController.java
  - zlt-business/mall-center/src/main/java/com/central/mall/service/IAdminStockService.java
  - zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStockServiceImpl.java
---

# Phase 15 Plan 06: 添加库存录入功能（创建 SKU 库存记录 API）

添加 POST /api/mall/admin/stock 接口，支持创建新的 SKU 库存记录。

## Commits

| Task | Commit | Description |
|------|--------|-------------|
| Task 1 | 8e982448d | 创建StockCreateDTO |
| Task 2 | 0ebb9968c | IAdminStockService添加createStock方法声明 |
| Task 3 | c2774467c | AdminStockServiceImpl实现createStock |
| Task 4 | f9ace8549 | AdminStockController添加POST端点 |

## Decisions Made

- StockCreateDTO 使用 Jakarta Validation 注解进行参数校验（@NotNull, @NotBlank, @Positive）
- createStock 方法实现时检查 SKU 编码唯一性，防止重复创建
- 验证商品 ID 是否存在，确保数据完整性
- 规格 JSON 默认为 "{}"，避免 null 值
- 状态默认为 1（启用）
- 初始库存默认为 0

## Deviations
None

## Threat Flags
None

## Self-Check
PASSED

**Files Created:**
- StockCreateDTO.java - 库存创建请求 DTO

**Files Modified:**
- IAdminStockService.java - 添加 createStock 方法声明
- AdminStockServiceImpl.java - 实现 createStock 业务逻辑
- AdminStockController.java - 添加 POST /api/mall/admin/stock 端点