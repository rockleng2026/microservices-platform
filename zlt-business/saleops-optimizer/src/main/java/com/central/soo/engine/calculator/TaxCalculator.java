package com.central.soo.engine.calculator;

import com.central.soo.engine.context.SalaryCalculationContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 个人所得税计算器
 */
@Slf4j
@Component
@Order(7)
public class TaxCalculator implements SalaryCalculator {

    // 个税起征点
    private static final BigDecimal TAX_THRESHOLD = new BigDecimal("5000");

    @Override
    public String getCalculatorType() {
        return "personal_income_tax";
    }

    @Override
    public BigDecimal calculate(SalaryCalculationContext context) {
        // 计算应纳税所得额
        BigDecimal taxableIncome = calculateTaxableIncome(context);
        
        if (taxableIncome.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        // 按照累进税率计算个人所得税
        BigDecimal personalIncomeTax = calculateProgressiveTax(taxableIncome);

        log.debug("个人所得税计算 - 员工ID: {}, 应纳税所得额: {}, 个人所得税: {}",
                context.getEmployee().getId(), taxableIncome, personalIncomeTax);

        return personalIncomeTax;
    }

    /**
     * 计算应纳税所得额
     */
    private BigDecimal calculateTaxableIncome(SalaryCalculationContext context) {
        // 应发工资总额
        BigDecimal grossPay = calculateGrossPay(context);
        
        // 个人社保公积金总额
        BigDecimal personalSocialTotal = calculatePersonalSocialTotal(context);
        
        // 应纳税所得额 = 应发工资 - 个人社保公积金 - 起征点
        BigDecimal taxableIncome = grossPay.subtract(personalSocialTotal).subtract(TAX_THRESHOLD);
        
        return taxableIncome.max(BigDecimal.ZERO);
    }

    /**
     * 计算应发工资总额
     */
    private BigDecimal calculateGrossPay(SalaryCalculationContext context) {
        BigDecimal grossPay = BigDecimal.ZERO;
        
        // 调整后基础工资
        if (context.getSalaryConfig() != null) {
            BigDecimal baseSalary = context.getSalaryConfig().getBaseSalary();
            BigDecimal regionCoefficient = context.getRegionalCoefficient() != null ? 
                    context.getRegionalCoefficient().getSalaryCoefficient() : BigDecimal.ONE;
            grossPay = grossPay.add(baseSalary.multiply(regionCoefficient));
        }

        // 绩效工资
        if (context.getPerformance() != null && context.getPerformance().getPerformanceScore() != null) {
            BigDecimal performanceRatio = context.getPerformance().getPerformanceScore()
                    .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);
            BigDecimal performancePay = grossPay.multiply(performanceRatio);
            grossPay = grossPay.add(performancePay);
        }

        // 个人项目提成（简化计算）
        if (context.getSalaryConfig() != null && 
            context.getSalaryConfig().getIsSalesIncentive() &&
            context.getPerformance() != null) {
            
            BigDecimal personalCommission = calculatePersonalCommission(context);
            grossPay = grossPay.add(personalCommission);
        }

        // 团队提成
        if (context.getSalaryConfig() != null && 
            context.getSalaryConfig().getIsTeamIncentive() &&
            context.getPerformance() != null) {
            
            BigDecimal teamCommission = calculateTeamCommission(context);
            grossPay = grossPay.add(teamCommission);
        }

        // 部门分红
        if (context.getSalaryConfig() != null && 
            context.getSalaryConfig().getIsDepartmentBonus() &&
            context.getDepartmentBonusConfig() != null &&
            context.getBreakevenAnalysis() != null) {
            
            BigDecimal departmentBonus = calculateDepartmentBonus(context);
            grossPay = grossPay.add(departmentBonus);
        }

        return grossPay;
    }

