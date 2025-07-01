package com.central.crm.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.central.crm.annotation.LongToString;
import lombok.Data;

import java.util.Date;

/**
 * 个人客户扩展信息实体类
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Data
@TableName("individual_customer")
public class IndividualCustomer {

    /**
     * 主键ID
     */
    @LongToString
    @TableId(value = "id", type = IdType.ASSIGN_ID)
    private Long id;

    /**
     * 客户ID
     */
    @LongToString
    @TableField("customer_id")
    private Long customerId;

    /**
     * 真实姓名
     */
    @TableField("real_name")
    private String realName;

    /**
     * 身份证号
     */
    @TableField("id_card")
    private String idCard;

    /**
     * 性别：男、女
     */
    @TableField("gender")
    private String gender;

    /**
     * 出生日期
     */
    @TableField("birth_date")
    private Date birthDate;

    /**
     * 婚姻状况：未婚、已婚、离异、丧偶
     */
    @TableField("marital_status")
    private String maritalStatus;

    /**
     * 学历：小学、初中、高中、大专、本科、硕士、博士
     */
    @TableField("education")
    private String education;

    /**
     * 职业
     */
    @TableField("occupation")
    private String occupation;

    /**
     * 年收入
     */
    @TableField("annual_income")
    private String annualIncome;

    /**
     * 家庭地址
     */
    @TableField("home_address")
    private String homeAddress;

    /**
     * 工作单位
     */
    @TableField("work_company")
    private String workCompany;

    /**
     * 工作地址
     */
    @TableField("work_address")
    private String workAddress;

    /**
     * 兴趣爱好
     */
    @TableField("hobbies")
    private String hobbies;

    /**
     * 微信号
     */
    @TableField("wechat")
    private String wechat;

    /**
     * QQ号
     */
    @TableField("qq")
    private String qq;

    /**
     * 紧急联系人
     */
    @TableField("emergency_contact")
    private String emergencyContact;

    /**
     * 紧急联系人电话
     */
    @TableField("emergency_phone")
    private String emergencyPhone;

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