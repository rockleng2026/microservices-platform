package com.central.soo.controller;

import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.soo.model.entity.FinancialModel;
import com.central.soo.model.entity.ModelVariable;
import com.central.soo.service.FinancialModelService;
import com.central.soo.service.IModelVariableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 盈亏平衡分析V2控制器
 * 基于财务模型和变量管理的新版盈亏平衡分析
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Tag(name = "盈亏平衡分析V2")
@Slf4j
@RestController
@RequestMapping("/api/soo/v2/breakeven")
public class BreakevenAnalysisV2Controller {

    @Autowired
    private FinancialModelService financialModelService;
    
    @Autowired
    private IModelVariableService modelVariableService;

    // ==================== 模型基础接口 ====================

    /**
     * 获取可用的财务模型列表
     */
    @Operation(summary = "获取可用的财务模型列表")
    @GetMapping("/models")
    public Result<List<Map<String, Object>>> getAvailableModels() {
        try {
            List<FinancialModel> models = financialModelService.getBreakevenModels();
            List<Map<String, Object>> result = models.stream().map(model -> {
                Map<String, Object> modelMap = new HashMap<>();
                modelMap.put("id", model.getId());
                modelMap.put("modelName", model.getModelName());
                modelMap.put("modelCode", model.getModelCode());
                modelMap.put("category", model.getModelCategory());
                modelMap.put("description", model.getModelDescription());
                modelMap.put("status", model.getIsActive() ? "active" : "inactive");
                modelMap.put("variableCount", modelVariableService.getVariableCountByModelId(model.getId()));
                return modelMap;
            }).toList();
            
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("获取财务模型列表失败", e);
            return Result.failed("获取模型列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取模型的变量列表
     */
    @Operation(summary = "获取模型的变量列表")
    @GetMapping("/models/{modelId}/variables")
    public Result<List<Map<String, Object>>> getModelVariables(
            @Parameter(description = "模型ID") @PathVariable Long modelId
    ) {
        try {
            List<ModelVariable> variables = modelVariableService.getVariablesByModelId(modelId);
            List<Map<String, Object>> result = variables.stream().map(variable -> {
                Map<String, Object> varMap = new HashMap<>();
                varMap.put("id", variable.getId());
                varMap.put("variableName", variable.getVariableName());
                varMap.put("variableCode", variable.getVariableCode());
                varMap.put("variableType", variable.getVariableType());
                varMap.put("dataType", variable.getDataType());
                varMap.put("defaultValue", variable.getDefaultValue());
                varMap.put("unit", variable.getUnit());
                varMap.put("description", variable.getDescription());
                varMap.put("isRequired", variable.getIsRequired());
                varMap.put("displayOrder", variable.getDisplayOrder());
                varMap.put("validationRules", variable.getValidationRules());
                varMap.put("minValue", variable.getMinValue());
                varMap.put("maxValue", variable.getMaxValue());
                return varMap;
            }).toList();
            
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("获取模型变量失败", e);
            return Result.failed("获取模型变量失败: " + e.getMessage());
        }
    }

    // ==================== 分析计算接口 ====================

    /**
     * 执行盈亏平衡分析
     */
    @Operation(summary = "执行盈亏平衡分析")
    @PostMapping("/calculate")
    public Result<Map<String, Object>> calculateBreakeven(
            @Parameter(description = "分析请求") @Valid @RequestBody Map<String, Object> request
    ) {
        try {
            Long modelId = Long.valueOf(request.get("modelId").toString());
            @SuppressWarnings("unchecked")
            Map<String, Object> variableValues = (Map<String, Object>) request.get("variableValues");
            
            log.info("执行盈亏平衡分析: modelId={}, variables={}", modelId, variableValues);
            
            // 获取模型和变量定义
            FinancialModel model = financialModelService.getById(modelId);
            if (model == null) {
                return Result.failed("财务模型不存在");
            }
            
            List<ModelVariable> variables = modelVariableService.getVariablesByModelId(modelId);
            
            // 执行计算
            Map<String, Object> analysisResult = performBreakevenCalculation(model, variables, variableValues);
            
            return Result.succeed(analysisResult);
        } catch (Exception e) {
            log.error("执行盈亏平衡分析失败", e);
            return Result.failed("分析计算失败: " + e.getMessage());
        }
    }

    /**
     * 批量场景分析
     */
    @Operation(summary = "批量场景分析")
    @PostMapping("/scenario-analysis")
    public Result<Map<String, Object>> performScenarioAnalysis(
            @Parameter(description = "场景分析请求") @Valid @RequestBody Map<String, Object> request
    ) {
        try {
            Long modelId = Long.valueOf(request.get("modelId").toString());
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> scenarios = (List<Map<String, Object>>) request.get("scenarios");
            
            log.info("执行场景分析: modelId={}, scenarioCount={}", modelId, scenarios.size());
            
            FinancialModel model = financialModelService.getById(modelId);
            if (model == null) {
                return Result.failed("财务模型不存在");
            }
            
            List<ModelVariable> variables = modelVariableService.getVariablesByModelId(modelId);
            
            // 执行多场景计算
            Map<String, Object> scenarioResult = performMultiScenarioAnalysis(model, variables, scenarios);
            
            return Result.succeed(scenarioResult);
        } catch (Exception e) {
            log.error("场景分析失败", e);
            return Result.failed("场景分析失败: " + e.getMessage());
        }
    }

    /**
     * 敏感性分析
     */
    @Operation(summary = "敏感性分析")
    @PostMapping("/sensitivity-analysis")
    public Result<Map<String, Object>> performSensitivityAnalysis(
            @Parameter(description = "敏感性分析请求") @Valid @RequestBody Map<String, Object> request
    ) {
        try {
            Long modelId = Long.valueOf(request.get("modelId").toString());
            @SuppressWarnings("unchecked")
            Map<String, Object> baseValues = (Map<String, Object>) request.get("baseValues");
            @SuppressWarnings("unchecked")
            Map<String, Object> sensitivityConfig = (Map<String, Object>) request.get("sensitivityConfig");
            
            log.info("执行敏感性分析: modelId={}", modelId);
            
            FinancialModel model = financialModelService.getById(modelId);
            if (model == null) {
                return Result.failed("财务模型不存在");
            }
            
            List<ModelVariable> variables = modelVariableService.getVariablesByModelId(modelId);
            
            // 执行敏感性分析
            Map<String, Object> sensitivityResult = performSensitivityAnalysisCalculation(
                model, variables, baseValues, sensitivityConfig);
            
            return Result.succeed(sensitivityResult);
        } catch (Exception e) {
            log.error("敏感性分析失败", e);
            return Result.failed("敏感性分析失败: " + e.getMessage());
        }
    }

    /**
     * 预测分析
     */
    @Operation(summary = "预测分析")
    @PostMapping("/forecast-analysis")
    public Result<Map<String, Object>> performForecastAnalysis(
            @Parameter(description = "预测分析请求") @Valid @RequestBody Map<String, Object> request
    ) {
        try {
            Long modelId = Long.valueOf(request.get("modelId").toString());
            @SuppressWarnings("unchecked")
            Map<String, Object> baseValues = (Map<String, Object>) request.get("baseValues");
            @SuppressWarnings("unchecked")
            Map<String, Object> forecastConfig = (Map<String, Object>) request.get("forecastConfig");
            
            log.info("执行预测分析: modelId={}", modelId);
            
            FinancialModel model = financialModelService.getById(modelId);
            if (model == null) {
                return Result.failed("财务模型不存在");
            }
            
            List<ModelVariable> variables = modelVariableService.getVariablesByModelId(modelId);
            
            // 执行预测分析
            Map<String, Object> forecastResult = performForecastAnalysisCalculation(
                model, variables, baseValues, forecastConfig);
            
            return Result.succeed(forecastResult);
        } catch (Exception e) {
            log.error("预测分析失败", e);
            return Result.failed("预测分析失败: " + e.getMessage());
        }
    }

    // ==================== 图表数据接口 ====================

    /**
     * 获取盈亏平衡图表数据
     */
    @Operation(summary = "获取盈亏平衡图表数据")
    @PostMapping("/chart-data")
    public Result<Map<String, Object>> getBreakevenChartData(
            @Parameter(description = "图表数据请求") @Valid @RequestBody Map<String, Object> request
    ) {
        try {
            Long modelId = Long.valueOf(request.get("modelId").toString());
            @SuppressWarnings("unchecked")
            Map<String, Object> variableValues = (Map<String, Object>) request.get("variableValues");
            String chartType = request.getOrDefault("chartType", "line").toString();
            Integer dataPoints = Integer.valueOf(request.getOrDefault("dataPoints", "50").toString());
            
            log.info("生成图表数据: modelId={}, chartType={}", modelId, chartType);
            
            FinancialModel model = financialModelService.getById(modelId);
            if (model == null) {
                return Result.failed("财务模型不存在");
            }
            
            List<ModelVariable> variables = modelVariableService.getVariablesByModelId(modelId);
            
            // 生成图表数据
            Map<String, Object> chartData = generateBreakevenChartData(
                model, variables, variableValues, chartType, dataPoints);
            
            return Result.succeed(chartData);
        } catch (Exception e) {
            log.error("生成图表数据失败", e);
            return Result.failed("生成图表数据失败: " + e.getMessage());
        }
    }

    // ==================== 分析历史接口 ====================

    /**
     * 保存分析结果
     */
    @Operation(summary = "保存分析结果")
    @PostMapping("/save-analysis")
    public Result<Map<String, Object>> saveAnalysisResult(
            @Parameter(description = "保存分析请求") @Valid @RequestBody Map<String, Object> request
    ) {
        try {
            String analysisName = request.get("analysisName").toString();
            Long modelId = Long.valueOf(request.get("modelId").toString());
            @SuppressWarnings("unchecked")
            Map<String, Object> analysisResult = (Map<String, Object>) request.get("analysisResult");
            @SuppressWarnings("unchecked")
            Map<String, Object> variableValues = (Map<String, Object>) request.get("variableValues");
            
            log.info("保存分析结果: name={}, modelId={}", analysisName, modelId);
            
            // TODO: 实现保存分析结果到数据库的逻辑
            Map<String, Object> savedAnalysis = new HashMap<>();
            savedAnalysis.put("analysisId", System.currentTimeMillis()); // 临时ID
            savedAnalysis.put("analysisName", analysisName);
            savedAnalysis.put("modelId", modelId);
            savedAnalysis.put("createdAt", new java.util.Date());
            savedAnalysis.put("status", "saved");
            
            return Result.succeed(savedAnalysis);
        } catch (Exception e) {
            log.error("保存分析结果失败", e);
            return Result.failed("保存分析结果失败: " + e.getMessage());
        }
    }

    /**
     * 获取分析历史列表
     */
    @Operation(summary = "获取分析历史列表")
    @GetMapping("/analysis-history")
    public Result<List<Map<String, Object>>> getAnalysisHistory(
            @Parameter(description = "模型ID") @RequestParam(required = false) Long modelId,
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "页大小") @RequestParam(defaultValue = "20") int size
    ) {
        try {
            log.info("获取分析历史: modelId={}, page={}, size={}", modelId, page, size);
            
            // TODO: 实现从数据库获取分析历史的逻辑
            List<Map<String, Object>> historyList = List.of();
            
            return Result.succeed(historyList);
        } catch (Exception e) {
            log.error("获取分析历史失败", e);
            return Result.failed("获取分析历史失败: " + e.getMessage());
        }
    }

    // ==================== 导出功能接口 ====================

    /**
     * 导出分析报告
     */
    @Operation(summary = "导出分析报告")
    @PostMapping("/export-report")
    public Result<Map<String, Object>> exportAnalysisReport(
            @Parameter(description = "导出请求") @Valid @RequestBody Map<String, Object> request
    ) {
        try {
            String exportFormat = request.getOrDefault("exportFormat", "excel").toString();
            @SuppressWarnings("unchecked")
            Map<String, Object> analysisResult = (Map<String, Object>) request.get("analysisResult");
            
            log.info("导出分析报告: format={}", exportFormat);
            
            // TODO: 实现报告导出逻辑
            Map<String, Object> exportResult = new HashMap<>();
            exportResult.put("downloadUrl", "/api/soo/v2/breakeven/download/" + System.currentTimeMillis());
            exportResult.put("fileName", "breakeven_analysis_" + System.currentTimeMillis() + "." + exportFormat);
            exportResult.put("fileSize", "2.5MB");
            
            return Result.succeed(exportResult);
        } catch (Exception e) {
            log.error("导出分析报告失败", e);
            return Result.failed("导出报告失败: " + e.getMessage());
        }
    }

    // ==================== 私有方法 ====================

    /**
     * 执行盈亏平衡计算
     */
    private Map<String, Object> performBreakevenCalculation(
            FinancialModel model, List<ModelVariable> variables, Map<String, Object> variableValues) {
        
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 基本参数提取
            double fixedCost = getDoubleValue(variableValues, "fixed_cost", 10000.0);
            double unitPrice = getDoubleValue(variableValues, "unit_price", 100.0);
            double variableCost = getDoubleValue(variableValues, "variable_cost", 50.0);
            double targetProfit = getDoubleValue(variableValues, "target_profit", 0.0);
            
            // 计算单位边际贡献
            double unitContribution = unitPrice - variableCost;
            
            if (unitContribution <= 0) {
                throw new RuntimeException("单位边际贡献必须大于0");
            }
            
            // 计算盈亏平衡点
            double breakevenQuantity = fixedCost / unitContribution;
            double breakevenRevenue = breakevenQuantity * unitPrice;
            
            // 计算目标利润的销量
            double targetQuantity = (fixedCost + targetProfit) / unitContribution;
            double targetRevenue = targetQuantity * unitPrice;
            
            // 计算边际贡献率
            double contributionMargin = unitContribution / unitPrice;
            
            // 计算安全边际（假设当前销量）
            double currentQuantity = getDoubleValue(variableValues, "current_quantity", breakevenQuantity * 1.2);
            double safetyMargin = (currentQuantity - breakevenQuantity) / currentQuantity;
            
            // 基本结果
            result.put("breakevenQuantity", Math.round(breakevenQuantity));
            result.put("breakevenRevenue", Math.round(breakevenRevenue * 100) / 100.0);
            result.put("targetQuantity", Math.round(targetQuantity));
            result.put("targetRevenue", Math.round(targetRevenue * 100) / 100.0);
            result.put("unitContribution", Math.round(unitContribution * 100) / 100.0);
            result.put("contributionMargin", Math.round(contributionMargin * 10000) / 100.0); // 百分比
            result.put("safetyMargin", Math.round(safetyMargin * 10000) / 100.0); // 百分比
            
            // 生成图表数据点
            List<Map<String, Object>> chartPoints = generateDataPoints(fixedCost, unitPrice, variableCost, 
                (int)(breakevenQuantity * 2), 50);
            result.put("chartData", chartPoints);
            
            // 关键指标摘要
            Map<String, Object> summary = new HashMap<>();
            summary.put("fixedCost", fixedCost);
            summary.put("unitPrice", unitPrice);
            summary.put("variableCost", variableCost);
            summary.put("unitContribution", unitContribution);
            summary.put("breakevenPoint", breakevenQuantity);
            summary.put("breakevenRevenue", breakevenRevenue);
            result.put("summary", summary);
            
            log.info("盈亏平衡计算完成: 盈亏平衡点={}, 盈亏平衡收入={}", breakevenQuantity, breakevenRevenue);
            
        } catch (Exception e) {
            log.error("盈亏平衡计算失败", e);
            throw new RuntimeException("计算失败: " + e.getMessage());
        }
        
        return result;
    }

    /**
     * 执行多场景分析
     */
    private Map<String, Object> performMultiScenarioAnalysis(
            FinancialModel model, List<ModelVariable> variables, List<Map<String, Object>> scenarios) {
        
        Map<String, Object> result = new HashMap<>();
        List<Map<String, Object>> scenarioResults = new java.util.ArrayList<>();
        
        for (int i = 0; i < scenarios.size(); i++) {
            Map<String, Object> scenario = scenarios.get(i);
            try {
                Map<String, Object> scenarioResult = performBreakevenCalculation(model, variables, scenario);
                scenarioResult.put("scenarioName", scenario.getOrDefault("scenarioName", "场景" + (i + 1)));
                scenarioResults.add(scenarioResult);
            } catch (Exception e) {
                log.error("场景{}计算失败", i + 1, e);
                Map<String, Object> errorResult = new HashMap<>();
                errorResult.put("scenarioName", scenario.getOrDefault("scenarioName", "场景" + (i + 1)));
                errorResult.put("error", e.getMessage());
                scenarioResults.add(errorResult);
            }
        }
        
        result.put("scenarios", scenarioResults);
        result.put("scenarioCount", scenarios.size());
        result.put("calculatedAt", new java.util.Date());
        
        return result;
    }

    /**
     * 执行敏感性分析
     */
    private Map<String, Object> performSensitivityAnalysisCalculation(
            FinancialModel model, List<ModelVariable> variables, 
            Map<String, Object> baseValues, Map<String, Object> sensitivityConfig) {
        
        Map<String, Object> result = new HashMap<>();
        
        // 获取敏感性分析参数
        List<String> sensitivityVariables = (List<String>) sensitivityConfig.getOrDefault("variables", 
            List.of("unit_price", "variable_cost", "fixed_cost"));
        double changePercent = getDoubleValue(sensitivityConfig, "changePercent", 10.0);
        
        // 基准计算
        Map<String, Object> baseResult = performBreakevenCalculation(model, variables, baseValues);
        double baseBreakevenQuantity = (Double) baseResult.get("breakevenQuantity");
        
        // 敏感性分析结果
        List<Map<String, Object>> sensitivityResults = new java.util.ArrayList<>();
        
        for (String variable : sensitivityVariables) {
            Map<String, Object> sensitivity = new HashMap<>();
            sensitivity.put("variable", variable);
            
            // 上调变化
            Map<String, Object> upValues = new HashMap<>(baseValues);
            double baseValue = getDoubleValue(baseValues, variable, 0.0);
            upValues.put(variable, baseValue * (1 + changePercent / 100));
            
            Map<String, Object> upResult = performBreakevenCalculation(model, variables, upValues);
            double upBreakevenQuantity = (Double) upResult.get("breakevenQuantity");
            double upChange = (upBreakevenQuantity - baseBreakevenQuantity) / baseBreakevenQuantity * 100;
            
            // 下调变化
            Map<String, Object> downValues = new HashMap<>(baseValues);
            downValues.put(variable, baseValue * (1 - changePercent / 100));
            
            Map<String, Object> downResult = performBreakevenCalculation(model, variables, downValues);
            double downBreakevenQuantity = (Double) downResult.get("breakevenQuantity");
            double downChange = (downBreakevenQuantity - baseBreakevenQuantity) / baseBreakevenQuantity * 100;
            
            sensitivity.put("baseValue", baseValue);
            sensitivity.put("changePercent", changePercent);
            sensitivity.put("upChange", Math.round(upChange * 100) / 100.0);
            sensitivity.put("downChange", Math.round(downChange * 100) / 100.0);
            sensitivity.put("sensitivity", Math.abs(upChange + downChange) / 2); // 敏感性指数
            
            sensitivityResults.add(sensitivity);
        }
        
        // 按敏感性排序
        sensitivityResults.sort((a, b) -> 
            Double.compare((Double) b.get("sensitivity"), (Double) a.get("sensitivity")));
        
        result.put("baseResult", baseResult);
        result.put("sensitivityAnalysis", sensitivityResults);
        result.put("analysisParameters", sensitivityConfig);
        
        return result;
    }

    /**
     * 执行预测分析
     */
    private Map<String, Object> performForecastAnalysisCalculation(
            FinancialModel model, List<ModelVariable> variables, 
            Map<String, Object> baseValues, Map<String, Object> forecastConfig) {
        
        Map<String, Object> result = new HashMap<>();
        
        // 获取预测参数
        int periods = (Integer) forecastConfig.getOrDefault("periods", 12);
        double growthRate = getDoubleValue(forecastConfig, "growthRate", 5.0); // 年增长率
        String periodType = forecastConfig.getOrDefault("periodType", "month").toString();
        
        // 调整为月度增长率
        double monthlyGrowthRate = Math.pow(1 + growthRate / 100, 1.0 / 12) - 1;
        
        List<Map<String, Object>> forecastData = new java.util.ArrayList<>();
        
        for (int i = 1; i <= periods; i++) {
            Map<String, Object> periodValues = new HashMap<>(baseValues);
            
            // 应用增长率（假设销售价格和市场需求增长）
            double priceFactor = Math.pow(1 + monthlyGrowthRate, i);
            if (periodValues.containsKey("unit_price")) {
                double newPrice = getDoubleValue(baseValues, "unit_price", 100.0) * priceFactor;
                periodValues.put("unit_price", newPrice);
            }
            
            Map<String, Object> periodResult = performBreakevenCalculation(model, variables, periodValues);
            periodResult.put("period", i);
            periodResult.put("periodType", periodType);
            periodResult.put("growthFactor", priceFactor);
            
            forecastData.add(periodResult);
        }
        
        result.put("forecastData", forecastData);
        result.put("forecastParameters", forecastConfig);
        result.put("periods", periods);
        result.put("growthRate", growthRate);
        
        return result;
    }

    /**
     * 生成盈亏平衡图表数据
     */
    private Map<String, Object> generateBreakevenChartData(
            FinancialModel model, List<ModelVariable> variables, 
            Map<String, Object> variableValues, String chartType, int dataPoints) {
        
        Map<String, Object> result = new HashMap<>();
        
        double fixedCost = getDoubleValue(variableValues, "fixed_cost", 10000.0);
        double unitPrice = getDoubleValue(variableValues, "unit_price", 100.0);
        double variableCost = getDoubleValue(variableValues, "variable_cost", 50.0);
        
        // 计算盈亏平衡点
        double unitContribution = unitPrice - variableCost;
        double breakevenQuantity = fixedCost / unitContribution;
        
        // 生成数据点
        List<Map<String, Object>> chartData = generateDataPoints(fixedCost, unitPrice, variableCost, 
            (int)(breakevenQuantity * 2), dataPoints);
        
        result.put("chartData", chartData);
        result.put("breakevenPoint", breakevenQuantity);
        result.put("chartType", chartType);
        result.put("dataPoints", dataPoints);
        
        // 图表配置
        Map<String, Object> chartConfig = new HashMap<>();
        chartConfig.put("xAxisLabel", "销售数量");
        chartConfig.put("yAxisLabel", "金额");
        chartConfig.put("title", "盈亏平衡分析图");
        chartConfig.put("breakevenLine", true);
        result.put("chartConfig", chartConfig);
        
        return result;
    }

    /**
     * 生成数据点
     */
    private List<Map<String, Object>> generateDataPoints(double fixedCost, double unitPrice, 
            double variableCost, int maxQuantity, int pointCount) {
        
        List<Map<String, Object>> points = new java.util.ArrayList<>();
        int step = Math.max(1, maxQuantity / pointCount);
        
        for (int quantity = 0; quantity <= maxQuantity; quantity += step) {
            Map<String, Object> point = new HashMap<>();
            double revenue = quantity * unitPrice;
            double totalVariableCost = quantity * variableCost;
            double totalCost = fixedCost + totalVariableCost;
            double profit = revenue - totalCost;
            
            point.put("quantity", quantity);
            point.put("revenue", Math.round(revenue * 100) / 100.0);
            point.put("totalCost", Math.round(totalCost * 100) / 100.0);
            point.put("fixedCost", fixedCost);
            point.put("variableCost", Math.round(totalVariableCost * 100) / 100.0);
            point.put("profit", Math.round(profit * 100) / 100.0);
            
            points.add(point);
        }
        
        return points;
    }

    /**
     * 安全获取double值
     */
    private double getDoubleValue(Map<String, Object> values, String key, double defaultValue) {
        Object value = values.get(key);
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            log.warn("无法解析数值: {}={}, 使用默认值: {}", key, value, defaultValue);
            return defaultValue;
        }
    }
} 