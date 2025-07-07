package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 工资计算结果实体
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("soo_payroll_result")
public class PayrollResult implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableField("task_id")
    private String taskId;

    @TableField("task_name")
    private String taskName;

    @TableField("calculation_version")
    private Integer calculationVersion;

    @TableField("month")
    private String month;

    @TableField("employee_id")
    private Long employeeId;

    @TableField("employee_name")
    private String employeeName;

    @TableField("employee_no")
    private String employeeNo;

    @TableField("department_id")
    private Long departmentId;

    @TableField("department_name")
    private String departmentName;

    @TableField("position_id")
    private Long positionId;

    @TableField("position_name")
    private String positionName;

    @TableField("job_level_code")
    private String jobLevelCode;

    @TableField("region")
    private String region;

    // 基础工资相关
    @TableField("base_salary")
    private BigDecimal baseSalary;

    @TableField("region_coefficient")
    private BigDecimal regionCoefficient;

    @TableField("adjusted_base_salary")
    private BigDecimal adjustedBaseSalary;

    // 绩效相关
    @TableField("performance_score")
    private BigDecimal performanceScore;

    @TableField("performance_ratio")
    private BigDecimal performanceRatio;

    @TableField("performance_pay")
    private BigDecimal performancePay;

    // 提成奖金相关
    @TableField("personal_project_profit")
    private BigDecimal personalProjectProfit;

    @TableField("personal_commission_rate")
    private BigDecimal personalCommissionRate;

    @TableField("personal_commission")
    private BigDecimal personalCommission;

    @TableField("team_project_profit")
    private BigDecimal teamProjectProfit;

    @TableField("team_commission_rate")
    private BigDecimal teamCommissionRate;

    @TableField("team_commission")
    private BigDecimal teamCommission;

    @TableField("department_bonus")
    private BigDecimal departmentBonus;

    @TableField("other_allowance")
    private BigDecimal otherAllowance;

    @TableField("other_deduction")
    private BigDecimal otherDeduction;

    // 工资汇总
    @TableField("gross_pay")
    private BigDecimal grossPay;

    // 个人扣除明细
    @TableField("personal_pension")
    private BigDecimal personalPension;

    @TableField("personal_medical")
    private BigDecimal personalMedical;

    @TableField("personal_unemployment")
    private BigDecimal personalUnemployment;

    @TableField("personal_housing_fund")
    private BigDecimal personalHousingFund;

    @TableField("personal_social_total")
    private BigDecimal personalSocialTotal;

    // 个税计算
    @TableField("taxable_income")
    private BigDecimal taxableIncome;

    @TableField("personal_income_tax")
    private BigDecimal personalIncomeTax;

    @TableField("net_pay")
    private BigDecimal netPay;

    // 公司成本明细
    @TableField("company_pension")
    private BigDecimal companyPension;

    @TableField("company_medical")
    private BigDecimal companyMedical;

    @TableField("company_unemployment")
    private BigDecimal companyUnemployment;

    @TableField("company_maternity")
    private BigDecimal companyMaternity;

    @TableField("company_injury")
    private BigDecimal companyInjury;

    @TableField("company_housing_fund")
    private BigDecimal companyHousingFund;

    @TableField("company_social_total")
    private BigDecimal companySocialTotal;

    @TableField("total_company_cost")
    private BigDecimal totalCompanyCost;

    // 计算相关
    @TableField("calculation_rule_snapshot")
    private String calculationRuleSnapshot;

    @TableField("calculation_details")
    private String calculationDetails;

    @TableField("calculation_log")
    private String calculationLog;

    @TableField("calculation_status")
    private String calculationStatus;

    @TableField("error_message")
    private String errorMessage;

    // 确认和审批
    @TableField("is_current_version")
    private Boolean isCurrentVersion;

    @TableField("is_final")
    private Boolean isFinal;

    @TableField("confirmed_by")
    private Long confirmedBy;

    @TableField("confirmed_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime confirmedAt;

    @TableField("approval_status")
    private String approvalStatus;

    @TableField("approved_by")
    private Long approvedBy;

    @TableField("approved_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime approvedAt;

    @TableField("approval_remark")
    private String approvalRemark;

    // 系统字段
    @TableField("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    @TableField("created_by")
    private Long createdBy;

    @TableField("updated_by")
    private Long updatedBy;

    @TableField("tenant_id")
    private String tenantId;

    @TableField("delflag")
    private Boolean delflag;

    // 计算状态枚举
    public static class CalculationStatus {
        public static final String SUCCESS = "SUCCESS";
        public static final String FAILED = "FAILED";
        public static final String WARNING = "WARNING";
    }

    // 审批状态枚举
    public static class ApprovalStatus {
        public static final String PENDING = "PENDING";
        public static final String APPROVED = "APPROVED";
        public static final String REJECTED = "REJECTED";
    }
} 