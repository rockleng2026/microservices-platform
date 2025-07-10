package com.central.soo.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.common.annotation.LoginUser;
import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.common.model.SysUser;
import com.central.soo.model.entity.FinancialModel;
import com.central.soo.service.FinancialModelService;
import com.central.soo.utils.PageResultUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;

/**
 * 财务模型管理控制器
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/api/soo/v2/models")
@Tag(name = "财务模型管理", description = "增强版财务模型管理API")
@Validated
public class FinancialModelController {

    @Autowired
    private FinancialModelService financialModelService;

    /**
     * 创建财务模型
     */
    @PostMapping
    @Operation(summary = "创建财务模型", description = "创建新的财务计算模型")
    public Result<FinancialModel> createModel(
            @Valid @RequestBody FinancialModel model,
            @LoginUser SysUser user) {
        
        log.info("用户[{}]创建财务模型: {}", user.getUsername(), model.getModelName());
        
        // 设置创建人信息
        model.setCreatorId(user.getId());
        model.setCreatorName(user.getUsername());
        model.setTenantId("default"); // 使用默认租户ID
        
        FinancialModel createdModel = financialModelService.createModel(model);
        
        log.info("财务模型创建成功，ID: {}", createdModel.getId());
        return Result.succeed(createdModel);
    }

    /**
     * 获取模型列表
     */
    @GetMapping
    @Operation(summary = "获取模型列表", description = "分页查询财务模型列表")
    public Result<PageResult<FinancialModel>> getModels(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Boolean isTemplate,
            @LoginUser SysUser user) {
        
        Page<FinancialModel> pageInfo = new Page<>(page, size);
        Page<FinancialModel> result = financialModelService.pageModels(
            pageInfo, category, keyword, isActive, isTemplate, "default");
        
        return Result.succeed(PageResultUtil.buildPageResult(result));
    }

    /**
     * 获取模型详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取模型详情", description = "获取财务模型详细信息")
    public Result<Map<String, Object>> getModelDetail(
            @PathVariable @NotNull Long id) {
        
        Map<String, Object> modelDetail = financialModelService.getModelDetail(id);
        return Result.succeed(modelDetail);
    }

    /**
     * 更新财务模型
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新财务模型", description = "更新现有财务模型信息")
    public Result<FinancialModel> updateModel(
            @PathVariable @NotNull Long id,
            @Valid @RequestBody FinancialModel model,
            @LoginUser SysUser user) {
        
        log.info("用户[{}]更新财务模型[{}]: {}", user.getUsername(), id, model.getModelName());
        
        model.setId(id);
        model.setTenantId("default");
        
        FinancialModel updatedModel = financialModelService.updateModel(model);
        
        log.info("财务模型更新成功，ID: {}", updatedModel.getId());
        return Result.succeed(updatedModel);
    }

    /**
     * 删除财务模型
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除财务模型", description = "软删除财务模型")
    public Result<Boolean> deleteModel(
            @PathVariable @NotNull Long id,
            @LoginUser SysUser user) {
        
        log.info("用户[{}]删除财务模型: {}", user.getUsername(), id);
        
        boolean success = financialModelService.deleteModel(id);
        
        if (success) {
            log.info("财务模型删除成功，ID: {}", id);
            return Result.succeed(true);
        } else {
            return Result.failed("删除失败");
        }
    }

    /**
     * 克隆财务模型
     */
    @PostMapping("/{id}/clone")
    @Operation(summary = "克隆财务模型", description = "基于现有模型创建新模型")
    public Result<FinancialModel> cloneModel(
            @PathVariable @NotNull Long id,
            @RequestBody Map<String, Object> cloneRequest,
            @LoginUser SysUser user) {
        
        String newModelCode = (String) cloneRequest.get("newModelCode");
        String newModelName = (String) cloneRequest.get("newModelName");
        Boolean includeVariables = (Boolean) cloneRequest.getOrDefault("includeVariables", true);
        
        log.info("用户[{}]克隆财务模型[{}]为: {}", user.getUsername(), id, newModelName);
        
        FinancialModel clonedModel = financialModelService.cloneModel(
            id, newModelCode, newModelName, includeVariables);
        
        // 设置克隆模型的创建人信息
        clonedModel.setCreatorId(user.getId());
        clonedModel.setCreatorName(user.getUsername());
        clonedModel.setTenantId(user.getTenantId());
        
        log.info("财务模型克隆成功，新模型ID: {}", clonedModel.getId());
        return Result.success(clonedModel);
    }

    /**
     * 获取模型统计信息
     */
    @GetMapping("/{id}/statistics")
    @Operation(summary = "获取模型统计", description = "获取模型使用统计信息")
    public Result<Map<String, Object>> getModelStatistics(
            @PathVariable @NotNull Long id) {
        
        Map<String, Object> statistics = financialModelService.getModelStatistics(id);
        return Result.success(statistics);
    }

    /**
     * 验证模型完整性
     */
    @PostMapping("/{id}/validate")
    @Operation(summary = "验证模型", description = "验证模型配置的完整性和正确性")
    public Result<Map<String, Object>> validateModel(
            @PathVariable @NotNull Long id) {
        
        Map<String, Object> validationResult = financialModelService.validateModel(id);
        return Result.success(validationResult);
    }

    /**
     * 启用/禁用模型
     */
    @PutMapping("/{id}/status")
    @Operation(summary = "切换模型状态", description = "启用或禁用财务模型")
    public Result<Boolean> toggleModelStatus(
            @PathVariable @NotNull Long id,
            @RequestParam boolean isActive,
            @LoginUser SysUser user) {
        
        log.info("用户[{}]{}财务模型: {}", user.getUsername(), isActive ? "启用" : "禁用", id);
        
        boolean success = financialModelService.toggleModelStatus(id, isActive);
        return Result.success(success);
    }

    /**
     * 导出模型配置
     */
    @GetMapping("/{id}/export")
    @Operation(summary = "导出模型配置", description = "导出模型配置为JSON格式")
    public Result<String> exportModelConfig(
            @PathVariable @NotNull Long id) {
        
        String configJson = financialModelService.exportModelConfig(id);
        return Result.success(configJson);
    }

    /**
     * 导入模型配置
     */
    @PostMapping("/import")
    @Operation(summary = "导入模型配置", description = "从JSON配置导入财务模型")
    public Result<FinancialModel> importModelConfig(
            @RequestBody Map<String, String> importRequest,
            @LoginUser SysUser user) {
        
        String configJson = importRequest.get("configJson");
        
        log.info("用户[{}]导入财务模型配置", user.getUsername());
        
        FinancialModel importedModel = financialModelService.importModelConfig(configJson, user.getTenantId());
        
        log.info("财务模型导入成功，ID: {}", importedModel.getId());
        return Result.success(importedModel);
    }

    /**
     * 获取模型分类汇总
     */
    @GetMapping("/categories/summary")
    @Operation(summary = "获取分类汇总", description = "获取模型分类统计信息")
    public Result<List<Map<String, Object>>> getCategorySummary(
            @LoginUser SysUser user) {
        
        List<Map<String, Object>> summary = financialModelService.getCategorySummary(user.getTenantId());
        return Result.success(summary);
    }

    /**
     * 获取最近使用的模型
     */
    @GetMapping("/recent")
    @Operation(summary = "获取最近使用模型", description = "获取用户最近使用的财务模型")
    public Result<List<FinancialModel>> getRecentlyUsedModels(
            @RequestParam(defaultValue = "10") int limit,
            @LoginUser SysUser user) {
        
        List<FinancialModel> recentModels = financialModelService.getRecentlyUsedModels(user.getTenantId(), limit);
        return Result.success(recentModels);
    }

    /**
     * 根据模型编码获取模型
     */
    @GetMapping("/code/{modelCode}")
    @Operation(summary = "根据编码获取模型", description = "通过模型编码查询财务模型")
    public Result<FinancialModel> getModelByCode(
            @PathVariable String modelCode,
            @LoginUser SysUser user) {
        
        FinancialModel model = financialModelService.getByModelCode(modelCode, user.getTenantId());
        return Result.success(model);
    }
} 