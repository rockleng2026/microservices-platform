package com.central.soo.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.common.annotation.LoginUser;
import com.central.common.context.TenantContextHolder;
import com.central.common.model.LoginAppUser;
import com.central.common.model.Result;
import com.central.common.model.PageResult;
import com.central.common.model.SysUser;
import com.central.soo.model.entity.FinancialModelInstance;
import com.central.soo.model.entity.ModelInstanceVariable;
import com.central.soo.service.FinancialModelInstanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 财务模型实例控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/soo/v2/model-instances")
@Tag(name = "财务模型实例管理")
public class FinancialModelInstanceController {

    @Autowired
    private FinancialModelInstanceService financialModelInstanceService;

    @GetMapping
    @Operation(summary = "分页查询模型实例列表")
    public PageResult<FinancialModelInstance> getInstances(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) Long modelId,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String instanceStatus,
            @RequestParam(required = false) String keyword,
            @LoginUser SysUser user) {
        
        String tenantId = TenantContextHolder.getTenant();
        return financialModelInstanceService.pageInstances(page, size, modelId, projectId, instanceStatus, keyword, tenantId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "获取模型实例详情")
    public Result<Map<String, Object>> getInstanceDetail(@PathVariable Long id) {
        Map<String, Object> detail = financialModelInstanceService.getInstanceDetail(id);
        return Result.succeed(detail);
    }

    @PostMapping
    @Operation(summary = "创建模型实例")
    public Result<FinancialModelInstance> createInstance(
            @RequestBody FinancialModelInstance instance,
            @LoginUser SysUser user) {
        FinancialModelInstance createdInstance = financialModelInstanceService.createInstance(instance);
        return Result.succeed(createdInstance);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新模型实例")
    public Result<FinancialModelInstance> updateInstance(
            @PathVariable Long id, 
            @RequestBody FinancialModelInstance instance,
            @LoginUser SysUser user) {
        instance.setId(id);
        FinancialModelInstance updatedInstance = financialModelInstanceService.updateInstance(instance);
        return Result.succeed(updatedInstance);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除模型实例")
    public Result<Boolean> deleteInstance(
            @PathVariable Long id,
            @LoginUser SysUser user) {
        boolean result = financialModelInstanceService.deleteInstance(id);
        return Result.succeed(result);
    }

    @PostMapping("/{id}/calculate")
    @Operation(summary = "执行实例计算")
    public Result<Map<String, Object>> executeCalculation(
            @PathVariable Long id, 
            @RequestBody Map<String, String> request,
            @LoginUser SysUser user) {
        String calculationType = request.get("calculationType");
        Long triggeredBy = user.getId();
        Map<String, Object> result = financialModelInstanceService.executeCalculation(id, calculationType, triggeredBy);
        return Result.succeed(result);
    }

    @GetMapping("/{id}/variables")
    @Operation(summary = "获取实例变量列表")
    public Result<List<ModelInstanceVariable>> getInstanceVariables(@PathVariable Long id) {
        List<ModelInstanceVariable> variables = financialModelInstanceService.getInstanceVariables(id);
        return Result.succeed(variables);
    }

    @PutMapping("/{id}/variables")
    @Operation(summary = "更新实例变量")
    public Result<Boolean> updateInstanceVariables(
            @PathVariable Long id, 
            @RequestBody Map<String, List<ModelInstanceVariable>> request,
            @LoginUser SysUser user) {
        List<ModelInstanceVariable> variables = request.get("variables");
        boolean result = financialModelInstanceService.updateInstanceVariables(id, variables);
        return Result.succeed(result);
    }

    @PostMapping("/{id}/clone")
    @Operation(summary = "克隆模型实例")
    public Result<FinancialModelInstance> cloneInstance(
            @PathVariable Long id, 
            @RequestBody Map<String, String> request,
            @LoginUser SysUser user) {
        String newInstanceCode = request.get("newInstanceCode");
        String newInstanceName = request.get("newInstanceName");
        FinancialModelInstance clonedInstance = financialModelInstanceService.cloneInstance(id, newInstanceCode, newInstanceName);
        return Result.succeed(clonedInstance);
    }

    @GetMapping("/statistics")
    @Operation(summary = "获取实例统计信息")
    public Result<Map<String, Object>> getInstanceStatistics(@LoginUser SysUser user) {
        String tenantId = TenantContextHolder.getTenant();
        Map<String, Object> statistics = financialModelInstanceService.getInstanceStatistics(tenantId);
        return Result.succeed(statistics);
    }
} 