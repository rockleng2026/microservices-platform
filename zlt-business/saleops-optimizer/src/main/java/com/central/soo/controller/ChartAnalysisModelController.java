package com.central.soo.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.common.annotation.LoginUser;
import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.common.model.SysUser;
import com.central.soo.model.entity.ChartAnalysisModel;
import com.central.soo.service.ChartAnalysisModelService;
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
import java.util.ArrayList;
import java.util.HashMap;
import com.central.soo.model.entity.ChartSeries;
import com.central.soo.service.ChartSeriesService;

/**
 * 图表分析模型配置控制器
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/api/soo/v2/chart-models")
@Tag(name = "图表分析模型管理", description = "自定义图表分析模型配置API")
@Validated
public class ChartAnalysisModelController {

    @Autowired
    private ChartAnalysisModelService chartAnalysisModelService;

    @Autowired
    private ChartSeriesService chartSeriesService;

    // ==================== 基础CRUD ====================

    /**
     * 创建图表分析模型
     */
    @PostMapping
    @Operation(summary = "创建图表分析模型", description = "创建新的图表分析模型配置")
    public Result<ChartAnalysisModel> createChartModel(
            @Valid @RequestBody ChartAnalysisModel chartModel,
            @LoginUser SysUser user) {
        
        log.info("用户[{}]创建图表分析模型: {}", user.getUsername(), chartModel.getChartName());
        
        try {
            ChartAnalysisModel createdModel = chartAnalysisModelService.createChartModel(chartModel);
            log.info("图表分析模型创建成功，ID: {}", createdModel.getId());
            return Result.succeed(createdModel);
        } catch (Exception e) {
            log.error("创建图表分析模型失败", e);
            return Result.failed("创建失败: " + e.getMessage());
        }
    }

    /**
     * 获取图表模型列表
     */
    @GetMapping
    @Operation(summary = "获取图表模型列表", description = "分页查询图表分析模型列表")
    public Result<PageResult<ChartAnalysisModel>> getChartModels(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long modelId,
            @RequestParam(required = false) String chartName,
            @RequestParam(required = false) String chartType,
            @LoginUser SysUser user) {
        
        try {
            Page<ChartAnalysisModel> pageInfo = new Page<>(page, size);
            PageResult<ChartAnalysisModel> result = chartAnalysisModelService.pageChartModels(
                    pageInfo, modelId, chartName, chartType);
            
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("查询图表模型列表失败", e);
            return Result.failed("查询失败: " + e.getMessage());
        }
    }

    /**
     * 获取图表模型详情
     */
    @GetMapping("/{chartId}")
    @Operation(summary = "获取图表模型详情", description = "获取图表分析模型详细信息")
    public Result<ChartAnalysisModel> getChartModelDetail(
            @PathVariable @NotNull Long chartId) {
        
        try {
            ChartAnalysisModel chartModel = chartAnalysisModelService.getChartModelWithSeries(chartId);
            if (chartModel == null) {
                return Result.failed("图表模型不存在");
            }
            return Result.succeed(chartModel);
        } catch (Exception e) {
            log.error("获取图表模型详情失败", e);
            return Result.failed("获取详情失败: " + e.getMessage());
        }
    }

    /**
     * 更新图表分析模型
     */
    @PutMapping("/{chartId}")
    @Operation(summary = "更新图表分析模型", description = "更新现有图表分析模型配置")
    public Result<ChartAnalysisModel> updateChartModel(
            @PathVariable @NotNull Long chartId,
            @Valid @RequestBody ChartAnalysisModel chartModel,
            @LoginUser SysUser user) {
        
        log.info("用户[{}]更新图表分析模型[{}]: {}", user.getUsername(), chartId, chartModel.getChartName());
        
        try {
            chartModel.setId(chartId);
            ChartAnalysisModel updatedModel = chartAnalysisModelService.updateChartModel(chartModel);
            
            log.info("图表分析模型更新成功，ID: {}", updatedModel.getId());
            return Result.succeed(updatedModel);
        } catch (Exception e) {
            log.error("更新图表分析模型失败", e);
            return Result.failed("更新失败: " + e.getMessage());
        }
    }

    /**
     * 删除图表分析模型
     */
    @DeleteMapping("/{chartId}")
    @Operation(summary = "删除图表分析模型", description = "删除图表分析模型及相关配置")
    public Result<Boolean> deleteChartModel(
            @PathVariable @NotNull Long chartId,
            @LoginUser SysUser user) {
        
        log.info("用户[{}]删除图表分析模型: {}", user.getUsername(), chartId);
        
        try {
            boolean success = chartAnalysisModelService.deleteChartModel(chartId);
            
            if (success) {
                log.info("图表分析模型删除成功，ID: {}", chartId);
                return Result.succeed(true);
            } else {
                return Result.failed("删除失败");
            }
        } catch (Exception e) {
            log.error("删除图表分析模型失败", e);
            return Result.failed("删除失败: " + e.getMessage());
        }
    }

    /**
     * 批量删除图表分析模型
     */
    @PostMapping("/batch-delete")
    @Operation(summary = "批量删除图表分析模型", description = "批量删除多个图表分析模型")
    public Result<Boolean> batchDeleteChartModels(
            @RequestBody List<Long> chartIds,
            @LoginUser SysUser user) {
        
        log.info("用户[{}]批量删除图表分析模型: {}", user.getUsername(), chartIds);
        
        try {
            boolean success = chartAnalysisModelService.batchDeleteChartModels(chartIds);
            
            if (success) {
                log.info("批量删除图表分析模型成功，数量: {}", chartIds.size());
                return Result.succeed(true);
            } else {
                return Result.failed("批量删除失败");
            }
        } catch (Exception e) {
            log.error("批量删除图表分析模型失败", e);
            return Result.failed("批量删除失败: " + e.getMessage());
        }
    }

    // ==================== 业务方法 ====================

    /**
     * 复制图表分析模型
     */
    @PostMapping("/{chartId}/copy")
    @Operation(summary = "复制图表分析模型", description = "基于现有模型创建新的图表配置")
    public Result<ChartAnalysisModel> copyChartModel(
            @PathVariable @NotNull Long chartId,
            @RequestBody Map<String, Object> copyRequest,
            @LoginUser SysUser user) {
        
        try {
            Long targetModelId = Long.valueOf(copyRequest.get("targetModelId").toString());
            String newChartName = (String) copyRequest.get("newChartName");
            
            log.info("用户[{}]复制图表分析模型[{}]为: {}", user.getUsername(), chartId, newChartName);
            
            ChartAnalysisModel copiedModel = chartAnalysisModelService.copyChartModel(
                    chartId, targetModelId, newChartName);
            
            log.info("图表分析模型复制成功，新模型ID: {}", copiedModel.getId());
            return Result.succeed(copiedModel);
        } catch (Exception e) {
            log.error("复制图表分析模型失败", e);
            return Result.failed("复制失败: " + e.getMessage());
        }
    }

    /**
     * 验证图表模型配置
     */
    @PostMapping("/{chartId}/validate")
    @Operation(summary = "验证图表模型", description = "验证图表模型配置的完整性和正确性")
    public Result<Map<String, Object>> validateChartModel(
            @PathVariable @NotNull Long chartId) {
        
        try {
            Map<String, Object> validationResult = chartAnalysisModelService.validateChartModel(chartId);
            return Result.succeed(validationResult);
        } catch (Exception e) {
            log.error("验证图表模型失败", e);
            return Result.failed("验证失败: " + e.getMessage());
        }
    }

    /**
     * 执行图表数据模拟
     */
    @PostMapping("/{chartId}/simulate")
    @Operation(summary = "执行图表数据模拟", description = "根据配置参数执行图表数据模拟计算")
    public Result<Map<String, Object>> simulateChartData(
            @PathVariable @NotNull Long chartId,
            @RequestBody Map<String, Object> parameters,
            @LoginUser SysUser user) {
        
        log.info("用户[{}]执行图表数据模拟: chartId={}", user.getUsername(), chartId);
        
        try {
            Map<String, Object> simulationResult = chartAnalysisModelService.simulateChartData(chartId, parameters);
            
            log.info("图表数据模拟完成: chartId={}, runId={}", 
                     chartId, simulationResult.get("runId"));
            return Result.succeed(simulationResult);
        } catch (Exception e) {
            log.error("执行图表数据模拟失败", e);
            return Result.failed("模拟失败: " + e.getMessage());
        }
    }

    /**
     * 生成预设图表配置
     */
    @PostMapping("/preset")
    @Operation(summary = "生成预设图表配置", description = "根据财务模型和图表类型生成预设配置")
    public Result<ChartAnalysisModel> generatePresetConfig(
            @RequestParam Long modelId,
            @RequestParam String chartType,
            @LoginUser SysUser user) {
        
        log.info("用户[{}]生成预设图表配置: modelId={}, chartType={}", 
                 user.getUsername(), modelId, chartType);
        
        try {
            ChartAnalysisModel presetConfig = chartAnalysisModelService.generatePresetChartConfig(modelId, chartType);
            return Result.succeed(presetConfig);
        } catch (Exception e) {
            log.error("生成预设图表配置失败", e);
            return Result.failed("生成失败: " + e.getMessage());
        }
    }

    /**
     * 更新模拟步数
     */
    @PutMapping("/simulation-steps")
    @Operation(summary = "更新模拟步数", description = "批量更新图表的模拟步数")
    public Result<Boolean> updateSimulationSteps(
            @RequestBody Map<String, Object> updateRequest,
            @LoginUser SysUser user) {
        
        try {
            @SuppressWarnings("unchecked")
            List<Long> chartIds = (List<Long>) updateRequest.get("chartIds");
            Integer simulationSteps = (Integer) updateRequest.get("simulationSteps");
            
            log.info("用户[{}]更新图表模拟步数: chartIds={}, steps={}", 
                     user.getUsername(), chartIds, simulationSteps);
            
            boolean success = chartAnalysisModelService.updateSimulationSteps(chartIds, simulationSteps);
            return Result.succeed(success);
        } catch (Exception e) {
            log.error("更新模拟步数失败", e);
            return Result.failed("更新失败: " + e.getMessage());
        }
    }

    // ==================== 查询方法 ====================

    /**
     * 根据财务模型获取图表列表
     */
    @GetMapping("/model/{modelId}")
    @Operation(summary = "获取模型的图表列表", description = "获取指定财务模型下的所有图表配置")
    public Result<List<ChartAnalysisModel>> getChartsByModel(
            @PathVariable @NotNull Long modelId) {
        
        try {
            List<ChartAnalysisModel> charts = chartAnalysisModelService.getChartModelsByModelId(modelId);
            return Result.succeed(charts);
        } catch (Exception e) {
            log.error("获取模型图表列表失败", e);
            return Result.failed("获取失败: " + e.getMessage());
        }
    }

    /**
     * 获取图表的完整配置（包括图表模型和系列配置）
     */
    @GetMapping("/{chartId}/complete")
    @Operation(summary = "获取图表完整配置", description = "获取图表分析模型的完整配置，包括系列配置信息")
    public Result<Map<String, Object>> getChartCompleteConfig(
            @PathVariable @NotNull Long chartId) {
        
        try {
            ChartAnalysisModel chartModel = chartAnalysisModelService.getChartModelWithSeries(chartId);
            if (chartModel == null) {
                return Result.failed("图表模型不存在");
            }
            
            // 获取系列配置
            List<ChartSeries> seriesList = chartSeriesService.getByChartId(chartId);
            
            // 构建完整配置
            Map<String, Object> completeConfig = new HashMap<>();
            completeConfig.put("chartModel", chartModel);
            completeConfig.put("seriesList", seriesList);
            
            return Result.succeed(completeConfig);
        } catch (Exception e) {
            log.error("获取图表完整配置失败", e);
            return Result.failed("获取失败: " + e.getMessage());
        }
    }

    /**
     * 获取模型下所有图表的完整配置
     */
    @GetMapping("/model/{modelId}/complete")
    @Operation(summary = "获取模型下所有图表完整配置", description = "获取指定财务模型下所有图表的完整配置，包括系列配置信息")
    public Result<List<Map<String, Object>>> getModelChartsCompleteConfig(
            @PathVariable @NotNull Long modelId) {
        
        try {
            List<ChartAnalysisModel> charts = chartAnalysisModelService.getChartModelsByModelId(modelId);
            List<Map<String, Object>> completeConfigs = new ArrayList<>();
            
            for (ChartAnalysisModel chart : charts) {
                Map<String, Object> config = new HashMap<>();
                config.put("chartModel", chart);
                
                // 获取每个图表的系列配置
                List<ChartSeries> seriesList = chartSeriesService.getByChartId(chart.getId());
                config.put("seriesList", seriesList);
                
                completeConfigs.add(config);
            }
            
            return Result.succeed(completeConfigs);
        } catch (Exception e) {
            log.error("获取模型图表完整配置失败", e);
            return Result.failed("获取失败: " + e.getMessage());
        }
    }

    /**
     * 根据字段查询图表
     */
    @GetMapping("/field/{fieldName}")
    @Operation(summary = "根据字段查询图表", description = "查询使用指定字段的所有图表配置")
    public Result<List<ChartAnalysisModel>> getChartsByField(
            @PathVariable String fieldName) {
        
        try {
            List<ChartAnalysisModel> charts = chartAnalysisModelService.getChartModelsByField(fieldName);
            return Result.succeed(charts);
        } catch (Exception e) {
            log.error("根据字段查询图表失败", e);
            return Result.failed("查询失败: " + e.getMessage());
        }
    }

    // ==================== 统计分析 ====================

    /**
     * 获取图表统计信息
     */
    @GetMapping("/statistics/models")
    @Operation(summary = "获取模型图表统计", description = "获取各财务模型的图表数量统计")
    public Result<List<Map<String, Object>>> getModelChartStats() {
        
        try {
            List<Map<String, Object>> statistics = chartAnalysisModelService.countChartsByModel();
            return Result.succeed(statistics);
        } catch (Exception e) {
            log.error("获取模型图表统计失败", e);
            return Result.failed("获取统计失败: " + e.getMessage());
        }
    }

    /**
     * 获取图表类型统计
     */
    @GetMapping("/statistics/types")
    @Operation(summary = "获取图表类型统计", description = "获取各图表类型的使用统计")
    public Result<List<Map<String, Object>>> getChartTypeStats() {
        
        try {
            List<Map<String, Object>> statistics = chartAnalysisModelService.countChartsByType();
            return Result.succeed(statistics);
        } catch (Exception e) {
            log.error("获取图表类型统计失败", e);
            return Result.failed("获取统计失败: " + e.getMessage());
        }
    }

    /**
     * 获取图表使用统计
     */
    @GetMapping("/{chartId}/usage-stats")
    @Operation(summary = "获取图表使用统计", description = "获取图表的使用历史统计信息")
    public Result<Map<String, Object>> getChartUsageStats(
            @PathVariable @NotNull Long chartId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        try {
            Map<String, Object> statistics = chartAnalysisModelService.getChartUsageStats(chartId, startDate, endDate);
            return Result.succeed(statistics);
        } catch (Exception e) {
            log.error("获取图表使用统计失败", e);
            return Result.failed("获取统计失败: " + e.getMessage());
        }
    }

    // ==================== 数据导入导出 ====================

    /**
     * 导出图表配置
     */
    @PostMapping("/export")
    @Operation(summary = "导出图表配置", description = "导出指定图表的配置信息")
    public Result<String> exportChartConfigs(
            @RequestBody List<Long> chartIds,
            @LoginUser SysUser user) {
        
        log.info("用户[{}]导出图表配置: {}", user.getUsername(), chartIds);
        
        try {
            String configJson = chartAnalysisModelService.exportChartConfigs(chartIds);
            return Result.succeed(configJson);
        } catch (Exception e) {
            log.error("导出图表配置失败", e);
            return Result.failed("导出失败: " + e.getMessage());
        }
    }

    /**
     * 导入图表配置
     */
    @PostMapping("/import")
    @Operation(summary = "导入图表配置", description = "从JSON配置导入图表分析模型")
    public Result<List<ChartAnalysisModel>> importChartConfigs(
            @RequestBody Map<String, Object> importRequest,
            @LoginUser SysUser user) {
        
        try {
            String configJson = (String) importRequest.get("configJson");
            Long targetModelId = Long.valueOf(importRequest.get("targetModelId").toString());
            
            log.info("用户[{}]导入图表配置到模型: {}", user.getUsername(), targetModelId);
            
            List<ChartAnalysisModel> importedCharts = chartAnalysisModelService.importChartConfigs(configJson, targetModelId);
            
            log.info("图表配置导入成功，数量: {}", importedCharts.size());
            return Result.succeed(importedCharts);
        } catch (Exception e) {
            log.error("导入图表配置失败", e);
            return Result.failed("导入失败: " + e.getMessage());
        }
    }

    // ==================== 模板管理 ====================

    /**
     * 保存为模板
     */
    @PostMapping("/{chartId}/save-template")
    @Operation(summary = "保存为模板", description = "将图表配置保存为模板")
    public Result<Boolean> saveAsTemplate(
            @PathVariable @NotNull Long chartId,
            @RequestParam String templateName,
            @LoginUser SysUser user) {
        
        log.info("用户[{}]保存图表模板: chartId={}, templateName={}", 
                 user.getUsername(), chartId, templateName);
        
        try {
            boolean success = chartAnalysisModelService.saveAsTemplate(chartId, templateName);
            return Result.succeed(success);
        } catch (Exception e) {
            log.error("保存图表模板失败", e);
            return Result.failed("保存失败: " + e.getMessage());
        }
    }

    /**
     * 从模板创建图表
     */
    @PostMapping("/create-from-template")
    @Operation(summary = "从模板创建图表", description = "根据模板创建新的图表配置")
    public Result<ChartAnalysisModel> createFromTemplate(
            @RequestParam String templateName,
            @RequestParam Long modelId,
            @RequestParam String chartName,
            @LoginUser SysUser user) {
        
        log.info("用户[{}]从模板创建图表: template={}, modelId={}, chartName={}", 
                 user.getUsername(), templateName, modelId, chartName);
        
        try {
            ChartAnalysisModel createdChart = chartAnalysisModelService.createFromTemplate(
                    templateName, modelId, chartName);
            return Result.succeed(createdChart);
        } catch (Exception e) {
            log.error("从模板创建图表失败", e);
            return Result.failed("创建失败: " + e.getMessage());
        }
    }

    /**
     * 获取图表模板列表
     */
    @GetMapping("/templates")
    @Operation(summary = "获取图表模板列表", description = "获取所有可用的图表模板")
    public Result<List<Map<String, Object>>> getChartTemplates() {
        
        try {
            List<Map<String, Object>> templates = chartAnalysisModelService.getChartTemplates();
            return Result.succeed(templates);
        } catch (Exception e) {
            log.error("获取图表模板列表失败", e);
            return Result.failed("获取失败: " + e.getMessage());
        }
    }

    // ==================== 维护方法 ====================

    /**
     * 清理无效图表
     */
    @PostMapping("/cleanup")
    @Operation(summary = "清理无效图表", description = "清理系统中的无效图表配置")
    public Result<Integer> cleanupInvalidCharts(@LoginUser SysUser user) {
        
        log.info("用户[{}]执行图表清理操作", user.getUsername());
        
        try {
            int cleanedCount = chartAnalysisModelService.cleanupInvalidCharts();
            
            log.info("图表清理完成，清理数量: {}", cleanedCount);
            return Result.succeed(cleanedCount);
        } catch (Exception e) {
            log.error("清理无效图表失败", e);
            return Result.failed("清理失败: " + e.getMessage());
        }
    }
} 