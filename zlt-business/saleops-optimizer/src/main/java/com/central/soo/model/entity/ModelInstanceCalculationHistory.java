package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 模型实例计算历史实体
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("soo_model_instance_calculation_history")
@Schema(description = "模型实例计算历史")
public class ModelInstanceCalculationHistory {

    @Schema(description = "主键ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @Schema(description = "模型实例ID")
    @JsonProperty("instanceId")
    @TableField("instance_id")
    private Long instanceId;

    @Schema(description = "计算版本号")
    @JsonProperty("calculationVersion")
    @TableField("calculation_version")
    private String calculationVersion;

    @Schema(description = "计算类型：MANUAL-手动计算，AUTO-自动计算，SCHEDULED-定时计算")
    @JsonProperty("calculationType")
    @TableField("calculation_type")
    private String calculationType;

    @Schema(description = "计算状态：STARTED-开始，PROCESSING-处理中，COMPLETED-完成，FAILED-失败")
    @JsonProperty("calculationStatus")
    @TableField("calculation_status")
    private String calculationStatus;

    @Schema(description = "输入数据JSON")
    @JsonProperty("inputData")
    @TableField("input_data")
    private String inputData;

    @Schema(description = "输出数据JSON")
    @JsonProperty("outputData")
    @TableField("output_data")
    private String outputData;

    @Schema(description = "错误信息")
    @JsonProperty("errorMessage")
    @TableField("error_message")
    private String errorMessage;

    @Schema(description = "执行时间(毫秒)")
    @JsonProperty("executionTime")
    @TableField("execution_time")
    private Integer executionTime;

    @Schema(description = "触发人ID")
    @JsonProperty("triggeredBy")
    @TableField("triggered_by")
    private Long triggeredBy;

    @Schema(description = "开始时间")
    @JsonProperty("startedAt")
    @TableField("started_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startedAt;

    @Schema(description = "完成时间")
    @JsonProperty("completedAt")
    @TableField("completed_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime completedAt;

    @Schema(description = "创建时间")
    @JsonProperty("createdAt")
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    // 非数据库字段
    @Schema(description = "关联的模型实例信息")
    @TableField(exist = false)
    private FinancialModelInstance modelInstance;

    @Schema(description = "触发人姓名")
    @TableField(exist = false)
    private String triggeredByName;

    @Schema(description = "实例名称")
    @TableField(exist = false)
    private String instanceName;

    @Schema(description = "模型名称")
    @TableField(exist = false)
    private String modelName;
} 