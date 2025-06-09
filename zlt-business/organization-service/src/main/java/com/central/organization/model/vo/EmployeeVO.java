package com.central.organization.model.vo;

import com.central.organization.annotation.LongToString;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 员工视图对象
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
public class EmployeeVO {

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
     * 性别描述
     */
    private String genderText;

    /**
     * 出生日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;

    /**
     * 年龄
     */
    private Integer age;

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
     * 头像地址
     */
    private String avatar;

    /**
     * 部门ID
     */
    @LongToString
    private Long departmentId;

    /**
     * 部门名称
     */
    private String departmentName;

    /**
     * 部门路径
     */
    private String departmentPath;

    /**
     * 主岗位ID
     */
    @LongToString
    private Long positionId;

    /**
     * 主岗位名称
     */
    private String positionName;

    /**
     * 副岗位ID列表
     */
    private String secondaryPositionIds;

    /**
     * 副岗位列表
     */
    private List<PositionInfo> secondaryPositions;

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
     * 用工类型描述
     */
    private String employmentTypeText;

    /**
     * 在职状态(1:在职,2:试用,3:离职,4:停职)
     */
    private Integer employmentStatus;

    /**
     * 在职状态描述
     */
    private String employmentStatusText;

    /**
     * 入职日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate entryDate;

    /**
     * 工作天数
     */
    private Integer workDays;

    /**
     * 试用期结束日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate probationEndDate;

    /**
     * 转正日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate regularizationDate;

    /**
     * 离职日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate leaveDate;

    /**
     * 离职原因
     */
    private String leaveReason;

    /**
     * 工作年限
     */
    private Integer workYears;

    /**
     * 学历水平(1:小学,2:初中,3:高中,4:中专,5:大专,6:本科,7:硕士,8:博士)
     */
    private Integer educationLevel;

    /**
     * 学历描述
     */
    private String educationLevelText;

    /**
     * 毕业院校
     */
    private String graduationSchool;

    /**
     * 专业
     */
    private String major;

    /**
     * 婚姻状况(1:未婚,2:已婚,3:离异,4:丧偶)
     */
    private Integer maritalStatus;

    /**
     * 婚姻状况描述
     */
    private String maritalStatusText;

    /**
     * 居住地址
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
     * 个人描述
     */
    private String description;

    /**
     * 状态(1:启用,0:禁用)
     */
    private Integer status;

    /**
     * 状态描述
     */
    private String statusText;

    /**
     * 家庭成员信息
     */
    private List<FamilyMember> familyMembers;

    /**
     * 教育经历
     */
    private List<EducationHistory> educationHistory;

    /**
     * 工作经验
     */
    private List<WorkExperience> workExperience;

    /**
     * 附件信息
     */
    private List<AttachmentInfo> attachments;

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
     * 创建人姓名
     */
    private String creatorName;

    /**
     * 岗位信息
     */
    @Data
    public static class PositionInfo {
        @LongToString
        private Long id;
        private String name;
        private String shortName;
    }

    /**
     * 家庭成员信息
     */
    @Data
    public static class FamilyMember {
        private String name;
        private String relationship;
        private String position;
        private String company;
    }

    /**
     * 教育经历
     */
    @Data
    public static class EducationHistory {
        private String school;
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate startDate;
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate endDate;
        private String major;
        private String degree;
        private String referee;
    }

    /**
     * 工作经验
     */
    @Data
    public static class WorkExperience {
        private String company;
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate startDate;
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate endDate;
        private String position;
        private String salary;
        private String leaveReason;
        private String referee;
        private String refereePhone;
    }

    /**
     * 附件信息
     */
    @Data
    public static class AttachmentInfo {
        @LongToString
        private Long id;
        private String fileName;
        private String fileType;
        private String fileUrl;
        private String attachmentType;
        private String description;
        private Integer status;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime uploadTime;
    }

    /**
     * 获取性别描述
     */
    public String getGenderText() {
        if (gender == null) return null;
        return switch (gender) {
            case 1 -> "男";
            case 2 -> "女";
            default -> "未知";
        };
    }

    /**
     * 获取用工类型描述
     */
    public String getEmploymentTypeText() {
        if (employmentType == null) return null;
        return switch (employmentType) {
            case 1 -> "正式员工";
            case 2 -> "实习生";
            case 3 -> "外包员工";
            case 4 -> "劳务员工";
            default -> "未知";
        };
    }

    /**
     * 获取在职状态描述
     */
    public String getEmploymentStatusText() {
        if (employmentStatus == null) return null;
        return switch (employmentStatus) {
            case 1 -> "在职";
            case 2 -> "试用";
            case 3 -> "离职";
            case 4 -> "停职";
            default -> "未知";
        };
    }

    /**
     * 获取学历描述
     */
    public String getEducationLevelText() {
        if (educationLevel == null) return null;
        return switch (educationLevel) {
            case 1 -> "小学";
            case 2 -> "初中";
            case 3 -> "高中";
            case 4 -> "中专";
            case 5 -> "大专";
            case 6 -> "本科";
            case 7 -> "硕士";
            case 8 -> "博士";
            default -> "未知";
        };
    }

    /**
     * 获取婚姻状况描述
     */
    public String getMaritalStatusText() {
        if (maritalStatus == null) return null;
        return switch (maritalStatus) {
            case 1 -> "未婚";
            case 2 -> "已婚";
            case 3 -> "离异";
            case 4 -> "丧偶";
            default -> "未知";
        };
    }

    /**
     * 获取状态描述
     */
    public String getStatusText() {
        if (status == null) return null;
        return switch (status) {
            case 1 -> "启用";
            case 0 -> "禁用";
            default -> "未知";
        };
    }
} 