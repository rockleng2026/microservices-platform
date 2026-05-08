package com.central.mall.controller.admin;

import com.central.common.model.Result;
import com.central.mall.model.dto.BannerDTO;
import com.central.mall.service.IAdminBannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin banner management controller.
 * Provides 5 endpoints for full CRUD + sort operations.
 * D-04: Mixed link mode - internal goods (linkType=1) and external URL (linkType=2).
 *
 * @author Portal Team
 * @since 2026-05-08
 */
@RestController
@RequestMapping("/api/mall/admin/banner")
@RequiredArgsConstructor
@Tag(name = "管理员-轮播图管理", description = "后台轮播图管理接口")
public class AdminBannerController {

    private final IAdminBannerService adminBannerService;

    @GetMapping("/list")
    @Operation(summary = "获取轮播图列表")
    public Result<List<BannerDTO>> getBannerList() {
        return Result.succeed(adminBannerService.getBannerList());
    }

    @PostMapping
    @Operation(summary = "新增轮播图")
    public Result<Boolean> addBanner(@RequestBody @Validated BannerDTO dto) {
        // Validate title is required
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            return Result.failed("轮播图标题不能为空");
        }
        // Validate imageUrl is required
        if (dto.getImageUrl() == null || dto.getImageUrl().trim().isEmpty()) {
            return Result.failed("轮播图图片不能为空");
        }
        // Validate linkType
        if (dto.getLinkType() == null || (dto.getLinkType() != 1 && dto.getLinkType() != 2)) {
            return Result.failed("链接类型必须为1(商品)或2(外部链接)");
        }
        boolean success = adminBannerService.addBanner(dto);
        return success ? Result.succeed(true) : Result.failed("新增轮播图失败");
    }

    @PutMapping
    @Operation(summary = "编辑轮播图")
    public Result<Boolean> updateBanner(@RequestBody @Validated BannerDTO dto) {
        if (dto.getId() == null) {
            return Result.failed("轮播图ID不能为空");
        }
        boolean success = adminBannerService.updateBanner(dto);
        return success ? Result.succeed(true) : Result.failed("编辑轮播图失败");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除轮播图")
    public Result<Boolean> deleteBanner(@PathVariable Long id) {
        boolean success = adminBannerService.deleteBanner(id);
        return success ? Result.succeed(true) : Result.failed("删除轮播图失败");
    }

    @PutMapping("/{id}/sort/{sort}")
    @Operation(summary = "更新轮播图排序")
    public Result<Boolean> updateSort(@PathVariable Long id, @PathVariable Integer sort) {
        boolean success = adminBannerService.updateSort(id, sort);
        return success ? Result.succeed(true) : Result.failed("更新排序失败");
    }
}