package com.central.soo.engine.calculator;

import com.central.soo.engine.context.SalaryCalculationContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 个人项目提成计算器
 */
@Slf4j
@Component
@Order(3)
public class PersonalCommissionCalculator implements SalaryCalculator {

    private static final BigDecimal COMMISSION_BASE_RATE = new BigDecimal("0.07"); // 7% = 50% * 70% * 20%

    @Override
    public String getCalculatorType() {
        return "personal_commission";
    }

    @Override
    public BigDecimal calculate(SalaryCalculationContext context) {
        if (!context.getSalaryConfig().getIsSalesIncentive()) {
            return BigDecimal.ZERO;
        }

        if (context.getPerformance() == null || 
            context.getPerformance().getPersonalProjectRevenue() == null ||
            context.getPerformance().getPersonalProjectMargin() == null) {
            return BigDecimal.ZERO;
        }

        // 个人项目毛利润
        BigDecimal personalProjectProfit = context.getPerformance().getPersonalProjectRevenue()
                .multiply(context.getPerformance().getPersonalProjectMargin());

        // 绩效系数
        BigDecimal performanceFactor = context.getPerformance().getPerformanceScore()
                .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);

        // 销售提成比例
        BigDecimal salesIncentiveRatio = context.getSalaryConfig().getSalesIncentiveRatio()
                .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);

        // 个人项目提成 = 个人项目毛利润 * 基础提成率 * 绩效系数 * 销售提成比例
        BigDecimal personalCommission = personalProjectProfit
                .multiply(COMMISSION_BASE_RATE)
                .multiply(performanceFactor)
                .multiply(salesIncentiveRatio)
                .setScale(2, RoundingMode.HALF_UP);

        log.debug("个人项目提成计算 - 员工ID: {}, 项目毛利润: {}, 绩效系数: {}, 提成比例: {}, 个人提成: {}",
                context.getEmployee().getId(), personalProjectProfit, performanceFactor, 
                salesIncentiveRatio, personalCommission);

        return personalCommission;
    }

    @Override
    public boolean isApplicable(SalaryCalculationContext context) {
        return context.getSalaryConfig() != null && 
               context.getSalaryConfig().getIsSalesIncentive() &&
               context.getPerformance() != null;
    }

    @Override
    public int getPriority() {
        return 3;
    }
} 