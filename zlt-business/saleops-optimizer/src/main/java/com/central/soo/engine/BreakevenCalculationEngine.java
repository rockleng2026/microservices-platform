package com.central.soo.engine;

import com.central.soo.model.dto.BreakevenAnalysisDTO;
import com.central.soo.model.entity.BreakevenAnalysis;
import com.central.soo.model.entity.BreakevenForecast;
import com.central.soo.model.entity.BreakevenScenario;
import com.central.soo.model.entity.BreakevenSensitivity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 盈亏平衡计算引擎
 * 核心计算逻辑实现
 */
@Slf4j
@Component
public class BreakevenCalculationEngine {

    private static final int CALCULATION_SCALE = 6; // 计算精度
    private static final int RESULT_SCALE = 2; // 结果精度
    private static final BigDecimal HUNDRED = new BigDecimal("100");
    private static final String ENGINE_VERSION = "1.0.0";

    /**
     * 执行完整的盈亏平衡分析
     *
     * @param analysisDTO 分析参数
     * @param tenantId 租户ID
     * @param creatorId 创建人ID
     * @return 分析结果
     */
    public BreakevenAnalysis performAnalysis(BreakevenAnalysisDTO analysisDTO, Long tenantId, Long creatorId) {
        log.info("开始执行盈亏平衡分析: {}", analysisDTO.getAnalysisName());
        
        long startTime = System.currentTimeMillis();
        
        try {
            // 1. 基础计算
            BreakevenAnalysis analysis = performBasicCalculation(analysisDTO, tenantId, creatorId);
            
            // 2. 场景分析
            if (analysisDTO.getScenarioConfigs() != null && !analysisDTO.getScenarioConfigs().isEmpty()) {
                List<BreakevenScenario> scenarios = performScenarioAnalysis(analysis.getAnalysisId(), 
                    analysisDTO.getScenarioConfigs(), analysisDTO.getCalculationParameters(), tenantId);
                analysis.setScenarioResults(convertScenariosToJson(scenarios));
            }
            
            // 3. 敏感性分析
            if (analysisDTO.getSensitivityConfig() != null && Boolean.TRUE.equals(analysisDTO.getSensitivityConfig().getEnabled())) {
                List<BreakevenSensitivity> sensitivities = performSensitivityAnalysis(analysis.getAnalysisId(), 
                    analysisDTO.getSensitivityConfig(), analysisDTO.getCalculationParameters(), tenantId);
                analysis.setSensitivityData(convertSensitivitiesToJson(sensitivities));
            }
            
            // 4. 预测分析
            if (analysisDTO.getForecastConfig() != null && Boolean.TRUE.equals(analysisDTO.getForecastConfig().getEnabled())) {
                BreakevenForecast forecast = performForecastAnalysis(analysis.getAnalysisId(), 
                    analysisDTO.getForecastConfig(), analysisDTO.getCalculationParameters(), tenantId);
                analysis.setForecastResults(convertForecastToJson(forecast));
            }
            
            // 5. 计算合理性评分
            BigDecimal reasonabilityScore = calculateReasonabilityScore(analysis, analysisDTO.getCalculationParameters());
            analysis.setReasonabilityScore(reasonabilityScore);
            
            // 6. 设置计算元数据
            long duration = System.currentTimeMillis() - startTime;
            analysis.setCalculationDuration((int) duration);
            analysis.setCalculationEngineVersion(ENGINE_VERSION);
            analysis.setLastRecalculation(LocalDateTime.now());
            
            log.info("盈亏平衡分析完成: {}, 耗时: {}ms", analysisDTO.getAnalysisName(), duration);
            return analysis;
            
        } catch (Exception e) {
            log.error("盈亏平衡分析执行失败: {}", analysisDTO.getAnalysisName(), e);
            throw new RuntimeException("分析计算失败: " + e.getMessage(), e);
        }
    }

