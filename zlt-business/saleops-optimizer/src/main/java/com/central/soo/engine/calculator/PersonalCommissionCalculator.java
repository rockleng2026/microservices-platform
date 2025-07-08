package com.central.soo.engine.calculator;

import com.central.soo.engine.context.SalaryCalculationContext;
import com.central.soo.model.entity.PayrollResult;
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
    public BigDecimal calculate(SalaryCalculationContext context, PayrollResult payrollResult) {
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

        // 参考公式 IF(员工基础信息表.是否参与销售提成=1, (月度绩效与提成输入表.个人项目营业额 * 月度绩效与提成输入表.个人项目毛利率 * 0.5 * 0.7 * 0.2 * (月度绩效与提成输入表.绩效得分/100)) - (AdjustedBaseSalary + PerformancePay), 0)
        // 这里还要减去(基础工资+绩效工资)(AdjustedBaseSalary + PerformancePay)
        BigDecimal difference = personalCommission.subtract(payrollResult.getAdjustedBaseSalary().add(payrollResult.getPerformancePay()));
        personalCommission = difference.compareTo(BigDecimal.ZERO) > 0 ? difference : BigDecimal.ZERO;

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