package com.central.soo.engine;

import com.central.common.utils.JsonUtil;
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
 * 支持复杂的数学表达式和逻辑运算
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Slf4j
@Component
public class DynamicFormulaEngine {

    private static final int CALCULATION_SCALE = 6; // 计算精度
    private static final int RESULT_SCALE = 2; // 结果精度
    private static final String ENGINE_VERSION = "2.0.0";
    
    // 支持的函数模式
    private static final Pattern FUNCTION_PATTERN = Pattern.compile("(\\w+)\\(([^)]*)\\)");
    private static final Pattern VARIABLE_PATTERN = Pattern.compile("\\b([a-zA-Z_][a-zA-Z0-9_]*)\\b");
    private static final Pattern API_PATTERN = Pattern.compile("API_GET\\('([^']+)'\\s*,\\s*\\{([^}]*)\\}\\)");

    private final ScriptEngineManager scriptEngineManager;
    private final Map<String, FormulaFunction> builtInFunctions;

    public DynamicFormulaEngine() {
        this.scriptEngineManager = new ScriptEngineManager();
        this.builtInFunctions = initializeBuiltInFunctions();
    }

    /**
     * 执行计算公式
     * 
     * @param formula 计算公式
     * @param variables 变量上下文
     * @return 计算结果
     */
    public CalculationResult executeFormula(String formula, Map<String, Object> variables) {
        long startTime = System.currentTimeMillis();
        
        try {
            log.debug("开始执行公式计算: {}", formula);
            
            // 1. 公式预处理和验证
            String processedFormula = preprocessFormula(formula);
            FormulaValidationResult validation = validateFormula(processedFormula, variables);
            
            if (!validation.isValid()) {
                return CalculationResult.error(validation.getErrors());
            }
            
            // 2. 处理API调用
            String formulaWithApiData = processApiCalls(processedFormula, variables);
            
            // 3. 处理内置函数
            String formulaWithFunctions = processBuiltInFunctions(formulaWithApiData, variables);
            
            // 4. 执行计算
            BigDecimal result = evaluateExpression(formulaWithFunctions, variables);
            
            long duration = System.currentTimeMillis() - startTime;
            log.debug("公式计算完成，耗时: {}ms, 结果: {}", duration, result);
            
            return CalculationResult.success(result, duration, validation.getDependencies());
            
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("公式计算失败: {}, 耗时: {}ms", formula, duration, e);
            return CalculationResult.error(Collections.singletonList("计算执行失败: " + e.getMessage()));
        }
    }

    /**
     * 批量计算优化
     * 
     * @param tasks 计算任务列表
     * @return 计算结果映射
     */
    public Map<String, CalculationResult> batchCalculate(List<CalculationTask> tasks) {
        log.info("开始批量计算，任务数量: {}", tasks.size());
        
        // 1. 构建计算依赖图
        CalculationGraph graph = buildDependencyGraph(tasks);
        
        // 2. 拓扑排序确定计算顺序
        List<CalculationTask> sortedTasks = topologicalSort(graph);
        
        // 3. 按依赖顺序执行计算
        Map<String, CalculationResult> results = new LinkedHashMap<>();
        Map<String, Object> globalContext = new HashMap<>();
        
        for (CalculationTask task : sortedTasks) {
            try {
                // 合并全局上下文和任务上下文
                Map<String, Object> taskContext = new HashMap<>(globalContext);
                taskContext.putAll(task.getVariables());
                
                CalculationResult result = executeFormula(task.getFormula(), taskContext);
                results.put(task.getTaskId(), result);
                
                // 成功的计算结果加入全局上下文
                if (result.isSuccess()) {
                    globalContext.put(task.getOutputVariable(), result.getValue());
                }
                
            } catch (Exception e) {
                log.error("批量计算任务失败: {}", task.getTaskId(), e);
                results.put(task.getTaskId(), CalculationResult.error(
                    Collections.singletonList("任务执行失败: " + e.getMessage())));
            }
        }
        
        log.info("批量计算完成，成功: {}, 失败: {}", 
            results.values().stream().mapToInt(r -> r.isSuccess() ? 1 : 0).sum(),
            results.values().stream().mapToInt(r -> r.isSuccess() ? 0 : 1).sum());
        
        return results;
    }

