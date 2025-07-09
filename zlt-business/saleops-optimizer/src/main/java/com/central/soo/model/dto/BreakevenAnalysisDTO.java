package com.central.soo.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 盈亏平衡分析请求DTO
 */
@Data
@Schema(description = "盈亏平衡分析请求参数")
public class BreakevenAnalysisDTO {

    @Schema(description = "分析名称", required = true)
    @NotBlank(message = "分析名称不能为空")
    @Size(max = 100, message = "分析名称长度不能超过100字符")
    private String analysisName;

    @Schema(description = "分析类型", required = true, example = "monthly")
    @NotBlank(message = "分析类型不能为空")
    @Pattern(regexp = "^(monthly|quarterly|yearly)$", message = "分析类型只能是monthly、quarterly或yearly")
    private String analysisType;

    @Schema(description = "分析期间", required = true, example = "2024-01")
    @NotBlank(message = "分析期间不能为空")
    private String analysisPeriod;

    @Schema(description = "是否实时计算", example = "false")
    private Boolean isRealTime = false;

    @Schema(description = "是否自动重算", example = "true")
    private Boolean autoRecalculation = true;

    @Schema(description = "计算参数")
    @Valid
    private CalculationParameters calculationParameters;

    @Schema(description = "场景配置")
    @Valid
    private List<ScenarioConfig> scenarioConfigs;

    @Schema(description = "敏感性分析参数")
    @Valid
    private SensitivityConfig sensitivityConfig;

    @Schema(description = "预测配置")
    @Valid
    private ForecastConfig forecastConfig;

    @Schema(description = "告警设置")
    @Valid
    private AlertSettings alertSettings;

    /**
     * 计算参数配置
     */
    @Data
    @Schema(description = "计算参数配置")
    public static class CalculationParameters {

        @Schema(description = "基准营收", required = true, example = "1000000")
        @NotNull(message = "基准营收不能为空")
        @DecimalMin(value = "0", message = "基准营收必须大于等于0")
        private BigDecimal baseRevenue;

        @Schema(description = "固定成本", required = true, example = "300000")
        @NotNull(message = "固定成本不能为空")
        @DecimalMin(value = "0", message = "固定成本必须大于等于0")
        private BigDecimal fixedCost;

        @Schema(description = "变动成本率", required = true, example = "0.4")
        @NotNull(message = "变动成本率不能为空")
        @DecimalMin(value = "0", message = "变动成本率必须大于等于0")
        @DecimalMax(value = "1", message = "变动成本率必须小于等于1")
        private BigDecimal variableCostRatio;

        @Schema(description = "目标利润", example = "50000")
        @DecimalMin(value = "0", message = "目标利润必须大于等于0")
        private BigDecimal targetProfit;

        @Schema(description = "税率", example = "0.25")
        @DecimalMin(value = "0", message = "税率必须大于等于0")
        @DecimalMax(value = "1", message = "税率必须小于等于1")
        private BigDecimal taxRate;

        @Schema(description = "其他成本分解")
        private Map<String, BigDecimal> costBreakdown;

        @Schema(description = "收入来源分解")
        private Map<String, BigDecimal> revenueBreakdown;

        @Schema(description = "产能约束")
        private Map<String, BigDecimal> capacityConstraints;

        @Schema(description = "市场约束")
        private Map<String, BigDecimal> marketConstraints;
    }

    /**
     * 场景配置
     */
    @Data
    @Schema(description = "场景配置")
    public static class ScenarioConfig {

        @Schema(description = "场景名称", required = true)
        @NotBlank(message = "场景名称不能为空")
        private String scenarioName;

        @Schema(description = "场景类型", required = true)
        @NotBlank(message = "场景类型不能为空")
        private String scenarioType;

        @Schema(description = "场景描述")
        private String scenarioDescription;

        @Schema(description = "是否基准场景")
        private Boolean isBaseline = false;

        @Schema(description = "参数调整")
        private Map<String, BigDecimal> parameterAdjustments;

        @Schema(description = "约束条件")
        private Map<String, Object> constraints;

