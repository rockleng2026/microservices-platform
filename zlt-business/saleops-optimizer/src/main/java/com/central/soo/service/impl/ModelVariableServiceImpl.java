package com.central.soo.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.common.context.TenantContextHolder;
import com.central.soo.mapper.ModelVariableMapper;
import com.central.soo.model.entity.ModelVariable;
import com.central.soo.service.IModelVariableService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import javax.annotation.Resource;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;

/**
 * 模型变量服务实现类
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Slf4j
@Service
@Transactional
public class ModelVariableServiceImpl extends ServiceImpl<ModelVariableMapper, ModelVariable> 
        implements IModelVariableService {

    @Resource
    private ModelVariableMapper modelVariableMapper;

    @Resource
    private ObjectMapper objectMapper;

    @Override
    public IPage<ModelVariable> getVariables(int page, int size, Long modelId, String keyword, 
                                           String variableType, String dataType) {
        Page<ModelVariable> pageParam = new Page<>(page, size);
        
        return modelVariableMapper.selectPageVariables(pageParam, modelId, keyword, 
                variableType, dataType);
    }

    @Override
    public List<ModelVariable> getVariablesByModelId(Long modelId) {
        return modelVariableMapper.selectByModelId(modelId);
    }

    @Override
    public ModelVariable createVariable(ModelVariable variable) {
        // 检查变量编码是否重复
        if (checkVariableCodeExists(variable.getModelId(), variable.getVariableCode(), null)) {
            throw new RuntimeException("变量编码已存在: " + variable.getVariableCode());
        }
        
        // 设置显示顺序
        if (variable.getDisplayOrder() == null) {
            Integer maxOrder = modelVariableMapper.selectMaxDisplayOrder(variable.getModelId());
            variable.setDisplayOrder(maxOrder + 1);
        }
        
        // 设置默认值
        if (variable.getIsRequired() == null) {
            variable.setIsRequired(false);
        }
        if (variable.getIsVisible() == null) {
            variable.setIsVisible(true);
        }
        if (variable.getIsKeyIndicator() == null) {
            variable.setIsKeyIndicator(false);
        }
        
        this.save(variable);
        return variable;
    }

    @Override
    public ModelVariable updateVariable(Long id, ModelVariable variable) {
        ModelVariable existingVariable = this.getById(id);
        if (existingVariable == null) {
            throw new RuntimeException("变量不存在: " + id);
        }
        
        // 检查变量编码是否重复（排除当前记录）
        if (!existingVariable.getVariableCode().equals(variable.getVariableCode()) &&
                checkVariableCodeExists(variable.getModelId(), variable.getVariableCode(), id)) {
            throw new RuntimeException("变量编码已存在: " + variable.getVariableCode());
        }
        
        // 复制属性
        BeanUtils.copyProperties(variable, existingVariable, "id", "createdAt");
        
        this.updateById(existingVariable);
        return existingVariable;
    }

    @Override
    public boolean deleteVariable(Long id) {
        ModelVariable variable = this.getById(id);
        if (variable == null) {
            return false;
        }
        
        // 检查是否被其他变量的公式引用
        List<ModelVariable> dependencies = findDependentVariables(variable.getModelId(), variable.getVariableCode());
        if (!dependencies.isEmpty()) {
            throw new RuntimeException("变量被以下变量引用，无法删除: " + 
                    dependencies.stream().map(ModelVariable::getVariableName).reduce((a, b) -> a + ", " + b).orElse(""));
        }
        
        return this.removeById(id);
    }

    @Override
    public boolean batchDeleteVariables(List<Long> ids) {
        return modelVariableMapper.batchDeleteByIds(ids) > 0;
    }

    @Override
    public ModelVariable cloneVariable(Long id, String newVariableCode, String newVariableName) {
        ModelVariable originalVariable = this.getById(id);
        if (originalVariable == null) {
            throw new RuntimeException("源变量不存在: " + id);
        }
        
        // 检查新变量编码是否重复
        if (checkVariableCodeExists(originalVariable.getModelId(), newVariableCode, null)) {
            throw new RuntimeException("变量编码已存在: " + newVariableCode);
        }
        
        ModelVariable newVariable = new ModelVariable();
        BeanUtils.copyProperties(originalVariable, newVariable, "id", "createdAt", "updatedAt");
        
        newVariable.setVariableCode(newVariableCode);
        newVariable.setVariableName(newVariableName);
        
        Integer maxOrder = modelVariableMapper.selectMaxDisplayOrder(originalVariable.getModelId());
        newVariable.setDisplayOrder(maxOrder + 1);
        
        this.save(newVariable);
        return newVariable;
    }

    @Override
    public boolean checkVariableCodeExists(Long modelId, String variableCode, Long excludeId) {
        return modelVariableMapper.checkVariableCodeExists(modelId, variableCode, excludeId) > 0;
    }

    @Override
    public Map<String, Object> getVariableStatistics(Long modelId) {
        return modelVariableMapper.selectVariableStatistics(modelId);
    }

    @Override
    public Map<String, Object> validateFormula(Long modelId, String formula) {
        Map<String, Object> result = new HashMap<>();
        
        if (!StringUtils.hasText(formula)) {
            result.put("valid", false);
            result.put("message", "公式不能为空");
            return result;
        }
        
        try {
            // 提取公式中的变量
            Set<String> variablesInFormula = extractVariablesFromFormula(formula);
            
            // 检查变量是否存在
            List<ModelVariable> allVariables = getVariablesByModelId(modelId);
            Map<String, ModelVariable> variableMap = new HashMap<>();
            for (ModelVariable var : allVariables) {
                variableMap.put(var.getVariableCode(), var);
            }
            
            List<String> missingVariables = new ArrayList<>();
            for (String varCode : variablesInFormula) {
                if (!variableMap.containsKey(varCode)) {
                    missingVariables.add(varCode);
                }
            }
            
            if (!missingVariables.isEmpty()) {
                result.put("valid", false);
                result.put("message", "公式中包含未定义的变量: " + String.join(", ", missingVariables));
                return result;
            }
            
            // 简单的语法检查（可以扩展为更复杂的解析器）
            if (!isValidFormulaExpression(formula)) {
                result.put("valid", false);
                result.put("message", "公式语法错误");
                return result;
            }
            
            result.put("valid", true);
            result.put("message", "公式验证通过");
            result.put("variables", variablesInFormula);
            
        } catch (Exception e) {
            log.error("验证公式失败: {}", e.getMessage());
            result.put("valid", false);
            result.put("message", "公式验证异常: " + e.getMessage());
        }
        
        return result;
    }

    @Override
    public boolean updateVariableOrder(List<Map<String, Object>> variables) {
        for (Map<String, Object> var : variables) {
            Long id = Long.valueOf(var.get("id").toString());
            Integer displayOrder = Integer.valueOf(var.get("displayOrder").toString());
            modelVariableMapper.updateDisplayOrder(id, displayOrder);
        }
        
        return true;
    }

    @Override
    public String exportVariables(Long modelId) {
        List<ModelVariable> variables = getVariablesByModelId(modelId);
        
        try {
            return objectMapper.writeValueAsString(variables);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("导出变量配置失败: " + e.getMessage());
        }
    }

    @Override
    public List<ModelVariable> importVariables(Long modelId, String configJson) {
        try {
            ModelVariable[] variableArray = objectMapper.readValue(configJson, ModelVariable[].class);
            List<ModelVariable> variables = Arrays.asList(variableArray);
            
            List<ModelVariable> importedVariables = new ArrayList<>();
            
            for (ModelVariable variable : variables) {
                // 重置ID和时间戳
                variable.setId(null);
                variable.setModelId(modelId);
                
                // 处理重复的变量编码
                String originalCode = variable.getVariableCode();
                String newCode = originalCode;
                int suffix = 1;
                while (checkVariableCodeExists(modelId, newCode, null)) {
                    newCode = originalCode + "_" + suffix++;
                }
                variable.setVariableCode(newCode);
                
                // 如果编码被修改，同时修改名称
                if (!newCode.equals(originalCode)) {
                    variable.setVariableName(variable.getVariableName() + "_导入" + suffix);
                }
                
                createVariable(variable);
                importedVariables.add(variable);
            }
            
            return importedVariables;
            
        } catch (JsonProcessingException e) {
            throw new RuntimeException("导入变量配置失败: " + e.getMessage());
        }
    }

    @Override
    public int getVariableCountByModelId(Long modelId) {
        return Math.toIntExact(modelVariableMapper.selectCount(
            Wrappers.<ModelVariable>lambdaQuery()
                .eq(ModelVariable::getModelId, modelId)
        ));
    }

    /**
     * 查找依赖指定变量的其他变量
     */
    private List<ModelVariable> findDependentVariables(Long modelId, String variableCode) {
        List<ModelVariable> allVariables = getVariablesByModelId(modelId);
        List<ModelVariable> dependentVariables = new ArrayList<>();
        
        for (ModelVariable variable : allVariables) {
            if (ModelVariable.TYPE_CALC.equals(variable.getVariableType()) && 
                    StringUtils.hasText(variable.getCalculationFormula())) {
                Set<String> variablesInFormula = extractVariablesFromFormula(variable.getCalculationFormula());
                if (variablesInFormula.contains(variableCode)) {
                    dependentVariables.add(variable);
                }
            }
        }
        
        return dependentVariables;
    }

    /**
     * 从公式中提取变量名
     */
    private Set<String> extractVariablesFromFormula(String formula) {
        Set<String> variables = new HashSet<>();
        
        // 匹配变量模式（字母开头，可包含字母、数字、下划线）
        Pattern pattern = Pattern.compile("\\b[a-zA-Z][a-zA-Z0-9_]*\\b");
        Matcher matcher = pattern.matcher(formula);
        
        while (matcher.find()) {
            String token = matcher.group();
            // 排除数学函数和关键字
            if (!isMathFunction(token)) {
                variables.add(token);
            }
        }
        
        return variables;
    }

    /**
     * 检查是否为数学函数
     */
    private boolean isMathFunction(String token) {
        Set<String> mathFunctions = Set.of(
                "sin", "cos", "tan", "log", "ln", "sqrt", "abs", "max", "min",
                "sum", "avg", "round", "ceil", "floor", "pow", "exp"
        );
        return mathFunctions.contains(token.toLowerCase());
    }

    /**
     * 简单的公式表达式验证
     */
    private boolean isValidFormulaExpression(String formula) {
        try {
            // 简单的括号匹配检查
            int parenthesesCount = 0;
            for (char c : formula.toCharArray()) {
                if (c == '(') {
                    parenthesesCount++;
                } else if (c == ')') {
                    parenthesesCount--;
                    if (parenthesesCount < 0) {
                        return false;
                    }
                }
            }
            return parenthesesCount == 0;
        } catch (Exception e) {
            return false;
        }
    }
} 