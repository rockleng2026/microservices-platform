package com.central.soo.engine.calculator;

import com.central.soo.engine.context.SalaryCalculationContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * 团队项目提成计算器
 */
@Slf4j
@Component
@Order(4)
public class TeamCommissionCalculator implements SalaryCalculator {

    private static final BigDecimal COMMISSION_BASE_RATE = new BigDecimal("0.035"); // 3.5% = 50% * 70% * 10%

    @Override
    public String getCalculatorType() {
        return "team_commission";
    }

    @Override
    public BigDecimal calculate(SalaryCalculationContext context) {
        if (!context.getSalaryConfig().getIsTeamIncentive()) {
            return BigDecimal.ZERO;
        }

        if (context.getPerformance() == null || 
            context.getPerformance().getTeamProjectRevenue() == null ||
            context.getPerformance().getTeamProjectMargin() == null ||
            context.getPerformance().getTeamMemberCount() == null ||
            context.getPerformance().getTeamMemberCount() <= 0) {
            return BigDecimal.ZERO;
        }

        // 团队项目毛利润
        BigDecimal teamProjectProfit = context.getPerformance().getTeamProjectRevenue()
                .multiply(context.getPerformance().getTeamProjectMargin());

        // 团队提成比例
        BigDecimal teamIncentiveRatio = context.getSalaryConfig().getTeamIncentiveRatio()
                .divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP);

        // 团队成员数
        BigDecimal teamMemberCount = new BigDecimal(context.getPerformance().getTeamMemberCount());

        // 团队项目提成 = (团队项目毛利润 * 基础提成率 / 团队成员数) * 团队提成比例
        BigDecimal teamCommission = teamProjectProfit
                .multiply(COMMISSION_BASE_RATE)
                .divide(teamMemberCount, 4, RoundingMode.HALF_UP)
                .multiply(teamIncentiveRatio)
                .setScale(2, RoundingMode.HALF_UP);

        log.debug("团队项目提成计算 - 员工ID: {}, 团队毛利润: {}, 团队成员数: {}, 提成比例: {}, 团队提成: {}",
                context.getEmployee().getId(), teamProjectProfit, teamMemberCount, 
                teamIncentiveRatio, teamCommission);

        return teamCommission;
    }

    @Override
    public boolean isApplicable(SalaryCalculationContext context) {
        return context.getSalaryConfig() != null && 
               context.getSalaryConfig().getIsTeamIncentive() &&
               context.getPerformance() != null;
    }

    @Override
    public int getPriority() {
        return 4;
    }
} 