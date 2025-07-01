package com.central.crm.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.central.crm.annotation.LongToString;
import lombok.Data;

import java.util.Date;

/**
 * 客户移交记录实体类
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Data
@TableName("customer_transfer")
public class CustomerTransfer {

    /**
     * 移交记录ID
     */
    @LongToString
    @TableId(value = "transfer_id", type = IdType.ASSIGN_ID)
    private Long transferId;

    /**
     * 客户ID
     */
    @LongToString
    @TableField("customer_id")
    private Long customerId;

    /**
     * 原负责人ID
     */
    @LongToString
    @TableField("from_employee_id")
    private Long fromEmployeeId;

    /**
     * 新负责人ID
     */
    @LongToString
    @TableField("to_employee_id")
    private Long toEmployeeId;

    /**
     * 移交原因
     */
    @TableField("transfer_reason")
    private String transferReason;

    /**
     * 移交时间
     */
    @TableField("transfer_time")
    private Date transferTime;

    /**
     * 工作流实例ID
     */
    @TableField("process_instance_id")
    private String processInstanceId;

    /**
     * 审批状态：待审批、已通过、已拒绝、已取消
     */
    @TableField("approval_status")
    private String approvalStatus;

    /**
     * 审批时间
     */
    @TableField("approval_time")
    private Date approvalTime;

    /**
     * 审批备注
     */
    @TableField("approval_notes")
    private String approvalNotes;

    /**
     * 创建时间
     */
    @TableField("created_at")
    private Date createdAt;

    /**
     * 创建人
     */
    @LongToString
    @TableField("created_by")
    private Long createdBy;

    /**
     * 更新时间
     */
    @TableField("updated_at")
    private Date updatedAt;

    /**
     * 更新人
     */
    @LongToString
    @TableField("updated_by")
    private Long updatedBy;

    // 扩展字段，不对应数据库字段
    @TableField(exist = false)
    private String customerName;

    @TableField(exist = false)
    private String fromEmployeeName;

    @TableField(exist = false)
    private String toEmployeeName;
}