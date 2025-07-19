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
            result.put("data", pageResult.getRecords());
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
    public Result<ModelVariable> getVariableById(
            @Parameter(description = "变量ID") @PathVariable Long id
    ) {
        try {
            ModelVariable variable = modelVariableService.getById(id);
            if (variable == null) {
                return Result.failed("变量不存在");
            }
            return Result.succeed(variable);
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
    public Result<ModelVariable> createVariable(
            @Parameter(description = "变量信息") @RequestBody ModelVariable variable
    ) {
        try {
            ModelVariable createdVariable = modelVariableService.createVariable(variable);
            return Result.succeed(createdVariable);
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
    public Result<ModelVariable> updateVariable(
            @Parameter(description = "变量ID") @PathVariable Long id,
            @Parameter(description = "变量信息") @RequestBody ModelVariable variable
    ) {
        try {
            ModelVariable updatedVariable = modelVariableService.updateVariable(id, variable);
            return Result.succeed(updatedVariable);
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
    public Result<List<ModelVariable>> getVariablesByModelId(
            @Parameter(description = "模型ID") @PathVariable Long modelId
    ) {
        try {
            List<ModelVariable> variables = modelVariableService.getVariablesByModelId(modelId);
            return Result.succeed(variables);
        } catch (Exception e) {
            log.error("获取模型变量失败", e);
            return Result.failed("获取模型变量失败: " + e.getMessage());
        }
    }

    /**
     * 根据模型ID获取变量树形结构
     */
    @Operation(summary = "根据模型ID获取变量树形结构")
    @GetMapping("/tree/{modelId}")
    public Result<List<ModelVariable>> getVariableTree(
            @Parameter(description = "模型ID") @PathVariable Long modelId
    ) {
        try {
            List<ModelVariable> variableTree = modelVariableService.getVariableTree(modelId);
            return Result.succeed(variableTree);
        } catch (Exception e) {
            log.error("获取变量树失败", e);
            return Result.failed("获取变量树失败: " + e.getMessage());
        }
    }

    /**
     * 根据父变量ID获取子变量列表
     */
    @Operation(summary = "根据父变量ID获取子变量列表")
    @GetMapping("/children/{parentId}")
    public Result<List<ModelVariable>> getChildVariables(
            @Parameter(description = "父变量ID") @PathVariable Long parentId
    ) {
        try {
            List<ModelVariable> children = modelVariableService.getChildVariables(parentId);
            return Result.succeed(children);
        } catch (Exception e) {
            log.error("获取子变量失败", e);
            return Result.failed("获取子变量失败: " + e.getMessage());
        }
    }

    /**
     * 移动变量到新的父级
     */
    @Operation(summary = "移动变量到新的父级")
    @PutMapping("/{id}/move")
    public Result<Boolean> moveVariable(
            @Parameter(description = "变量ID") @PathVariable Long id,
            @Parameter(description = "移动参数") @RequestBody Map<String, Object> request
    ) {
        try {
            Long newParentId = request.get("parentId") != null ? 
                    Long.valueOf(request.get("parentId").toString()) : null;
            
            boolean result = modelVariableService.moveVariable(id, newParentId);
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("移动变量失败", e);
            return Result.failed("移动变量失败: " + e.getMessage());
        }
    }

    /**
     * 验证约束条件
     */
    @Operation(summary = "验证约束条件")
    @PostMapping("/validate-constraint")
    public Result<Map<String, Object>> validateConstraint(
            @Parameter(description = "验证请求") @RequestBody Map<String, Object> request
    ) {
        try {
            Long modelId = Long.valueOf(request.get("modelId").toString());
            Long parentId = Long.valueOf(request.get("parentId").toString());
            String constraintFormula = request.get("constraintFormula").toString();
            
            Map<String, Object> result = modelVariableService.validateConstraint(modelId, parentId, constraintFormula);
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("验证约束条件失败", e);
            return Result.failed("验证约束条件失败: " + e.getMessage());
        }
    }

    /**
     * 获取变量依赖关系
     */
    @Operation(summary = "获取变量依赖关系")
    @GetMapping("/{variableId}/dependencies")
    public Result<List<ModelVariable>> getVariableDependencies(
            @Parameter(description = "变量ID") @PathVariable Long variableId
    ) {
        try {
            List<ModelVariable> dependencies = modelVariableService.getVariableDependencies(variableId);
            return Result.succeed(dependencies);
        } catch (Exception e) {
            log.error("获取变量依赖关系失败", e);
            return Result.failed("获取变量依赖关系失败: " + e.getMessage());
        }
    }

    /**
     * 更新变量顺序（上下移动）
     */
    @Operation(summary = "更新变量顺序（上下移动）")
    @PutMapping("/{id}/order")
    public Result<Boolean> updateVariableOrder(
            @Parameter(description = "变量ID") @PathVariable Long id,
            @Parameter(description = "移动参数") @RequestBody Map<String, String> request
    ) {
        try {
            String direction = request.get("direction");
            boolean result = modelVariableService.updateVariableOrder(id, direction);
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("更新变量顺序失败", e);
            return Result.failed("更新变量顺序失败: " + e.getMessage());
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
    public Result<ModelVariable> cloneVariable(
            @Parameter(description = "变量ID") @PathVariable Long id,
            @Parameter(description = "复制参数") @RequestBody Map<String, String> request
    ) {
        try {
            String newVariableCode = request.get("newVariableCode");
            String newVariableName = request.get("newVariableName");
            
            ModelVariable clonedVariable = modelVariableService.cloneVariable(id, newVariableCode, newVariableName);
            return Result.succeed(clonedVariable);
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
    public Result<List<ModelVariable>> importVariables(
            @Parameter(description = "模型ID") @PathVariable Long modelId,
            @Parameter(description = "配置数据") @RequestBody Map<String, String> request
    ) {
        try {
            String configJson = request.get("configJson");
            List<ModelVariable> importedVariables = modelVariableService.importVariables(modelId, configJson);
            return Result.succeed(importedVariables);
        } catch (Exception e) {
            log.error("导入变量配置失败", e);
            return Result.failed("导入变量配置失败: " + e.getMessage());
        }
    }
}