    /**
     * 验证公式语法和依赖关系
     */
    public FormulaValidationResult validateFormula(String formula, Map<String, Object> availableVariables) {
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        Set<String> dependencies = new HashSet<>();
        
        try {
            // 提取变量依赖
            Matcher matcher = VARIABLE_PATTERN.matcher(formula);
            while (matcher.find()) {
                String variable = matcher.group(1);
                if (!isReservedWord(variable) && !builtInFunctions.containsKey(variable.toUpperCase())) {
                    dependencies.add(variable);
                    
                    // 检查变量是否可用
                    if (availableVariables != null && !availableVariables.containsKey(variable)) {
                        errors.add("未定义的变量: " + variable);
                    }
                }
            }
            
            // 检查括号匹配
            if (!isParenthesesBalanced(formula)) {
                errors.add("括号不匹配");
            }
            
            // 检查函数语法
            validateFunctions(formula, errors, warnings);
            
            // 检查API调用语法
            validateApiCalls(formula, errors, warnings);
            
        } catch (Exception e) {
            errors.add("公式语法验证失败: " + e.getMessage());
        }
        
        return new FormulaValidationResult(errors.isEmpty(), errors, warnings, dependencies);
    }

    /**
     * 公式预处理
     */
    private String preprocessFormula(String formula) {
        if (!StringUtils.hasText(formula)) {
            throw new IllegalArgumentException("公式不能为空");
        }
        
        // 移除多余的空格
        String processed = formula.replaceAll("\\s+", " ").trim();
        
        // 处理百分比符号
        processed = processed.replaceAll("(\\d+(?:\\.\\d+)?)%", "($1/100)");
        
        return processed;
    }

    /**
     * 处理API调用
     */
    private String processApiCalls(String formula, Map<String, Object> variables) {
        Matcher matcher = API_PATTERN.matcher(formula);
        StringBuffer sb = new StringBuffer();
        
        while (matcher.find()) {
            String apiName = matcher.group(1);
            String paramsStr = matcher.group(2);
            
            try {
                // 解析API参数
                Map<String, Object> apiParams = parseApiParams(paramsStr, variables);
                
                // 调用API获取数据（这里简化处理，实际应该调用API服务）
                Object apiResult = callApi(apiName, apiParams);
                
                // 替换API调用为结果值
                matcher.appendReplacement(sb, String.valueOf(apiResult));
                
            } catch (Exception e) {
                log.error("API调用失败: {}", apiName, e);
                matcher.appendReplacement(sb, "0"); // 默认值
            }
        }
        matcher.appendTail(sb);
        
        return sb.toString();
    }

    /**
     * 处理内置函数
     */
    private String processBuiltInFunctions(String formula, Map<String, Object> variables) {
        Matcher matcher = FUNCTION_PATTERN.matcher(formula);
        StringBuffer sb = new StringBuffer();
        
        while (matcher.find()) {
            String funcName = matcher.group(1).toUpperCase();
            String argsStr = matcher.group(2);
            
            if (builtInFunctions.containsKey(funcName)) {
                try {
                    FormulaFunction function = builtInFunctions.get(funcName);
                    List<BigDecimal> args = parseArguments(argsStr, variables);
                    BigDecimal result = function.apply(args);
                    matcher.appendReplacement(sb, result.toString());
                } catch (Exception e) {
                    log.error("函数执行失败: {}", funcName, e);
                    matcher.appendReplacement(sb, "0");
                }
            }
        }
        matcher.appendTail(sb);
        
        return sb.toString();
    }

    /**
     * 执行数学表达式计算
     */
    private BigDecimal evaluateExpression(String expression, Map<String, Object> variables) throws ScriptException {
        ScriptEngine engine = scriptEngineManager.getEngineByName("JavaScript");
        
        // 设置变量值
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            engine.put(entry.getKey(), entry.getValue());
        }
        
        Object result = engine.eval(expression);
        
