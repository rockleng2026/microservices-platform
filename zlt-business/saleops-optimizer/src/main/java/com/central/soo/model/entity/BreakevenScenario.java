package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 盈亏平衡场景实体
 * 对应数据库表：soo_breakeven_scenarios
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("soo_breakeven_scenarios")
public class BreakevenScenario {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 场景ID
     */
    @TableField("scenario_id")
    private String scenarioId;

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
     * 场景名称
     */
    @TableField("scenario_name")
    private String scenarioName;

    /**
     * 场景类型
     */
    @TableField("scenario_type")
    private String scenarioType;

    /**
     * 场景描述
     */
    @TableField("scenario_description")
    private String scenarioDescription;

    /**
     * 是否基准场景
     */
    @TableField("is_baseline")
    private Boolean isBaseline;

    /**
     * 是否推荐场景
     */
    @TableField("is_recommended")
    private Boolean isRecommended;

    /**
     * 场景参数配置
     */
    @TableField("scenario_parameters")
    private String scenarioParameters;

    /**
     * 相对基准的参数变化
     */
    @TableField("parameter_changes")
    private String parameterChanges;

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
     * 可行性评分
     */
    @TableField("feasibility_score")
    private BigDecimal feasibilityScore;

    /**
     * 风险等级
     */
    @TableField("risk_level")
    private String riskLevel;

    /**
     * 置信水平
     */
    @TableField("confidence_level")
    private BigDecimal confidenceLevel;

    /**
     * 敏感性评分
     */
    @TableField("sensitivity_score")
    private BigDecimal sensitivityScore;

    /**
     * 营收影响
     */
    @TableField("revenue_impact")
    private BigDecimal revenueImpact;

    /**
     * 成本影响
     */
    @TableField("cost_impact")
    private BigDecimal costImpact;

    /**
     * 利润影响
     */
    @TableField("profit_impact")
    private BigDecimal profitImpact;

    /**
     * 实施成本
     */
    @TableField("implementation_cost")
    private BigDecimal implementationCost;

    /**
     * 回收期(月)
     */
    @TableField("payback_period")
    private Integer paybackPeriod;

    /**
     * 关键指标
     */
    @TableField("key_metrics")
    private String keyMetrics;

    /**
     * 绩效指标
     */
    @TableField("performance_indicators")
    private String performanceIndicators;

    /**
     * 成功标准
     */
    @TableField("success_criteria")
    private String successCriteria;

    /**
     * 排序序号
     */
    @TableField("sort_order")
    private Integer sortOrder;

    /**
     * 状态
     */
    @TableField("status")
    private String status;

    /**
     * 最后计算时间
     */
    @TableField("last_calculated")
    private LocalDateTime lastCalculated;

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
    public static final String TYPE_CONSERVATIVE = "conservative";
    public static final String TYPE_BASELINE = "baseline";
    public static final String TYPE_OPTIMISTIC = "optimistic";
    public static final String TYPE_INDUSTRY_SPECIFIC = "industry_specific";

    public static final String RISK_LOW = "low";
    public static final String RISK_MEDIUM = "medium";
    public static final String RISK_HIGH = "high";

    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_INACTIVE = "inactive";
    public static final String STATUS_ARCHIVED = "archived";
} 