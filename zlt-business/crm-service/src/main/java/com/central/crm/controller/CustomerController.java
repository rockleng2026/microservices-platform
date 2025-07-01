package com.central.crm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.common.model.Result;
import com.central.crm.model.Customer;
import com.central.crm.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 客户管理Controller
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/api/customer")
@Tag(name = "客户管理", description = "客户管理相关接口")
@Validated
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    /**
     * 分页查询客户列表
     */
    @GetMapping("/page")
    @Operation(summary = "分页查询客户列表")
    public Result<IPage<Customer>> getCustomerPage(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String customerType,
            @RequestParam(required = false) String customerStatus,
            @RequestParam(required = false) String customerSource,
            @RequestParam(required = false) Long ownerEmployeeId,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String companyScale,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        try {
            Page<Customer> pageParam = new Page<>(page, size);
            Map<String, Object> params = new HashMap<>();
            if (customerName != null) params.put("customerName", customerName);
            if (customerType != null) params.put("customerType", customerType);
            if (customerStatus != null) params.put("customerStatus", customerStatus);
            if (customerSource != null) params.put("customerSource", customerSource);
            if (ownerEmployeeId != null) params.put("ownerEmployeeId", ownerEmployeeId);
            if (industry != null) params.put("industry", industry);
            if (companyScale != null) params.put("companyScale", companyScale);
            if (startDate != null) params.put("startDate", startDate);
            if (endDate != null) params.put("endDate", endDate);
            
            IPage<Customer> pageResult = customerService.selectCustomerPage(pageParam, params);
            return Result.succeed(pageResult);
        } catch (Exception e) {
            log.error("分页查询客户列表失败", e);
            return Result.failed("分页查询客户列表失败: " + e.getMessage());
        }
    }

    /**
     * 根据ID查询客户详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID查询客户详情")
    public Result<Customer> getCustomerById(@PathVariable Long id) {
        try {
            Customer customer = customerService.getById(id);
            return Result.succeed(customer);
        } catch (Exception e) {
            log.error("查询客户详情失败", e);
            return Result.failed("查询客户详情失败: " + e.getMessage());
        }
    }

    /**
     * 创建客户
     */
    @PostMapping
    @Operation(summary = "创建客户")
    public Result<String> createCustomer(@Valid @RequestBody Customer customer) {
        try {
            boolean success = customerService.createCustomer(customer);
            return success ? Result.succeed("创建成功") : Result.failed("创建失败");
        } catch (Exception e) {
            log.error("创建客户失败", e);
            return Result.failed("创建客户失败: " + e.getMessage());
        }
    }

    /**
     * 更新客户
     */
    @PutMapping
    @Operation(summary = "更新客户")
    public Result<String> updateCustomer(@Valid @RequestBody Customer customer) {
        try {
            boolean success = customerService.updateCustomer(customer);
            return success ? Result.succeed("更新成功") : Result.failed("更新失败");
        } catch (Exception e) {
            log.error("更新客户失败", e);
            return Result.failed("更新客户失败: " + e.getMessage());
        }
    }

    /**
     * 删除客户
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除客户")
    public Result<String> deleteCustomer(@PathVariable Long id) {
        try {
            boolean success = customerService.deleteCustomer(id);
            return success ? Result.succeed("删除成功") : Result.failed("删除失败");
        } catch (Exception e) {
            log.error("删除客户失败", e);
            return Result.failed("删除客户失败: " + e.getMessage());
        }
    }

    /**
     * 批量删除客户
     */
    @DeleteMapping("/batch")
    @Operation(summary = "批量删除客户")
    public Result<String> batchDeleteCustomers(@RequestBody List<Long> ids) {
        try {
            boolean success = customerService.batchDeleteCustomers(ids);
            return success ? Result.succeed("批量删除成功") : Result.failed("批量删除失败");
        } catch (Exception e) {
            log.error("批量删除客户失败", e);
            return Result.failed("批量删除客户失败: " + e.getMessage());
        }
    }

    /**
     * 检查客户名称是否存在
     */
    @GetMapping("/check-name")
    @Operation(summary = "检查客户名称是否存在")
    public Result<Boolean> checkCustomerNameExists(
            @RequestParam String customerName,
            @RequestParam(required = false) Long customerId) {
        
        try {
            boolean exists = customerService.checkCustomerNameExists(customerName, customerId);
            return Result.succeed(exists);
        } catch (Exception e) {
            log.error("检查客户名称失败", e);
            return Result.failed("检查客户名称失败: " + e.getMessage());
        }
    }

    /**
     * 检查手机号是否存在
     */
    @GetMapping("/check-phone")
    @Operation(summary = "检查手机号是否存在")
    public Result<Boolean> checkPhoneExists(
            @RequestParam String phone,
            @RequestParam(required = false) Long customerId) {
        
        try {
            boolean exists = customerService.checkPhoneExists(phone, customerId);
            return Result.succeed(exists);
        } catch (Exception e) {
            log.error("检查手机号失败", e);
            return Result.failed("检查手机号失败: " + e.getMessage());
        }
    }

    /**
     * 检查邮箱是否存在
     */
    @GetMapping("/check-email")
    @Operation(summary = "检查邮箱是否存在")
    public Result<Boolean> checkEmailExists(
            @RequestParam String email,
            @RequestParam(required = false) Long customerId) {
        
        try {
            boolean exists = customerService.checkEmailExists(email, customerId);
            return Result.succeed(exists);
        } catch (Exception e) {
            log.error("检查邮箱失败", e);
            return Result.failed("检查邮箱失败: " + e.getMessage());
        }
    }

    /**
     * 更新客户负责人
     */
    @PutMapping("/{id}/owner")
    @Operation(summary = "更新客户负责人")
    public Result<String> updateCustomerOwner(
            @PathVariable Long id,
            @RequestParam Long newOwnerEmployeeId) {
        
        try {
            boolean success = customerService.updateCustomerOwner(id, newOwnerEmployeeId);
            return success ? Result.succeed("更新成功") : Result.failed("更新失败");
        } catch (Exception e) {
            log.error("更新客户负责人失败", e);
            return Result.failed("更新客户负责人失败: " + e.getMessage());
        }
    }

    /**
     * 批量更新客户状态
     */
    @PutMapping("/batch-status")
    @Operation(summary = "批量更新客户状态")
    public Result<String> batchUpdateCustomerStatus(
            @RequestParam List<Long> customerIds,
            @RequestParam String status,
            @RequestParam Long updatedBy) {
        
        try {
            boolean success = customerService.batchUpdateCustomerStatus(customerIds, status, updatedBy);
            return success ? Result.succeed("批量更新成功") : Result.failed("批量更新失败");
        } catch (Exception e) {
            log.error("批量更新客户状态失败", e);
            return Result.failed("批量更新客户状态失败: " + e.getMessage());
        }
    }

    /**
     * 查询客户统计信息
     */
    @GetMapping("/statistics")
    @Operation(summary = "查询客户统计信息")
    public Result<Map<String, Object>> getCustomerStatistics(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Long ownerEmployeeId) {
        
        try {
            Map<String, Object> params = new HashMap<>();
            if (startDate != null) params.put("startDate", startDate);
            if (endDate != null) params.put("endDate", endDate);
            if (ownerEmployeeId != null) params.put("ownerEmployeeId", ownerEmployeeId);
            
            Map<String, Object> statistics = customerService.getCustomerStatistics(params);
            return Result.succeed(statistics);
        } catch (Exception e) {
            log.error("查询客户统计信息失败", e);
            return Result.failed("查询客户统计信息失败: " + e.getMessage());
        }
    }

    /**
     * 查询客户分布统计
     */
    @GetMapping("/distribution")
    @Operation(summary = "查询客户分布统计")
    public Result<List<Map<String, Object>>> getCustomerDistribution(
            @RequestParam(required = false) String type) {
        
        try {
            Map<String, Object> params = new HashMap<>();
            if (type != null) params.put("type", type);
            
            List<Map<String, Object>> distribution = customerService.getCustomerDistribution(params);
            return Result.succeed(distribution);
        } catch (Exception e) {
            log.error("查询客户分布统计失败", e);
            return Result.failed("查询客户分布统计失败: " + e.getMessage());
        }
    }

    /**
     * 查询高价值客户
     */
    @GetMapping("/high-value")
    @Operation(summary = "查询高价值客户")
    public Result<List<Customer>> getHighValueCustomers(
            @RequestParam(required = false) String minRevenue,
            @RequestParam(defaultValue = "10") Integer limit) {
        
        try {
            List<Customer> customers = customerService.getHighValueCustomers(minRevenue, limit);
            return Result.succeed(customers);
        } catch (Exception e) {
            log.error("查询高价值客户失败", e);
            return Result.failed("查询高价值客户失败: " + e.getMessage());
        }
    }

    /**
     * 查询流失风险客户
     */
    @GetMapping("/churn-risk")
    @Operation(summary = "查询流失风险客户")
    public Result<List<Map<String, Object>>> getChurnRiskCustomers(
            @RequestParam(defaultValue = "30") Integer daysSinceLastFollow) {
        
        try {
            List<Map<String, Object>> customers = customerService.getChurnRiskCustomers(daysSinceLastFollow);
            return Result.succeed(customers);
        } catch (Exception e) {
            log.error("查询流失风险客户失败", e);
            return Result.failed("查询流失风险客户失败: " + e.getMessage());
        }
    }

    /**
     * 导入客户数据
     */
    @PostMapping("/import")
    @Operation(summary = "导入客户数据")
    public Result<Map<String, Object>> importCustomers(@RequestBody List<Customer> customers) {
        try {
            Map<String, Object> result = customerService.importCustomers(customers);
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("导入客户数据失败", e);
            return Result.failed("导入客户数据失败: " + e.getMessage());
        }
    }

    /**
     * 导出客户数据
     */
    @PostMapping("/export")
    @Operation(summary = "导出客户数据")
    public Result<List<Customer>> exportCustomers(@RequestBody Map<String, Object> params) {
        try {
            List<Customer> customers = customerService.exportCustomers(params);
            return Result.succeed(customers);
        } catch (Exception e) {
            log.error("导出客户数据失败", e);
            return Result.failed("导出客户数据失败: " + e.getMessage());
        }
    }
}