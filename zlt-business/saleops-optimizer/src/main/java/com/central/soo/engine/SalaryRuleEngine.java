package com.central.soo.engine;

import com.central.soo.engine.context.SalaryCalculationContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;
import java.util.HashMap;

/**
 * 薪酬规则引擎
 * 用于解析和执行薪酬计算规则
 */
@Slf4j
@Component
public class SalaryRuleEngine {

    /**
     * 解析薪酬规则
     */
    public Map<String, Object> parseRules(String rulesJson) {
        Map<String, Object> rules = new HashMap<>();
        
        // 简化实现：解析JSON规则
        // 实际应该使用JSON解析器
        if (rulesJson != null && !rulesJson.trim().isEmpty()) {
            // 模拟解析规则
            rules.put("base_calculation", true);
            rules.put("performance_calculation", true);
            rules.put("commission_calculation", true);
            rules.put("social_security_calculation", true);
            rules.put("tax_calculation", true);
        }
        
        return rules;
    }

    /**
     * 验证计算条件
     */
    public boolean evaluateCondition(String condition, SalaryCalculationContext context) {
        if (condition == null || condition.trim().isEmpty()) {
            return true;
        }
        
        // 简化实现：条件判断
        switch (condition.toLowerCase()) {
            case "has_performance":
                return context.getPerformance() != null && 
                       context.getPerformance().getPerformanceScore() != null;
            case "is_sales_incentive":
                return context.getSalaryConfig() != null && 
                       context.getSalaryConfig().getIsSalesIncentive();
            case "is_team_incentive":
                return context.getSalaryConfig() != null && 
                       context.getSalaryConfig().getIsTeamIncentive();
            case "is_department_bonus":
                return context.getSalaryConfig() != null && 
                       context.getSalaryConfig().getIsDepartmentBonus();
            case "has_social_security":
                return context.getSocialSecurityConfig() != null;
            default:
                return true;
        }
    }

    /**
     * 计算公式表达式
     */
    public BigDecimal calculateFormula(String formula, Map<String, BigDecimal> variables) {
        if (formula == null || formula.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }
        
        // 简化实现：公式计算
        // 实际应该使用表达式引擎（如SPEL、OGNL等）
        try {
            // 替换变量
            String expression = formula;
            for (Map.Entry<String, BigDecimal> entry : variables.entrySet()) {
                expression = expression.replace("{" + entry.getKey() + "}", 
                        entry.getValue().toString());
            }
            
            // 简单的数学表达式计算
            return evaluateSimpleExpression(expression);
        } catch (Exception e) {
            log.error("公式计算失败: {}", formula, e);
            return BigDecimal.ZERO;
        }
    }

    /**
     * 简单的数学表达式求值
     */
    private BigDecimal evaluateSimpleExpression(String expression) {
        // 这里是非常简化的实现
        // 实际应该使用更强大的表达式引擎
        try {
            // 移除空格
            expression = expression.replaceAll(" ", "");
            
            // 如果只是一个数字，直接返回
            if (expression.matches("^\\d+(\\.\\d+)?$")) {
                return new BigDecimal(expression);
            }
            
            // 简单的加减乘除计算（非常基础的实现）
            if (expression.contains("+")) {
                String[] parts = expression.split("\\+", 2);
                return evaluateSimpleExpression(parts[0]).add(evaluateSimpleExpression(parts[1]));
            } else if (expression.contains("-")) {
                String[] parts = expression.split("-", 2);
                return evaluateSimpleExpression(parts[0]).subtract(evaluateSimpleExpression(parts[1]));
            } else if (expression.contains("*")) {
                String[] parts = expression.split("\\*", 2);
                return evaluateSimpleExpression(parts[0]).multiply(evaluateSimpleExpression(parts[1]));
            } else if (expression.contains("/")) {
                String[] parts = expression.split("/", 2);
                return evaluateSimpleExpression(parts[0]).divide(evaluateSimpleExpression(parts[1]), 4, BigDecimal.ROUND_HALF_UP);
            }
            
            // 如果无法解析，返回0
            return BigDecimal.ZERO;
        } catch (Exception e) {
            log.error("表达式求值失败: {}", expression, e);
            return BigDecimal.ZERO;
        }
    }

