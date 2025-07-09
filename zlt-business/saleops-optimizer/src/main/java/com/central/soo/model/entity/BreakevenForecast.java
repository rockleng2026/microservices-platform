package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 盈亏平衡预测实体
 * 对应数据库表：soo_breakeven_forecast
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("soo_breakeven_forecast")
public class BreakevenForecast {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 预测ID
     */
    @TableField("forecast_id")
    private String forecastId;

    /**
     * 关联分析ID
     */
    @TableField("analysis_id")
    private String analysisId;

    /**
     * 租户ID
     */
    @TableField("tenant_id")
    private String tenantId;

    /**
     * 预测名称
     */
    @TableField("forecast_name")
    private String forecastName;

    /**
     * 预测类型
     */
    @TableField("forecast_type")
    private String forecastType;

    /**
     * 预测期间
     */
    @TableField("forecast_period")
    private String forecastPeriod;

    /**
     * 预测开始时间
     */
    @TableField("forecast_start_date")
    private LocalDateTime forecastStartDate;

    /**
     * 预测结束时间
     */
    @TableField("forecast_end_date")
    private LocalDateTime forecastEndDate;

    /**
     * 预测频率
     */
    @TableField("forecast_frequency")
    private String forecastFrequency;

    /**
     * 预测模型类型
     */
    @TableField("model_type")
    private String modelType;

    /**
     * 模型参数配置
     */
    @TableField("model_parameters")
    private String modelParameters;

    /**
     * 历史数据窗口(月)
     */
    @TableField("historical_window")
    private Integer historicalWindow;

    /**
     * 训练数据集
     */
    @TableField("training_data")
    private String trainingData;

    /**
     * 验证数据集
     */
    @TableField("validation_data")
    private String validationData;

    /**
     * 预测结果数据
     */
    @TableField("forecast_results")
    private String forecastResults;

    /**
     * 预测准确性指标
     */
    @TableField("accuracy_metrics")
    private String accuracyMetrics;

    /**
     * 整体准确率
     */
    @TableField("overall_accuracy")
    private BigDecimal overallAccuracy;

    /**
     * 平均绝对误差
     */
    @TableField("mean_absolute_error")
    private BigDecimal meanAbsoluteError;

    /**
     * 均方根误差
     */
    @TableField("root_mean_square_error")
    private BigDecimal rootMeanSquareError;

    /**
     * 平均绝对百分比误差
     */
    @TableField("mean_absolute_percentage_error")
    private BigDecimal meanAbsolutePercentageError;

    /**
     * 置信水平
     */
    @TableField("confidence_level")
    private BigDecimal confidenceLevel;

    /**
     * 置信区间数据
     */
    @TableField("confidence_intervals")
    private String confidenceIntervals;

    /**
     * 趋势分析
     */
    @TableField("trend_analysis")
    private String trendAnalysis;

    /**
     * 季节性因子
     */
    @TableField("seasonal_factors")
    private String seasonalFactors;

    /**
     * 周期性模式
     */
    @TableField("cyclical_patterns")
    private String cyclicalPatterns;

    /**
     * 外部因子影响
     */
    @TableField("external_factors")
    private String externalFactors;

    /**
     * 预测假设条件
     */
    @TableField("forecast_assumptions")
    private String forecastAssumptions;

    /**
     * 风险因子
     */
    @TableField("risk_factors")
    private String riskFactors;

    /**
     * 情景对比
     */
    @TableField("scenario_comparison")
    private String scenarioComparison;

    /**
     * 敏感性参数
     */
    @TableField("sensitivity_parameters")
    private String sensitivityParameters;

    /**
     * 关键节点预警
     */
    @TableField("key_alerts")
    private String keyAlerts;

    /**
     * 预测质量评级
     */
    @TableField("quality_rating")
    private String qualityRating;

    /**
     * 可信度评分
     */
    @TableField("reliability_score")
    private BigDecimal reliabilityScore;

    /**
     * 模型诊断信息
     */
    @TableField("model_diagnostics")
    private String modelDiagnostics;

    /**
     * 数据质量指标
     */
    @TableField("data_quality_metrics")
    private String dataQualityMetrics;

    /**
     * 更新频率
     */
    @TableField("update_frequency")
    private String updateFrequency;

    /**
     * 最后更新时间
     */
    @TableField("last_updated")
    private LocalDateTime lastUpdated;

    /**
     * 下次更新时间
     */
    @TableField("next_update")
    private LocalDateTime nextUpdate;

    /**
     * 预测状态
     */
    @TableField("forecast_status")
    private String forecastStatus;

    /**
     * 是否自动更新
     */
    @TableField("auto_update")
    private Boolean autoUpdate;

    /**
     * 是否公开
     */
    @TableField("is_public")
    private Boolean isPublic;

    /**
     * 版本号
     */
    @TableField("version")
    private String version;

    /**
     * 创建人ID
     */
    @TableField("creator_id")
    private Long creatorId;

    /**
     * 创建时间
     */
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    // 常量定义
    public static final String TYPE_SHORT_TERM = "short_term";
    public static final String TYPE_MEDIUM_TERM = "medium_term";
    public static final String TYPE_LONG_TERM = "long_term";

    public static final String FREQUENCY_MONTHLY = "monthly";
    public static final String FREQUENCY_QUARTERLY = "quarterly";
    public static final String FREQUENCY_YEARLY = "yearly";

    public static final String MODEL_LINEAR_REGRESSION = "linear_regression";
    public static final String MODEL_ARIMA = "arima";
    public static final String MODEL_EXPONENTIAL_SMOOTHING = "exponential_smoothing";
    public static final String MODEL_NEURAL_NETWORK = "neural_network";
    public static final String MODEL_ENSEMBLE = "ensemble";

    public static final String STATUS_DRAFT = "draft";
    public static final String STATUS_TRAINING = "training";
    public static final String STATUS_READY = "ready";
    public static final String STATUS_UPDATING = "updating";
    public static final String STATUS_DEPRECATED = "deprecated";

    public static final String QUALITY_EXCELLENT = "excellent";
    public static final String QUALITY_GOOD = "good";
    public static final String QUALITY_FAIR = "fair";
    public static final String QUALITY_POOR = "poor";
} 