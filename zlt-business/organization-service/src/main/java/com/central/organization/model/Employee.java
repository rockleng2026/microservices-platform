package com.central.organization.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.central.common.model.SuperEntity;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 员工实体类
 * 基于原有employee表结构扩展
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("employee")
public class Employee extends SuperEntity {

    @TableId(value = "id", type = IdType.AUTO)
    private Integer id;

    /**
     * UUID(兼容原字段)
     */
    private String uuid;

    /**
     * 员工编号(兼容原字段)
     */
    private String empNo;

    /**
     * 员工编号
     */
    private String empNo2;

    /**
     * 姓名
     */
    private String name;

    /**
     * 英文姓名
     */
    private String nameEn;

    /**
     * 生日(兼容原字段)
     */
    private String birth;

    /**
     * 出生日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate birthDate;

    /**
     * 性别(兼容原字段)
     */
    private Integer sex;

    /**
     * 性别(1:男,2:女)
     */
    private Integer gender;

    /**
     * 身份证号(兼容原字段)
     */
    private String cardid;

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
     * 电话(兼容原字段)
     */
    @TableField("Tel")
    private String tel;

    /**
     * 部门ID(兼容原字段)
     */
    private Integer department;

    /**
     * 部门ID
     */
    private Integer departmentId;

    /**
     * 职位ID(兼容原字段)
     */
    private Integer position;

    /**
     * 主岗位ID
     */
    private Integer positionId;

    /**
     * 工作岗位(兼容原字段)
     */
    private Integer workposition;

    /**
     * 副岗位ID列表
     */
    private String secondaryPositionIds;

    /**
     * 员工等级(兼容原字段)
     */
    private Integer gradeid;

    /**
     * 员工等级ID
     */
    private Integer gradeId;

    /**
     * 用工类型(1:正式,2:实习,3:外包,4:劳务)
     */
    private Integer employmentType;

    /**
     * 是否在职(兼容原字段)
     */
    private Integer isLeave;

    /**
     * 在职状态(1:在职,2:试用,3:离职)
     */
    private Integer employmentStatus;

    /**
     * 入职时间(兼容原字段)
     */
    private String entryTime;

    /**
     * 入职日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate entryDate;

    /**
     * 试用期结束日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate probationEndDate;

    /**
     * 离职时间(兼容原字段)
     */
    private String leaveTime;

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
     * 是否有登录账号(兼容原字段)
     */
    private Integer isLoginAccount;

    /**
     * 学历
     */
    private String education;

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
     * 籍贯
     */
    private String birthplace;

    /**
     * 现居住地
     */
    private String residence;

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
     * 创建人
     */
    private Integer createdBy;

    /**
     * 更新人
     */
    private Integer updatedBy;

    // 非数据库字段

    /**
     * 部门名称
     */
    @TableField(exist = false)
    private String departmentName;

    /**
     * 主岗位名称
     */
    @TableField(exist = false)
    private String positionName;

    /**
     * 副岗位名称列表
     */
    @TableField(exist = false)
    private List<String> secondaryPositionNames;

    /**
     * 员工等级名称
     */
    @TableField(exist = false)
    private String gradeName;

    /**
     * 用工类型名称
     */
    @TableField(exist = false)
    private String employmentTypeName;

    /**
     * 在职状态名称
     */
    @TableField(exist = false)
    private String employmentStatusName;

    /**
     * 性别名称
     */
    @TableField(exist = false)
    private String genderName;

    /**
     * 工龄
     */
    @TableField(exist = false)
    private String workAge;

    /**
     * 年龄
     */
    @TableField(exist = false)
    private Integer age;

    /**
     * 部门路径
     */
    @TableField(exist = false)
    private String deptPath;

    /**
     * 扩展信息
     */
    @TableField(exist = false)
    private Object extendData;

    /**
     * 附件列表
     */
    @TableField(exist = false)
    private List<EmployeeAttachment> attachments;
} 