package com.central.soo.model.dto;

import lombok.Data;
import java.util.List;

/**
 * 薪酬趋势结果DTO
 */
@Data
public class SalaryTrendDTO {
    
    /**
     * 月份列表
     */
    private List<String> months;
    
    /**
     * 总应发工资列表
     */
    private List<Integer> totalGrossPay;
    
    /**
     * 总实发工资列表
     */
    private List<Integer> totalNetPay;
    
    /**
     * 总公司成本列表
     */
    private List<Integer> totalCompanyCost;
    
    /**
     * 员工人数列表
     */
    private List<Integer> employeeCount;
    
    /**
     * 平均工资列表
     */
    private List<Integer> avgSalary;
} 