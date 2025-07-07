package com.central.soo.engine.calculator;

import com.central.soo.engine.context.SalaryCalculationContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 绩效工资计算器
 */
@Slf4j
@Component
@Order(2)
public class PerformancePayCalculator implements SalaryCalculator {

    @Override
    public String getCalculatorType() {
        return "performance_pay";
    }

    @Override
    public BigDecimal calculate(SalaryCalculationContext context) {
        // 绩效工资 = 调整后基础工资 * 绩效比例
        BigDecimal adjustedBaseSalary = context.getSalaryConfig().getBaseSalary()
                .multiply(context.getRegionalCoefficient() != null ? 
                         context.getRegionalCoefficient().getSalaryCoefficient() : BigDecimal.ONE);

        // 计算绩效比例
        BigDecimal performanceRatio = calculatePerformanceRatio(context);
        
        BigDecimal performancePay = adjustedBaseSalary.multiply(performanceRatio)
                .setScale(2, RoundingMode.HALF_UP);

        log.debug("绩效工资计算 - 员工ID: {}, 调整后基础工资: {}, 绩效比例: {}, 绩效工资: {}",
                context.getEmployee().getId(), adjustedBaseSalary, performanceRatio, performancePay);

        return performancePay;
    }

    /**
     * 计算绩效比例
     */
    private BigDecimal calculatePerformanceRatio(SalaryCalculationContext context) {
        if (context.getPerformance() == null) {
            return BigDecimal.ZERO;
        }

        BigDecimal performanceScore = context.getPerformance().getPerformanceScore();
        BigDecimal performanceRatio = performanceScore.divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);

        // 应用职级绩效比例限制
        if (context.getJobLevelSalary() != null) {
            BigDecimal minRatio = context.getJobLevelSalary().getPerformanceRatioMin();
            BigDecimal maxRatio = context.getJobLevelSalary().getPerformanceRatioMax();
            
            if (performanceRatio.compareTo(minRatio) < 0) {
                performanceRatio = minRatio;
            } else if (performanceRatio.compareTo(maxRatio) > 0) {
                performanceRatio = maxRatio;
            }
        }

        return performanceRatio;
    }

    @Override
    public boolean isApplicable(SalaryCalculationContext context) {
        return context.getPerformance() != null && 
               context.getPerformance().getPerformanceScore() != null;
    }

    @Override
    public int getPriority() {
        return 2;
    }
} 