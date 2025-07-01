package com.central.crm.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.central.crm.annotation.LongToString;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Date;

/**
 * 商机实体类
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Data
@TableName("opportunity")
public class Opportunity {

    /**
     * 商机ID
     */
    @LongToString
    @TableId(value = "opportunity_id", type = IdType.ASSIGN_ID)
    private Long opportunityId;

    /**
     * 租户ID
     */
    @TableField("tenant_id")
    private String tenantId;

    /**
     * 客户ID
     */
    @LongToString
    @TableField("customer_id")
    private Long customerId;

    /**
     * 商机名称
     */
    @TableField("opportunity_name")
    private String opportunityName;

    /**
     * 商机来源
     */
    @TableField("opportunity_source")
    private String opportunitySource;

    /**
     * 销售阶段
     */
    @TableField("stage")
    private String stage;

    /**
     * 成功概率(%)
     */
    @TableField("probability")
    private Integer probability;

    /**
     * 预期金额
     */
    @TableField("expected_amount")
    private BigDecimal expectedAmount;

    /**
     * 预期成交日期
     */
    @TableField("expected_close_date")
    private Date expectedCloseDate;

    /**
     * 负责员工ID
     */
    @LongToString
    @TableField("owner_employee_id")
    private Long ownerEmployeeId;

    /**
     * 竞争对手
     */
    @TableField("competitor")
    private String competitor;

    /**
     * 商机描述
     */
    @TableField("description")
    private String description;

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

    /**
     * 是否删除：0-否，1-是
     */
    @TableField("is_deleted")
    private Integer isDeleted;

    // 扩展字段，不对应数据库字段
    @TableField(exist = false)
    private String customerName;

    @TableField(exist = false)
    private String ownerEmployeeName;
}