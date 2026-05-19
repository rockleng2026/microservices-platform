package com.central.mall.controller.admin;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.common.model.Result;
import com.central.mall.model.entity.MallMarketingActivity;
import com.central.mall.service.IAdminPromotionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * 管理员促销活动控制器
 */
@RestController
@RequestMapping("/api/mall/admin/promotions")
@RequiredArgsConstructor
@Tag(name = "管理员-促销管理")
@Validated
public class AdminPromotionController {

    private final IAdminPromotionService promotionService;

    @GetMapping
    @Operation(summary = "获取促销列表")
    public Result<Page<MallMarketingActivity>> getPromotionList(
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "10") Long pageSize,
            @RequestParam(required = false) Integer status) {
        return Result.succeed(promotionService.getPromotionList(page, pageSize, status));
    }

    @PostMapping
    @Operation(summary = "创建促销活动")
    public Result<Boolean> createPromotion(@RequestBody @Validated MallMarketingActivity promotion) {
        boolean success = promotionService.createPromotion(promotion);
        return success ? Result.succeed(true, "促销活动创建成功") : Result.failed("创建失败");
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新促销活动")
    public Result<Boolean> updatePromotion(@PathVariable Long id, @RequestBody @Validated MallMarketingActivity promotion) {
        boolean success = promotionService.updatePromotion(id, promotion);
        return success ? Result.succeed(true, "促销活动更新成功") : Result.failed("更新失败");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除促销活动")
    public Result<Boolean> deletePromotion(@PathVariable Long id) {
        boolean success = promotionService.deletePromotion(id);
        return success ? Result.succeed(true, "删除成功") : Result.failed("删除失败");
    }

    @PutMapping("/{id}/toggle")
    @Operation(summary = "启用/禁用促销活动")
    public Result<Boolean> togglePromotion(@PathVariable Long id) {
        boolean success = promotionService.togglePromotion(id);
        return success ? Result.succeed(true, "状态更新成功") : Result.failed("状态更新失败");
    }
}