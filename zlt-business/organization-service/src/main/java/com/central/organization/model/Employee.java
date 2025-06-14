package com.central.organization.model;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.central.organization.annotation.LongToString;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;

/**
 * 员工实体
 * 对应employee表结构
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("employee")
public class Employee implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 主键ID
     */
    @TableId
    @LongToString
    private Long id;

    /**
     * 员工编号
     */
    private String empNo;

    /**
     * 姓名
     */
    private String name;

    /**
     * 英文姓名
     */
    private String nameEn;

    /**
     * 出生日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date birthDate;

    /**
     * 年龄
     */
    private Integer age;

    /**
     * 性别(1:男,2:女)
     */
    private Integer gender;

    /**
     * 身份证号
     */
    private String idCard;

    /**
     * 手机号
     */
    private String mobile;

    /**
     * 邮箱
     */
    private String email;

    /**
     * 部门ID
     */
    @LongToString
    private Long departmentId;

    /**
     * 部门名称(关联查询字段)
     */
    @TableField(exist = false)
    private String departmentName;

    /**
     * 岗位ID
     */
    @LongToString
    private Long positionId;

    /**
     * 岗位名称(关联查询字段)
     */
    @TableField(exist = false)
    private String positionName;

    /**
     * 职级ID
     */
    @LongToString
    private Long gradeId;

    /**
     * 用工类型(1:正式员工,2:实习生,3:外包)
     */
    private Integer employmentType;

    /**
     * 在职状态(1:在职,2:离职,3:停薪留职)
     */
    private Integer employmentStatus;

    /**
     * 入职日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date entryDate;

    /**
     * 试用期结束日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date probationEndDate;

    /**
     * 转正日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date regularizationDate;

    /**
     * 离职日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date leaveDate;

    /**
     * 离职原因
     */
    private String leaveReason;

    /**
     * 登录账号状态(0:无登录账号,1:有登录账号,2:禁止登录)
     */
    private Integer loginAccountFlag;

    /**
     * 学历
     */
    private String education;

    /**
     * 毕业院校
     */
    private String graduationSchool;

    /**
     * 专业
     */
    private String major;

    /**
     * 民族
     */
    private String nation;

    /**
     * 健康状况
     */
    private String healthStatus;

    /**
     * 身高
     */
    private String height;

    /**
     * 体重
     */
    private String weight;

    /**
     * 婚姻状况
     */
    private String maritalStatus;

    /**
     * 工作年限
     */
    private Integer workYears;

    /**
     * 籍贯
     */
    private String birthplace;

    /**
     * 现居住地
     */
    private String address;

    /**
     * 紧急联系人
     */
    private String emergencyContact;

    /**
     * 紧急联系电话
     */
    private String emergencyPhone;

    /**
     * 专业技能
     */
    private String specialty;

    /**
     * 头像
     */
    private String avatar;

    /**
     * 备注
     */
    private String remark;

    /**
     * 删除标识
     */
    private Integer delflag;


    /**
     * 租户ID
     */
    private String tenantId;

    /**
     * 创建时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * 创建人ID
     */
    @LongToString
    private Long createdBy;

    /**
     * 更新人ID
     */
    @LongToString
    private Long updatedBy;

    // 业务方法

    /**
     * 获取性别名称
     */
    public String getGenderName() {
        if (gender == null) return "未知";
        switch (gender) {
            case 1: return "男";
            case 2: return "女";
            default: return "未知";
        }
    }

    /**
     * 获取用工类型名称
     */
    public String getEmploymentTypeName() {
        if (employmentType == null) return "未知";
        switch (employmentType) {
            case 1: return "正式员工";
            case 2: return "实习生";
            case 3: return "外包";
            default: return "未知";
        }
    }

    /**
     * 获取在职状态名称
     */
    public String getEmploymentStatusName() {
        if (employmentStatus == null) return "未知";
        switch (employmentStatus) {
            case 1: return "在职";
            case 2: return "离职";
            case 3: return "停薪留职";
            default: return "未知";
        }
    }

    /**
     * 是否在职
     */
    public boolean isActive() {
        return employmentStatus != null && employmentStatus == 1;
    }

    public void setSecondaryPositionIds(String collect) {
    }

    public boolean isProbation() {
        return  2 == employmentType;
    }

    public void setLeaveDate(Date leaveDate) {
        this.leaveDate = leaveDate;
    }

    public Date getLeaveDate() {
        return leaveDate;
    }

    public void setLeaveReason(String leaveReason) {
        this.leaveReason = leaveReason;
    }

    public String getLeaveReason() {
        return leaveReason;
    }
}