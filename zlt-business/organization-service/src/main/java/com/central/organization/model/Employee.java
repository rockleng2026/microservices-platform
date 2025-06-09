package com.central.organization.model;

import com.central.organization.annotation.LongToString;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Date;

/**
 * 员工实体
 * 基于原employee表扩展，支持多租户
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class Employee implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 员工ID
     */
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
     * 性别(1:男,2:女)
     */
    private Integer gender;

    /**
     * 出生日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date birthDate;

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
     * 座机电话
     */
    private String phone;

    /**
     * 家庭住址
     */
    private String address;

    /**
     * 紧急联系人
     */
    private String emergencyContact;

    /**
     * 紧急联系人电话
     */
    private String emergencyPhone;

    /**
     * 部门ID
     */
    @LongToString
    private Long departmentId;

    /**
     * 部门名称(冗余字段)
     */
    private String departmentName;

    /**
     * 主岗位ID
     */
    @LongToString
    private Long positionId;

    /**
     * 主岗位名称(冗余字段)
     */
    private String positionName;

    /**
     * 副岗位ID列表(JSON格式)
     */
    private String secondaryPositionIds;

    /**
     * 员工等级ID
     */
    @LongToString
    private Long gradeId;

    /**
     * 员工等级名称
     */
    private String gradeName;

    /**
     * 用工类型(1:正式员工,2:实习生,3:外包员工,4:劳务员工)
     */
    private Integer employmentType;

    /**
     * 在职状态(1:在职,2:试用,3:离职,4:停职)
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
    private Date regularDate;

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
     * 头像地址
     */
    private String avatar;

    /**
     * 工号
     */
    private String jobNumber;

    /**
     * 直接主管ID
     */
    @LongToString
    private Long supervisorId;

    /**
     * 直接主管姓名
     */
    private String supervisorName;

    /**
     * 工作地点
     */
    private String workLocation;

    /**
     * 学历(1:小学,2:初中,3:高中,4:中专,5:大专,6:本科,7:硕士,8:博士)
     */
    private Integer education;

    /**
     * 毕业院校
     */
    private String graduateSchool;

    /**
     * 专业
     */
    private String major;

    /**
     * 政治面貌(1:群众,2:团员,3:党员,4:民主党派,5:其他)
     */
    private Integer politicalStatus;

    /**
     * 婚姻状况(1:未婚,2:已婚,3:离异,4:丧偶)
     */
    private Integer maritalStatus;

    /**
     * 民族
     */
    private String ethnicity;

    /**
     * 籍贯
     */
    private String nativePlace;

    /**
     * 户口性质(1:城镇,2:农村)
     */
    private Integer householdType;

    /**
     * 社保号
     */
    private String socialSecurityNumber;

    /**
     * 公积金账号
     */
    private String housingFundAccount;

    /**
     * 银行卡号
     */
    private String bankAccount;

    /**
     * 开户银行
     */
    private String bankName;

    /**
     * 备注
     */
    private String remark;

    /**
     * 排序号
     */
    private Integer sortOrder;

    /**
     * 状态(1:启用,0:禁用)
     */
    private Integer status;

    /**
     * 删除标识(0:正常,1:删除)
     */
    private Integer delflag;

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
     * 租户ID
     */
    private String tenantId;

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

    /**
     * 创建人姓名
     */
    private String createdByName;

    /**
     * 更新人姓名
     */
    private String updatedByName;

    /**
     * 获取性别名称
     */
    public String getGenderName() {
        if (gender == null) return "";
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
        if (employmentType == null) return "";
        switch (employmentType) {
            case 1: return "正式员工";
            case 2: return "实习生";
            case 3: return "外包员工";
            case 4: return "劳务员工";
            default: return "未知";
        }
    }

    /**
     * 获取在职状态名称
     */
    public String getEmploymentStatusName() {
        if (employmentStatus == null) return "";
        switch (employmentStatus) {
            case 1: return "在职";
            case 2: return "试用";
            case 3: return "离职";
            case 4: return "停职";
            default: return "未知";
        }
    }

    /**
     * 获取学历名称
     */
    public String getEducationName() {
        if (education == null) return "";
        switch (education) {
            case 1: return "小学";
            case 2: return "初中";
            case 3: return "高中";
            case 4: return "中专";
            case 5: return "大专";
            case 6: return "本科";
            case 7: return "硕士";
            case 8: return "博士";
            default: return "未知";
        }
    }

    /**
     * 获取政治面貌名称
     */
    public String getPoliticalStatusName() {
        if (politicalStatus == null) return "";
        switch (politicalStatus) {
            case 1: return "群众";
            case 2: return "团员";
            case 3: return "党员";
            case 4: return "民主党派";
            case 5: return "其他";
            default: return "未知";
        }
    }

    /**
     * 获取婚姻状况名称
     */
    public String getMaritalStatusName() {
        if (maritalStatus == null) return "";
        switch (maritalStatus) {
            case 1: return "未婚";
            case 2: return "已婚";
            case 3: return "离异";
            case 4: return "丧偶";
            default: return "未知";
        }
    }

    /**
     * 是否在职
     */
    public boolean isActive() {
        return employmentStatus != null && (employmentStatus == 1 || employmentStatus == 2);
    }

    /**
     * 是否试用期
     */
    public boolean isProbation() {
        return employmentStatus != null && employmentStatus == 2;
    }
} 