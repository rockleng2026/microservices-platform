package com.central.crm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.common.model.Result;
import com.central.crm.model.CustomerTransfer;
import com.central.crm.service.CustomerTransferService;
import com.central.crm.model.vo.CustomerTransferQueryVO;
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
    @PostMapping("/page")
    @Operation(summary = "分页查询移交记录列表")
    public Result<IPage<CustomerTransfer>> getTransferPage(@RequestBody CustomerTransferQueryVO vo) {
        try {
            Page<CustomerTransfer> pageParam = new Page<>(vo.getPage(), vo.getSize());
            Map<String, Object> params = new HashMap<>();
            if (vo.getCustomerId() != null) params.put("customerId", vo.getCustomerId());
            if (vo.getFromEmployeeId() != null) params.put("fromEmployeeId", vo.getFromEmployeeId());
            if (vo.getToEmployeeId() != null) params.put("toEmployeeId", vo.getToEmployeeId());
            if (vo.getApprovalStatus() != null) params.put("approvalStatus", vo.getApprovalStatus());
            if (vo.getStartDate() != null) params.put("startDate", vo.getStartDate());
            if (vo.getEndDate() != null) params.put("endDate", vo.getEndDate());
            
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
    public Result<String> approveTransfer(@PathVariable Long id, @RequestBody CustomerTransferQueryVO vo) {
        try {
            boolean success = customerTransferService.approveTransfer(id, vo.getApprovalStatus(), vo.getApprovalNotes(), vo.getApproverId());
            return success ? Result.succeed("审批成功") : Result.failed("审批失败");
        } catch (Exception e) {
            log.error("审批移交申请失败", e);
            return Result.failed("审批移交申请失败: " + e.getMessage());
        }
    }

    /**
     * 查询待审批的移交申请
     */
    @PostMapping("/pending-approvals")
    @Operation(summary = "查询待审批的移交申请")
    public Result<List<CustomerTransfer>> getPendingApprovals(@RequestBody CustomerTransferQueryVO vo) {
        try {
            Map<String, Object> params = new HashMap<>();
            if (vo.getApproverId() != null) params.put("approverId", vo.getApproverId());
            
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
    @PostMapping("/statistics")
    @Operation(summary = "查询移交统计信息")
    public Result<Map<String, Object>> getTransferStatistics(@RequestBody CustomerTransferQueryVO vo) {
        try {
            Map<String, Object> params = new HashMap<>();
            if (vo.getEmployeeId() != null) params.put("employeeId", vo.getEmployeeId());
            if (vo.getStartDate() != null) params.put("startDate", vo.getStartDate());
            if (vo.getEndDate() != null) params.put("endDate", vo.getEndDate());
            
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
    public Result<Map<String, Object>> batchTransferCustomers(@RequestBody CustomerTransferQueryVO vo) {
        try {
            Map<String, Object> result = customerTransferService.batchTransferCustomers(vo.getCustomerIds(), vo.getToEmployeeId(), vo.getTransferReason(), vo.getOperatorId());
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
    public Result<String> cancelTransfer(@PathVariable Long id, @RequestBody CustomerTransferQueryVO vo) {
        try {
            boolean success = customerTransferService.cancelTransfer(id, vo.getCancelReason(), vo.getOperatorId());
            return success ? Result.succeed("取消成功") : Result.failed("取消失败");
        } catch (Exception e) {
            log.error("取消移交申请失败", e);
            return Result.failed("取消移交申请失败: " + e.getMessage());
        }
    }

    /**
     * 查询我的移交申请
     */
    @PostMapping("/my-applications")
    @Operation(summary = "查询我的移交申请")
    public Result<List<CustomerTransfer>> getMyTransferApplications(@RequestBody CustomerTransferQueryVO vo) {
        try {
            List<CustomerTransfer> applications = customerTransferService.getMyTransferApplications(vo.getEmployeeId());
            return Result.succeed(applications);
        } catch (Exception e) {
            log.error("查询我的移交申请失败", e);
            return Result.failed("查询我的移交申请失败: " + e.getMessage());
        }
    }

    /**
     * 查询需要我审批的移交申请
     */
    @PostMapping("/for-approval")
    @Operation(summary = "查询需要我审批的移交申请")
    public Result<List<CustomerTransfer>> getTransfersForApproval(@RequestBody CustomerTransferQueryVO vo) {
        try {
            List<CustomerTransfer> transfers = customerTransferService.getTransfersForApproval(vo.getApproverId());
            return Result.succeed(transfers);
        } catch (Exception e) {
            log.error("查询需要我审批的移交申请失败", e);
            return Result.failed("查询需要我审批的移交申请失败: " + e.getMessage());
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