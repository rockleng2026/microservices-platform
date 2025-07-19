package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 模型实例变量实体
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("soo_model_instance_variable")
@Schema(description = "模型实例变量")
public class ModelInstanceVariable {

    @Schema(description = "主键ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @Schema(description = "模型实例ID")
    @JsonProperty("instanceId")
    @TableField("instance_id")
    private Long instanceId;

    @Schema(description = "模型变量ID")
    @JsonProperty("variableId")
    @TableField("variable_id")
    private Long variableId;

    @Schema(description = "变量值")
    @JsonProperty("variableValue")
    @TableField("variable_value")
    private String variableValue;

    @Schema(description = "计算后的值")
    @JsonProperty("calculatedValue")
    @TableField("calculated_value")
    private String calculatedValue;

    @Schema(description = "是否已计算：0-未计算，1-已计算")
    @JsonProperty("isCalculated")
    @TableField("is_calculated")
    private Integer isCalculated;

    @Schema(description = "计算错误信息")
    @JsonProperty("calculationError")
    @TableField("calculation_error")
    private String calculationError;

    @Schema(description = "创建时间")
    @JsonProperty("createdAt")
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @Schema(description = "更新时间")
    @JsonProperty("updatedAt")
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    // 非数据库字段
    @Schema(description = "关联的模型变量信息")
    @TableField(exist = false)
    private ModelVariable modelVariable;

    @Schema(description = "变量编码")
    @TableField(exist = false)
    private String variableCode;

    @Schema(description = "变量名称")
    @TableField(exist = false)
    private String variableName;

    @Schema(description = "变量类型")
    @TableField(exist = false)
    private String variableType;

    @Schema(description = "数据类型")
    @TableField(exist = false)
    private String dataType;

    @Schema(description = "单位")
    @TableField(exist = false)
    private String unit;

    @Schema(description = "是否必填")
    @TableField(exist = false)
    private Boolean isRequired;

    @Schema(description = "显示顺序")
    @TableField(exist = false)
    private Integer displayOrder;
} 