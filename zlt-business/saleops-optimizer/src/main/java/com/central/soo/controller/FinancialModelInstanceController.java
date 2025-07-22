package com.central.soo.controller;

import com.central.common.annotation.LoginUser;
import com.central.common.context.TenantContextHolder;
import com.central.common.model.Result;
import com.central.common.model.PageResult;
import com.central.common.model.SysUser;
import com.central.soo.model.entity.FinancialModelInstance;
import com.central.soo.model.entity.ModelInstanceVariable;
import com.central.soo.service.FinancialModelInstanceService;
import io.swagger.v3.oas.annotations.Operation;
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

    /**
     * variableValues 只要传了 INPUT、API、CALC_FACTORS 类型变量，就会覆盖实例表中的值；<br/>
     * 没有传的 CALC_FACTORS（或 INPUT、API）类型变量，则自动用模型实例表中已有的值；<br/>
     * 计算时用的是“传参+实例表”合并后的最终变量值，保证了灵活性和兼容性 <br/>
     *
     * @param id 模型实例ID
     * @param request 请求体
     * @param user 当前用户
     * @return Result
     */
    @PostMapping("/{id}/calculate")
    @Operation(summary = "执行实例计算")
    public Result<Map<String, Object>> executeCalculation(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request,
            @LoginUser SysUser user) {
        // 变量赋值（INPUT/API类型）
        List<Map<String, Object>> variableValues = (List<Map<String, Object>>) request.get("variableValues");
        // 返回类型控制：calcOnly=true 只返回CALC类型，否则返回全部
        Boolean calcOnly = request.get("calcOnly") != null ? (Boolean) request.get("calcOnly") : false;
        String calculationType = request.get("calculationType") != null ? (String) request.get("calculationType") : "MANUAL";
        Long triggeredBy = user.getId();
        // 调用service
        Map<String, Object> result = financialModelInstanceService.executeCalculationV2(id, calculationType, triggeredBy, variableValues, calcOnly);
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

    @PostMapping("/{id}/variables")
    @Operation(summary = "创建实例变量")
    public Result<Boolean> createInstanceVariables(
            @PathVariable Long id,
            @RequestBody Map<String, List<ModelInstanceVariable>> request,
            @LoginUser SysUser user) {
        List<ModelInstanceVariable> variables = request.get("variables");
        boolean result = financialModelInstanceService.createInstanceVariables(id, variables);
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

    @GetMapping("/{id}/trial-calculation")
    @Operation(summary = "获取实例试算数据")
    public Result<Map<String, Object>> getTrialCalculationData(@PathVariable Long id) {
        Map<String, Object> data = financialModelInstanceService.getTrialCalculationData(id);
        return Result.succeed(data);
    }
} 