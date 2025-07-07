package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 薪酬统计汇总实体
 */
@Data
@TableName("soo_salary_summary")
public class SalarySummary {
    
    @TableId
    private Long id;
    
    /**
     * 任务ID
     */
    private String taskId;
    
    /**
     * 汇总类型：COMPANY, DEPARTMENT, POSITION
     */
    private String summaryType;
    
    /**
     * 部门ID
     */
    private Long departmentId;
    
    /**
     * 职位ID
     */
    private Long positionId;
    
    /**
     * 总员工数
     */
    private Integer totalEmployeeCount;
    
    /**
     * 参与计算员工数
     */
    private Integer calculationEmployeeCount;
    
    /**
     * 基础工资总额
     */
    private BigDecimal totalBaseSalary;
    
    /**
     * 应发工资总额
     */
    private BigDecimal totalGrossPay;
    
    /**
     * 实发工资总额
     */
    private BigDecimal totalNetPay;
    
    /**
     * 公司总成本
     */
    private BigDecimal totalCompanyCost;
    
    /**
     * 平均应发工资
     */
    private BigDecimal avgGrossPay;
    
    /**
     * 平均实发工资
     */
    private BigDecimal avgNetPay;
    
    /**
     * 平均公司成本
     */
    private BigDecimal avgCompanyCost;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
} 