    /**
     * 执行基础盈亏平衡计算
     */
    private BreakevenAnalysis performBasicCalculation(BreakevenAnalysisDTO analysisDTO, Long tenantId, Long creatorId) {
        BreakevenAnalysisDTO.CalculationParameters params = analysisDTO.getCalculationParameters();
        
        // 基础参数验证
        validateCalculationParameters(params);
        
        BreakevenAnalysis analysis = new BreakevenAnalysis();
        analysis.setAnalysisId(generateAnalysisId());
        analysis.setAnalysisName(analysisDTO.getAnalysisName());
        analysis.setAnalysisType(analysisDTO.getAnalysisType());
        analysis.setAnalysisPeriod(analysisDTO.getAnalysisPeriod());
        analysis.setTenantId(tenantId);
        analysis.setCreatorId(creatorId);
        analysis.setIsRealTime(analysisDTO.getIsRealTime());
        analysis.setAutoRecalculation(analysisDTO.getAutoRecalculation());
        analysis.setStatus(BreakevenAnalysis.STATUS_ACTIVE);
        analysis.setCalculationTrigger(BreakevenAnalysis.TRIGGER_MANUAL);
        
        // 保存当前参数快照
        analysis.setCurrentParameters(convertParametersToJson(params));
        
        // 核心计算
        BigDecimal fixedCost = params.getFixedCost();
        BigDecimal variableCostRatio = params.getVariableCostRatio();
        BigDecimal baseRevenue = params.getBaseRevenue();
        
        // 计算贡献边际率
        BigDecimal contributionMarginRatio = BigDecimal.ONE.subtract(variableCostRatio);
        
        // 计算盈亏平衡点 = 固定成本 / 贡献边际率
        BigDecimal breakevenPoint = fixedCost.divide(contributionMarginRatio, CALCULATION_SCALE, RoundingMode.HALF_UP);
        
        // 计算安全边际 = 基准营收 - 盈亏平衡点
        BigDecimal marginSafety = baseRevenue.subtract(breakevenPoint);
        
        // 计算安全边际率 = 安全边际 / 基准营收
        BigDecimal marginSafetyRatio = BigDecimal.ZERO;
        if (baseRevenue.compareTo(BigDecimal.ZERO) > 0) {
            marginSafetyRatio = marginSafety.divide(baseRevenue, CALCULATION_SCALE, RoundingMode.HALF_UP);
        }
        
        // 设置计算结果
        analysis.setBreakevenPoint(breakevenPoint.setScale(RESULT_SCALE, RoundingMode.HALF_UP));
        analysis.setTotalFixedCost(fixedCost.setScale(RESULT_SCALE, RoundingMode.HALF_UP));
        analysis.setVariableCostRatio(variableCostRatio.setScale(4, RoundingMode.HALF_UP));
        analysis.setMarginSafety(marginSafety.setScale(RESULT_SCALE, RoundingMode.HALF_UP));
        analysis.setMarginSafetyRatio(marginSafetyRatio.setScale(4, RoundingMode.HALF_UP));
        
        return analysis;
    }

    /**
     * 执行场景分析
     */
    private List<BreakevenScenario> performScenarioAnalysis(String analysisId, 
            List<BreakevenAnalysisDTO.ScenarioConfig> scenarioConfigs,
            BreakevenAnalysisDTO.CalculationParameters baseParams, Long tenantId) {
        
        List<BreakevenScenario> scenarios = new ArrayList<>();
        int sortOrder = 1;
        
        for (BreakevenAnalysisDTO.ScenarioConfig config : scenarioConfigs) {
            BreakevenScenario scenario = new BreakevenScenario();
            scenario.setScenarioId(generateScenarioId());
            scenario.setAnalysisId(analysisId);
            scenario.setTenantId(tenantId);
            scenario.setScenarioName(config.getScenarioName());
            scenario.setScenarioType(config.getScenarioType());
            scenario.setScenarioDescription(config.getScenarioDescription());
            scenario.setIsBaseline(config.getIsBaseline());
            scenario.setSortOrder(sortOrder++);
            scenario.setStatus(BreakevenScenario.STATUS_ACTIVE);
            scenario.setLastCalculated(LocalDateTime.now());
            
            // 应用参数调整
            BreakevenAnalysisDTO.CalculationParameters adjustedParams = applyParameterAdjustments(baseParams, config.getParameterAdjustments());
            scenario.setScenarioParameters(convertParametersToJson(adjustedParams));
            scenario.setParameterChanges(convertAdjustmentsToJson(config.getParameterAdjustments()));
            
            // 计算场景结果
            calculateScenarioResults(scenario, adjustedParams);
            
            // 评估场景可行性
            evaluateScenarioFeasibility(scenario, config);
            
            scenarios.add(scenario);
        }
        
        return scenarios;
    }

