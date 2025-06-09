package com.central.organization.dto;

import lombok.Data;
import lombok.experimental.Accessors;

import java.io.Serializable;

/**
 * 员工搜索条件DTO
 * 
 * @author Portal Team
 * @since 2024-01-01
 */
@Data
@Accessors(chain = true)
public class EmployeeSearchDTO implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 搜索关键词（姓名、员工编号）
     */
    private String keyword;
    
    /**
     * 部门ID
     */
    private Long departmentId;
    
    /**
     * 是否包含子部门
     */
    private Boolean includeSubDepts;
    
    /**
     * 岗位ID
     */
    private Long positionId;
    
    /**
     * 在职状态(1:在职,2:试用,3:离职)
     */
    private Integer employmentStatus;
    
    /**
     * 用工类型(1:正式,2:实习,3:外包,4:劳务)
     */
    private Integer employmentType;
    
    /**
     * 员工等级ID
     */
    private Long gradeId;
    
    /**
     * 性别(1:男,2:女)
     */
    private Integer gender;
    
    /**
     * 入职日期开始
     */
    private String entryDateStart;
    
    /**
     * 入职日期结束
     */
    private String entryDateEnd;
    
    /**
     * 年龄范围开始
     */
    private Integer ageStart;
    
    /**
     * 年龄范围结束
     */
    private Integer ageEnd;
    
    /**
     * 学历
     */
    private String education;
    
    /**
     * 民族
     */
    private String nation;
    
    /**
     * 婚姻状况
     */
    private String maritalStatus;
    
    /**
     * 手机号
     */
    private String mobile;
    
    /**
     * 邮箱
     */
    private String email;
    
    /**
     * 身份证号
     */
    private String idCard;
    
    /**
     * 籍贯
     */
    private String birthplace;
    
    /**
     * 现居住地
     */
    private String residence;
    
    /**
     * 专业技能
     */
    private String specialty;
    
    /**
     * 是否有登录账号
     */
    private Boolean hasLoginAccount;
    
    /**
     * 创建时间开始
     */
    private String createTimeStart;
    
    /**
     * 创建时间结束
     */
    private String createTimeEnd;
    
    /**
     * 试用期结束日期开始
     */
    private String probationEndStart;
    
    /**
     * 试用期结束日期结束
     */
    private String probationEndEnd;
    
    /**
     * 离职日期开始
     */
    private String leaveDateStart;
    
    /**
     * 离职日期结束
     */
    private String leaveDateEnd;
    
    /**
     * 排序字段
     */
    private String sortField;
    
    /**
     * 排序方向(ASC/DESC)
     */
    private String sortOrder;
} 