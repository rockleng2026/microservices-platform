package com.central.soo.engine.calculator;

import com.central.soo.engine.context.SalaryCalculationContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.HashMap;

/**
 * 社保公积金计算器
 */
@Slf4j
@Component
@Order(6)
public class SocialSecurityCalculator implements SalaryCalculator {

    @Override
    public String getCalculatorType() {
        return "social_security";
    }

    @Override
    public BigDecimal calculate(SalaryCalculationContext context) {
        if (context.getSocialSecurityConfig() == null) {
            return BigDecimal.ZERO;
        }

        // 应发工资总额（用于计算社保基数）
        BigDecimal grossPay = calculateGrossPay(context);
        
        // 计算社保基数和公积金基数
        BigDecimal socialBase = calculateSocialBase(grossPay, context.getSocialSecurityConfig());
        BigDecimal housingBase = calculateHousingBase(grossPay, context.getSocialSecurityConfig());

        // 计算各项社保费用
        Map<String, BigDecimal> socialSecurityAmounts = calculateSocialSecurityAmounts(
                socialBase, housingBase, context.getSocialSecurityConfig());

        // 设置计算结果到上下文中（这里简化处理，实际应该有更好的方式传递结果）
        log.debug("社保公积金计算完成 - 员工ID: {}, 社保基数: {}, 公积金基数: {}", 
                context.getEmployee().getId(), socialBase, housingBase);

        // 返回个人缴费总额（用于扣除）
        return socialSecurityAmounts.get("personal_total");
    }

    /**
     * 计算应发工资总额
     */
    private BigDecimal calculateGrossPay(SalaryCalculationContext context) {
        BigDecimal grossPay = BigDecimal.ZERO;
        
        // 基础工资
        if (context.getSalaryConfig() != null) {
            BigDecimal baseSalary = context.getSalaryConfig().getBaseSalary();
            BigDecimal regionCoefficient = context.getRegionalCoefficient() != null ? 
                    context.getRegionalCoefficient().getSalaryCoefficient() : BigDecimal.ONE;
            grossPay = grossPay.add(baseSalary.multiply(regionCoefficient));
        }

        // 绩效工资（简化计算）
        if (context.getPerformance() != null && context.getPerformance().getPerformanceScore() != null) {
            BigDecimal performancePay = grossPay.multiply(context.getPerformance().getPerformanceScore())
                    .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
            grossPay = grossPay.add(performancePay);
        }

        return grossPay;
    }

    /**
     * 计算社保基数
     */
    private BigDecimal calculateSocialBase(BigDecimal grossPay, SalaryCalculationContext.SocialSecurityConfig config) {
        BigDecimal socialBase = grossPay;
        
        // 确保在社保基数范围内
        if (socialBase.compareTo(config.getSocialSecurityBaseLower()) < 0) {
            socialBase = config.getSocialSecurityBaseLower();
        } else if (socialBase.compareTo(config.getSocialSecurityBaseUpper()) > 0) {
            socialBase = config.getSocialSecurityBaseUpper();
        }
        
        return socialBase;
    }

    /**
     * 计算公积金基数
     */
    private BigDecimal calculateHousingBase(BigDecimal grossPay, SalaryCalculationContext.SocialSecurityConfig config) {
        BigDecimal housingBase = grossPay;
        
        // 确保在公积金基数范围内
        if (housingBase.compareTo(config.getHousingFundBaseLower()) < 0) {
            housingBase = config.getHousingFundBaseLower();
        } else if (housingBase.compareTo(config.getHousingFundBaseUpper()) > 0) {
            housingBase = config.getHousingFundBaseUpper();
        }
        
        return housingBase;
    }

    /**
     * 计算各项社保费用
     */
    private Map<String, BigDecimal> calculateSocialSecurityAmounts(
            BigDecimal socialBase, BigDecimal housingBase, SalaryCalculationContext.SocialSecurityConfig config) {
        
        Map<String, BigDecimal> amounts = new HashMap<>();
        
        // 个人缴费
        BigDecimal personalPension = socialBase.multiply(config.getPensionPersonalRatio())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal personalMedical = socialBase.multiply(config.getMedicalPersonalRatio())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal personalUnemployment = socialBase.multiply(config.getUnemploymentPersonalRatio())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal personalHousingFund = housingBase.multiply(config.getHousingFundPersonalRatio())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        
        BigDecimal personalTotal = personalPension.add(personalMedical)
                .add(personalUnemployment).add(personalHousingFund);
        
        // 公司缴费
        BigDecimal companyPension = socialBase.multiply(config.getPensionCompanyRatio())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal companyMedical = socialBase.multiply(config.getMedicalCompanyRatio())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal companyUnemployment = socialBase.multiply(config.getUnemploymentCompanyRatio())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal companyMaternity = socialBase.multiply(config.getMaternityCompanyRatio())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal companyInjury = socialBase.multiply(config.getInjuryCompanyRatio())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        BigDecimal companyHousingFund = housingBase.multiply(config.getHousingFundCompanyRatio())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
        
        BigDecimal companyTotal = companyPension.add(companyMedical).add(companyUnemployment)
                .add(companyMaternity).add(companyInjury).add(companyHousingFund);
        
        // 保存计算结果
        amounts.put("personal_pension", personalPension);
        amounts.put("personal_medical", personalMedical);
        amounts.put("personal_unemployment", personalUnemployment);
        amounts.put("personal_housing_fund", personalHousingFund);
        amounts.put("personal_total", personalTotal);
        
        amounts.put("company_pension", companyPension);
        amounts.put("company_medical", companyMedical);
        amounts.put("company_unemployment", companyUnemployment);
        amounts.put("company_maternity", companyMaternity);
        amounts.put("company_injury", companyInjury);
        amounts.put("company_housing_fund", companyHousingFund);
        amounts.put("company_total", companyTotal);
        
        return amounts;
    }

    @Override
    public boolean isApplicable(SalaryCalculationContext context) {
        return context.getSocialSecurityConfig() != null;
    }

    @Override
    public int getPriority() {
        return 6;
    }
} 