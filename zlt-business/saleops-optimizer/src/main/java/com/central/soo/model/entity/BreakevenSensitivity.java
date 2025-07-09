package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 盈亏平衡敏感性分析实体
 * 对应数据库表：soo_breakeven_sensitivity
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("soo_breakeven_sensitivity")
public class BreakevenSensitivity {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 关联分析ID
     */
    @TableField("analysis_id")
    private String analysisId;

    /**
     * 租户ID
     */
    @TableField("tenant_id")
    private Long tenantId;

    /**
     * 敏感性参数名称
     */
    @TableField("parameter_name")
    private String parameterName;

    /**
     * 参数中文名称
     */
    @TableField("parameter_label")
    private String parameterLabel;

    /**
     * 参数类别
     */
    @TableField("parameter_category")
    private String parameterCategory;

    /**
     * 基准值
     */
    @TableField("baseline_value")
    private BigDecimal baselineValue;

    /**
     * 变化范围(JSON数组)
     */
    @TableField("variation_range")
    private String variationRange;

    /**
     * 敏感度系数
     */
    @TableField("sensitivity_coefficient")
    private BigDecimal sensitivityCoefficient;

    /**
     * 敏感度等级
     */
    @TableField("sensitivity_level")
    private String sensitivityLevel;

    /**
     * 弹性系数
     */
    @TableField("elasticity_coefficient")
    private BigDecimal elasticityCoefficient;

    /**
     * 影响方向
     */
    @TableField("impact_direction")
    private String impactDirection;

    /**
     * 影响幅度
     */
    @TableField("impact_magnitude")
    private BigDecimal impactMagnitude;

    /**
     * 临界点
     */
    @TableField("critical_point")
    private BigDecimal criticalPoint;

    /**
     * 详细结果数据(JSON)
     */
    @TableField("detailed_results")
    private String detailedResults;

    /**
     * 图表数据(JSON)
     */
    @TableField("chart_data")
    private String chartData;

    /**
     * 置信区间下限
     */
    @TableField("confidence_lower")
    private BigDecimal confidenceLower;

    /**
     * 置信区间上限
     */
    @TableField("confidence_upper")
    private BigDecimal confidenceUpper;

    /**
     * 标准偏差
     */
    @TableField("standard_deviation")
    private BigDecimal standardDeviation;

    /**
     * 变异系数
     */
    @TableField("coefficient_variation")
    private BigDecimal coefficientVariation;

    /**
     * 相关性系数
     */
    @TableField("correlation_coefficient")
    private BigDecimal correlationCoefficient;

    /**
     * R平方值
     */
    @TableField("r_squared")
    private BigDecimal rSquared;

    /**
     * 最优值
     */
    @TableField("optimal_value")
    private BigDecimal optimalValue;

    /**
     * 最优值信心度
     */
    @TableField("optimal_confidence")
    private BigDecimal optimalConfidence;

    /**
     * 风险评估
     */
    @TableField("risk_assessment")
    private String riskAssessment;

    /**
     * 建议措施
     */
    @TableField("recommendations")
    private String recommendations;

    /**
     * 排序序号
     */
    @TableField("sort_order")
    private Integer sortOrder;

    /**
     * 是否为关键参数
     */
    @TableField("is_critical")
    private Boolean isCritical;

    /**
     * 是否可控
     */
    @TableField("is_controllable")
    private Boolean isControllable;

    /**
     * 计算状态
     */
    @TableField("calculation_status")
    private String calculationStatus;

    /**
     * 计算时间
     */
    @TableField("calculated_at")
    private LocalDateTime calculatedAt;

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
    public static final String LEVEL_HIGH = "high";
    public static final String LEVEL_MEDIUM = "medium";
    public static final String LEVEL_LOW = "low";

    public static final String DIRECTION_POSITIVE = "positive";
    public static final String DIRECTION_NEGATIVE = "negative";
    public static final String DIRECTION_NEUTRAL = "neutral";

    public static final String CATEGORY_REVENUE = "revenue";
    public static final String CATEGORY_COST = "cost";
    public static final String CATEGORY_PRICE = "price";
    public static final String CATEGORY_VOLUME = "volume";
    public static final String CATEGORY_EFFICIENCY = "efficiency";

    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_CALCULATING = "calculating";
    public static final String STATUS_COMPLETED = "completed";
    public static final String STATUS_FAILED = "failed";
} 