package com.central.crm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.common.model.Result;
import com.central.crm.model.CustomerTransfer;
import com.central.crm.service.CustomerTransferService;
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
 * 客户移交Controller
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/api/customer-transfer")
@Tag(name = "客户移交管理", description = "客户移交相关接口")
@Validated
public class CustomerTransferController {

    @Autowired
    private CustomerTransferService customerTransferService;

    /**
     * 分页查询移交记录列表
     */
    @GetMapping("/page")
    @Operation(summary = "分页查询移交记录列表")
    public Result<IPage<CustomerTransfer>> getTransferPage(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long fromEmployeeId,
            @RequestParam(required = false) Long toEmployeeId,
            @RequestParam(required = false) String approvalStatus,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        try {
            Page<CustomerTransfer> pageParam = new Page<>(page, size);
            Map<String, Object> params = new HashMap<>();
            if (customerId != null) params.put("customerId", customerId);
            if (fromEmployeeId != null) params.put("fromEmployeeId", fromEmployeeId);
            if (toEmployeeId != null) params.put("toEmployeeId", toEmployeeId);
            if (approvalStatus != null) params.put("approvalStatus", approvalStatus);
            if (startDate != null) params.put("startDate", startDate);
            if (endDate != null) params.put("endDate", endDate);
            
            IPage<CustomerTransfer> pageResult = customerTransferService.selectTransferPage(pageParam, params);
            return Result.succeed(pageResult);
        } catch (Exception e) {
            log.error("分页查询移交记录失败", e);
            return Result.failed("分页查询移交记录失败: " + e.getMessage());
        }
    }

    /**
     * 根据ID查询移交记录详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID查询移交记录详情")
    public Result<CustomerTransfer> getTransferById(@PathVariable Long id) {
        try {
            CustomerTransfer transfer = customerTransferService.getById(id);
            return Result.succeed(transfer);
        } catch (Exception e) {
            log.error("查询移交记录详情失败", e);
            return Result.failed("查询移交记录详情失败: " + e.getMessage());
        }
    }

    /**
     * 创建移交申请
     */
    @PostMapping
    @Operation(summary = "创建移交申请")
    public Result<String> createTransfer(@Valid @RequestBody CustomerTransfer transfer) {
        try {
            boolean success = customerTransferService.createTransfer(transfer);
            return success ? Result.succeed("移交申请创建成功") : Result.failed("移交申请创建失败");
        } catch (Exception e) {
            log.error("创建移交申请失败", e);
            return Result.failed("创建移交申请失败: " + e.getMessage());
        }
    }

    /**
     * 审批移交申请
     */
    @PutMapping("/{id}/approve")
    @Operation(summary = "审批移交申请")
    public Result<String> approveTransfer(
            @PathVariable Long id,
            @RequestParam String approvalStatus,
            @RequestParam(required = false) String approvalNotes,
            @RequestParam Long approverId) {
        
        try {
            boolean success = customerTransferService.approveTransfer(id, approvalStatus, approvalNotes, approverId);
            return success ? Result.succeed("审批成功") : Result.failed("审批失败");
        } catch (Exception e) {
            log.error("审批移交申请失败", e);
            return Result.failed("审批移交申请失败: " + e.getMessage());
        }
    }

    /**
     * 查询待审批的移交申请
     */
    @GetMapping("/pending-approvals")
    @Operation(summary = "查询待审批的移交申请")
    public Result<List<CustomerTransfer>> getPendingApprovals(
            @RequestParam(required = false) Long approverId) {
        
        try {
            Map<String, Object> params = new HashMap<>();
            if (approverId != null) params.put("approverId", approverId);
            
            List<CustomerTransfer> pendingApprovals = customerTransferService.getPendingApprovals(params);
            return Result.succeed(pendingApprovals);
        } catch (Exception e) {
            log.error("查询待审批移交申请失败", e);
            return Result.failed("查询待审批移交申请失败: " + e.getMessage());
        }
    }

    /**
     * 根据客户ID查询移交记录
     */
    @GetMapping("/customer/{customerId}")
    @Operation(summary = "根据客户ID查询移交记录")
    public Result<List<CustomerTransfer>> getByCustomerId(@PathVariable Long customerId) {
        try {
            List<CustomerTransfer> transfers = customerTransferService.getByCustomerId(customerId);
            return Result.succeed(transfers);
        } catch (Exception e) {
            log.error("查询客户移交记录失败", e);
            return Result.failed("查询客户移交记录失败: " + e.getMessage());
        }
    }

