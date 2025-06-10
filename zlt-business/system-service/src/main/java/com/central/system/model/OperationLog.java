package com.central.system.model;

import com.baomidou.mybatisplus.annotation.*;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

/**
 * 操作日志实体
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("audit_log")
@Schema(description = "操作日志")
public class OperationLog {

    private static final long serialVersionUID = 1L;

    @Schema(description = "日志ID")
    @TableId(value = "id", type = IdType.AUTO)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;



    @Schema(description = "操作用户ID")
    @TableField("user_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long userId;

    @Schema(description = "操作用户名")
    @TableField("user_name")
    private String userName;

    @Schema(description = "操作模块")
    @TableField("module")
    private String module;

    @Schema(description = "操作类型")
    @TableField("operation")
    private String operation;

    @Schema(description = "目标类型")
    @TableField("target_type")
    private String targetType;

    @Schema(description = "目标ID")
    @TableField("target_id")
    private String targetId;

    @Schema(description = "目标名称")
    @TableField("target_name")
    private String targetName;

    @Schema(description = "操作描述")
    @TableField("operation_desc")
    private String operationDesc;

    @Schema(description = "变更前值")
    @TableField("old_value")
    private String oldValue;

    @Schema(description = "变更后值")
    @TableField("new_value")
    private String newValue;

    @Schema(description = "IP地址")
    @TableField("ip_address")
    private String ipAddress;

    @Schema(description = "用户代理")
    @TableField("user_agent")
    private String userAgent;

    @Schema(description = "操作时间")
    @TableField(value = "operation_time", fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date operationTime;

    @Schema(description = "租户ID")
    @TableField("tenant_id")
    private String tenantId;

    // 非数据库字段
    @Schema(description = "操作结果(1成功,0失败)")
    @TableField(exist = false)
    private Integer result = 1;

    @Schema(description = "异常信息")
    @TableField(exist = false)
    private String errorMsg;

    @Schema(description = "执行时长(毫秒)")
    @TableField(exist = false)
    private Long duration;
} 