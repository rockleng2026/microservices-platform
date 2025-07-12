package com.central.soo.engine;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;
import javax.script.ScriptException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 动态公式计算引擎
 * 支持基本的数学表达式计算和变量替换
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Slf4j
@Component
public class DynamicFormulaEngine {

    private static final int CALCULATION_SCALE = 6; // 计算精度
    private static final int RESULT_SCALE = 2; // 结果精度
    
    // 变量模式匹配
    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b");
    
    private final ScriptEngineManager scriptEngineManager;

    public DynamicFormulaEngine() {
        this.scriptEngineManager = new ScriptEngineManager();
    }

    /**
     * 执行计算公式
     * 
     * @param formula 计算公式
     * @param variables 变量上下文
     * @return 计算结果
     */
    public CalculationResult executeFormula(String formula, Map<String, Object> variables) {
        return executeFormula(formula, variables, null);
    }

    /**
     * 执行计算公式（支持变量数据类型）
     * 
     * @param formula 计算公式
     * @param variables 变量上下文
     * @param variableDataTypes 变量数据类型映射，key为变量名，value为数据类型（如"percentage"表示百分比）
     * @return 计算结果
     */
    public CalculationResult executeFormula(String formula, Map<String, Object> variables, Map<String, String> variableDataTypes) {
        long startTime = System.currentTimeMillis();
        
        try {
            log.debug("开始执行公式计算: {}", formula);
            
            if (!StringUtils.hasText(formula)) {
                return CalculationResult.error(Collections.singletonList("公式不能为空"));
            }
            
            // 预处理公式
            String processedFormula = preprocessFormula(formula);
            
            // 验证变量
            List<String> missingVariables = validateVariables(processedFormula, variables);
            if (!missingVariables.isEmpty()) {
                return CalculationResult.error(Collections.singletonList("缺少变量: " + String.join(", ", missingVariables)));
            }
            
            // 执行计算
            BigDecimal result = evaluateExpression(processedFormula, variables, variableDataTypes);
            
            long duration = System.currentTimeMillis() - startTime;
            log.debug("公式计算完成，耗时: {}ms, 结果: {}", duration, result);
            
            return CalculationResult.success(result, duration);
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("公式计算失败: {}, 耗时: {}ms", formula, duration, e);
            return CalculationResult.error(Collections.singletonList("计算执行失败: " + e.getMessage()));
        }
    }

    /**
     * 公式预处理
     */
    private String preprocessFormula(String formula) {
        // 移除多余的空格
        String processed = formula.replaceAll("\\s+", " ").trim();
        
        // 处理百分比符号
        processed = processed.replaceAll("(\\d+(?:\\.\\d+)?)%", "($1/100)");
        
        return processed;
    }

    /**
     * 验证变量是否存在
     */
    private List<String> validateVariables(String formula, Map<String, Object> variables) {
        List<String> missingVariables = new ArrayList<>();
        Set<String> foundVariables = new HashSet<>();
        
        Matcher matcher = VARIABLE_PATTERN.matcher(formula);
        while (matcher.find()) {
            String variable = matcher.group(1);
            
            // 跳过保留字和数字
            if (isReservedWord(variable) || isNumber(variable)) {
                continue;
            }
            
            foundVariables.add(variable);
        }
        
        // 检查变量是否在上下文中存在
        for (String variable : foundVariables) {
            if (!variables.containsKey(variable)) {
                missingVariables.add(variable);
            }
        }
        
        return missingVariables;
    }

    /**
     * 执行数学表达式计算
     */
    private BigDecimal evaluateExpression(String expression, Map<String, Object> variables) throws ScriptException {
        return evaluateExpression(expression, variables, null);
    }

