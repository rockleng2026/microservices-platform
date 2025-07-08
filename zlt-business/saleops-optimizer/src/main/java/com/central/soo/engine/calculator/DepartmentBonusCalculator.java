package com.central.soo.engine.calculator;

import com.central.soo.engine.context.SalaryCalculationContext;
import com.central.soo.model.entity.PayrollResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 部门分红计算器
 */
@Slf4j
@Component
@Order(5)
public class DepartmentBonusCalculator implements SalaryCalculator {

    @Override
    public String getCalculatorType() {
        return "department_bonus";
    }

    @Override
    public BigDecimal calculate(SalaryCalculationContext context, PayrollResult payrollResult) {
        if (!context.getSalaryConfig().getIsDepartmentBonus()) {
            return BigDecimal.ZERO;
        }

        if (context.getDepartmentBonusConfig() == null || 
            context.getBreakevenAnalysis() == null ||
            context.getBreakevenAnalysis().getDistributableProfit() == null ||
            context.getBreakevenAnalysis().getDistributableProfit().compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }

        // 可分配利润
        BigDecimal distributableProfit = context.getBreakevenAnalysis().getDistributableProfit();
        
        // 部门分红权重
        BigDecimal bonusWeight = context.getDepartmentBonusConfig().getBonusWeight()
                .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);

        // 部门员工数（简化处理，实际应从数据库查询）
        BigDecimal departmentEmployeeCount = new BigDecimal("10"); // 模拟部门员工数

        // 部门分红 = (可分配利润 * 部门分红权重) / 部门员工数
        BigDecimal departmentBonus = distributableProfit
                .multiply(bonusWeight)
                .divide(departmentEmployeeCount, 2, RoundingMode.HALF_UP);

        log.debug("部门分红计算 - 员工ID: {}, 可分配利润: {}, 分红权重: {}, 部门员工数: {}, 部门分红: {}",
                context.getEmployee().getId(), distributableProfit, bonusWeight, 
                departmentEmployeeCount, departmentBonus);

        return departmentBonus;
    }

    @Override
    public boolean isApplicable(SalaryCalculationContext context) {
        return context.getSalaryConfig() != null && 
               context.getSalaryConfig().getIsDepartmentBonus() &&
               context.getDepartmentBonusConfig() != null &&
               context.getBreakevenAnalysis() != null;
    }

    @Override
    public int getPriority() {
        return 5;
    }
} 