    /**
     * 执行敏感性分析
     */
    private List<BreakevenSensitivity> performSensitivityAnalysis(String analysisId,
            BreakevenAnalysisDTO.SensitivityConfig sensitivityConfig,
            BreakevenAnalysisDTO.CalculationParameters baseParams, Long tenantId) {
        
        List<BreakevenSensitivity> sensitivities = new ArrayList<>();
        
        if (sensitivityConfig.getParameters() == null || sensitivityConfig.getParameters().isEmpty()) {
            // 使用默认参数进行敏感性分析
            sensitivities.addAll(performDefaultSensitivityAnalysis(analysisId, sensitivityConfig, baseParams, tenantId));
        } else {
            // 使用指定参数进行敏感性分析
            for (BreakevenAnalysisDTO.SensitivityParameter param : sensitivityConfig.getParameters()) {
                if (Boolean.TRUE.equals(param.getEnabled())) {
                    BreakevenSensitivity sensitivity = performParameterSensitivityAnalysis(analysisId, param, sensitivityConfig, baseParams, tenantId);
                    sensitivities.add(sensitivity);
                }
            }
        }
        
        return sensitivities;
    }

    /**
     * 执行预测分析
     */
    private BreakevenForecast performForecastAnalysis(String analysisId,
            BreakevenAnalysisDTO.ForecastConfig forecastConfig,
            BreakevenAnalysisDTO.CalculationParameters baseParams, Long tenantId) {
        
        BreakevenForecast forecast = new BreakevenForecast();
        forecast.setForecastId(generateForecastId());
        forecast.setAnalysisId(analysisId);
        forecast.setTenantId(tenantId);
        forecast.setForecastName("自动预测-" + analysisId);
        forecast.setForecastType(forecastConfig.getForecastType());
        forecast.setModelType(forecastConfig.getModelType());
        forecast.setHistoricalWindow(forecastConfig.getHistoricalWindow());
        forecast.setConfidenceLevel(forecastConfig.getConfidenceLevel());
        forecast.setForecastStatus(BreakevenForecast.STATUS_READY);
        
        // 这里应该实现具体的预测算法
        // 为简化，先返回基础结构
        Map<String, Object> forecastResults = generateSimpleForecast(baseParams, forecastConfig);
        forecast.setForecastResults(convertObjectToJson(forecastResults));
        
        forecast.setOverallAccuracy(new BigDecimal("0.85")); // 示例准确率
        forecast.setReliabilityScore(new BigDecimal("0.80")); // 示例可信度
        forecast.setQualityRating(BreakevenForecast.QUALITY_GOOD);
        
        return forecast;
    }

    /**
     * 计算合理性评分
     */
    private BigDecimal calculateReasonabilityScore(BreakevenAnalysis analysis, BreakevenAnalysisDTO.CalculationParameters params) {
        BigDecimal score = BigDecimal.ZERO;
        int totalChecks = 0;
        int passedChecks = 0;
        
        // 检查1: 变动成本率合理性 (0.3 - 0.7 为合理范围)
        totalChecks++;
        if (params.getVariableCostRatio().compareTo(new BigDecimal("0.3")) >= 0 && 
            params.getVariableCostRatio().compareTo(new BigDecimal("0.7")) <= 0) {
            passedChecks++;
        }
        
        // 检查2: 安全边际率合理性 (> 0.2 为安全)
        totalChecks++;
        if (analysis.getMarginSafetyRatio().compareTo(new BigDecimal("0.2")) > 0) {
            passedChecks++;
        }
        
        // 检查3: 盈亏平衡点与基准营收比例合理性
        totalChecks++;
        BigDecimal breakevenRatio = analysis.getBreakevenPoint().divide(params.getBaseRevenue(), CALCULATION_SCALE, RoundingMode.HALF_UP);
        if (breakevenRatio.compareTo(new BigDecimal("0.8")) <= 0) {
            passedChecks++;
        }
        
        // 计算评分
        if (totalChecks > 0) {
            score = new BigDecimal(passedChecks).divide(new BigDecimal(totalChecks), CALCULATION_SCALE, RoundingMode.HALF_UP);
        }
        
        return score.setScale(2, RoundingMode.HALF_UP);
    }

