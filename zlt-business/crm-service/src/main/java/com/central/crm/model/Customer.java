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
 * 客户实体类
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Data
@TableName("customer")
public class Customer {

    /**
     * 客户ID
     */
    @LongToString
    @TableId(value = "customer_id", type = IdType.ASSIGN_ID)
    private Long customerId;

    /**
     * 租户ID
     */
    @TableField("tenant_id")
    private String tenantId;

    /**
     * 客户名称
     */
    @TableField("customer_name")
    private String customerName;

    /**
     * 客户类型：个人、企业
     */
    @TableField("customer_type")
    private String customerType;

    /**
     * 客户状态：潜在客户、已确认、已流失
     */
    @TableField("customer_status")
    private String customerStatus;

    /**
     * 客户来源：电话、网络、介绍等
     */
    @TableField("customer_source")
    private String customerSource;

    /**
     * 负责员工ID
     */
    @LongToString
    @TableField("owner_employee_id")
    private Long ownerEmployeeId;

    /**
     * 联系电话
     */
    @TableField("contact_phone")
    private String contactPhone;

    /**
     * 联系邮箱
     */
    @TableField("contact_email")
    private String contactEmail;

    /**
     * 联系地址
     */
    @TableField("contact_address")
    private String contactAddress;

    /**
     * 所属行业
     */
    @TableField("industry")
    private String industry;

    /**
     * 公司规模
     */
    @TableField("company_scale")
    private String companyScale;

    /**
     * 年营收
     */
    @TableField("annual_revenue")
    private BigDecimal annualRevenue;

    /**
     * 公司网站
     */
    @TableField("website")
    private String website;

    /**
     * 客户描述
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
    private String ownerEmployeeName;

    // 个人客户扩展信息
    @TableField(exist = false)
    private IndividualCustomer individualCustomer;

    // 企业客户扩展信息
    @TableField(exist = false)
    private CorporateCustomer corporateCustomer;
}