package com.central.soo.engine;

import com.central.soo.engine.calculator.*;
import com.central.soo.engine.context.SalaryCalculationContext;
import com.central.soo.model.entity.PayrollResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * 薪酬计算引擎
 */
@Slf4j
@Component
public class SalaryCalculationEngine {

    @Autowired
    private List<SalaryCalculator> calculators;

    @Autowired
    private SalaryRuleEngine ruleEngine;

    /**
     * 计算员工工资
     */
    public PayrollResult calculateSalary(SalaryCalculationContext context) {
        log.info("开始计算员工工资，员工ID: {}, 月份: {}", 
                context.getEmployee().getId(), context.getMonth());

        try {
            PayrollResult result = new PayrollResult();
            result.setMonth(context.getMonth());
            result.setEmployeeId(context.getEmployee().getId());
            result.setEmployeeName(context.getEmployee().getName());
            result.setEmployeeNo(context.getEmployee().getEmployeeNo());
            result.setDepartmentId(context.getEmployee().getDepartmentId());
            result.setDepartmentName(context.getEmployee().getDepartmentName());
            result.setPositionId(context.getEmployee().getPositionId());
            result.setJobLevelCode(context.getJobLevelSalary().getJobLevelCode());
            result.setRegion(context.getSalaryConfig().getRegion());

            // 按顺序执行各个计算器
            for (SalaryCalculator calculator : calculators) {
                if (calculator.isApplicable(context)) {
                    try {
                        BigDecimal amount = calculator.calculate(context);
                        setCalculationResult(result, calculator.getCalculatorType(), amount);
                        log.debug("计算器 {} 计算完成，金额: {}", 
                                calculator.getCalculatorType(), amount);
                    } catch (Exception e) {
                        log.error("计算器 {} 计算失败: {}", 
                                calculator.getCalculatorType(), e.getMessage(), e);
                        throw new RuntimeException("工资计算失败: " + calculator.getCalculatorType(), e);
                    }
                }
            }

            // 计算最终金额
            calculateFinalAmounts(result);

            log.info("员工工资计算完成，员工ID: {}, 应发工资: {}, 实发工资: {}", 
                    context.getEmployee().getId(), result.getGrossPay(), result.getNetPay());

            return result;

        } catch (Exception e) {
            log.error("员工工资计算失败，员工ID: {}, 月份: {}, 错误: {}", 
                    context.getEmployee().getId(), context.getMonth(), e.getMessage(), e);
            throw new RuntimeException("工资计算失败", e);
        }
    }

    /**
     * 设置计算结果到PayrollResult对象
     */
    private void setCalculationResult(PayrollResult result, String calculatorType, BigDecimal amount) {
        switch (calculatorType) {
            case "base_salary":
                result.setBaseSalary(amount);
                break;
            case "adjusted_base_salary":
                result.setAdjustedBaseSalary(amount);
                break;
            case "performance_pay":
                result.setPerformancePay(amount);
                break;
            case "personal_commission":
                result.setPersonalCommission(amount);
                break;
            case "team_commission":
                result.setTeamCommission(amount);
                break;
            case "department_bonus":
                result.setDepartmentBonus(amount);
                break;
            case "personal_pension":
                result.setPersonalPension(amount);
                break;
            case "personal_medical":
                result.setPersonalMedical(amount);
                break;
            case "personal_unemployment":
                result.setPersonalUnemployment(amount);
                break;
            case "personal_housing_fund":
                result.setPersonalHousingFund(amount);
                break;
            case "company_pension":
                result.setCompanyPension(amount);
                break;
            case "company_medical":
                result.setCompanyMedical(amount);
                break;
            case "company_unemployment":
                result.setCompanyUnemployment(amount);
                break;
            case "company_maternity":
                result.setCompanyMaternity(amount);
                break;
            case "company_injury":
                result.setCompanyInjury(amount);
                break;
            case "company_housing_fund":
                result.setCompanyHousingFund(amount);
                break;
            case "personal_income_tax":
                result.setPersonalIncomeTax(amount);
                break;
            default:
                log.warn("未知的计算器类型: {}", calculatorType);
                break;
        }
    }

    /**
     * 计算最终金额
     */
    private void calculateFinalAmounts(PayrollResult result) {
        // 计算应发工资合计
        BigDecimal grossPay = BigDecimal.ZERO
                .add(nullToZero(result.getAdjustedBaseSalary()))
                .add(nullToZero(result.getPerformancePay()))
                .add(nullToZero(result.getPersonalCommission()))
                .add(nullToZero(result.getTeamCommission()))
                .add(nullToZero(result.getDepartmentBonus()));
        result.setGrossPay(grossPay);

        // 计算个人社保公积金合计
        BigDecimal personalSocialTotal = BigDecimal.ZERO
                .add(nullToZero(result.getPersonalPension()))
                .add(nullToZero(result.getPersonalMedical()))
                .add(nullToZero(result.getPersonalUnemployment()))
                .add(nullToZero(result.getPersonalHousingFund()));
        result.setPersonalSocialTotal(personalSocialTotal);

        // 计算应纳税所得额
        BigDecimal taxableIncome = grossPay
                .subtract(personalSocialTotal)
                .subtract(new BigDecimal("5000")); // 个税起征点
        result.setTaxableIncome(taxableIncome.max(BigDecimal.ZERO));

        // 计算实发工资
        BigDecimal netPay = grossPay
                .subtract(personalSocialTotal)
                .subtract(nullToZero(result.getPersonalIncomeTax()));
        result.setNetPay(netPay);

        // 计算公司社保公积金合计
        BigDecimal companySocialTotal = BigDecimal.ZERO
                .add(nullToZero(result.getCompanyPension()))
                .add(nullToZero(result.getCompanyMedical()))
                .add(nullToZero(result.getCompanyUnemployment()))
                .add(nullToZero(result.getCompanyMaternity()))
                .add(nullToZero(result.getCompanyInjury()))
                .add(nullToZero(result.getCompanyHousingFund()));
        result.setCompanySocialTotal(companySocialTotal);

        // 计算公司总成本
        BigDecimal totalCompanyCost = grossPay.add(companySocialTotal);
        result.setTotalCompanyCost(totalCompanyCost);
    }

    /**
     * 空值转换为零
     */
    private BigDecimal nullToZero(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    /**
     * 金额四舍五入到分
     */
    private BigDecimal roundToTwoDecimals(BigDecimal value) {
        return value.setScale(2, RoundingMode.HALF_UP);
    }
} 