    // 辅助方法
    private void validateCalculationParameters(BreakevenAnalysisDTO.CalculationParameters params) {
        if (params == null) {
            throw new IllegalArgumentException("计算参数不能为空");
        }
        if (params.getBaseRevenue() == null || params.getBaseRevenue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("基准营收必须大于0");
        }
        if (params.getFixedCost() == null || params.getFixedCost().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("固定成本不能为负数");
        }
        if (params.getVariableCostRatio() == null || params.getVariableCostRatio().compareTo(BigDecimal.ZERO) < 0 || 
            params.getVariableCostRatio().compareTo(BigDecimal.ONE) > 0) {
            throw new IllegalArgumentException("变动成本率必须在0-1之间");
        }
    }

    private String generateAnalysisId() {
        return "BA" + System.currentTimeMillis() + "_" + new Random().nextInt(1000);
    }

    private String generateScenarioId() {
        return "BS" + System.currentTimeMillis() + "_" + new Random().nextInt(1000);
    }

    private String generateForecastId() {
        return "BF" + System.currentTimeMillis() + "_" + new Random().nextInt(1000);
    }

    // JSON转换方法 (实际实现中应使用JSON库)
    private String convertParametersToJson(BreakevenAnalysisDTO.CalculationParameters params) {
        // 简化实现，实际应使用Jackson或Gson
        return "{}";
    }

    private String convertScenariosToJson(List<BreakevenScenario> scenarios) {
        return "[]";
    }

    private String convertSensitivitiesToJson(List<BreakevenSensitivity> sensitivities) {
        return "[]";
    }

    private String convertForecastToJson(BreakevenForecast forecast) {
        return "{}";
    }

    private String convertAdjustmentsToJson(Map<String, BigDecimal> adjustments) {
        return "{}";
    }

    private String convertObjectToJson(Object obj) {
        return "{}";
    }

    // 其他辅助计算方法...
    private BreakevenAnalysisDTO.CalculationParameters applyParameterAdjustments(
            BreakevenAnalysisDTO.CalculationParameters baseParams, Map<String, BigDecimal> adjustments) {
        // 实现参数调整逻辑
        return baseParams;
    }

    private void calculateScenarioResults(BreakevenScenario scenario, BreakevenAnalysisDTO.CalculationParameters params) {
        // 实现场景计算逻辑
    }

    private void evaluateScenarioFeasibility(BreakevenScenario scenario, BreakevenAnalysisDTO.ScenarioConfig config) {
        // 实现可行性评估逻辑
    }

    private List<BreakevenSensitivity> performDefaultSensitivityAnalysis(String analysisId,
            BreakevenAnalysisDTO.SensitivityConfig config, BreakevenAnalysisDTO.CalculationParameters params, Long tenantId) {
        // 实现默认敏感性分析
        return new ArrayList<>();
    }

    private BreakevenSensitivity performParameterSensitivityAnalysis(String analysisId,
            BreakevenAnalysisDTO.SensitivityParameter param, BreakevenAnalysisDTO.SensitivityConfig config,
            BreakevenAnalysisDTO.CalculationParameters params, Long tenantId) {
        // 实现参数敏感性分析
        return new BreakevenSensitivity();
    }

    private Map<String, Object> generateSimpleForecast(BreakevenAnalysisDTO.CalculationParameters params,
            BreakevenAnalysisDTO.ForecastConfig config) {
        // 实现简单预测逻辑
        return new HashMap<>();
    }
} 