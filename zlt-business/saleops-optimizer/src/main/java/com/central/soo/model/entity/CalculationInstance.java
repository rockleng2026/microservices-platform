package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.central.common.model.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 计算实例实体
 * 对应数据库表：soo_calculation_instance
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("soo_calculation_instance")
public class CalculationInstance extends BaseEntity {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 实例编号
     */
    @TableField("instance_id")
    private String instanceId;

    /**
     * 模型ID
     */
    @TableField("model_id")
    private Long modelId;

    /**
     * 实例名称
     */
    @TableField("instance_name")
    private String instanceName;

    /**
     * 计算周期
     */
    @TableField("calculation_period")
    private String calculationPeriod;

    /**
     * 周期开始日期
     */
    @TableField("period_start_date")
    private LocalDate periodStartDate;

    /**
     * 周期结束日期
     */
    @TableField("period_end_date")
    private LocalDate periodEndDate;

    /**
     * 输入参数
     */
    @TableField("input_parameters")
    private String inputParameters;

    /**
     * 计算结果
     */
    @TableField("calculation_results")
    private String calculationResults;

    /**
     * 场景分析结果
     */
    @TableField("scenario_results")
    private String scenarioResults;

    /**
     * 预测结果
     */
    @TableField("forecast_results")
    private String forecastResults;

    /**
     * 敏感性分析结果
     */
    @TableField("sensitivity_results")
    private String sensitivityResults;

    /**
     * 计算状态
     */
    @TableField("calculation_status")
    private String calculationStatus;

    /**
     * 计算耗时(毫秒)
     */
    @TableField("calculation_duration")
    private Integer calculationDuration;

    /**
     * 错误信息
     */
    @TableField("error_message")
    private String errorMessage;

    /**
     * 计算日志
     */
    @TableField("calculation_log")
    private String calculationLog;

    /**
     * 计算配置
     */
    @TableField("calculation_config")
    private String calculationConfig;

    /**
     * 最后执行时间
     */
    @TableField("last_executed_time")
    private LocalDateTime lastExecutedTime;

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
     * 租户ID
     */
    @TableField("tenant_id")
    private String tenantId;

    // 计算状态常量
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_CALCULATING = "CALCULATING";
    public static final String STATUS_COMPLETED = "COMPLETED";
    public static final String STATUS_FAILED = "FAILED";
    public static final String STATUS_CANCELLED = "CANCELLED";
} 