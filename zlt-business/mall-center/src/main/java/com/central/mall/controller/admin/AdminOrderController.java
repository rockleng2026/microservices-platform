package com.central.mall.controller.admin;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.central.common.model.Result;
import com.central.mall.model.dto.OrderDetailDTO;
import com.central.mall.model.dto.OrderListDTO;
import com.central.mall.model.dto.ShipOrderDTO;
import com.central.mall.service.IOrderService;
import com.central.mall.config.TenantInterceptor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mall/admin/order")
@RequiredArgsConstructor
@Tag(name = "管理员-订单管理")
@Validated
public class AdminOrderController {

    private final IOrderService orderService;

    @GetMapping("/list")
    @Operation(summary = "订单列表（分页）")
    public Result<IPage<OrderListDTO>> getOrderPage(
            @RequestParam(defaultValue = "1") Long page,
            @RequestParam(defaultValue = "20") Long pageSize,
            @RequestParam(required = false) String orderNo,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime,
            @RequestParam(required = false) String keyword) {

        String tenantId = TenantInterceptor.getCurrentTenantId();

        // Build filter params
        Map<String, Object> params = new HashMap<>();
        if (orderNo != null && !orderNo.isEmpty()) params.put("orderNo", orderNo);
        if (status != null) params.put("status", status);
        if (startTime != null && !startTime.isEmpty()) params.put("startTime", startTime);
        if (endTime != null && !endTime.isEmpty()) params.put("endTime", endTime);
        if (keyword != null && !keyword.isEmpty()) params.put("keyword", keyword);
        params.put("tenantId", tenantId);

        // Get orders - this would need a proper implementation with pagination
        // For now, return a basic page
        com.baomidou.mybatisplus.extension.plugins.pagination.Page<OrderListDTO> pageResult =
            new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(page, pageSize);

        // TODO: Implement with actual query when IAdminOrderService has getOrderPage method
        return Result.succeed(pageResult);
    }

    @GetMapping("/{id}")
    @Operation(summary = "订单详情")
    public Result<?> getOrderDetail(@PathVariable Long id) {
        try {
            Map<String, Object> detail = orderService.getOrderDetail(id, null);
            return Result.succeed(detail);
        } catch (RuntimeException e) {
            return Result.failed("订单不存在");
        }
    }

    @PostMapping("/{id}/ship")
    @Operation(summary = "订单发货")
    public Result<Boolean> shipOrder(@PathVariable Long id, @RequestBody @Validated ShipOrderDTO dto) {
        if (dto.getExpressCode() == null || dto.getExpressCode().trim().isEmpty()) {
            return Result.failed("物流编码不能为空");
        }
        if (dto.getExpressName() == null || dto.getExpressName().trim().isEmpty()) {
            return Result.failed("物流名称不能为空");
        }
        if (dto.getWaybillNo() == null || dto.getWaybillNo().trim().isEmpty()) {
            return Result.failed("运单号不能为空");
        }
        try {
            boolean result = orderService.shipOrder(id, dto.getExpressCode(), dto.getExpressName(), dto.getWaybillNo());
            return result ? Result.succeed(true, "发货成功") : Result.failed("发货失败");
        } catch (RuntimeException e) {
            return Result.failed(e.getMessage());
        }
    }

    @GetMapping("/statistics")
    @Operation(summary = "订单统计")
    public Result<Map<String, Object>> getOrderStatistics() {
        String tenantId = TenantInterceptor.getCurrentTenantId();

        // TODO: Implement actual statistics queries
        Map<String, Object> stats = new HashMap<>();
        stats.put("todayOrderCount", 0);
        stats.put("todaySalesAmount", BigDecimal.ZERO);
        stats.put("pendingShipCount", 0);
        stats.put("completedCount", 0);

        return Result.succeed(stats);
    }
}