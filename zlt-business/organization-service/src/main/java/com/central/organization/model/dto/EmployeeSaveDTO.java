package com.central.organization.model.dto;

import com.central.organization.annotation.LongToString;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * 员工保存DTO
 */
@Data
public class EmployeeSaveDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 员工ID(编辑时需要)
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
    @NotBlank(message = "姓名不能为空")
    private String name;

    /**
     * 英文姓名
     */
    private String nameEn;

    /**
     * 性别(1:男,2:女)
     */
    @NotNull(message = "性别不能为空")
    private Integer gender;

    /**
     * 出生日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date birthDate;

    /**
     * 身份证号
     */
    @Pattern(regexp = "^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$", 
             message = "身份证号格式不正确")
    private String idCard;

    /**
     * 手机号
     */
    @NotBlank(message = "手机号不能为空")
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String mobile;

    /**
     * 邮箱
     */
    @Email(message = "邮箱格式不正确")
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
    @NotNull(message = "部门不能为空")
    @LongToString
    private Long departmentId;

    /**
     * 主岗位ID
     */
    @NotNull(message = "主岗位不能为空")
    @LongToString
    private Long positionId;

    /**
     * 副岗位ID列表
     */
    private List<Long> secondaryPositionIds;

    /**
     * 员工等级ID
     */
    @LongToString
    private Long gradeId;

    /**
     * 用工类型(1:正式员工,2:实习生,3:外包员工,4:劳务员工)
     */
    @NotNull(message = "用工类型不能为空")
    private Integer employmentType;

    /**
     * 在职状态(1:在职,2:试用,3:离职,4:停职)
     */
    @NotNull(message = "在职状态不能为空")
    private Integer employmentStatus;

    /**
     * 入职日期
     */
    @NotNull(message = "入职日期不能为空")
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
     * 家庭成员信息
     */
    private List<FamilyMemberDTO> familyMembers;

    /**
     * 教育经历
     */
    private List<EducationHistoryDTO> educationHistory;

    /**
     * 工作经验
     */
    private List<WorkExperienceDTO> workExperience;

    /**
     * 家庭成员DTO
     */
    @Data
    public static class FamilyMemberDTO implements Serializable {
        private String name;
        private String relationship;
        private String position;
        private String company;
        private String phone;
        private String remark;
    }

    /**
     * 教育经历DTO
     */
    @Data
    public static class EducationHistoryDTO implements Serializable {
        private String school;
        @JsonFormat(pattern = "yyyy-MM-dd")
        private Date startDate;
        @JsonFormat(pattern = "yyyy-MM-dd")
        private Date endDate;
        private String major;
        private String degree;
        private String referee;
        private String refereePhone;
        private String certificate;
        private String remark;
    }

    /**
     * 工作经验DTO
     */
    @Data
    public static class WorkExperienceDTO implements Serializable {
        private String company;
        @JsonFormat(pattern = "yyyy-MM-dd")
        private Date startDate;
        @JsonFormat(pattern = "yyyy-MM-dd")
        private Date endDate;
        private String position;
        private String salary;
        private String leaveReason;
        private String referee;
        private String refereePhone;
        private String responsibility;
        private String remark;
    }
} 