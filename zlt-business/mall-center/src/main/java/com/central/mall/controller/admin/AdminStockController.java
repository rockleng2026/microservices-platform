package com.central.mall.controller.admin;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.central.common.model.Result;
import com.central.mall.model.dto.SkuStockDTO;
import com.central.mall.model.dto.StockCorrectDTO;
import com.central.mall.service.IAdminStockService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mall/admin/stock")
@RequiredArgsConstructor
@Tag(name = "管理员-库存管理")
public class AdminStockController {

    private final IAdminStockService adminStockService;

    @GetMapping("/list")
    @Operation(summary = "Get SKU stock list (STOCK-04)")
    public Result<IPage<SkuStockDTO>> getSkuStockPage(
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "20") Long pageSize,
            @RequestParam(required = false) Long goodsId,
            @RequestParam(required = false) String keyword) {
        IPage<SkuStockDTO> result = adminStockService.getSkuStockPage(
                new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(page, pageSize),
                Map.of("goodsId", goodsId, "keyword", keyword));
        return Result.succeed(result);
    }

    @GetMapping("/{skuId}")
    @Operation(summary = "Get single SKU stock detail (STOCK-04)")
    public Result<SkuStockDTO> getSkuStockDetail(@PathVariable Long skuId) {
        SkuStockDTO detail = adminStockService.getSkuStockDetail(skuId);
        if (detail == null) {
            return Result.failed("SKU not found");
        }
        return Result.succeed(detail);
    }

    @PutMapping("/{skuId}/correct")
    @Operation(summary = "Manual stock correction (STOCK-05)")
    public Result<Boolean> correctStock(@PathVariable Long skuId, @RequestBody StockCorrectDTO dto) {
        if (dto.getChange() == null || dto.getChange() == 0) {
            return Result.failed("修正数量不能为0");
        }
        if (dto.getOperator() == null || dto.getOperator().isBlank()) {
            return Result.failed("操作人不能为空");
        }
        boolean success = adminStockService.correctStock(skuId, dto.getChange(), dto.getOperator(), dto.getRemark());
        if (success) {
            return Result.succeed(true);
        } else {
            return Result.failed("修正失败");
        }
    }

    @GetMapping("/alert/list")
    @Operation(summary = "Get stock below threshold (STOCK-06)")
    public Result<List<SkuStockDTO>> getStockAlertList() {
        List<SkuStockDTO> alerts = adminStockService.getStockAlertList();
        return Result.succeed(alerts);
    }
}