        if (result instanceof Number) {
            return new BigDecimal(result.toString()).setScale(RESULT_SCALE, RoundingMode.HALF_UP);
        } else {
            throw new IllegalArgumentException("表达式结果不是数值类型: " + result);
        }
    }

    /**
     * 构建计算依赖图
     */
    private CalculationGraph buildDependencyGraph(List<CalculationTask> tasks) {
        CalculationGraph graph = new CalculationGraph();
        
        // 添加所有任务节点
        for (CalculationTask task : tasks) {
            graph.addNode(task);
        }
        
        // 分析依赖关系
        for (CalculationTask task : tasks) {
            FormulaValidationResult validation = validateFormula(task.getFormula(), null);
            for (String dependency : validation.getDependencies()) {
                // 查找提供该变量的任务
                for (CalculationTask depTask : tasks) {
                    if (dependency.equals(depTask.getOutputVariable())) {
                        graph.addEdge(depTask, task);
                        break;
                    }
                }
            }
        }
        
        return graph;
    }

    /**
     * 拓扑排序
     */
    private List<CalculationTask> topologicalSort(CalculationGraph graph) {
        List<CalculationTask> result = new ArrayList<>();
        Set<CalculationTask> visited = new HashSet<>();
        Set<CalculationTask> visiting = new HashSet<>();
        
        for (CalculationTask node : graph.getNodes()) {
            if (!visited.contains(node)) {
                topologicalSortDFS(node, graph, visited, visiting, result);
            }
        }
        
        Collections.reverse(result);
        return result;
    }

    private void topologicalSortDFS(CalculationTask node, CalculationGraph graph, 
                                   Set<CalculationTask> visited, Set<CalculationTask> visiting, 
                                   List<CalculationTask> result) {
        if (visiting.contains(node)) {
            throw new IllegalArgumentException("检测到循环依赖: " + node.getTaskId());
        }
        
        if (visited.contains(node)) {
            return;
        }
        
        visiting.add(node);
        
        for (CalculationTask dependency : graph.getDependencies(node)) {
            topologicalSortDFS(dependency, graph, visited, visiting, result);
        }
        
        visiting.remove(node);
        visited.add(node);
        result.add(node);
    }

    /**
     * 初始化内置函数
     */
    private Map<String, FormulaFunction> initializeBuiltInFunctions() {
        Map<String, FormulaFunction> functions = new HashMap<>();
        
        // 数学函数
        functions.put("SUM", args -> args.stream().reduce(BigDecimal.ZERO, BigDecimal::add));
        functions.put("AVG", args -> {
            if (args.isEmpty()) return BigDecimal.ZERO;
            return args.stream().reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(args.size()), CALCULATION_SCALE, RoundingMode.HALF_UP);
        });
        functions.put("MAX", args -> args.stream().max(BigDecimal::compareTo).orElse(BigDecimal.ZERO));
        functions.put("MIN", args -> args.stream().min(BigDecimal::compareTo).orElse(BigDecimal.ZERO));
        functions.put("ABS", args -> args.isEmpty() ? BigDecimal.ZERO : args.get(0).abs());
        functions.put("ROUND", args -> {
            if (args.size() < 2) return BigDecimal.ZERO;
            return args.get(0).setScale(args.get(1).intValue(), RoundingMode.HALF_UP);
        });
        
        // 条件函数
        functions.put("IF", args -> {
            if (args.size() < 3) return BigDecimal.ZERO;
            return args.get(0).compareTo(BigDecimal.ZERO) > 0 ? args.get(1) : args.get(2);
        });
        
        // 财务函数
        functions.put("NPV", this::calculateNPV);
        functions.put("IRR", this::calculateIRR);
        
        return functions;
    }

    /**
     * 计算净现值 (NPV)
     */
    private BigDecimal calculateNPV(List<BigDecimal> args) {
        if (args.size() < 2) return BigDecimal.ZERO;
        
        BigDecimal rate = args.get(0);
        BigDecimal npv = BigDecimal.ZERO;
        
        for (int i = 1; i < args.size(); i++) {
            BigDecimal cashFlow = args.get(i);
            BigDecimal discountFactor = BigDecimal.ONE.add(rate).pow(i);
            npv = npv.add(cashFlow.divide(discountFactor, CALCULATION_SCALE, RoundingMode.HALF_UP));
        }
        
        return npv;
    }

    /**
     * 计算内部收益率 (IRR) - 简化实现
     */
    private BigDecimal calculateIRR(List<BigDecimal> args) {
        // 这里是IRR的简化实现，实际应用中需要使用牛顿法等数值方法
        if (args.size() < 2) return BigDecimal.ZERO;
        
        // 简单估算，实际需要迭代求解
        return new BigDecimal("0.10"); // 假设10%的收益率
    }

    // 工具方法
    private boolean isReservedWord(String word) {
        String[] reserved = {"if", "else", "for", "while", "function", "var", "let", "const"};
        return Arrays.asList(reserved).contains(word.toLowerCase());
    }

    private boolean isParenthesesBalanced(String formula) {
        int count = 0;
        for (char c : formula.toCharArray()) {
            if (c == '(') count++;
            else if (c == ')') count--;
            if (count < 0) return false;
        }
        return count == 0;
    }

    private void validateFunctions(String formula, List<String> errors, List<String> warnings) {
        Matcher matcher = FUNCTION_PATTERN.matcher(formula);
        while (matcher.find()) {
            String funcName = matcher.group(1).toUpperCase();
            if (!builtInFunctions.containsKey(funcName)) {
                errors.add("未知函数: " + funcName);
            }
        }
    }

    private void validateApiCalls(String formula, List<String> errors, List<String> warnings) {
        Matcher matcher = API_PATTERN.matcher(formula);
        while (matcher.find()) {
            String apiName = matcher.group(1);
            // 这里可以验证API名称是否有效
            warnings.add("API调用需要运行时验证: " + apiName);
        }
    }

    private Map<String, Object> parseApiParams(String paramsStr, Map<String, Object> variables) {
        // 简化的参数解析实现
        Map<String, Object> params = new HashMap<>();
        if (StringUtils.hasText(paramsStr)) {
            String[] pairs = paramsStr.split(",");
            for (String pair : pairs) {
                String[] kv = pair.split(":");
                if (kv.length == 2) {
                    String key = kv[0].trim().replaceAll("['\"]", "");
                    String value = kv[1].trim().replaceAll("['\"]", "");
                    
                    // 如果值是变量引用，则从变量上下文中获取
                    if (value.startsWith("${") && value.endsWith("}")) {
                        String varName = value.substring(2, value.length() - 1);
                        params.put(key, variables.get(varName));
                    } else {
                        params.put(key, value);
                    }
                }
            }
        }
        return params;
    }

    private Object callApi(String apiName, Map<String, Object> params) {
        // 这里应该调用实际的API服务
        // 暂时返回模拟数据
        log.debug("调用API: {}, 参数: {}", apiName, params);
        return 100.0; // 模拟返回值
    }

    private List<BigDecimal> parseArguments(String argsStr, Map<String, Object> variables) {
        List<BigDecimal> args = new ArrayList<>();
        if (StringUtils.hasText(argsStr)) {
            String[] argArray = argsStr.split(",");
            for (String arg : argArray) {
                arg = arg.trim();
                try {
                    // 如果是变量，从上下文中获取值
                    if (variables.containsKey(arg)) {
                        Object value = variables.get(arg);
                        if (value instanceof Number) {
                            args.add(new BigDecimal(value.toString()));
                        }
                    } else {
                        // 否则当作数字直接解析
                        args.add(new BigDecimal(arg));
                    }
                } catch (NumberFormatException e) {
                    log.warn("参数解析失败: {}", arg);
                    args.add(BigDecimal.ZERO);
                }
            }
        }
        return args;
    }

    // 内部类定义
    @FunctionalInterface
    public interface FormulaFunction {
        BigDecimal apply(List<BigDecimal> args);
    }

    public static class CalculationResult {
        private boolean success;
        private BigDecimal value;
        private long executionTime;
        private Set<String> dependencies;
        private List<String> errors;

        public static CalculationResult success(BigDecimal value, long executionTime, Set<String> dependencies) {
            CalculationResult result = new CalculationResult();
            result.success = true;
            result.value = value;
            result.executionTime = executionTime;
            result.dependencies = dependencies;
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
        public Set<String> getDependencies() { return dependencies; }
        public List<String> getErrors() { return errors; }
    }

    public static class FormulaValidationResult {
        private boolean valid;
        private List<String> errors;
        private List<String> warnings;
        private Set<String> dependencies;

        public FormulaValidationResult(boolean valid, List<String> errors, List<String> warnings, Set<String> dependencies) {
            this.valid = valid;
            this.errors = errors;
            this.warnings = warnings;
            this.dependencies = dependencies;
        }

        // Getters
        public boolean isValid() { return valid; }
        public List<String> getErrors() { return errors; }
        public List<String> getWarnings() { return warnings; }
        public Set<String> getDependencies() { return dependencies; }
    }

    public static class CalculationTask {
        private String taskId;
        private String formula;
        private Map<String, Object> variables;
        private String outputVariable;

        public CalculationTask(String taskId, String formula, Map<String, Object> variables, String outputVariable) {
            this.taskId = taskId;
            this.formula = formula;
            this.variables = variables;
            this.outputVariable = outputVariable;
        }

        // Getters
        public String getTaskId() { return taskId; }
        public String getFormula() { return formula; }
        public Map<String, Object> getVariables() { return variables; }
        public String getOutputVariable() { return outputVariable; }
    }

    public static class CalculationGraph {
        private Map<CalculationTask, Set<CalculationTask>> adjacencyList = new HashMap<>();

        public void addNode(CalculationTask node) {
            adjacencyList.computeIfAbsent(node, k -> new HashSet<>());
        }

        public void addEdge(CalculationTask from, CalculationTask to) {
            adjacencyList.computeIfAbsent(from, k -> new HashSet<>()).add(to);
            adjacencyList.computeIfAbsent(to, k -> new HashSet<>());
        }

        public Set<CalculationTask> getNodes() {
            return adjacencyList.keySet();
        }

        public Set<CalculationTask> getDependencies(CalculationTask node) {
            return adjacencyList.getOrDefault(node, Collections.emptySet());
        }
    }
} 