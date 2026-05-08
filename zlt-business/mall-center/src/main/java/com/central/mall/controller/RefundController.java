package com.central.mall.controller;

import com.central.common.model.Result;
import com.central.mall.model.dto.RefundApplyDTO;
import com.central.mall.service.IRefundService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 退款控制器
 */
@RestController
@RequestMapping("/api/mall/refund")
@RequiredArgsConstructor
@Tag(name = "退款管理", description = "小程序端退款接口")
@Validated
public class RefundController {

    private final IRefundService refundService;

    @PostMapping
    @Operation(summary = "申请退款 (REFUND-01)")
    public Result<?> applyRefund(@RequestBody @Validated RefundApplyDTO dto) {
        Long userId = getCurrentUserId();
        return refundService.applyRefund(dto, userId);
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "取消退款申请 (REFUND-03)")
    public Result<?> cancelRefund(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return refundService.cancelRefund(id, userId);
    }

    @GetMapping("/list")
    @Operation(summary = "退款列表 (REFUND-02)")
    public Result<?> getUserRefundList(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer pageSize) {
        Long userId = getCurrentUserId();
        Map<String, Object> pageDTO = Map.of("page", page != null ? page : 1, "pageSize", pageSize != null ? pageSize : 20);
        return refundService.getUserRefundList(userId, pageDTO);
    }

    @GetMapping("/{id}")
    @Operation(summary = "退款详情")
    public Result<?> getRefundDetail(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return refundService.getRefundDetail(id, userId);
    }

    private Long getCurrentUserId() {
        // TODO: integrate with real auth context
        return 1L;
    }
}
