package com.central.crm.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.central.crm.annotation.LongToString;
import lombok.Data;

import java.util.Date;

/**
 * 审计日志实体类
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Data
@TableName("audit_log")
public class AuditLog {

    /**
     * 日志ID
     */
    @LongToString
    @TableId(value = "log_id", type = IdType.ASSIGN_ID)
    private Long logId;

    /**
     * 操作用户ID
     */
    @LongToString
    @TableField("user_id")
    private Long userId;

    /**
     * 操作用户名
     */
    @TableField("user_name")
    private String userName;

    /**
     * 操作类型：CREATE、UPDATE、DELETE、VIEW、EXPORT、IMPORT
     */
    @TableField("operation_type")
    private String operationType;

    /**
     * 业务模块：customer、opportunity、follow、transfer
     */
    @TableField("business_module")
    private String businessModule;

    /**
     * 业务对象ID
     */
    @LongToString
    @TableField("business_id")
    private Long businessId;

    /**
     * 业务对象名称
     */
    @TableField("business_name")
    private String businessName;

    /**
     * 操作描述
     */
    @TableField("operation_desc")
    private String operationDesc;

    /**
     * 操作前数据（JSON格式）
     */
    @TableField("old_data")
    private String oldData;

    /**
     * 操作后数据（JSON格式）
     */
    @TableField("new_data")
    private String newData;

    /**
     * 客户端IP
     */
    @TableField("client_ip")
    private String clientIp;

    /**
     * 用户代理
     */
    @TableField("user_agent")
    private String userAgent;

    /**
     * 操作时间
     */
    @TableField("operation_time")
    private Date operationTime;

    /**
     * 操作结果：SUCCESS、FAILURE
     */
    @TableField("operation_result")
    private String operationResult;

    /**
     * 错误信息
     */
    @TableField("error_message")
    private String errorMessage;

    /**
     * 执行耗时（毫秒）
     */
    @TableField("execution_time")
    private Long executionTime;
}