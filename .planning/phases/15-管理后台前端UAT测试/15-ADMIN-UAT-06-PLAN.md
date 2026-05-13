---
phase: 15-管理后台前端UAT测试
plan: 06
type: execute
wave: 2
depends_on: []
files_modified:
  - zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminStockController.java
  - zlt-business/mall-center/src/main/java/com/central/mall/service/IAdminStockService.java
  - zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStockServiceImpl.java
autonomous: true
gap_closure: true
requirements:
  - ADMIN-05
---

<objective>
Add stock entry endpoint to create new SKU stock records (Gap 3).

Purpose: Currently there is no way to add a new SKU stock record for existing goods. Need to add POST /api/mall/admin/stock endpoint to create new stock entries with goods selection, specs, and initial stock.

Output: POST /api/mall/admin/stock endpoint that creates new SKU stock records.
</objective>

<context>
@zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminStockController.java
@zlt-business/mall-center/src/main/java/com/central/mall/service/IAdminStockService.java
@zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallGoodsSku.java

Backend stock controller only has:
- GET /list - list stock
- GET /{skuId} - get detail
- PUT /{skuId}/correct - correct stock
- GET /alert/list - get alerts

Missing: POST endpoint to create new stock records.

MallGoodsSku entity fields:
- id, tenantId, goodsId, skuCode, specs (JSON), price, stock, status, delFlag, createTime, updateTime
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create StockCreateDTO for request body</name>
  <files>zlt-business/mall-center/src/main/java/com/central/mall/model/dto/StockCreateDTO.java</files>
  <action>
    Create a new DTO class for stock entry request.

Create file: `zlt-business/mall-center/src/main/java/com/central/mall/model/dto/StockCreateDTO.java`

```java
package com.central.mall.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

@Data
@Schema(description = "Stock creation request")
public class StockCreateDTO {

    @NotNull(message = "商品ID不能为空")
    @Schema(description = "Goods ID")
    private Long goodsId;

    @NotBlank(message = "SKU编码不能为空")
    @Schema(description = "SKU code - must be unique per tenant")
    private String skuCode;

    @Schema(description = "Specifications JSON, e.g. {\"color\":\"red\",\"size\":\"M\"}")
    private String specs;

    @NotNull(message = "价格不能为空")
    @Positive(message = "价格必须大于0")
    @Schema(description = "SKU price")
    private BigDecimal price;

    @NotNull(message = "初始库存不能为空")
    @Schema(description = "Initial stock quantity (default 0)")
    private Integer stock = 0;

    @Schema(description = "Status: 1=enabled, 0=disabled")
    private Integer status = 1;
}
```
</action>
  <verify>
    <automated>test -f zlt-business/mall-center/src/main/java/com/central/mall/model/dto/StockCreateDTO.java && echo "EXISTS" || echo "MISSING"</automated>
    <automated>grep -c "class StockCreateDTO" zlt-business/mall-center/src/main/java/com/central/mall/model/dto/StockCreateDTO.java</automated>
  </verify>
  <done>
    StockCreateDTO class created with fields: goodsId, skuCode, specs, price, stock, status
  </done>
</task>

<task type="auto">
  <name>Task 2: Add createStock method to IAdminStockService interface</name>
  <files>zlt-business/mall-center/src/main/java/com/central/mall/service/IAdminStockService.java</files>
  <read_first>
    - zlt-business/mall-center/src/main/java/com/central/mall/service/IAdminStockService.java
  </read_first>
  <action>
    Add createStock method declaration to IAdminStockService interface.

Add import:
```java
import com.central.mall.model.dto.StockCreateDTO;
```

Add method signature after existing method declarations:
```java
/**
 * Create a new SKU stock record
 * @param dto stock creation data
 * @return created SKU ID
 */
Long createStock(StockCreateDTO dto);
```
</action>
  <verify>
    <automated>grep -c "createStock" zlt-business/mall-center/src/main/java/com/central/mall/service/IAdminStockService.java</automated>
  </verify>
  <done>
    IAdminStockService interface has createStock(StockCreateDTO) method
  </done>
</task>

<task type="auto">
  <name>Task 3: Implement createStock in AdminStockServiceImpl</name>
  <files>zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStockServiceImpl.java</files>
  <read_first>
    - zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStockServiceImpl.java
    - zlt-business/mall-center/src/main/java/com/central/mall/model/entity/MallGoodsSku.java
  </read_first>
  <action>
    Implement createStock method in AdminStockServiceImpl.

Add import:
```java
import com.central.mall.model.dto.StockCreateDTO;
```