    /**
     * 执行数学表达式计算（支持变量数据类型）
     */
    private BigDecimal evaluateExpression(String expression, Map<String, Object> variables, Map<String, String> variableDataTypes) throws ScriptException {
        ScriptEngine engine = scriptEngineManager.getEngineByName("JavaScript");
        
        // 检查ScriptEngine是否可用
        if (engine == null) {
            log.warn("JavaScript引擎不可用，使用备用计算方案");
            return evaluateExpressionFallback(expression, variables, variableDataTypes);
        }
        
        try {
            // 设置变量值
            for (Map.Entry<String, Object> entry : variables.entrySet()) {
                String key = entry.getKey();
                Object value = entry.getValue();
                
                // 处理百分比类型变量
                if (variableDataTypes != null && "percentage".equals(variableDataTypes.get(key))) {
                    if (value instanceof Number) {
                        // 百分比类型需要除以100
                        double percentageValue = ((Number) value).doubleValue() / 100.0;
                        value = percentageValue;
                        log.debug("百分比变量 {} 转换: {} -> {}", key, entry.getValue(), percentageValue);
                    }
                }
                
                // 确保变量名是有效的JavaScript标识符
                if (isValidJavaScriptIdentifier(key)) {
                    engine.put(key, value);
                } else {
                    log.warn("跳过无效的JavaScript标识符: {}", key);
                }
            }
            
            Object result = engine.eval(expression);
            
            if (result instanceof Number) {
                return new BigDecimal(result.toString()).setScale(RESULT_SCALE, RoundingMode.HALF_UP);
            } else {
                throw new IllegalArgumentException("表达式结果不是数值类型: " + result);
            }
        } catch (Exception e) {
            log.warn("JavaScript引擎计算失败，使用备用计算方案: {}", e.getMessage());
            return evaluateExpressionFallback(expression, variables, variableDataTypes);
        }
    }
    
    /**
     * 备用表达式计算方案
     */
    private BigDecimal evaluateExpressionFallback(String expression, Map<String, Object> variables) {
        return evaluateExpressionFallback(expression, variables, null);
    }

    /**
     * 备用表达式计算方案（支持变量数据类型）
     */
    private BigDecimal evaluateExpressionFallback(String expression, Map<String, Object> variables, Map<String, String> variableDataTypes) {
        try {
            // 替换变量
            String processedExpression = replaceVariables(expression, variables, variableDataTypes);
            
            // 简单的数学表达式计算
            return evaluateSimpleExpression(processedExpression);
            
        } catch (Exception e) {
            log.error("备用计算方案失败: {}", expression, e);
            throw new RuntimeException("表达式计算失败: " + expression, e);
        }
    }
    
    /**
     * 替换表达式中的变量
     */
    private String replaceVariables(String expression, Map<String, Object> variables) {
        return replaceVariables(expression, variables, null);
    }

    /**
     * 替换表达式中的变量（支持变量数据类型）
     */
    private String replaceVariables(String expression, Map<String, Object> variables, Map<String, String> variableDataTypes) {
        String result = expression;
        
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            String varName = entry.getKey();
            Object value = entry.getValue();
            
            if (value instanceof Number) {
                // 处理百分比类型变量
                if (variableDataTypes != null && "percentage".equals(variableDataTypes.get(varName))) {
                    // 百分比类型需要除以100
                    double percentageValue = ((Number) value).doubleValue() / 100.0;
                    value = percentageValue;
                    log.debug("备用方案中百分比变量 {} 转换: {} -> {}", varName, entry.getValue(), percentageValue);
                }
                
                // 使用正则表达式替换变量，确保只替换完整的变量名
                String regex = "\\b" + Pattern.quote(varName) + "\\b";
                result = result.replaceAll(regex, value.toString());
            }
        }
        
