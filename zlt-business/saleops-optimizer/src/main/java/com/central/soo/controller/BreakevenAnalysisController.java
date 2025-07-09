package com.central.soo.controller;

import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.soo.model.dto.BreakevenAnalysisDTO;
import com.central.soo.model.dto.BreakevenQueryDTO;
import com.central.soo.model.entity.BreakevenAnalysis;
import com.central.soo.model.entity.BreakevenForecast;
import com.central.soo.model.entity.BreakevenScenario;
import com.central.soo.model.entity.BreakevenSensitivity;
import com.central.soo.service.IBreakevenAnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * 盈亏平衡分析控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/soo/breakeven")
@Tag(name = "盈亏平衡分析管理")
public class BreakevenAnalysisController {

    @Autowired
    private IBreakevenAnalysisService breakevenAnalysisService;

    // ==================== 分析管理 ====================

    @PostMapping("/analysis")
    @Operation(summary = "创建盈亏平衡分析")
    public Result<BreakevenAnalysis> createAnalysis(@Valid @RequestBody BreakevenAnalysisDTO analysisDTO) {
        try {
            log.info("创建盈亏平衡分析: {}", analysisDTO.getAnalysisName());
            return breakevenAnalysisService.createAnalysis(analysisDTO);
        } catch (Exception e) {
            log.error("创建盈亏平衡分析失败", e);
            return Result.failed("创建分析失败: " + e.getMessage());
        }
    }

