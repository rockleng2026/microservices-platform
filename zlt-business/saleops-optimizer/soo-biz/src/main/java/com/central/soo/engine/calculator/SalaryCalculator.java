package com.central.soo.engine.calculator;

import com.central.soo.engine.context.SalaryCalculationContext;

import java.math.BigDecimal;

/**
 * 薪酬计算器接口
 */
public interface SalaryCalculator {

    /**
     * 获取计算器类型
     */
    String getCalculatorType();

    /**
     * 计算金额
     */
    BigDecimal calculate(SalaryCalculationContext context);

    /**
     * 判断是否适用于当前计算上下文
     */
    boolean isApplicable(SalaryCalculationContext context);

    /**
     * 获取计算器优先级（数字越小优先级越高）
     */
    default int getPriority() {
        return 100;
    }
} 