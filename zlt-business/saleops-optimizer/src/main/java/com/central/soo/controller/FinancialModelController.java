package com.central.soo.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.common.annotation.LoginUser;
import com.central.common.context.TenantContextHolder;
import com.central.common.model.LoginAppUser;
import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.common.model.SysUser;
import com.central.common.utils.LoginUserUtils;
import com.central.soo.model.entity.FinancialModel;
import com.central.soo.service.FinancialModelService;
import com.central.soo.service.FinancialModelExportService;
import com.central.soo.utils.PageResultUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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

    @Autowired
    private FinancialModelExportService financialModelExportService;

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
    public PageResult<FinancialModel> getModels(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Boolean isTemplate,
            @LoginUser SysUser user) {
        
        return financialModelService.pageModels(page, size, category, keyword, isActive, isTemplate, "default");
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
    @Operation(summary = "克隆财务模型", description = "基于现有模型创建新模型，包括变量、图表和系列配置")
    public Result<FinancialModel> cloneModel(
            @PathVariable @NotNull Long id,
            @RequestBody Map<String, Object> cloneRequest) {
        
        String newModelCode = (String) cloneRequest.get("newModelCode");
        String newModelName = (String) cloneRequest.get("newModelName");
        Boolean includeVariables = (Boolean) cloneRequest.getOrDefault("includeVariables", true);
        Boolean includeCharts = (Boolean) cloneRequest.getOrDefault("includeCharts", true);
        
        log.info("克隆财务模型[{}]为: {}, 包含变量: {}, 包含图表: {}", 
                id, newModelName, includeVariables, includeCharts);

        FinancialModel clonedModel = financialModelService.cloneModel(
            id, newModelCode, newModelName, includeVariables && includeCharts);
        
        // 设置克隆模型的创建人信息
        clonedModel.setCreatorId(LoginUserUtils.getCurrentSysUser().getCreatorId());
        clonedModel.setTenantId(TenantContextHolder.getTenant());
        
        log.info("财务模型克隆成功，新模型ID: {}", clonedModel.getId());
        return Result.succeed(clonedModel);
    }

    /**
     * 获取模型统计信息
     */
    @GetMapping("/{id}/statistics")
    @Operation(summary = "获取模型统计", description = "获取模型使用统计信息")
    public Result<Map<String, Object>> getModelStatistics(
            @PathVariable @NotNull Long id) {
        
        Map<String, Object> statistics = financialModelService.getModelStatistics(id);
        return Result.succeed(statistics);
    }

    /**
     * 验证模型完整性
     */
    @PostMapping("/{id}/validate")
    @Operation(summary = "验证模型", description = "验证模型配置的完整性和正确性")
    public Result<Map<String, Object>> validateModel(
            @PathVariable @NotNull Long id) {
        
        Map<String, Object> validationResult = financialModelService.validateModel(id);
        return Result.succeed(validationResult);
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
        return Result.succeed(success);
    }

    /**
     * 导出模型配置
     */
    @GetMapping("/{id}/export")
    @Operation(summary = "导出模型配置", description = "导出模型配置为JSON格式")
    public void exportModelConfig(
            @PathVariable @NotNull Long id,
            HttpServletResponse response,
            @LoginUser SysUser user) throws IOException {
        
        log.info("用户[{}]导出财务模型配置: {}", user.getUsername(), id);
        
        try {
            String configJson = financialModelService.exportModelConfig(id);
            
            // 设置响应头
            String fileName = URLEncoder.encode("财务模型配置_" + id + "_" + 
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")), 
                    StandardCharsets.UTF_8);
            response.setContentType("application/json");
            response.setCharacterEncoding("utf-8");
            response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".json");
            
            // 写入响应体
            response.getWriter().write(configJson);
            
            log.info("财务模型配置导出成功，ID: {}", id);
        } catch (Exception e) {
            log.error("财务模型配置导出失败，ID: {}, 错误: {}", id, e.getMessage(), e);
            throw e;
        }
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
        
        FinancialModel importedModel = financialModelService.importModelConfig(configJson, TenantContextHolder.getTenant());
        
        log.info("财务模型导入成功，ID: {}", importedModel.getId());
        return Result.succeed(importedModel);
    }

    /**
     * 获取模型分类汇总
     */
    @GetMapping("/categories/summary")
    @Operation(summary = "获取分类汇总", description = "获取模型分类统计信息")
    public Result<List<Map<String, Object>>> getCategorySummary(
            @LoginUser SysUser user) {
        
        List<Map<String, Object>> summary = financialModelService.getCategorySummary(TenantContextHolder.getTenant());
        return Result.succeed(summary);
    }

    /**
     * 获取最近使用的模型
     */
    @GetMapping("/recent")
    @Operation(summary = "获取最近使用模型", description = "获取用户最近使用的财务模型")
    public Result<List<FinancialModel>> getRecentlyUsedModels(
            @RequestParam(defaultValue = "10") int limit,
            @LoginUser SysUser user) {
        
        List<FinancialModel> recentModels = financialModelService.getRecentlyUsedModels(TenantContextHolder.getTenant(), limit);
        return Result.succeed(recentModels);
    }

    /**
     * 根据模型编码获取模型
     */
    @GetMapping("/code/{modelCode}")
    @Operation(summary = "根据编码获取模型", description = "通过模型编码查询财务模型")
    public Result<FinancialModel> getModelByCode(
            @PathVariable String modelCode,
            @LoginUser SysUser user) {
        
        FinancialModel model = financialModelService.getByModelCode(modelCode, TenantContextHolder.getTenant());
        return Result.succeed(model);
    }

    /**
     * 导出单个财务模型到Excel
     */
    @GetMapping("/{id}/export/excel")
    @Operation(summary = "导出模型到Excel", description = "将财务模型及其相关数据导出到Excel文件")
    public void exportModelToExcel(
            @PathVariable @NotNull Long id,
            HttpServletResponse response,
            @LoginUser SysUser user) throws IOException {
        
        log.info("用户[{}]导出财务模型到Excel: {}", user.getUsername(), id);
        
        try {
            financialModelExportService.exportModelToExcel(id, response);
            log.info("财务模型Excel导出成功，ID: {}", id);
        } catch (Exception e) {
            log.error("财务模型Excel导出失败，ID: {}, 错误: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 批量导出财务模型到Excel
     */
    @PostMapping("/export/excel/batch")
    @Operation(summary = "批量导出模型到Excel", description = "将多个财务模型及其相关数据导出到Excel文件")
    public void exportModelsToExcel(
            @RequestBody List<Long> modelIds,
            HttpServletResponse response,
            @LoginUser SysUser user) throws IOException {
        
        log.info("用户[{}]批量导出财务模型到Excel: {}", user.getUsername(), modelIds);
        
        try {
            financialModelExportService.exportModelsToExcel(modelIds, response);
            log.info("财务模型批量Excel导出成功，共导出 {} 个模型", modelIds.size());
        } catch (Exception e) {
            log.error("财务模型批量Excel导出失败，错误: {}", e.getMessage(), e);
            throw e;
        }
    }

    /**
     * 导出所有财务模型到Excel
     */
    @GetMapping("/export/excel/all")
    @Operation(summary = "导出所有模型到Excel", description = "将所有财务模型及其相关数据导出到Excel文件")
    public void exportAllModelsToExcel(
            HttpServletResponse response,
            @LoginUser SysUser user) throws IOException {
        
        log.info("用户[{}]导出所有财务模型到Excel", user.getUsername());
        
        try {
            financialModelExportService.exportAllModelsToExcel(response);
            log.info("所有财务模型Excel导出成功");
        } catch (Exception e) {
            log.error("所有财务模型Excel导出失败，错误: {}", e.getMessage(), e);
            throw e;
        }
    }
} 