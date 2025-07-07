package com.central.soo.model.dto;

import lombok.Data;
import java.util.List;

/**
 * 薪酬趋势查询DTO
 */
@Data
public class SalaryTrendQueryDTO {
    
    /**
     * 开始月份
     */
    private String startMonth;
    
    /**
     * 结束月份
     */
    private String endMonth;
    
    /**
     * 部门ID列表
     */
    private List<Long> departmentIds;
    
    /**
     * 员工ID列表
     */
    private List<Long> employeeIds;
    
    /**
     * 分析类型：COMPANY, DEPARTMENT, EMPLOYEE
     */
    private String analysisType;
} 