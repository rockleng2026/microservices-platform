package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 财务模型实例实体
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("soo_financial_model_instance")
@Schema(description = "财务模型实例")
public class FinancialModelInstance {

    @Schema(description = "主键ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @Schema(description = "实例编码")
    @JsonProperty("instanceCode")
    @TableField("instance_code")
    private String instanceCode;

    @Schema(description = "实例名称")
    @JsonProperty("instanceName")
    @TableField("instance_name")
    private String instanceName;

    @Schema(description = "关联的财务模型ID")
    @JsonProperty("modelId")
    @TableField("model_id")
    private Long modelId;

    @Schema(description = "关联的项目ID")
    @JsonProperty("projectId")
    @TableField("project_id")
    private Long projectId;

    @Schema(description = "实例状态：DRAFT-草稿，ACTIVE-激活，INACTIVE-停用，ARCHIVED-归档")
    @JsonProperty("instanceStatus")
    @TableField("instance_status")
    private String instanceStatus;

    @Schema(description = "实例版本号")
    @JsonProperty("instanceVersion")
    @TableField("instance_version")
    private String instanceVersion;

    @Schema(description = "实例描述")
    @JsonProperty("instanceDescription")
    @TableField("instance_description")
    private String instanceDescription;

    @Schema(description = "实例配置JSON，存储所有变量值")
    @JsonProperty("instanceConfig")
    @TableField("instance_config")
    private String instanceConfig;

    @Schema(description = "计算结果JSON，存储计算后的变量值")
    @JsonProperty("calculationResult")
    @TableField("calculation_result")
    private String calculationResult;

    @Schema(description = "最后计算时间")
    @JsonProperty("lastCalculatedAt")
    @TableField("last_calculated_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastCalculatedAt;

    @Schema(description = "计算状态：PENDING-待计算，CALCULATING-计算中，COMPLETED-已完成，FAILED-失败")
    @JsonProperty("calculationStatus")
    @TableField("calculation_status")
    private String calculationStatus;

    @Schema(description = "创建人ID")
    @JsonProperty("creatorId")
    @TableField("creator_id")
    private Long creatorId;

    @Schema(description = "租户ID")
    @JsonProperty("tenantId")
    @TableField("tenant_id")
    private String tenantId;

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

    @Schema(description = "是否删除：0-未删除，1-已删除")
    @TableLogic
    @TableField("deleted")
    private Integer deleted;

    // 非数据库字段
    @Schema(description = "关联的财务模型信息")
    @TableField(exist = false)
    private FinancialModel financialModel;

    @Schema(description = "实例变量值列表")
    @TableField(exist = false)
    private List<ModelInstanceVariable> instanceVariables;

    @Schema(description = "实例配置Map")
    @TableField(exist = false)
    private Map<String, Object> configMap;

    @Schema(description = "计算结果Map")
    @TableField(exist = false)
    private Map<String, Object> resultMap;

    @Schema(description = "创建人姓名")
    @TableField(exist = false)
    private String creatorName;

    @Schema(description = "项目名称")
    @TableField(exist = false)
    private String projectName;
} 