package com.central.soo.engine.calculator;

import com.central.soo.engine.context.SalaryCalculationContext;
import com.central.soo.model.entity.PayrollResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * 基础工资计算器-这包含基础工资 和 乘以地区系数后的调整后基础薪资
 */
@Slf4j
@Component
@Order(1)
public class BaseSalaryCalculator implements SalaryCalculator {

    @Override
    public String getCalculatorType() {
        return "adjusted_base_salary";
    }

    @Override
    public BigDecimal calculate(SalaryCalculationContext context, PayrollResult payrollResult) {
        // 基础工资 = 员工基础工资 * 地区系数
        BigDecimal baseSalary = context.getSalaryConfig().getBaseSalary();
        BigDecimal regionCoefficient = context.getRegionalCoefficient() != null ? 
                context.getRegionalCoefficient().getSalaryCoefficient() : BigDecimal.ONE;

        BigDecimal adjustedBaseSalary = baseSalary.multiply(regionCoefficient);

        log.debug("基础工资计算 - 员工ID: {}, 基础工资: {}, 地区系数: {}, 调整后基础工资: {}",
                context.getEmployee().getId(), baseSalary, regionCoefficient, adjustedBaseSalary);

        // 赋值
        payrollResult.setBaseSalary(baseSalary);
        payrollResult.setRegionCoefficient(regionCoefficient);
        payrollResult.setAdjustedBaseSalary(adjustedBaseSalary);
        return adjustedBaseSalary;
    }

    @Override
    public boolean isApplicable(SalaryCalculationContext context) {
        return context.getSalaryConfig() != null && 
               context.getSalaryConfig().getBaseSalary() != null;
    }

    @Override
    public int getPriority() {
        return 1;
    }
} 