package com.central.organization.model.dto;

import com.central.organization.annotation.LongToString;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 员工查询DTO
 */
@Data
public class EmployeeQueryDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 员工姓名(模糊查询)
     */
    private String name;

    /**
     * 员工编号
     */
    private String empNo;

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
     * 部门ID
     */
    @LongToString
    private Long departmentId;

    /**
     * 部门ID列表(查询多个部门)
     */
    private Long[] departmentIds;

    /**
     * 岗位ID
     */
    @LongToString
    private Long positionId;

    /**
     * 员工等级ID
     */
    @LongToString
    private Long gradeId;

    /**
     * 性别(1:男,2:女)
     */
    private Integer gender;

    /**
     * 用工类型(1:正式员工,2:实习生,3:外包员工,4:劳务员工)
     */
    private Integer employmentType;

    /**
     * 在职状态(1:在职,2:试用,3:离职,4:停职)
     */
    private Integer employmentStatus;

    /**
     * 在职状态列表
     */
    private Integer[] employmentStatuses;

    /**
     * 学历(1:小学,2:初中,3:高中,4:中专,5:大专,6:本科,7:硕士,8:博士)
     */
    private Integer education;

    /**
     * 政治面貌(1:群众,2:团员,3:党员,4:民主党派,5:其他)
     */
    private Integer politicalStatus;

    /**
     * 婚姻状况(1:未婚,2:已婚,3:离异,4:丧偶)
     */
    private Integer maritalStatus;

    /**
     * 工作地点
     */
    private String workLocation;

    /**
     * 入职开始日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date entryDateStart;

    /**
     * 入职结束日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date entryDateEnd;

    /**
     * 离职开始日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date leaveDateStart;

    /**
     * 离职结束日期
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private Date leaveDateEnd;

    /**
     * 年龄最小值
     */
    private Integer ageMin;

    /**
     * 年龄最大值
     */
    private Integer ageMax;

    /**
     * 工龄最小值(年)
     */
    private Integer workYearsMin;

    /**
     * 工龄最大值(年)
     */
    private Integer workYearsMax;

    /**
     * 状态(1:启用,0:禁用)
     */
    private Integer status;

    /**
     * 关键字搜索(姓名、员工编号、手机号、邮箱)
     */
    private String keyword;

    /**
     * 是否包含离职员工
     */
    private Boolean includeLeaved;

    /**
     * 是否只查询试用期员工
     */
    private Boolean onlyProbation;

    /**
     * 是否只查询在职员工
     */
    private Boolean onlyActive;

    /**
     * 排序字段
     */
    private String sortField;

    /**
     * 排序方向(asc/desc)
     */
    private String sortDirection;

    /**
     * 页码
     */
    private Integer page = 1;

    /**
     * 每页数量
     */
    private Integer size = 20;
    
    /**
     * 分页偏移量
     */
    private Integer offset;
    
    /**
     * 获取offset值（计算分页偏移量）
     */
    public Integer getOffset() {
        if (offset != null) {
            return offset;
        }
        if (page == null || size == null || page <= 0 || size <= 0) {
            return 0;
        }
        return (page - 1) * size;
    }
    
    /**
     * 设置offset值
     */
    public void setOffset(Integer offset) {
        this.offset = offset;
    }
} 