    /**
     * 获取变量值
     */
    public Map<String, BigDecimal> buildVariables(SalaryCalculationContext context) {
        Map<String, BigDecimal> variables = new HashMap<>();
        
        // 员工基础信息
        if (context.getEmployee() != null) {
            variables.put("employee_id", new BigDecimal(context.getEmployee().getId()));
        }
        
        // 薪酬配置
        if (context.getSalaryConfig() != null) {
            variables.put("base_salary", context.getSalaryConfig().getBaseSalary() != null ? 
                    context.getSalaryConfig().getBaseSalary() : BigDecimal.ZERO);
            variables.put("sales_incentive_ratio", context.getSalaryConfig().getSalesIncentiveRatio() != null ? 
                    context.getSalaryConfig().getSalesIncentiveRatio() : BigDecimal.ZERO);
            variables.put("team_incentive_ratio", context.getSalaryConfig().getTeamIncentiveRatio() != null ? 
                    context.getSalaryConfig().getTeamIncentiveRatio() : BigDecimal.ZERO);
        }
        
        // 地区系数
        if (context.getRegionalCoefficient() != null) {
            variables.put("region_coefficient", context.getRegionalCoefficient().getSalaryCoefficient() != null ? 
                    context.getRegionalCoefficient().getSalaryCoefficient() : BigDecimal.ONE);
        }
        
        // 绩效数据
        if (context.getPerformance() != null) {
            variables.put("performance_score", context.getPerformance().getPerformanceScore() != null ? 
                    context.getPerformance().getPerformanceScore() : BigDecimal.ZERO);
            variables.put("personal_project_revenue", context.getPerformance().getPersonalProjectRevenue() != null ? 
                    context.getPerformance().getPersonalProjectRevenue() : BigDecimal.ZERO);
            variables.put("personal_project_margin", context.getPerformance().getPersonalProjectMargin() != null ? 
                    context.getPerformance().getPersonalProjectMargin() : BigDecimal.ZERO);
            variables.put("team_project_revenue", context.getPerformance().getTeamProjectRevenue() != null ? 
                    context.getPerformance().getTeamProjectRevenue() : BigDecimal.ZERO);
            variables.put("team_project_margin", context.getPerformance().getTeamProjectMargin() != null ? 
                    context.getPerformance().getTeamProjectMargin() : BigDecimal.ZERO);
            variables.put("team_member_count", context.getPerformance().getTeamMemberCount() != null ? 
                    new BigDecimal(context.getPerformance().getTeamMemberCount()) : BigDecimal.ZERO);
        }
        
        // 职级配置
        if (context.getJobLevelSalary() != null) {
            variables.put("performance_ratio_min", context.getJobLevelSalary().getPerformanceRatioMin() != null ? 
                    context.getJobLevelSalary().getPerformanceRatioMin() : BigDecimal.ZERO);
            variables.put("performance_ratio_max", context.getJobLevelSalary().getPerformanceRatioMax() != null ? 
                    context.getJobLevelSalary().getPerformanceRatioMax() : BigDecimal.ONE);
        }
        
        return variables;
    }

    /**
     * 验证规则完整性
     */
    public boolean validateRules(Map<String, Object> rules) {
        if (rules == null || rules.isEmpty()) {
            return false;
        }
        
        // 检查必要的规则项
        return rules.containsKey("base_calculation") &&
               rules.containsKey("performance_calculation") &&
               rules.containsKey("commission_calculation") &&
               rules.containsKey("social_security_calculation") &&
               rules.containsKey("tax_calculation");
    }
} 