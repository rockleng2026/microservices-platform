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
 * 企业客户扩展信息实体类
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Data
@TableName("corporate_customer")
public class CorporateCustomer {

    /**
     * 主键ID
     */
    @LongToString
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

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
     * 公司全称
     */
    @TableField("company_full_name")
    private String companyFullName;

    /**
     * 统一社会信用代码
     */
    @TableField("credit_code")
    private String creditCode;

    /**
     * 法定代表人
     */
    @TableField("legal_person")
    private String legalPerson;

    /**
     * 注册资本
     */
    @TableField("registered_capital")
    private BigDecimal registeredCapital;

    /**
     * 成立日期
     */
    @TableField("establishment_date")
    private Date establishmentDate;

    /**
     * 经营范围
     */
    @TableField("business_scope")
    private String businessScope;

    /**
     * 公司性质：国有企业、民营企业、外资企业、合资企业、个体工商户
     */
    @TableField("company_nature")
    private String companyNature;

    /**
     * 员工规模：1-50人、51-200人、201-500人、501-1000人、1000人以上
     */
    @TableField("employee_count")
    private String employeeCount;

    /**
     * 主营产品
     */
    @TableField("main_products")
    private String mainProducts;

    /**
     * 主要客户群体
     */
    @TableField("target_customers")
    private String targetCustomers;

    /**
     * 公司官网
     */
    @TableField("official_website")
    private String officialWebsite;

    /**
     * 办公地址
     */
    @TableField("office_address")
    private String officeAddress;

    /**
     * 注册地址
     */
    @TableField("registered_address")
    private String registeredAddress;

    /**
     * 银行账户
     */
    @TableField("bank_account")
    private String bankAccount;

    /**
     * 开户银行
     */
    @TableField("bank_name")
    private String bankName;

    /**
     * 税务登记号
     */
    @TableField("tax_number")
    private String taxNumber;

    /**
     * 主要联系人
     */
    @TableField("main_contact")
    private String mainContact;

    /**
     * 联系人职位
     */
    @TableField("contact_position")
    private String contactPosition;

    /**
     * 联系人电话
     */
    @TableField("contact_phone")
    private String contactPhone;

    /**
     * 联系人邮箱
     */
    @TableField("contact_email")
    private String contactEmail;

    /**
     * 决策人信息
     */
    @TableField("decision_maker")
    private String decisionMaker;

    /**
     * 采购流程
     */
    @TableField("purchase_process")
    private String purchaseProcess;

    /**
     * 付款方式
     */
    @TableField("payment_method")
    private String paymentMethod;

    /**
     * 信用等级：AAA、AA、A、BBB、BB、B、CCC、CC、C、D
     */
    @TableField("credit_rating")
    private String creditRating;

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
}