    /**
     * 计算个人社保公积金总额
     */
    private BigDecimal calculatePersonalSocialTotal(SalaryCalculationContext context) {
        if (context.getSocialSecurityConfig() == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal grossPay = calculateGrossPay(context);
        
        // 社保基数
        BigDecimal socialBase = calculateSocialBase(grossPay, context.getSocialSecurityConfig());
        // 公积金基数
        BigDecimal housingBase = calculateHousingBase(grossPay, context.getSocialSecurityConfig());

        BigDecimal personalPension = socialBase.multiply(context.getSocialSecurityConfig().getPensionPersonalRatio())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal personalMedical = socialBase.multiply(context.getSocialSecurityConfig().getMedicalPersonalRatio())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal personalUnemployment = socialBase.multiply(context.getSocialSecurityConfig().getUnemploymentPersonalRatio())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal personalHousingFund = housingBase.multiply(context.getSocialSecurityConfig().getHousingFundPersonalRatio())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        return personalPension.add(personalMedical).add(personalUnemployment).add(personalHousingFund);
    }

    /**
     * 按累进税率计算个人所得税
     */
    private BigDecimal calculateProgressiveTax(BigDecimal taxableIncome) {
        BigDecimal tax = BigDecimal.ZERO;

        if (taxableIncome.compareTo(BigDecimal.ZERO) <= 0) {
            return tax;
        } else if (taxableIncome.compareTo(new BigDecimal("3000")) <= 0) {
            // 3%税率
            tax = taxableIncome.multiply(new BigDecimal("0.03"));
        } else if (taxableIncome.compareTo(new BigDecimal("12000")) <= 0) {
            // 10%税率
            tax = taxableIncome.multiply(new BigDecimal("0.10")).subtract(new BigDecimal("210"));
        } else if (taxableIncome.compareTo(new BigDecimal("25000")) <= 0) {
            // 20%税率
            tax = taxableIncome.multiply(new BigDecimal("0.20")).subtract(new BigDecimal("1410"));
        } else if (taxableIncome.compareTo(new BigDecimal("35000")) <= 0) {
            // 25%税率
            tax = taxableIncome.multiply(new BigDecimal("0.25")).subtract(new BigDecimal("2660"));
        } else if (taxableIncome.compareTo(new BigDecimal("55000")) <= 0) {
            // 30%税率
            tax = taxableIncome.multiply(new BigDecimal("0.30")).subtract(new BigDecimal("4410"));
        } else if (taxableIncome.compareTo(new BigDecimal("80000")) <= 0) {
            // 35%税率
            tax = taxableIncome.multiply(new BigDecimal("0.35")).subtract(new BigDecimal("7160"));
        } else {
            // 45%税率
            tax = taxableIncome.multiply(new BigDecimal("0.45")).subtract(new BigDecimal("15160"));
        }

        return tax.setScale(2, RoundingMode.HALF_UP);
    }

    // 以下方法是简化的计算逻辑，实际应该调用对应的计算器
    private BigDecimal calculatePersonalCommission(SalaryCalculationContext context) {
        // 简化实现
        return BigDecimal.ZERO;
    }

    private BigDecimal calculateTeamCommission(SalaryCalculationContext context) {
        // 简化实现
        return BigDecimal.ZERO;
    }

    private BigDecimal calculateDepartmentBonus(SalaryCalculationContext context) {
        // 简化实现
        return BigDecimal.ZERO;
    }

    private BigDecimal calculateSocialBase(BigDecimal grossPay, SalaryCalculationContext.SocialSecurityConfig config) {
        BigDecimal socialBase = grossPay;
        if (socialBase.compareTo(config.getSocialSecurityBaseLower()) < 0) {
            socialBase = config.getSocialSecurityBaseLower();
        } else if (socialBase.compareTo(config.getSocialSecurityBaseUpper()) > 0) {
            socialBase = config.getSocialSecurityBaseUpper();
        }
        return socialBase;
    }

    private BigDecimal calculateHousingBase(BigDecimal grossPay, SalaryCalculationContext.SocialSecurityConfig config) {
        BigDecimal housingBase = grossPay;
        if (housingBase.compareTo(config.getHousingFundBaseLower()) < 0) {
            housingBase = config.getHousingFundBaseLower();
        } else if (housingBase.compareTo(config.getHousingFundBaseUpper()) > 0) {
            housingBase = config.getHousingFundBaseUpper();
        }
        return housingBase;
    }

    @Override
    public boolean isApplicable(SalaryCalculationContext context) {
        return true; // 个人所得税计算对所有员工适用
    }

    @Override
    public int getPriority() {
        return 7;
    }
} 