Add implementation after the existing getSkuStockPage method:
```java
@Override
public Long createStock(StockCreateDTO dto) {
    String tenantId = TenantInterceptor.getCurrentTenantId();

    // Check if skuCode already exists for this tenant
    LambdaQueryWrapper<MallGoodsSku> existWrapper = new LambdaQueryWrapper<>();
    existWrapper.eq(MallGoodsSku::getTenantId, tenantId)
               .eq(MallGoodsSku::getSkuCode, dto.getSkuCode())
               .eq(MallGoodsSku::getDelFlag, 0);
    Long existingCount = skuMapper.selectCount(existWrapper);
    if (existingCount > 0) {
        throw new RuntimeException("SKU编码已存在: " + dto.getSkuCode());
    }

    // Verify goods exists
    MallGoods goods = goodsMapper.selectById(dto.getGoodsId());
    if (goods == null || goods.getDelFlag() != 0) {
        throw new RuntimeException("商品不存在: " + dto.getGoodsId());
    }

    // Create SKU stock record
    MallGoodsSku sku = new MallGoodsSku();
    sku.setGoodsId(dto.getGoodsId());
    sku.setTenantId(tenantId);
    sku.setSkuCode(dto.getSkuCode());
    sku.setSpecs(dto.getSpecs() != null ? dto.getSpecs() : "{}");
    sku.setPrice(dto.getPrice());
    sku.setStock(dto.getStock() != null ? dto.getStock() : 0);
    sku.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
    sku.setDelFlag(0);
    sku.setCreateTime(LocalDateTime.now());
    sku.setUpdateTime(LocalDateTime.now());

    skuMapper.insert(sku);
    return sku.getId();
}
```
</action>
  <verify>
    <automated>grep -c "createStock.*StockCreateDTO" zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStockServiceImpl.java</automated>
  </verify>
  <done>
    AdminStockServiceImpl.createStock() implemented with validation and insert
  </done>
</task>

<task type="auto">
  <name>Task 4: Add POST /api/mall/admin/stock endpoint to AdminStockController</name>
  <files>zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminStockController.java</files>
  <read_first>
    - zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminStockController.java
  </read_first>
  <action>
    Add POST endpoint to AdminStockController.

Add imports:
```java
import com.central.mall.model.dto.StockCreateDTO;
import jakarta.validation.Valid;
```

Add new endpoint after the getStockAlertList method:
```java
@PostMapping
@Operation(summary = "Create new SKU stock record")
public Result<Long> createStock(@Valid @RequestBody StockCreateDTO dto) {
    try {
        Long skuId = adminStockService.createStock(dto);
        return Result.succeed(skuId);
    } catch (RuntimeException e) {
        return Result.failed(e.getMessage());
    }
}
```
</action>
  <verify>
    <automated>grep -c "PostMapping" zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminStockController.java</automated>
    <automated>grep -c "createStock" zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminStockController.java</automated>
  </verify>
  <done>
    AdminStockController has POST /api/mall/admin/stock endpoint returning created SKU ID
  </done>
</task>

</tasks>

<must_haves>
  truths:
    - "可以通过 API 创建新的 SKU 库存记录"
    - "创建的库存记录包含商品ID、SKU编码、规格、价格、初始库存"
  artifacts:
    - path: "zlt-business/mall-center/src/main/java/com/central/mall/model/dto/StockCreateDTO.java"
      provides: "Request DTO for stock creation"
    - path: "zlt-business/mall-center/src/main/java/com/central/mall/controller/admin/AdminStockController.java"
      provides: "POST /api/mall/admin/stock endpoint"
      contains: "@PostMapping"
    - path: "zlt-business/mall-center/src/main/java/com/central/mall/service/IAdminStockService.java"
      provides: "createStock method signature"
    - path: "zlt-business/mall-center/src/main/java/com/central/mall/service/impl/AdminStockServiceImpl.java"
      provides: "createStock implementation with validation"
  key_links:
    - from: "AdminStockController.createStock"
      to: "AdminStockServiceImpl.createStock"
      via: "adminStockService.createStock(dto)"
</must_haves>

<verification>
1. POST /api/mall/admin/stock with valid data returns 200 and created SKU ID
2. POST with duplicate skuCode returns error
3. POST with non-existent goodsId returns error
4. Stock record appears in GET /api/mall/admin/stock/list
</verification>

<success_criteria>
- POST endpoint accepts goodsId, skuCode, specs, price, stock, status
- Duplicate skuCode rejected with error message
- Non-existent goodsId rejected with error message
- Created stock record queryable via list endpoint
</success_criteria>

<output>
After completion, create `.planning/phases/15-管理后台前端UAT测试/15-ADMIN-UAT-06-SUMMARY.md`
</output>