    /**
     * 查询移交统计信息
     */
    @GetMapping("/statistics")
    @Operation(summary = "查询移交统计信息")
    public Result<Map<String, Object>> getTransferStatistics(
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        
        try {
            Map<String, Object> params = new HashMap<>();
            if (employeeId != null) params.put("employeeId", employeeId);
            if (startDate != null) params.put("startDate", startDate);
            if (endDate != null) params.put("endDate", endDate);
            
            Map<String, Object> statistics = customerTransferService.getTransferStatistics(params);
            return Result.succeed(statistics);
        } catch (Exception e) {
            log.error("查询移交统计信息失败", e);
            return Result.failed("查询移交统计信息失败: " + e.getMessage());
        }
    }

    /**
     * 批量移交客户
     */
    @PostMapping("/batch")
    @Operation(summary = "批量移交客户")
    public Result<Map<String, Object>> batchTransferCustomers(
            @RequestParam List<Long> customerIds,
            @RequestParam Long toEmployeeId,
            @RequestParam String transferReason,
            @RequestParam Long operatorId) {
        
        try {
            Map<String, Object> result = customerTransferService.batchTransferCustomers(customerIds, toEmployeeId, transferReason, operatorId);
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("批量移交客户失败", e);
            return Result.failed("批量移交客户失败: " + e.getMessage());
        }
    }

    /**
     * 取消移交申请
     */
    @PutMapping("/{id}/cancel")
    @Operation(summary = "取消移交申请")
    public Result<String> cancelTransfer(
            @PathVariable Long id,
            @RequestParam String cancelReason,
            @RequestParam Long operatorId) {
        
        try {
            boolean success = customerTransferService.cancelTransfer(id, cancelReason, operatorId);
            return success ? Result.succeed("取消成功") : Result.failed("取消失败");
        } catch (Exception e) {
            log.error("取消移交申请失败", e);
            return Result.failed("取消移交申请失败: " + e.getMessage());
        }
    }

    /**
     * 查询我的移交申请
     */
    @GetMapping("/my-applications")
    @Operation(summary = "查询我的移交申请")
    public Result<List<CustomerTransfer>> getMyTransferApplications(@RequestParam Long employeeId) {
        try {
            List<CustomerTransfer> applications = customerTransferService.getMyTransferApplications(employeeId);
            return Result.succeed(applications);
        } catch (Exception e) {
            log.error("查询我的移交申请失败", e);
            return Result.failed("查询我的移交申请失败: " + e.getMessage());
        }
    }

    /**
     * 查询需要我审批的移交申请
     */
    @GetMapping("/for-approval")
    @Operation(summary = "查询需要我审批的移交申请")
    public Result<List<CustomerTransfer>> getTransfersForApproval(@RequestParam Long approverId) {
        try {
            List<CustomerTransfer> transfers = customerTransferService.getTransfersForApproval(approverId);
            return Result.succeed(transfers);
        } catch (Exception e) {
            log.error("查询需要审批的移交申请失败", e);
            return Result.failed("查询需要审批的移交申请失败: " + e.getMessage());
        }
    }

    /**
     * 查询移交历史记录
     */
    @GetMapping("/history/{customerId}")
    @Operation(summary = "查询移交历史记录")
    public Result<List<Map<String, Object>>> getTransferHistory(@PathVariable Long customerId) {
        try {
            List<Map<String, Object>> history = customerTransferService.getTransferHistory(customerId);
            return Result.succeed(history);
        } catch (Exception e) {
            log.error("查询移交历史记录失败", e);
            return Result.failed("查询移交历史记录失败: " + e.getMessage());
        }
    }

    /**
     * 导出移交记录
     */
    @PostMapping("/export")
    @Operation(summary = "导出移交记录")
    public Result<List<CustomerTransfer>> exportTransfers(@RequestBody Map<String, Object> params) {
        try {
            List<CustomerTransfer> transfers = customerTransferService.exportTransfers(params);
            return Result.succeed(transfers);
        } catch (Exception e) {
            log.error("导出移交记录失败", e);
            return Result.failed("导出移交记录失败: " + e.getMessage());
        }
    }
}