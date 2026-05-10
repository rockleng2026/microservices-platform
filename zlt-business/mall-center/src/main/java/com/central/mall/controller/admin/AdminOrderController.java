package com.central.mall.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.common.model.Result;
import com.central.mall.model.dto.*;
import com.central.mall.model.entity.MallOrder;
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
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

        // Build query wrapper with filters
        LambdaQueryWrapper<MallOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallOrder::getTenantId, tenantId);
        wrapper.eq(MallOrder::getDelFlag, 0); // Only non-deleted orders

        if (orderNo != null && !orderNo.isEmpty()) {
            wrapper.eq(MallOrder::getOrderNo, orderNo);
        }
        if (status != null) {
            wrapper.eq(MallOrder::getStatus, status);
        }
        if (startTime != null && !startTime.isEmpty()) {
            try {
                LocalDateTime start = LocalDateTime.parse(startTime, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                wrapper.ge(MallOrder::getCreateTime, start);
            } catch (Exception e) {
                // Ignore invalid date format
            }
        }
        if (endTime != null && !endTime.isEmpty()) {
            try {
                LocalDateTime end = LocalDateTime.parse(endTime, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                wrapper.le(MallOrder::getCreateTime, end);
            } catch (Exception e) {
                // Ignore invalid date format
            }
        }

        // Order by create time descending
        wrapper.orderByDesc(MallOrder::getCreateTime);

        // Execute paginated query
        Page<MallOrder> orderPage = new Page<>(page, pageSize);
        Page<MallOrder> result = orderService.getBaseMapper().selectPage(orderPage, wrapper);

        // Convert to DTO page
        Page<OrderListDTO> dtoPage = new Page<>(result.getCurrent(), result.getSize(), result.getTotal());
        List<OrderListDTO> records = result.getRecords().stream().map(order -> {
            OrderListDTO dto = new OrderListDTO();
            dto.setId(order.getId());
            dto.setOrderNo(order.getOrderNo());
            dto.setUserId(order.getUserId());
            dto.setTotalAmount(order.getTotalAmount());
            dto.setPayAmount(order.getPayAmount());
            dto.setStatus(order.getStatus());
            dto.setStatusDesc(order.getStatusName());
            dto.setGoodsType(order.getGoodsType());
            dto.setCreateTime(order.getCreateTime());
            return dto;
        }).collect(Collectors.toList());
        dtoPage.setRecords(records);

        return Result.succeed(dtoPage);
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

        // Count orders by status
        LambdaQueryWrapper<MallOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallOrder::getTenantId, tenantId);
        wrapper.eq(MallOrder::getDelFlag, 0);

        // Today start (00:00:00)
        LocalDateTime todayStart = LocalDateTime.now().toLocalDate().atStartOfDay();

        // Get all orders for tenant (simplified implementation)
        List<MallOrder> allOrders = orderService.getBaseMapper().selectList(wrapper);

        int todayOrderCount = 0;
        BigDecimal todaySalesAmount = BigDecimal.ZERO;
        int pendingShipCount = 0;
        int completedCount = 0;

        for (MallOrder order : allOrders) {
            // Today orders
            if (order.getCreateTime() != null && !order.getCreateTime().isBefore(todayStart)) {
                todayOrderCount++;
                if (order.getStatus() == 2) { // Paid
                    todaySalesAmount = todaySalesAmount.add(order.getPayAmount());
                }
            }
            // Status counts
            if (order.getStatus() == 2) pendingShipCount++; // Paid, awaiting shipment
            if (order.getStatus() == 4) completedCount++; // Completed
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("todayOrderCount", todayOrderCount);
        stats.put("todaySalesAmount", todaySalesAmount);
        stats.put("pendingShipCount", pendingShipCount);
        stats.put("completedCount", completedCount);

        return Result.succeed(stats);
    }

    @PostMapping("/{id}/close")
    @Operation(summary = "管理员关闭订单 (ORDER-EXT-01)")
    public Result<Boolean> adminCloseOrder(@PathVariable Long id, @RequestBody @Validated CloseOrderDTO dto) {
        try {
            boolean result = orderService.adminCloseOrder(id, dto.getReason());
            return result ? Result.succeed(true, "订单关闭成功") : Result.failed("关闭失败");
        } catch (RuntimeException e) {
            return Result.failed(e.getMessage());
        }
    }

    @PostMapping("/{id}/adjust-amount")
    @Operation(summary = "管理员调整订单金额 (ORDER-EXT-02)")
    public Result<Boolean> adjustOrderAmount(@PathVariable Long id, @RequestBody @Validated AdminAdjustOrderDTO dto) {
        try {
            boolean result = orderService.adjustOrderAmount(id, dto.getAdjustAmount(), dto.getReason());
            return result ? Result.succeed(true, "金额调整成功") : Result.failed("调整失败");
        } catch (RuntimeException e) {
            return Result.failed(e.getMessage());
        }
    }

    @PostMapping("/{id}/admin-remark")
    @Operation(summary = "管理员添加订单备注 (ORDER-EXT-03)")
    public Result<Boolean> updateAdminRemark(@PathVariable Long id, @RequestBody @Validated UpdateRemarkDTO dto) {
        try {
            boolean result = orderService.updateAdminRemark(id, dto.getRemark());
            return result ? Result.succeed(true, "备注添加成功") : Result.failed("添加失败");
        } catch (RuntimeException e) {
            return Result.failed(e.getMessage());
        }
    }
}