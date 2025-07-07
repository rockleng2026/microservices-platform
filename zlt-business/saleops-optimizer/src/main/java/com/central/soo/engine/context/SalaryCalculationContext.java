package com.central.soo.engine.context;

import com.central.soo.model.MonthlyPerformance;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 薪酬计算上下文
 * 包含计算过程中需要的所有数据
 */
@Data
public class SalaryCalculationContext {

    /**
     * 计算月份
     */
    private String month;

    /**
     * 员工基础信息
     */
    private EmployeeInfo employee;

    /**
     * 薪酬配置信息
     */
    private SalaryConfig salaryConfig;

    /**
     * 月度绩效数据
     */
    private MonthlyPerformance performance;

    /**
     * 职级工资配置
     */
    private JobLevelSalary jobLevelSalary;

    /**
     * 地区系数配置
     */
    private RegionalCoefficient regionalCoefficient;

    /**
     * 社保配置
     */
    private SocialSecurityConfig socialSecurityConfig;

    /**
     * 部门分红配置
     */
    private DepartmentBonusConfig departmentBonusConfig;

    /**
     * 盈亏平衡分析数据（用于部门分红计算）
     */
    private BreakevenAnalysisData breakevenAnalysis;

    /**
     * 员工基础信息
     */
    @Data
    public static class EmployeeInfo {
        private Long id;
        private String name;
        private String employeeNo;
        private Long departmentId;
        private String departmentName;
        private Long positionId;
        private String positionName;
        private String region;
        private Integer status;
    }

    /**
     * 薪酬配置信息
     */
    @Data
    public static class SalaryConfig {
        private Long employeeId;
        private BigDecimal baseSalary;
        private String region;
        private Boolean isSalesIncentive;
        private BigDecimal salesIncentiveRatio;
        private Boolean isTeamIncentive;
        private BigDecimal teamIncentiveRatio;
        private Boolean isDepartmentBonus;
        private Integer status;
    }

    /**
     * 职级工资配置
     */
    @Data
    public static class JobLevelSalary {
        private Long positionId;
        private String jobLevelCode;
        private BigDecimal performanceRatioMin;
        private BigDecimal performanceRatioMax;
        private BigDecimal commissionRatioMin;
        private BigDecimal commissionRatioMax;
        private Integer status;
    }

    /**
     * 地区系数配置
     */
    @Data
    public static class RegionalCoefficient {
        private String region;
        private BigDecimal salaryCoefficient;
        private Integer status;
    }

    /**
     * 社保配置
     */
    @Data
    public static class SocialSecurityConfig {
        private String region;
        private Integer year;
        private BigDecimal socialSecurityBaseLower;
        private BigDecimal socialSecurityBaseUpper;
        private BigDecimal housingFundBaseLower;
        private BigDecimal housingFundBaseUpper;
        private BigDecimal pensionPersonalRatio;
        private BigDecimal pensionCompanyRatio;
        private BigDecimal medicalPersonalRatio;
        private BigDecimal medicalCompanyRatio;
        private BigDecimal unemploymentPersonalRatio;
        private BigDecimal unemploymentCompanyRatio;
        private BigDecimal maternityCompanyRatio;
        private BigDecimal injuryCompanyRatio;
        private BigDecimal housingFundPersonalRatio;
        private BigDecimal housingFundCompanyRatio;
    }

    /**
     * 部门分红配置
     */
    @Data
    public static class DepartmentBonusConfig {
        private Long departmentId;
        private BigDecimal bonusWeight;
        private Integer status;
    }

    /**
     * 盈亏平衡分析数据
     */
    @Data
    public static class BreakevenAnalysisData {
        private String period;
        private BigDecimal distributableProfit;
    }
} 