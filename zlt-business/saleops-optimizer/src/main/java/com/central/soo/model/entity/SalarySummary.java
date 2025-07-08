package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 薪酬统计汇总实体
 */
@Data
@TableName("soo_salary_summary")
public class SalarySummary {
    
    @TableId(type = IdType.AUTO)
    private Long id;
    
    /**
     * 计算任务ID
     */
    private String taskId;
    
    /**
     * 汇总类型(TOTAL全公司,DEPARTMENT部门)
     */
    private String summaryType;
    
    /**
     * 月份(YYYY-MM)
     */
    private String month;
    
    /**
     * 部门ID(类型为DEPARTMENT时必填)
     */
    private Long departmentId;
    
    /**
     * 部门名称
     */
    private String departmentName;
    
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
     * 绩效工资总额
     */
    private BigDecimal totalPerformancePay;
    
    /**
     * 提成总额
     */
    private BigDecimal totalCommission;
    
    /**
     * 奖金总额
     */
    private BigDecimal totalBonus;
    
    /**
     * 补贴总额
     */
    private BigDecimal totalAllowance;
    
    /**
     * 应发工资总额
     */
    private BigDecimal totalGrossPay;
    
    /**
     * 扣除总额
     */
    private BigDecimal totalDeduction;
    
    /**
     * 实发工资总额
     */
    private BigDecimal totalNetPay;
    
    /**
     * 个人社保公积金总额
     */
    private BigDecimal totalPersonalSocial;
    
    /**
     * 公司社保公积金总额
     */
    private BigDecimal totalCompanySocial;
    
    /**
     * 个人所得税总额
     */
    private BigDecimal totalPersonalTax;
    
    /**
     * 公司总成本
     */
    private BigDecimal totalCompanyCost;
    
    /**
     * 人均应发工资
     */
    private BigDecimal avgGrossPay;
    
    /**
     * 人均实发工资
     */
    private BigDecimal avgNetPay;
    
    /**
     * 人均公司成本
     */
    private BigDecimal avgCompanyCost;
    
    /**
     * 创建时间
     */
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;
    
    /**
     * 创建人
     */
    private Long createdBy;
    
    /**
     * 更新人
     */
    private Long updatedBy;
    
    /**
     * 租户ID
     */
    private String tenantId;
    
    /**
     * 删除标识
     */
    private Integer delflag;
} 