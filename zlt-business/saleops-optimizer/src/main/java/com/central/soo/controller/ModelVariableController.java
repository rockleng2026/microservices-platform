package com.central.soo.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.central.common.model.Result;
import com.central.soo.model.entity.ModelVariable;
import com.central.soo.service.IModelVariableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 模型变量管理控制器
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Tag(name = "模型变量管理")
@Slf4j
@RestController
@RequestMapping("/api/soo/v2/variables")
public class ModelVariableController {

    @Autowired
    private IModelVariableService modelVariableService;

    /**
     * 分页查询模型变量列表
     */
    @Operation(summary = "分页查询模型变量列表")
    @GetMapping
    public Result<Map<String, Object>> getVariables(
            @Parameter(description = "当前页") @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "模型ID") @RequestParam(required = false) Long modelId,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "变量类型") @RequestParam(required = false) String variableType,
            @Parameter(description = "数据类型") @RequestParam(required = false) String dataType
    ) {
        try {
            IPage<ModelVariable> pageResult = modelVariableService.getVariables(
                    page, size, modelId, keyword, variableType, dataType);

            Map<String, Object> result = new HashMap<>();
            result.put("data", convertToFrontendFormat(pageResult.getRecords()));
            result.put("count", pageResult.getTotal());
            result.put("page", pageResult.getCurrent());
            result.put("size", pageResult.getSize());
            result.put("pages", pageResult.getPages());

            return Result.succeed(result);
        } catch (Exception e) {
            log.error("获取变量列表失败", e);
            return Result.failed("获取变量列表失败: " + e.getMessage());
        }
    }

    /**
     * 根据ID获取变量详情
     */
    @Operation(summary = "根据ID获取变量详情")
    @GetMapping("/{id}")
    public Result<Map<String, Object>> getVariableById(
            @Parameter(description = "变量ID") @PathVariable Long id
    ) {
        try {
            ModelVariable variable = modelVariableService.getById(id);
            if (variable == null) {
                return Result.failed("变量不存在");
            }
            return Result.succeed(convertToFrontendFormat(variable));
        } catch (Exception e) {
            log.error("获取变量详情失败", e);
            return Result.failed("获取变量详情失败: " + e.getMessage());
        }
    }

    /**
     * 创建模型变量
     */
    @Operation(summary = "创建模型变量")
    @PostMapping
    public Result<Map<String, Object>> createVariable(
            @Parameter(description = "变量信息") @RequestBody Map<String, Object> variableData
    ) {
        try {
            ModelVariable variable = convertFromFrontendFormat(variableData);
            ModelVariable createdVariable = modelVariableService.createVariable(variable);
            return Result.succeed(convertToFrontendFormat(createdVariable));
        } catch (Exception e) {
            log.error("创建变量失败", e);
            return Result.failed("创建变量失败: " + e.getMessage());
        }
    }

    /**
     * 更新模型变量
     */
    @Operation(summary = "更新模型变量")
    @PutMapping("/{id}")
    public Result<Map<String, Object>> updateVariable(
            @Parameter(description = "变量ID") @PathVariable Long id,
            @Parameter(description = "变量信息") @RequestBody Map<String, Object> variableData
    ) {
        try {
            ModelVariable variable = convertFromFrontendFormat(variableData);
            ModelVariable updatedVariable = modelVariableService.updateVariable(id, variable);
            return Result.succeed(convertToFrontendFormat(updatedVariable));
        } catch (Exception e) {
            log.error("更新变量失败", e);
            return Result.failed("更新变量失败: " + e.getMessage());
        }
    }

    /**
     * 删除模型变量
     */
    @Operation(summary = "删除模型变量")
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteVariable(
            @Parameter(description = "变量ID") @PathVariable Long id
    ) {
        try {
            boolean result = modelVariableService.deleteVariable(id);
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("删除变量失败", e);
            return Result.failed("删除变量失败: " + e.getMessage());
        }
    }

    /**
     * 批量删除模型变量
     */
    @Operation(summary = "批量删除模型变量")
    @PostMapping("/batch-delete")
    public Result<Boolean> batchDeleteVariables(
            @Parameter(description = "变量ID列表") @RequestBody Map<String, List<Long>> requestData
    ) {
        try {
            List<Long> ids = requestData.get("ids");
            boolean result = modelVariableService.batchDeleteVariables(ids);
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("批量删除变量失败", e);
            return Result.failed("批量删除变量失败: " + e.getMessage());
        }
    }

    /**
     * 根据模型ID获取变量列表
     */
    @Operation(summary = "根据模型ID获取变量列表")
    @GetMapping("/model/{modelId}")
    public Result<List<Map<String, Object>>> getVariablesByModelId(
            @Parameter(description = "模型ID") @PathVariable Long modelId
    ) {
        try {
            List<ModelVariable> variables = modelVariableService.getVariablesByModelId(modelId);
            return Result.succeed(convertToFrontendFormat(variables));
        } catch (Exception e) {
            log.error("获取模型变量失败", e);
            return Result.failed("获取模型变量失败: " + e.getMessage());
        }
    }

    /**
     * 验证变量公式
     */
    @Operation(summary = "验证变量公式")
    @PostMapping("/validate-formula")
    public Result<Map<String, Object>> validateFormula(
            @Parameter(description = "验证请求") @RequestBody Map<String, Object> request
    ) {
        try {
            Long modelId = Long.valueOf(request.get("modelId").toString());
            String formula = request.get("formula").toString();
            
            Map<String, Object> result = modelVariableService.validateFormula(modelId, formula);
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("验证公式失败", e);
            return Result.failed("验证公式失败: " + e.getMessage());
        }
    }

    /**
     * 复制变量
     */
    @Operation(summary = "复制变量")
    @PostMapping("/{id}/clone")
    public Result<Map<String, Object>> cloneVariable(
            @Parameter(description = "变量ID") @PathVariable Long id,
            @Parameter(description = "复制参数") @RequestBody Map<String, String> request
    ) {
        try {
            String newVariableCode = request.get("newVariableCode");
            String newVariableName = request.get("newVariableName");
            
            ModelVariable clonedVariable = modelVariableService.cloneVariable(id, newVariableCode, newVariableName);
            return Result.succeed(convertToFrontendFormat(clonedVariable));
        } catch (Exception e) {
            log.error("复制变量失败", e);
            return Result.failed("复制变量失败: " + e.getMessage());
        }
    }

    /**
     * 更新变量显示顺序
     */
    @Operation(summary = "更新变量显示顺序")
    @PutMapping("/update-order")
    public Result<Boolean> updateVariableOrder(
            @Parameter(description = "变量顺序") @RequestBody Map<String, List<Map<String, Object>>> request
    ) {
        try {
            List<Map<String, Object>> variables = request.get("variables");
            boolean result = modelVariableService.updateVariableOrder(variables);
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("更新变量顺序失败", e);
            return Result.failed("更新变量顺序失败: " + e.getMessage());
        }
    }

    /**
     * 获取变量统计信息
     */
    @Operation(summary = "获取变量统计信息")
    @GetMapping("/statistics/{modelId}")
    public Result<Map<String, Object>> getVariableStatistics(
            @Parameter(description = "模型ID") @PathVariable Long modelId
    ) {
        try {
            Map<String, Object> statistics = modelVariableService.getVariableStatistics(modelId);
            return Result.succeed(statistics);
        } catch (Exception e) {
            log.error("获取变量统计失败", e);
            return Result.failed("获取变量统计失败: " + e.getMessage());
        }
    }

    /**
     * 导出变量配置
     */
    @Operation(summary = "导出变量配置")
    @GetMapping("/export/{modelId}")
    public Result<String> exportVariables(
            @Parameter(description = "模型ID") @PathVariable Long modelId
    ) {
        try {
            String configJson = modelVariableService.exportVariables(modelId);
            return Result.succeed(configJson);
        } catch (Exception e) {
            log.error("导出变量配置失败", e);
            return Result.failed("导出变量配置失败: " + e.getMessage());
        }
    }

    /**
     * 导入变量配置
     */
    @Operation(summary = "导入变量配置")
    @PostMapping("/import/{modelId}")
    public Result<List<Map<String, Object>>> importVariables(
            @Parameter(description = "模型ID") @PathVariable Long modelId,
            @Parameter(description = "配置数据") @RequestBody Map<String, String> request
    ) {
        try {
            String configJson = request.get("configJson");
            List<ModelVariable> importedVariables = modelVariableService.importVariables(modelId, configJson);
            return Result.succeed(convertToFrontendFormat(importedVariables));
        } catch (Exception e) {
            log.error("导入变量配置失败", e);
            return Result.failed("导入变量配置失败: " + e.getMessage());
        }
    }


    /**
     * 获取前端变量类型
     */
    private String getFrontendVariableType(ModelVariable variable) {
        return variable.getVariableType();
    }

    /**
     * 将后端实体转换为前端格式
     */
    private Map<String, Object> convertToFrontendFormat(ModelVariable variable) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", variable.getId());
        result.put("modelId", variable.getModelId());
        result.put("variableName", variable.getVariableName());
        result.put("variableCode", variable.getVariableCode());
        result.put("variableType", getFrontendVariableType(variable));
        result.put("dataType", variable.getDataType());
        result.put("defaultValue", variable.getDefaultValue());
        result.put("unit", variable.getUnit());
        result.put("description", variable.getDescription());
        result.put("formulaExpression", variable.getCalculationFormula());
        result.put("isRequired", variable.getIsRequired());
        result.put("validationRules", variable.getValidationRules());
        result.put("displayOrder", variable.getDisplayOrder());
        result.put("isVisible", variable.getIsVisible());
        result.put("createdAt", variable.getCreatedAt());
        result.put("updatedAt", variable.getUpdatedAt());
        return result;
    }

    /**
     * 将后端实体列表转换为前端格式
     */
    private List<Map<String, Object>> convertToFrontendFormat(List<ModelVariable> variables) {
        return variables.stream()
                .map(this::convertToFrontendFormat)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * 将前端格式转换为后端实体
     */
    private ModelVariable convertFromFrontendFormat(Map<String, Object> data) {
        ModelVariable variable = new ModelVariable();
        
        if (data.get("modelId") != null) {
            variable.setModelId(Long.valueOf(data.get("modelId").toString()));
        }
        if (data.get("variableName") != null) {
            variable.setVariableName(data.get("variableName").toString());
        }
        if (data.get("variableCode") != null) {
            variable.setVariableCode(data.get("variableCode").toString());
        }
        if (data.get("variableType") != null) {
            String frontendType = data.get("variableType").toString();
            variable.setVariableType(frontendType);
        }
        if (data.get("dataType") != null) {
            variable.setDataType(data.get("dataType").toString());
        }
        if (data.get("defaultValue") != null && !data.get("defaultValue").toString().isEmpty()) {
            try {
                variable.setDefaultValue(new java.math.BigDecimal(data.get("defaultValue").toString()));
            } catch (NumberFormatException e) {
                // 如果无法转换为数字，设置为null
                variable.setDefaultValue(null);
            }
        }
        if (data.get("unit") != null) {
            variable.setUnit(data.get("unit").toString());
        }
        if (data.get("description") != null) {
            variable.setDescription(data.get("description").toString());
        }
        if (data.get("formulaExpression") != null) {
            variable.setCalculationFormula(data.get("formulaExpression").toString());
        }
        if (data.get("isRequired") != null) {
            variable.setIsRequired(Boolean.valueOf(data.get("isRequired").toString()));
        }
        if (data.get("validationRules") != null && !data.get("validationRules").toString().trim().isEmpty()) {
            String validationRules = data.get("validationRules").toString().trim();
            
            // 从验证规则中提取min和max值
            java.math.BigDecimal minValue = null;
            java.math.BigDecimal maxValue = null;
            
            // 检查是否是有效的JSON格式，如果不是则包装成JSON
            if (!validationRules.startsWith("{") && !validationRules.startsWith("[")) {
                // 简单的验证规则，转换为JSON格式
                try {
                    // 尝试解析简单规则，如 "min:0,max:100"
                    String[] rules = validationRules.split(",");
                    StringBuilder jsonBuilder = new StringBuilder("{");
                    for (int i = 0; i < rules.length; i++) {
                        String rule = rules[i].trim();
                        if (rule.contains(":")) {
                            String[] parts = rule.split(":", 2);
                            if (parts.length == 2) {
                                String key = parts[0].trim();
                                String value = parts[1].trim();
                                
                                // 提取min和max值
                                if ("min".equals(key)) {
                                    try {
                                        minValue = new java.math.BigDecimal(value);
                                    } catch (NumberFormatException e) {
                                        // 忽略无效的数字
                                    }
                                } else if ("max".equals(key)) {
                                    try {
                                        maxValue = new java.math.BigDecimal(value);
                                    } catch (NumberFormatException e) {
                                        // 忽略无效的数字
                                    }
                                }
                                
                                if (i > 0) jsonBuilder.append(",");
                                jsonBuilder.append("\"").append(key).append("\":\"").append(value).append("\"");
                            }
                        }
                    }
                    jsonBuilder.append("}");
                    variable.setValidationRules(jsonBuilder.toString());
                } catch (Exception e) {
                    // 如果解析失败，设置为null
                    variable.setValidationRules(null);
                }
            } else {
                // 假设已经是JSON格式，尝试解析
                variable.setValidationRules(validationRules);
                // TODO: 从JSON中提取min和max值
            }
            
            // 设置min和max值到对应字段
            variable.setMinValue(minValue);
            variable.setMaxValue(maxValue);
        } else {
            variable.setValidationRules(null);
            variable.setMinValue(null);
            variable.setMaxValue(null);
        }
        if (data.get("displayOrder") != null) {
            variable.setDisplayOrder(Integer.valueOf(data.get("displayOrder").toString()));
        }
        if (data.get("isVisible") != null) {
            variable.setIsVisible(Boolean.valueOf(data.get("isVisible").toString()));
        }
        
        return variable;
    }
} 