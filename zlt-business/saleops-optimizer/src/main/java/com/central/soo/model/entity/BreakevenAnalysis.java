package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 盈亏平衡分析实体
 * 对应数据库表：soo_breakeven_analysis
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("soo_breakeven_analysis")
public class BreakevenAnalysis {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 分析任务ID
     */
    @TableField("analysis_id")
    private String analysisId;

    /**
     * 分析名称
     */
    @TableField("analysis_name")
    private String analysisName;

    /**
     * 分析类型
     */
    @TableField("analysis_type")
    private String analysisType;

    /**
     * 分析期间
     */
    @TableField("analysis_period")
    private String analysisPeriod;

    /**
     * 租户ID
     */
    @TableField("tenant_id")
    private Long tenantId;

    /**
     * 创建人ID
     */
    @TableField("creator_id")
    private Long creatorId;

    /**
     * 创建人姓名
     */
    @TableField("creator_name")
    private String creatorName;

    /**
     * 当前参数快照
     */
    @TableField("current_parameters")
    private String currentParameters;

    /**
     * 盈亏平衡点
     */
    @TableField("breakeven_point")
    private BigDecimal breakevenPoint;

    /**
     * 总固定成本
     */
    @TableField("total_fixed_cost")
    private BigDecimal totalFixedCost;

    /**
     * 变动成本率
     */
    @TableField("variable_cost_ratio")
    private BigDecimal variableCostRatio;

    /**
     * 安全边际
     */
    @TableField("margin_safety")
    private BigDecimal marginSafety;

    /**
     * 安全边际率
     */
    @TableField("margin_safety_ratio")
    private BigDecimal marginSafetyRatio;

    /**
     * 场景分析结果
     */
    @TableField("scenario_results")
    private String scenarioResults;

    /**
     * 敏感性分析数据
     */
    @TableField("sensitivity_data")
    private String sensitivityData;

    /**
     * 预测结果
     */
    @TableField("forecast_results")
    private String forecastResults;

    /**
     * 合理性评分(0-1)
     */
    @TableField("reasonability_score")
    private BigDecimal reasonabilityScore;

    /**
     * 约束违反记录
     */
    @TableField("constraint_violations")
    private String constraintViolations;

    /**
     * 自动调整历史
     */
    @TableField("adjustment_history")
    private String adjustmentHistory;

    /**
     * 计算触发原因
     */
    @TableField("calculation_trigger")
    private String calculationTrigger;

    /**
     * 计算耗时(毫秒)
     */
    @TableField("calculation_duration")
    private Integer calculationDuration;

    /**
     * 计算引擎版本
     */
    @TableField("calculation_engine_version")
    private String calculationEngineVersion;

    /**
     * 最后重算时间
     */
    @TableField("last_recalculation")
    private LocalDateTime lastRecalculation;

    /**
     * 使用的预测模型
     */
    @TableField("forecast_model")
    private String forecastModel;

    /**
     * 预测置信度
     */
    @TableField("forecast_confidence")
    private BigDecimal forecastConfidence;

    /**
     * 季节性因子
     */
    @TableField("seasonal_factors")
    private String seasonalFactors;

    /**
     * 模型元数据
     */
    @TableField("model_metadata")
    private String modelMetadata;

    /**
     * 状态
     */
    @TableField("status")
    private String status;

    /**
     * 是否实时计算
     */
    @TableField("is_real_time")
    private Boolean isRealTime;

    /**
     * 是否自动重算
     */
    @TableField("auto_recalculation")
    private Boolean autoRecalculation;

    /**
     * 告警设置
     */
    @TableField("alert_settings")
    private String alertSettings;

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

    /**
     * 版本号
     */
    @TableField("version")
    @Version
    private Integer version;

    // 常量定义
    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_ARCHIVED = "archived";
    public static final String STATUS_DRAFT = "draft";

    public static final String TYPE_MONTHLY = "monthly";
    public static final String TYPE_QUARTERLY = "quarterly";
    public static final String TYPE_YEARLY = "yearly";

    public static final String TRIGGER_MANUAL = "manual";
    public static final String TRIGGER_PARAMETER_CHANGE = "parameter_change";
    public static final String TRIGGER_SCHEDULED = "scheduled";
    public static final String TRIGGER_DATA_UPDATE = "data_update";
} 