    @GetMapping("/analysis")
    @Operation(summary = "分页查询盈亏平衡分析列表")
    public PageResult<BreakevenAnalysis> getAnalysisList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String analysisId,
            @RequestParam(required = false) String analysisName,
            @RequestParam(required = false) String analysisType,
            @RequestParam(required = false) String analysisPeriod,
            @RequestParam(required = false) String periodStart,
            @RequestParam(required = false) String periodEnd,
            @RequestParam(required = false) Long creatorId,
            @RequestParam(required = false) String creatorName,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) List<String> statusList,
            @RequestParam(required = false) Boolean isRealTime,
            @RequestParam(required = false) Boolean autoRecalculation,
            @RequestParam(required = false) String createdStart,
            @RequestParam(required = false) String createdEnd,
            @RequestParam(required = false) String lastRecalculationStart,
            @RequestParam(required = false) String lastRecalculationEnd,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "created_at") String sortField,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(defaultValue = "false") Boolean includeDetails) {
        
        try {
            log.info("查询盈亏平衡分析列表: page={}, size={}, keyword={}", page, size, keyword);
            
            BreakevenQueryDTO queryDTO = new BreakevenQueryDTO();
            queryDTO.setPage(page);
            queryDTO.setSize(size);
            queryDTO.setAnalysisId(analysisId);
            queryDTO.setAnalysisName(analysisName);
            queryDTO.setAnalysisType(analysisType);
            queryDTO.setAnalysisPeriod(analysisPeriod);
            queryDTO.setPeriodStart(periodStart);
            queryDTO.setPeriodEnd(periodEnd);
            queryDTO.setCreatorId(creatorId);
            queryDTO.setCreatorName(creatorName);
            queryDTO.setStatus(status);
            queryDTO.setStatusList(statusList);
            queryDTO.setIsRealTime(isRealTime);
            queryDTO.setAutoRecalculation(autoRecalculation);
            queryDTO.setCreatedStart(createdStart);
            queryDTO.setCreatedEnd(createdEnd);
            queryDTO.setLastRecalculationStart(lastRecalculationStart);
            queryDTO.setLastRecalculationEnd(lastRecalculationEnd);
            queryDTO.setKeyword(keyword);
            queryDTO.setSortField(sortField);
            queryDTO.setSortDirection(sortDirection);
            queryDTO.setIncludeDetails(includeDetails);
            
            return breakevenAnalysisService.getAnalysisList(queryDTO);
        } catch (Exception e) {
            log.error("查询盈亏平衡分析列表失败", e);
            return PageResult.failed("查询失败: " + e.getMessage());
        }
    }

    @GetMapping("/analysis/{analysisId}")
    @Operation(summary = "获取分析详情")
    public Result<BreakevenAnalysis> getAnalysisDetail(@PathVariable String analysisId) {
        try {
            log.info("获取分析详情: {}", analysisId);
            return breakevenAnalysisService.getAnalysisDetail(analysisId);
        } catch (Exception e) {
            log.error("获取分析详情失败", e);
            return Result.failed("获取详情失败: " + e.getMessage());
        }
    }

    @PostMapping("/analysis/{analysisId}/recalculate")
    @Operation(summary = "重新计算分析")
    public Result<BreakevenAnalysis> recalculateAnalysis(@PathVariable String analysisId) {
        try {
            log.info("重新计算分析: {}", analysisId);
            return breakevenAnalysisService.recalculateAnalysis(analysisId);
        } catch (Exception e) {
            log.error("重新计算分析失败", e);
            return Result.failed("重新计算失败: " + e.getMessage());
        }
    }

    @PutMapping("/analysis/{analysisId}")
    @Operation(summary = "更新分析配置")
    public Result<BreakevenAnalysis> updateAnalysis(@PathVariable String analysisId, 
                                                   @Valid @RequestBody BreakevenAnalysisDTO analysisDTO) {
        try {
            log.info("更新分析配置: {}", analysisId);
            return breakevenAnalysisService.updateAnalysis(analysisId, analysisDTO);
        } catch (Exception e) {
            log.error("更新分析配置失败", e);
            return Result.failed("更新失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/analysis/{analysisId}")
    @Operation(summary = "删除分析")
    public Result<String> deleteAnalysis(@PathVariable String analysisId) {
        try {
            log.info("删除分析: {}", analysisId);
            return breakevenAnalysisService.deleteAnalysis(analysisId);
        } catch (Exception e) {
            log.error("删除分析失败", e);
            return Result.failed("删除失败: " + e.getMessage());
        }
    }

    @PostMapping("/analysis/batch-delete")
    @Operation(summary = "批量删除分析")
    public Result<String> batchDeleteAnalysis(@RequestBody List<String> analysisIds) {
        try {
            log.info("批量删除分析: {}", analysisIds);
            return breakevenAnalysisService.batchDeleteAnalysis(analysisIds);
        } catch (Exception e) {
            log.error("批量删除分析失败", e);
            return Result.failed("批量删除失败: " + e.getMessage());
        }
    }

    @PostMapping("/analysis/{analysisId}/archive")
    @Operation(summary = "归档分析")
    public Result<String> archiveAnalysis(@PathVariable String analysisId) {
        try {
            log.info("归档分析: {}", analysisId);
            return breakevenAnalysisService.archiveAnalysis(analysisId);
        } catch (Exception e) {
            log.error("归档分析失败", e);
            return Result.failed("归档失败: " + e.getMessage());
        }
    }

    @PostMapping("/analysis/{analysisId}/copy")
    @Operation(summary = "复制分析")
    public Result<BreakevenAnalysis> copyAnalysis(@PathVariable String analysisId, 
                                                 @RequestParam String newAnalysisName) {
        try {
            log.info("复制分析: {} -> {}", analysisId, newAnalysisName);
            return breakevenAnalysisService.copyAnalysis(analysisId, newAnalysisName);
        } catch (Exception e) {
            log.error("复制分析失败", e);
            return Result.failed("复制失败: " + e.getMessage());
        }
    }

    // ==================== 场景分析 ====================

    @GetMapping("/analysis/{analysisId}/scenarios")
    @Operation(summary = "获取分析的场景列表")
    public Result<List<BreakevenScenario>> getScenarios(@PathVariable String analysisId) {
        try {
            log.info("获取场景列表: {}", analysisId);
            return breakevenAnalysisService.getScenarios(analysisId);
        } catch (Exception e) {
            log.error("获取场景列表失败", e);
            return Result.failed("获取场景列表失败: " + e.getMessage());
        }
    }

    @PostMapping("/analysis/{analysisId}/scenarios")
    @Operation(summary = "添加场景")
    public Result<BreakevenScenario> addScenario(@PathVariable String analysisId, 
                                                @Valid @RequestBody BreakevenAnalysisDTO.ScenarioConfig scenarioConfig) {
        try {
            log.info("添加场景: {} - {}", analysisId, scenarioConfig.getScenarioName());
            return breakevenAnalysisService.addScenario(analysisId, scenarioConfig);
        } catch (Exception e) {
            log.error("添加场景失败", e);
            return Result.failed("添加场景失败: " + e.getMessage());
        }
    }

    @PutMapping("/scenarios/{scenarioId}")
    @Operation(summary = "更新场景")
    public Result<BreakevenScenario> updateScenario(@PathVariable String scenarioId, 
                                                   @Valid @RequestBody BreakevenAnalysisDTO.ScenarioConfig scenarioConfig) {
        try {
            log.info("更新场景: {}", scenarioId);
            return breakevenAnalysisService.updateScenario(scenarioId, scenarioConfig);
        } catch (Exception e) {
            log.error("更新场景失败", e);
            return Result.failed("更新场景失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/scenarios/{scenarioId}")
    @Operation(summary = "删除场景")
    public Result<String> deleteScenario(@PathVariable String scenarioId) {
        try {
            log.info("删除场景: {}", scenarioId);
            return breakevenAnalysisService.deleteScenario(scenarioId);
        } catch (Exception e) {
            log.error("删除场景失败", e);
            return Result.failed("删除场景失败: " + e.getMessage());
        }
    }

    @PostMapping("/scenarios/compare")
    @Operation(summary = "比较场景")
    public Result<Map<String, Object>> compareScenarios(@RequestBody List<String> scenarioIds) {
        try {
            log.info("比较场景: {}", scenarioIds);
            return breakevenAnalysisService.compareScenarios(scenarioIds);
        } catch (Exception e) {
            log.error("比较场景失败", e);
            return Result.failed("比较场景失败: " + e.getMessage());
        }
    }

    // ==================== 敏感性分析 ====================

    @GetMapping("/analysis/{analysisId}/sensitivity")
    @Operation(summary = "获取敏感性分析结果")
    public Result<List<BreakevenSensitivity>> getSensitivityAnalysis(@PathVariable String analysisId) {
        try {
            log.info("获取敏感性分析结果: {}", analysisId);
            return breakevenAnalysisService.getSensitivityAnalysis(analysisId);
        } catch (Exception e) {
            log.error("获取敏感性分析结果失败", e);
            return Result.failed("获取敏感性分析失败: " + e.getMessage());
        }
    }

    @PostMapping("/analysis/{analysisId}/sensitivity/recalculate")
    @Operation(summary = "重新进行敏感性分析")
    public Result<List<BreakevenSensitivity>> recalculateSensitivity(@PathVariable String analysisId, 
                                                                   @Valid @RequestBody BreakevenAnalysisDTO.SensitivityConfig sensitivityConfig) {
        try {
            log.info("重新进行敏感性分析: {}", analysisId);
            return breakevenAnalysisService.recalculateSensitivity(analysisId, sensitivityConfig);
        } catch (Exception e) {
            log.error("重新进行敏感性分析失败", e);
            return Result.failed("敏感性分析失败: " + e.getMessage());
        }
    }

    @GetMapping("/analysis/{analysisId}/sensitivity/ranking")
    @Operation(summary = "获取参数敏感性排名")
    public Result<List<Map<String, Object>>> getSensitivityRanking(@PathVariable String analysisId) {
        try {
            log.info("获取参数敏感性排名: {}", analysisId);
            return breakevenAnalysisService.getSensitivityRanking(analysisId);
        } catch (Exception e) {
            log.error("获取参数敏感性排名失败", e);
            return Result.failed("获取敏感性排名失败: " + e.getMessage());
        }
    }

    // ==================== 预测分析 ====================

    @GetMapping("/analysis/{analysisId}/forecast")
    @Operation(summary = "获取预测分析结果")
    public Result<BreakevenForecast> getForecastAnalysis(@PathVariable String analysisId) {
        try {
            log.info("获取预测分析结果: {}", analysisId);
            return breakevenAnalysisService.getForecastAnalysis(analysisId);
        } catch (Exception e) {
            log.error("获取预测分析结果失败", e);
            return Result.failed("获取预测分析失败: " + e.getMessage());
        }
    }

    @PostMapping("/analysis/{analysisId}/forecast/recalculate")
    @Operation(summary = "重新进行预测分析")
    public Result<BreakevenForecast> recalculateForecast(@PathVariable String analysisId, 
                                                        @Valid @RequestBody BreakevenAnalysisDTO.ForecastConfig forecastConfig) {
        try {
            log.info("重新进行预测分析: {}", analysisId);
            return breakevenAnalysisService.recalculateForecast(analysisId, forecastConfig);
        } catch (Exception e) {
            log.error("重新进行预测分析失败", e);
            return Result.failed("预测分析失败: " + e.getMessage());
        }
    }

    @GetMapping("/analysis/{analysisId}/forecast/trends")
    @Operation(summary = "获取预测趋势图数据")
    public Result<Map<String, Object>> getForecastTrends(@PathVariable String analysisId) {
        try {
            log.info("获取预测趋势图数据: {}", analysisId);
            return breakevenAnalysisService.getForecastTrends(analysisId);
        } catch (Exception e) {
            log.error("获取预测趋势图数据失败", e);
            return Result.failed("获取趋势图数据失败: " + e.getMessage());
        }
    }

    // ==================== 统计分析 ====================

    @GetMapping("/statistics")
    @Operation(summary = "获取分析统计信息")
    public Result<Map<String, Object>> getAnalysisStatistics(BreakevenQueryDTO queryDTO) {
        try {
            log.info("获取分析统计信息");
            return breakevenAnalysisService.getAnalysisStatistics(queryDTO);
        } catch (Exception e) {
            log.error("获取分析统计信息失败", e);
            return Result.failed("获取统计信息失败: " + e.getMessage());
        }
    }

    @GetMapping("/analysis/{analysisId}/history")
    @Operation(summary = "获取分析执行历史")
    public Result<List<Map<String, Object>>> getAnalysisHistory(@PathVariable String analysisId) {
        try {
            log.info("获取分析执行历史: {}", analysisId);
            return breakevenAnalysisService.getAnalysisHistory(analysisId);
        } catch (Exception e) {
            log.error("获取分析执行历史失败", e);
            return Result.failed("获取执行历史失败: " + e.getMessage());
        }
    }

    @GetMapping("/analysis/{analysisId}/cost-structure")
    @Operation(summary = "获取成本结构分析")
    public Result<Map<String, Object>> getCostStructureAnalysis(@PathVariable String analysisId) {
        try {
            log.info("获取成本结构分析: {}", analysisId);
            return breakevenAnalysisService.getCostStructureAnalysis(analysisId);
        } catch (Exception e) {
            log.error("获取成本结构分析失败", e);
            return Result.failed("获取成本结构分析失败: " + e.getMessage());
        }
    }

    @GetMapping("/analysis/{analysisId}/profitability")
    @Operation(summary = "获取盈利能力分析")
    public Result<Map<String, Object>> getProfitabilityAnalysis(@PathVariable String analysisId) {
        try {
            log.info("获取盈利能力分析: {}", analysisId);
            return breakevenAnalysisService.getProfitabilityAnalysis(analysisId);
        } catch (Exception e) {
            log.error("获取盈利能力分析失败", e);
            return Result.failed("获取盈利能力分析失败: " + e.getMessage());
        }
    }

    // ==================== 导出功能 ====================

    @PostMapping("/analysis/{analysisId}/export")
    @Operation(summary = "导出分析报告")
    public ResponseEntity<ByteArrayResource> exportAnalysisReport(@PathVariable String analysisId, 
                                                                 @RequestParam(defaultValue = "excel") String exportFormat) {
        try {
            log.info("导出分析报告: {}, 格式: {}", analysisId, exportFormat);
            
            byte[] reportBytes = breakevenAnalysisService.exportAnalysisReport(analysisId, exportFormat);
            
            if (reportBytes == null || reportBytes.length == 0) {
                return ResponseEntity.badRequest().build();
            }
            
            String fileName = generateReportFileName(analysisId, exportFormat);
            ByteArrayResource resource = new ByteArrayResource(reportBytes);
            
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName);
            headers.add(HttpHeaders.CONTENT_TYPE, getContentType(exportFormat));
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(reportBytes.length)
                    .body(resource);
        } catch (Exception e) {
            log.error("导出分析报告失败", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/export")
    @Operation(summary = "导出分析数据")
    public ResponseEntity<ByteArrayResource> exportAnalysisData(@RequestBody BreakevenQueryDTO queryDTO, 
                                                               @RequestParam(defaultValue = "excel") String exportFormat) {
        try {
            log.info("导出分析数据, 格式: {}", exportFormat);
            
            byte[] dataBytes = breakevenAnalysisService.exportAnalysisData(queryDTO, exportFormat);
            
            if (dataBytes == null || dataBytes.length == 0) {
                return ResponseEntity.badRequest().build();
            }
            
            String fileName = generateDataFileName(exportFormat);
            ByteArrayResource resource = new ByteArrayResource(dataBytes);
            
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName);
            headers.add(HttpHeaders.CONTENT_TYPE, getContentType(exportFormat));
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(dataBytes.length)
                    .body(resource);
        } catch (Exception e) {
            log.error("导出分析数据失败", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // ==================== 配置管理 ====================

    @GetMapping("/templates/{templateType}")
    @Operation(summary = "获取分析配置模板")
    public Result<BreakevenAnalysisDTO> getAnalysisTemplate(@PathVariable String templateType) {
        try {
            log.info("获取分析配置模板: {}", templateType);
            return breakevenAnalysisService.getAnalysisTemplate(templateType);
        } catch (Exception e) {
            log.error("获取分析配置模板失败", e);
            return Result.failed("获取模板失败: " + e.getMessage());
        }
    }

    @PostMapping("/templates/{templateName}")
    @Operation(summary = "保存分析配置模板")
    public Result<String> saveAnalysisTemplate(@PathVariable String templateName, 
                                              @Valid @RequestBody BreakevenAnalysisDTO analysisDTO) {
        try {
            log.info("保存分析配置模板: {}", templateName);
            return breakevenAnalysisService.saveAnalysisTemplate(templateName, analysisDTO);
        } catch (Exception e) {
            log.error("保存分析配置模板失败", e);
            return Result.failed("保存模板失败: " + e.getMessage());
        }
    }

    @GetMapping("/templates")
    @Operation(summary = "获取用户配置模板列表")
    public Result<List<Map<String, Object>>> getUserTemplates() {
        try {
            log.info("获取用户配置模板列表");
            return breakevenAnalysisService.getUserTemplates();
        } catch (Exception e) {
            log.error("获取用户配置模板列表失败", e);
            return Result.failed("获取模板列表失败: " + e.getMessage());
        }
    }

    // ==================== 自动化管理 ====================

    @PostMapping("/analysis/{analysisId}/auto-recalculation/enable")
    @Operation(summary = "启用自动重算")
    public Result<String> enableAutoRecalculation(@PathVariable String analysisId) {
        try {
            log.info("启用自动重算: {}", analysisId);
            return breakevenAnalysisService.enableAutoRecalculation(analysisId);
        } catch (Exception e) {
            log.error("启用自动重算失败", e);
            return Result.failed("启用自动重算失败: " + e.getMessage());
        }
    }

    @PostMapping("/analysis/{analysisId}/auto-recalculation/disable")
    @Operation(summary = "禁用自动重算")
    public Result<String> disableAutoRecalculation(@PathVariable String analysisId) {
        try {
            log.info("禁用自动重算: {}", analysisId);
            return breakevenAnalysisService.disableAutoRecalculation(analysisId);
        } catch (Exception e) {
            log.error("禁用自动重算失败", e);
            return Result.failed("禁用自动重算失败: " + e.getMessage());
        }
    }

    @PostMapping("/auto-recalculation/execute")
    @Operation(summary = "执行定时自动重算任务")
    public Result<String> executeScheduledRecalculation() {
        try {
            log.info("执行定时自动重算任务");
            return breakevenAnalysisService.executeScheduledRecalculation();
        } catch (Exception e) {
            log.error("执行定时自动重算任务失败", e);
            return Result.failed("执行定时任务失败: " + e.getMessage());
        }
    }

    @GetMapping("/analysis/{analysisId}/auto-recalculation/status")
    @Operation(summary = "获取自动重算状态")
    public Result<Map<String, Object>> getAutoRecalculationStatus(@PathVariable String analysisId) {
        try {
            log.info("获取自动重算状态: {}", analysisId);
            return breakevenAnalysisService.getAutoRecalculationStatus(analysisId);
        } catch (Exception e) {
            log.error("获取自动重算状态失败", e);
            return Result.failed("获取自动重算状态失败: " + e.getMessage());
        }
    }

    // ==================== 辅助方法 ====================

    /**
     * 生成报告文件名
     */
    private String generateReportFileName(String analysisId, String exportFormat) {
        String extension = "excel".equals(exportFormat) ? ".xlsx" : ".pdf";
        return "盈亏平衡分析报告_" + analysisId + "_" + 
               java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + 
               extension;
    }

    /**
     * 生成数据文件名
     */
    private String generateDataFileName(String exportFormat) {
        String extension = "excel".equals(exportFormat) ? ".xlsx" : ".csv";
        return "盈亏平衡分析数据_" + 
               java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + 
               extension;
    }

    /**
     * 获取内容类型
     */
    private String getContentType(String exportFormat) {
        switch (exportFormat.toLowerCase()) {
            case "excel":
                return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "pdf":
                return "application/pdf";
            case "csv":
                return "text/csv";
            default:
                return MediaType.APPLICATION_OCTET_STREAM_VALUE;
        }
    }
} 