        @Schema(description = "预期置信度")
        @DecimalMin(value = "0", message = "置信度必须大于等于0")
        @DecimalMax(value = "1", message = "置信度必须小于等于1")
        private BigDecimal confidenceLevel;
    }

    /**
     * 敏感性分析配置
     */
    @Data
    @Schema(description = "敏感性分析配置")
    public static class SensitivityConfig {

        @Schema(description = "是否启用敏感性分析")
        private Boolean enabled = true;

        @Schema(description = "敏感性参数列表")
        private List<SensitivityParameter> parameters;

        @Schema(description = "变化幅度", example = "0.1")
        @DecimalMin(value = "0", message = "变化幅度必须大于0")
        @DecimalMax(value = "1", message = "变化幅度必须小于等于1")
        private BigDecimal variationRange = new BigDecimal("0.1");

        @Schema(description = "步长", example = "0.01")
        @DecimalMin(value = "0", message = "步长必须大于0")
        private BigDecimal stepSize = new BigDecimal("0.01");

        @Schema(description = "置信水平", example = "0.95")
        @DecimalMin(value = "0", message = "置信水平必须大于0")
        @DecimalMax(value = "1", message = "置信水平必须小于等于1")
        private BigDecimal confidenceLevel = new BigDecimal("0.95");
    }

    /**
     * 敏感性参数
     */
    @Data
    @Schema(description = "敏感性参数")
    public static class SensitivityParameter {

        @Schema(description = "参数名称", required = true)
        @NotBlank(message = "参数名称不能为空")
        private String parameterName;

        @Schema(description = "参数标签")
        private String parameterLabel;

        @Schema(description = "参数类别")
        private String parameterCategory;

        @Schema(description = "是否启用")
        private Boolean enabled = true;

        @Schema(description = "自定义变化范围")
        private BigDecimal customRange;

        @Schema(description = "自定义步长")
        private BigDecimal customStep;

        @Schema(description = "最小值")
        private BigDecimal minValue;

        @Schema(description = "最大值")
        private BigDecimal maxValue;

        @Schema(description = "权重")
        @DecimalMin(value = "0", message = "权重必须大于等于0")
        private BigDecimal weight = BigDecimal.ONE;
    }

    /**
     * 预测配置
     */
    @Data
    @Schema(description = "预测配置")
    public static class ForecastConfig {

        @Schema(description = "是否启用预测")
        private Boolean enabled = false;

        @Schema(description = "预测类型")
        private String forecastType;

        @Schema(description = "预测期间", example = "12")
        @Min(value = 1, message = "预测期间必须大于0")
        @Max(value = 60, message = "预测期间不能超过60个月")
        private Integer forecastPeriods = 12;

        @Schema(description = "预测模型")
        private String modelType = "linear_regression";

        @Schema(description = "历史数据窗口", example = "24")
        @Min(value = 6, message = "历史数据窗口不能少于6个月")
        private Integer historicalWindow = 24;

        @Schema(description = "置信水平")
        @DecimalMin(value = "0", message = "置信水平必须大于0")
        @DecimalMax(value = "1", message = "置信水平必须小于等于1")
        private BigDecimal confidenceLevel = new BigDecimal("0.95");

        @Schema(description = "季节性调整")
        private Boolean seasonalAdjustment = true;

        @Schema(description = "趋势调整")
        private Boolean trendAdjustment = true;

        @Schema(description = "外部因子")
        private Map<String, Object> externalFactors;
    }

    /**
     * 告警设置
     */
    @Data
    @Schema(description = "告警设置")
    public static class AlertSettings {

        @Schema(description = "是否启用告警")
        private Boolean enabled = false;

        @Schema(description = "盈亏平衡点告警阈值")
        private BigDecimal breakevenThreshold;

        @Schema(description = "安全边际告警阈值")
        private BigDecimal marginSafetyThreshold;

        @Schema(description = "成本变动告警阈值")
        private BigDecimal costVariationThreshold;

        @Schema(description = "收入变动告警阈值")
        private BigDecimal revenueVariationThreshold;

        @Schema(description = "告警接收人")
        private List<Long> recipients;

        @Schema(description = "告警方式")
        private List<String> alertMethods;

        @Schema(description = "自定义告警规则")
        private Map<String, Object> customRules;
    }
} 