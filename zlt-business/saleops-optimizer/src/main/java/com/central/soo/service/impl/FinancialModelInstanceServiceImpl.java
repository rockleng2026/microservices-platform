package com.central.soo.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.common.context.TenantContextHolder;
import com.central.common.model.LoginAppUser;
import com.central.common.model.PageResult;
import com.central.common.utils.LoginUserUtils;
import com.central.soo.mapper.FinancialModelInstanceMapper;
import com.central.soo.mapper.ModelInstanceVariableMapper;
import com.central.soo.mapper.ModelInstanceCalculationHistoryMapper;
import com.central.soo.model.entity.FinancialModelInstance;
import com.central.soo.model.entity.ModelInstanceVariable;
import com.central.soo.model.entity.ModelInstanceCalculationHistory;
import com.central.soo.service.FinancialModelInstanceService;
import com.central.soo.utils.PageResultUtil;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;
import com.central.soo.model.entity.ModelVariable;
import com.central.soo.service.IModelVariableService;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 财务模型实例服务实现类
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Slf4j
@Service
public class FinancialModelInstanceServiceImpl extends ServiceImpl<FinancialModelInstanceMapper, FinancialModelInstance> 
        implements FinancialModelInstanceService {

    @Autowired
    private ModelInstanceVariableMapper modelInstanceVariableMapper;

    @Autowired
    private ModelInstanceCalculationHistoryMapper calculationHistoryMapper;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IModelVariableService modelVariableService;

    // 1. 注入 DynamicFormulaEngine
    @Autowired
    private com.central.soo.engine.DynamicFormulaEngine dynamicFormulaEngine;

    @Override
    public Page<FinancialModelInstance> pageInstances(Page<FinancialModelInstance> page, Long modelId, 
                                                     Long projectId, String instanceStatus, String keyword, String tenantId) {
        return baseMapper.selectPageInstances(page, modelId, projectId, instanceStatus, keyword, tenantId);
    }

    @Override
    public PageResult<FinancialModelInstance> pageInstances(Integer page, Integer size, Long modelId, 
                                                           Long projectId, String instanceStatus, String keyword, String tenantId) {
        Page<FinancialModelInstance> pageParam = new Page<>(page, size);
        Page<FinancialModelInstance> result = baseMapper.selectPageInstances(pageParam, modelId, projectId, instanceStatus, keyword, tenantId);
        return PageResultUtil.buildPageResult(result);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public FinancialModelInstance createInstance(FinancialModelInstance instance) {
        // 设置基本信息
        LoginAppUser loginUser = LoginUserUtils.getCurrentUser(false);
        instance.setCreatorId(loginUser.getId());
        instance.setTenantId(TenantContextHolder.getTenant());
        
        // 验证实例编码唯一性
        if (getByInstanceCode(instance.getInstanceCode(), instance.getTenantId()) != null) {
            throw new RuntimeException("实例编码已存在: " + instance.getInstanceCode());
        }
        
        // 设置默认值
        if (StrUtil.isBlank(instance.getInstanceStatus())) {
            instance.setInstanceStatus("ACTIVE");
        }
        if (StrUtil.isBlank(instance.getCalculationStatus())) {
            instance.setCalculationStatus("PENDING");
        }
        
        instance.setCreatedAt(LocalDateTime.now());
        instance.setUpdatedAt(LocalDateTime.now());
        
        // 保存实例
        save(instance);
        
        log.info("创建模型实例成功: {}", instance.getInstanceName());
        return instance;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public FinancialModelInstance updateInstance(FinancialModelInstance instance) {
        // 检查实例是否存在
        FinancialModelInstance existingInstance = getById(instance.getId());
        if (existingInstance == null) {
            throw new RuntimeException("实例不存在: " + instance.getId());
        }
        
        // 如果修改了实例编码，需要验证唯一性
        if (!existingInstance.getInstanceCode().equals(instance.getInstanceCode())) {
            FinancialModelInstance duplicateInstance = getByInstanceCode(instance.getInstanceCode(), existingInstance.getTenantId());
            if (duplicateInstance != null && !duplicateInstance.getId().equals(instance.getId())) {
                throw new RuntimeException("实例编码已存在: " + instance.getInstanceCode());
            }
        }
        
        // 更新基本信息
        instance.setUpdatedAt(LocalDateTime.now());
        instance.setCalculationStatus("PENDING");
        
        LoginAppUser loginUser = LoginUserUtils.getCurrentUser(false);
        instance.setCreatorId(loginUser.getId());
        instance.setCreatedAt(LocalDateTime.now());
        
        // 保存更新
        updateById(instance);
        
        log.info("更新模型实例成功: {}", instance.getInstanceName());
        return instance;
    }

    @Override
    public Map<String, Object> getInstanceDetail(Long instanceId) {
        Map<String, Object> result = new HashMap<>();
        
        // 获取实例基本信息
        FinancialModelInstance instance = baseMapper.selectInstanceDetail(instanceId);
        if (instance == null) {
            throw new RuntimeException("实例不存在");
        }
        result.put("instance", instance);

        // 获取实例变量
        List<ModelInstanceVariable> variables = modelInstanceVariableMapper.selectByInstanceId(instanceId);
        result.put("variables", variables);

        // 获取最新计算历史
        ModelInstanceCalculationHistory latestHistory = calculationHistoryMapper.selectLatestHistory(instanceId);
        result.put("latestHistory", latestHistory);

        // 获取计算统计
        Map<String, Object> statistics = calculationHistoryMapper.selectCalculationStatistics(instanceId);
        result.put("statistics", statistics);

        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteInstance(Long instanceId) {
        // 删除实例变量
        modelInstanceVariableMapper.deleteByInstanceId(instanceId);
        
        // 删除计算历史
        calculationHistoryMapper.deleteByInstanceId(instanceId);
        
        // 删除实例
        boolean result = removeById(instanceId);
        
        log.info("删除模型实例成功: {}", instanceId);
        return result;
    }

    @Override
    public boolean toggleInstanceStatus(Long instanceId, boolean isActive) {
        String status = isActive ? "ACTIVE" : "INACTIVE";
        int result = baseMapper.updateInstanceStatus(instanceId, status);
        log.info("更新实例状态成功: {} -> {}", instanceId, status);
        return result > 0;
    }

    @Override
    public List<FinancialModelInstance> getInstancesByModelId(Long modelId, String tenantId) {
        return baseMapper.selectByModelId(modelId, tenantId);
    }

    @Override
    public List<FinancialModelInstance> getInstancesByProjectId(Long projectId, String tenantId) {
        return baseMapper.selectByProjectId(projectId, tenantId);
    }

    @Override
    public FinancialModelInstance getByInstanceCode(String instanceCode, String tenantId) {
        return baseMapper.selectByInstanceCode(instanceCode, tenantId);
    }

    @Override
    public Map<String, Object> getInstanceStatistics(String tenantId) {
        return baseMapper.selectInstanceStatistics(tenantId);
    }

    @Override
    public List<FinancialModelInstance> getRecentlyUsedInstances(String tenantId, int limit) {
        return baseMapper.selectRecentlyUsedInstances(tenantId, limit);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public FinancialModelInstance cloneInstance(Long sourceInstanceId, String newInstanceCode, String newInstanceName) {
        // 获取源实例
        FinancialModelInstance sourceInstance = getById(sourceInstanceId);
        if (sourceInstance == null) {
            throw new RuntimeException("源实例不存在: " + sourceInstanceId);
        }
        
        // 验证新实例编码唯一性
        FinancialModelInstance existingInstance = getByInstanceCode(newInstanceCode, sourceInstance.getTenantId());
        if (existingInstance != null) {
            throw new RuntimeException("实例编码已存在: " + newInstanceCode);
        }
        
        // 创建新实例
        FinancialModelInstance newInstance = new FinancialModelInstance();
        newInstance.setModelId(sourceInstance.getModelId());
        newInstance.setProjectId(sourceInstance.getProjectId());
        newInstance.setInstanceCode(newInstanceCode); // 确保设置实例编码
        newInstance.setInstanceName(newInstanceName);
        newInstance.setInstanceDescription(sourceInstance.getInstanceDescription());
        newInstance.setInstanceStatus("DRAFT"); // 新克隆的实例设置为草稿状态
        newInstance.setInstanceVersion(sourceInstance.getInstanceVersion()); // 复制版本号
        newInstance.setCalculationStatus("PENDING");
        
        LoginAppUser loginUser = LoginUserUtils.getCurrentUser(false);
        newInstance.setCreatorId(loginUser.getId());
        newInstance.setTenantId(sourceInstance.getTenantId());
        newInstance.setCreatedAt(LocalDateTime.now());
        newInstance.setUpdatedAt(LocalDateTime.now());
        
        // 保存新实例
        save(newInstance);
        
        // 克隆变量
        List<ModelInstanceVariable> sourceVariables = modelInstanceVariableMapper.selectByInstanceId(sourceInstanceId);
        for (ModelInstanceVariable sourceVar : sourceVariables) {
            ModelInstanceVariable newVar = new ModelInstanceVariable();
            newVar.setInstanceId(newInstance.getId());
            newVar.setVariableId(sourceVar.getVariableId());
            newVar.setVariableCode(sourceVar.getVariableCode()); // 确保设置变量编码
            newVar.setVariableName(sourceVar.getVariableName());
            newVar.setVariableValue(sourceVar.getVariableValue());
            newVar.setVariableType(sourceVar.getVariableType());
            newVar.setDataType(sourceVar.getDataType()); // 复制数据类型
            newVar.setIsRequired(sourceVar.getIsRequired());
            newVar.setCreatedAt(LocalDateTime.now());
            newVar.setUpdatedAt(LocalDateTime.now());
            
            modelInstanceVariableMapper.insert(newVar);
        }
        
        log.info("克隆模型实例成功: {} -> {}", sourceInstance.getInstanceName(), newInstanceName);
        return newInstance;
    }

    @Override
    public Map<String, Object> validateInstance(Long instanceId) {
        Map<String, Object> result = new HashMap<>();
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        // 获取实例
        FinancialModelInstance instance = getById(instanceId);
        if (instance == null) {
            errors.add("实例不存在");
            result.put("valid", false);
            result.put("errors", errors);
            result.put("warnings", warnings);
            return result;
        }

        // 获取实例变量
        List<ModelInstanceVariable> variables = modelInstanceVariableMapper.selectByInstanceId(instanceId);
        
        // 验证必填变量
        for (ModelInstanceVariable variable : variables) {
            if (variable.getIsRequired() != null && variable.getIsRequired()) {
                if (!StringUtils.hasText(variable.getVariableValue())) {
                    errors.add(String.format("变量 %s 是必填项", variable.getVariableName()));
                }
            }
        }

        // 验证变量值格式
        for (ModelInstanceVariable variable : variables) {
            if (StringUtils.hasText(variable.getVariableValue())) {
                try {
                    validateVariableValue(variable);
                } catch (Exception e) {
                    errors.add(String.format("变量 %s 值格式错误: %s", variable.getVariableName(), e.getMessage()));
                }
            }
        }

        result.put("valid", errors.isEmpty());
        result.put("errors", errors);
        result.put("warnings", warnings);
        result.put("variableCount", variables.size());
        result.put("requiredVariableCount", variables.stream()
                .filter(v -> v.getIsRequired() != null && v.getIsRequired())
                .count());

        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> executeCalculationV2(Long instanceId, String calculationType, Long triggeredBy, List<Map<String, Object>> variableValues, Boolean calcOnly) {
        Map<String, Object> result = new HashMap<>();
        try {
            // 获取实例
            FinancialModelInstance instance = getById(instanceId);
            if (instance == null) {
                throw new RuntimeException("实例不存在");
            }
            // 获取所有模型变量定义
            List<ModelVariable> modelVariables = modelVariableService.getVariablesByModelId(instance.getModelId());
            Map<String, ModelVariable> defMap = new HashMap<>();
            for (ModelVariable mv : modelVariables) {
                defMap.put(mv.getVariableCode(), mv);
            }
            // 获取当前实例变量
            List<ModelInstanceVariable> instanceVariables = modelInstanceVariableMapper.selectByInstanceId(instanceId);
            Map<String, String> instanceValueMap = new HashMap<>();
            for (ModelInstanceVariable v : instanceVariables) {
                instanceValueMap.put(v.getVariableCode(), v.getVariableValue());
            }
            // 变量赋值优先级：variableValues > 实例表 > defaultValue > 0
            Map<String, Object> valueMap = new HashMap<>();
            // 先用实例表和defaultValue初始化
            for (ModelVariable mv : modelVariables) {
                String code = mv.getVariableCode();
                String val = instanceValueMap.get(code);
                if (val != null && !val.isEmpty()) {
                    valueMap.put(code, val);
                } else if (mv.getDefaultValue() != null) {
                    valueMap.put(code, mv.getDefaultValue().toString());
                } else {
                    valueMap.put(code, "0");
                }
            }
            // 再用variableValues覆盖
            if (variableValues != null) {
                for (Map<String, Object> item : variableValues) {
                    String variableCode = (String) item.get("variableCode");
                    Object value = item.get("variableValue");
                    if (variableCode != null) {
                        valueMap.put(variableCode, value != null ? value.toString() : "0");
                    }
                }
            }
            // 计算所有CALC类型变量
            valueMap = performCalculation(instance, instanceVariables, modelVariables, valueMap);
            // 构建返回
            Map<String, Object> data = new HashMap<>();
            for (ModelVariable mv : modelVariables) {
                String code = mv.getVariableCode();
                if (Boolean.TRUE.equals(calcOnly)) {
                    if (ModelVariable.TYPE_CALC.equals(mv.getVariableType())) {
                        data.put(code, valueMap.get(code) != null ? valueMap.get(code).toString() : null);
                    }
                } else {
                    data.put(code, valueMap.get(code) != null ? valueMap.get(code).toString() : null);
                }
            }
            result.put("success", true);
            result.put("data", data);
            return result;
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", e.getMessage());
            return result;
        }
    }

    @Override
    public List<ModelInstanceVariable> getInstanceVariables(Long instanceId) {
        return modelInstanceVariableMapper.selectByInstanceId(instanceId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateInstanceVariables(Long instanceId, List<ModelInstanceVariable> variables) {
        // 验证实例是否存在
        FinancialModelInstance instance = getById(instanceId);
        if (instance == null) {
            throw new RuntimeException("实例不存在");
        }

        // 批量更新变量值
        for (ModelInstanceVariable variable : variables) {
            variable.setInstanceId(instanceId);
            variable.setUpdatedAt(LocalDateTime.now());
            
            // 如果变量已存在，更新值；否则插入新记录
            ModelInstanceVariable existingVariable = modelInstanceVariableMapper.selectByInstanceAndVariable(
                instanceId, variable.getVariableId());
            
            if (existingVariable != null) {
                existingVariable.setVariableValue(variable.getVariableValue());
                existingVariable.setUpdatedAt(LocalDateTime.now());
                modelInstanceVariableMapper.updateById(existingVariable);
            } else {
                variable.setCreatedAt(LocalDateTime.now());
                modelInstanceVariableMapper.insert(variable);
            }
        }

        // 更新实例配置
        updateInstanceConfig(instanceId);

        // 重置计算状态
        baseMapper.updateCalculationStatus(instanceId, "PENDING");

        log.info("更新实例变量成功: {}, 变量数量: {}", instanceId, variables.size());
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createInstanceVariables(Long instanceId, List<ModelInstanceVariable> variables) {
        // 验证实例是否存在
        FinancialModelInstance instance = getById(instanceId);
        if (instance == null) {
            throw new RuntimeException("实例不存在");
        }
        // 批量插入变量
        for (ModelInstanceVariable variable : variables) {
            variable.setInstanceId(instanceId);
            variable.setCreatedAt(LocalDateTime.now());
            variable.setUpdatedAt(LocalDateTime.now());
            modelInstanceVariableMapper.insert(variable);
        }
        // 更新实例配置
        updateInstanceConfig(instanceId);
        // 重置计算状态
        baseMapper.updateCalculationStatus(instanceId, "PENDING");
        log.info("创建实例变量成功: {}, 变量数量: {}", instanceId, variables.size());
        return true;
    }

    @Override
    public String exportInstanceConfig(Long instanceId) {
        Map<String, Object> config = new HashMap<>();
        
        // 获取实例信息
        FinancialModelInstance instance = getById(instanceId);
        if (instance == null) {
            throw new RuntimeException("实例不存在");
        }
        
        config.put("instance", instance);
        
        // 获取实例变量
        List<ModelInstanceVariable> variables = modelInstanceVariableMapper.selectByInstanceId(instanceId);
        config.put("variables", variables);
        
        try {
            return objectMapper.writeValueAsString(config);
        } catch (Exception e) {
            throw new RuntimeException("导出配置失败", e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public FinancialModelInstance importInstanceConfig(String configJson, String tenantId) {
        try {
            Map<String, Object> config = objectMapper.readValue(configJson, new TypeReference<Map<String, Object>>() {});
            
            // 创建实例
            FinancialModelInstance instance = objectMapper.convertValue(config.get("instance"), FinancialModelInstance.class);
            instance.setId(null); // 清除ID，创建新实例
            instance.setTenantId(tenantId);
            instance.setInstanceStatus("DRAFT");
            instance.setCalculationStatus("PENDING");
            
            LoginAppUser loginUser = LoginUserUtils.getCurrentUser(false);
            instance.setCreatorId(loginUser.getId());
            instance.setCreatedAt(LocalDateTime.now());
            instance.setUpdatedAt(LocalDateTime.now());
            
            save(instance);
            
            // 导入变量
            if (config.containsKey("variables")) {
                List<ModelInstanceVariable> variables = objectMapper.convertValue(
                    config.get("variables"), 
                    new TypeReference<List<ModelInstanceVariable>>() {}
                );
                
                for (ModelInstanceVariable variable : variables) {
                    variable.setId(null);
                    variable.setInstanceId(instance.getId());
                    variable.setCreatedAt(LocalDateTime.now());
                    variable.setUpdatedAt(LocalDateTime.now());
                    modelInstanceVariableMapper.insert(variable);
                }
            }
            
            log.info("导入实例配置成功: {}", instance.getInstanceCode());
            return instance;
            
        } catch (Exception e) {
            throw new RuntimeException("导入配置失败", e);
        }
    }

    @Override
    public Map<String, Object> getTrialCalculationData(Long instanceId) {
        Map<String, Object> result = new HashMap<>();
        
        // 获取实例信息
        FinancialModelInstance instance = getById(instanceId);
        if (instance == null) {
            throw new RuntimeException("实例不存在");
        }
        result.put("instance", instance);
        
        // 获取模型变量（所有变量定义）
        List<ModelVariable> modelVariables = modelVariableService.getVariablesByModelId(instance.getModelId());
        result.put("modelVariables", modelVariables);
        
        // 获取实例变量（已保存的值）
        List<ModelInstanceVariable> instanceVariables = modelInstanceVariableMapper.selectByInstanceId(instanceId);
        result.put("instanceVariables", instanceVariables);
        
        // 构建变量映射，方便前端使用
        Map<String, Object> variableMap = new HashMap<>();
        for (ModelInstanceVariable instanceVar : instanceVariables) {
            variableMap.put(instanceVar.getVariableCode(), instanceVar.getVariableValue());
        }
        result.put("variableValues", variableMap);
        
        return result;
    }
    
    /**
     * 初始化实例变量
     */
    private void initializeInstanceVariables(FinancialModelInstance instance) {
        // 这里需要根据模型ID获取模型变量，然后创建实例变量
        // 由于模型变量服务可能在其他模块，这里先创建空的变量列表
        log.info("初始化实例变量: {}", instance.getInstanceCode());
    }

    /**
     * 验证变量值
     */
    private void validateVariableValue(ModelInstanceVariable variable) {
        if (!StringUtils.hasText(variable.getVariableValue())) {
            return;
        }

        switch (variable.getDataType()) {
            case "INTEGER":
                try {
                    Integer.parseInt(variable.getVariableValue());
                } catch (NumberFormatException e) {
                    throw new RuntimeException("整数格式错误");
                }
                break;
            case "DECIMAL":
                try {
                    Double.parseDouble(variable.getVariableValue());
                } catch (NumberFormatException e) {
                    throw new RuntimeException("小数格式错误");
                }
                break;
            case "BOOLEAN":
                String value = variable.getVariableValue().toLowerCase();
                if (!"true".equals(value) && !"false".equals(value) && 
                    !"1".equals(value) && !"0".equals(value)) {
                    throw new RuntimeException("布尔值格式错误");
                }
                break;
        }
    }

    // 2. 重写 performCalculation，集成 DynamicFormulaEngine
    private Map<String, Object> performCalculation(
        FinancialModelInstance instance,
        List<ModelInstanceVariable> variables,
        List<ModelVariable> modelVariables,
        Map<String, Object> valueMap
    ) {
        // 依赖排序
        List<ModelVariable> sortedVars = topoSortByDependency(modelVariables);
        for (ModelVariable def : sortedVars) {
            if (ModelVariable.TYPE_CALC.equals(def.getVariableType()) && def.getCalculationFormula() != null && !def.getCalculationFormula().trim().isEmpty()) {
                try {
                    String formula = def.getCalculationFormula().trim();
                    com.central.soo.engine.DynamicFormulaEngine.CalculationResult result =
                        dynamicFormulaEngine.executeFormula(formula, valueMap);
                    if (result.isSuccess() && result.getValue() != null) {
                        valueMap.put(def.getVariableCode(), result.getValue().stripTrailingZeros().toPlainString());
                        log.info("[财务模型试算] 变量: {} 公式: {} 计算结果: {}", def.getVariableCode(), formula, result.getValue());
                    } else {
                        valueMap.put(def.getVariableCode(), "0");
                        log.warn("[财务模型试算] 变量: {} 公式: {} 计算失败: {}", def.getVariableCode(), formula, result.getErrors());
                    }
                } catch (Exception ex) {
                    valueMap.put(def.getVariableCode(), "0");
                    log.warn("[财务模型试算] 变量: {} 公式异常: {}", def.getVariableCode(), ex.getMessage());
                }
            }
        }
        return valueMap;
    }

    /**
     * 更新实例配置
     */
    private void updateInstanceConfig(Long instanceId) {
        try {
            List<ModelInstanceVariable> variables = modelInstanceVariableMapper.selectByInstanceId(instanceId);
            Map<String, Object> config = new HashMap<>();
            
            for (ModelInstanceVariable variable : variables) {
                config.put(variable.getVariableCode(), variable.getVariableValue());
            }
            
            FinancialModelInstance instance = new FinancialModelInstance();
            instance.setId(instanceId);
            instance.setInstanceConfig(objectMapper.writeValueAsString(config));
            instance.setUpdatedAt(LocalDateTime.now());
            
            updateById(instance);
        } catch (Exception e) {
            log.error("更新实例配置失败: {}", instanceId, e);
        }
    }

    // 拓扑排序，确保依赖先算
    private List<ModelVariable> topoSortByDependency(List<ModelVariable> variables) {
        Map<String, ModelVariable> codeMap = new HashMap<>();
        for (ModelVariable v : variables) codeMap.put(v.getVariableCode(), v);
        List<ModelVariable> result = new ArrayList<>();
        Set<String> visited = new HashSet<>();
        for (ModelVariable v : variables) {
            dfsTopo(v, codeMap, visited, result);
        }
        return result;
    }
    private void dfsTopo(ModelVariable v, Map<String, ModelVariable> codeMap, Set<String> visited, List<ModelVariable> result) {
        if (visited.contains(v.getVariableCode())) return;
        visited.add(v.getVariableCode());
        String formula = v.getCalculationFormula();
        if (formula != null) {
            if (formula.contains("=")) {
                formula = formula.split("=", 2)[1];
            }
            Matcher m = Pattern.compile("\\b([A-Za-z_][A-Za-z0-9_]*)\\b").matcher(formula);
            while (m.find()) {
                String dep = m.group(1);
                if (codeMap.containsKey(dep)) {
                    dfsTopo(codeMap.get(dep), codeMap, visited, result);
                }
            }
        }
        if (!result.contains(v)) result.add(v);
    }
}