        return result;
    }
    
    /**
     * 简单的数学表达式计算
     */
    private BigDecimal evaluateSimpleExpression(String expression) {
        try {
            // 移除所有空格
            expression = expression.replaceAll("\\s+", "");
            
            // 先处理括号
            while (expression.contains("(")) {
                expression = processParentheses(expression);
            }
            
            // 处理乘除
            expression = processMultiplicationDivision(expression);
            
            // 处理加减
            return processAdditionSubtraction(expression);
            
        } catch (Exception e) {
            log.error("简单表达式计算失败: {}", expression, e);
            throw new RuntimeException("表达式计算失败: " + expression, e);
        }
    }
    
    private String processParentheses(String expression) {
        int start = expression.lastIndexOf("(");
        int end = expression.indexOf(")", start);
        
        if (start == -1 || end == -1) {
            return expression;
        }
        
        String innerExpression = expression.substring(start + 1, end);
        BigDecimal result = evaluateSimpleExpression(innerExpression);
        
        return expression.substring(0, start) + result.toString() + expression.substring(end + 1);
    }
    
    private String processMultiplicationDivision(String expression) {
        // 处理乘法和除法
        Pattern pattern = Pattern.compile("(-?\\d+(?:\\.\\d+)?)([*/])(-?\\d+(?:\\.\\d+)?)");
        Matcher matcher = pattern.matcher(expression);
        
        while (matcher.find()) {
            BigDecimal left = new BigDecimal(matcher.group(1));
            String operator = matcher.group(2);
            BigDecimal right = new BigDecimal(matcher.group(3));
            
            BigDecimal result;
            if ("*".equals(operator)) {
                result = left.multiply(right);
            } else {
                if (right.compareTo(BigDecimal.ZERO) == 0) {
                    throw new ArithmeticException("除数不能为零");
                }
                result = left.divide(right, CALCULATION_SCALE, RoundingMode.HALF_UP);
            }
            
            expression = expression.substring(0, matcher.start()) + result.toString() + expression.substring(matcher.end());
            matcher = pattern.matcher(expression);
        }
        
        return expression;
    }
    
    private BigDecimal processAdditionSubtraction(String expression) {
        // 处理加法和减法
        Pattern pattern = Pattern.compile("(-?\\d+(?:\\.\\d+)?)([+-])(-?\\d+(?:\\.\\d+)?)");
        Matcher matcher = pattern.matcher(expression);
        
        while (matcher.find()) {
            BigDecimal left = new BigDecimal(matcher.group(1));
            String operator = matcher.group(2);
            BigDecimal right = new BigDecimal(matcher.group(3));
            
            BigDecimal result;
            if ("+".equals(operator)) {
                result = left.add(right);
            } else {
                result = left.subtract(right);
            }
            
            expression = expression.substring(0, matcher.start()) + result.toString() + expression.substring(matcher.end());
            matcher = pattern.matcher(expression);
        }
        
        return new BigDecimal(expression);
    }

    // 工具方法
    private boolean isReservedWord(String word) {
        String[] reserved = {"if", "else", "for", "while", "function", "var", "let", "const", "return", "true", "false", "null", "undefined"};
        return Arrays.asList(reserved).contains(word.toLowerCase());
    }
    
    private boolean isNumber(String str) {
        try {
            Double.parseDouble(str);
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }
    
    private boolean isValidJavaScriptIdentifier(String identifier) {
        // 简单的JavaScript标识符验证
        return identifier.matches("^[a-zA-Z_$][a-zA-Z0-9_$]*$");
    }

    // 内部类定义
    public static class CalculationResult {
        private boolean success;
        private BigDecimal value;
        private long executionTime;
        private List<String> errors;

        public static CalculationResult success(BigDecimal value, long executionTime) {
            CalculationResult result = new CalculationResult();
            result.success = true;
            result.value = value;
            result.executionTime = executionTime;
            result.errors = Collections.emptyList();
            return result;
        }

        public static CalculationResult error(List<String> errors) {
            CalculationResult result = new CalculationResult();
            result.success = false;
            result.errors = errors;
            return result;
        }

        // Getters
        public boolean isSuccess() { return success; }
        public BigDecimal getValue() { return value; }
        public long getExecutionTime() { return executionTime; }
        public List<String> getErrors() { return errors; }
    }
} 