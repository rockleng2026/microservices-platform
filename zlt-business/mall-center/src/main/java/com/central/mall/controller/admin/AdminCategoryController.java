package com.central.mall.controller.admin;

import com.central.common.model.Result;
import com.central.mall.model.dto.AdminCategoryDTO;
import com.central.mall.service.IAdminCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin category management controller.
 * Provides 5 endpoints for full CRUD + sort operations.
 *
 * @author Portal Team
 * @since 2026-05-08
 */
@RestController
@RequestMapping("/api/mall/admin/category")
@RequiredArgsConstructor
@Tag(name = "管理员-分类管理", description = "后台分类管理接口")
public class AdminCategoryController {

    private final IAdminCategoryService adminCategoryService;

    @GetMapping("/list")
    @Operation(summary = "获取分类列表(树形)")
    public Result<List<AdminCategoryDTO>> getCategoryTree() {
        return Result.success(adminCategoryService.getCategoryTree());
    }

    @PostMapping
    @Operation(summary = "新增分类")
    public Result<Boolean> addCategory(@RequestBody @Validated AdminCategoryDTO dto) {
        // Validate name is required
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            return Result.fail("分类名称不能为空");
        }
        boolean success = adminCategoryService.addCategory(dto);
        return success ? Result.success(true) : Result.fail("新增分类失败");
    }

    @PutMapping
    @Operation(summary = "编辑分类")
    public Result<Boolean> updateCategory(@RequestBody @Validated AdminCategoryDTO dto) {
        if (dto.getId() == null) {
            return Result.fail("分类ID不能为空");
        }
        boolean success = adminCategoryService.updateCategory(dto);
        return success ? Result.success(true) : Result.fail("编辑分类失败");
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除分类")
    public Result<Boolean> deleteCategory(@PathVariable Long id) {
        boolean success = adminCategoryService.deleteCategory(id);
        return success ? Result.success(true) : Result.fail("删除分类失败");
    }

    @PutMapping("/sort")
    @Operation(summary = "批量排序分类")
    public Result<Boolean> sortCategories(@RequestBody List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return Result.fail("排序ID列表不能为空");
        }
        boolean success = adminCategoryService.sortCategories(ids);
        return success ? Result.success(true) : Result.fail("排序失败");
    }
}