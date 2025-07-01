package com.central.crm.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.central.crm.annotation.LongToString;
import lombok.Data;

import java.util.Date;

/**
 * 客户跟进记录实体类
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Data
@TableName("customer_follow")
public class CustomerFollow {

    /**
     * 跟进记录ID
     */
    @LongToString
    @TableId(value = "follow_id", type = IdType.ASSIGN_ID)
    private Long followId;

    /**
     * 客户ID
     */
    @LongToString
    @TableField("customer_id")
    private Long customerId;

    /**
     * 跟进员工ID
     */
    @LongToString
    @TableField("employee_id")
    private Long employeeId;

    /**
     * 跟进方式：电话、邮件、会议、拜访
     */
    @TableField("follow_type")
    private String followType;

    /**
     * 跟进时间
     */
    @TableField("follow_time")
    private Date followTime;

    /**
     * 下次跟进时间
     */
    @TableField("next_follow_time")
    private Date nextFollowTime;

    /**
     * 跟进内容
     */
    @TableField("content")
    private String content;

    /**
     * 客户当前阶段
     */
    @TableField("stage")
    private String stage;

    /**
     * 成交可能性(%)
     */
    @TableField("probability")
    private Integer probability;

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
    private String employeeName;
}