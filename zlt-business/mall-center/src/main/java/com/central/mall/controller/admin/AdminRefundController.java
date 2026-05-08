package com.central.mall.controller.admin;

import com.central.common.model.Result;
import com.central.mall.service.IRefundService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 管理员退款控制器
 */
@RestController
@RequestMapping("/api/mall/admin/refund")
@RequiredArgsConstructor
@Tag(name = "管理员-退款管理")
public class AdminRefundController {

    private final IRefundService refundService;

    @GetMapping("/list")
    @Operation(summary = "退款列表（多条件筛选）(REFUND-04)")
    public Result<?> getAdminRefundList(
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime,
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long pageSize) {
        Map<String, Object> queryDTO = new java.util.HashMap<>();
        if (orderId != null) queryDTO.put("orderId", orderId);
        if (status != null) queryDTO.put("status", status);
        if (startTime != null) queryDTO.put("startTime", startTime);
        if (endTime != null) queryDTO.put("endTime", endTime);
        queryDTO.put("page", page != null ? page : 1);
        queryDTO.put("pageSize", pageSize != null ? pageSize : 20);
        return refundService.getAdminRefundList(queryDTO);
    }

    @PostMapping("/{id}/approve")
    @Operation(summary = "审核通过退款申请 (REFUND-05)")
    public Result<?> approveRefund(@PathVariable Long id,
            @RequestParam(required = false) String remark) {
        // TODO: integrate with real admin auth context
        Long adminId = 1L;
        return refundService.approveRefund(id, adminId, remark);
    }

    @PostMapping("/{id}/reject")
    @Operation(summary = "审核拒绝退款申请 (REFUND-06)")
    public Result<?> rejectRefund(@PathVariable Long id,
            @RequestParam(required = false) String remark) {
        // TODO: integrate with real admin auth context
        Long adminId = 1L;
        return refundService.rejectRefund(id, adminId, remark);
    }
}
