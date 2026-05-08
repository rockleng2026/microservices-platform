package com.central.mall.controller;

import com.central.common.model.Result;
import com.central.mall.model.dto.CreateOrderDTO;
import com.central.mall.model.dto.LogisticsTrackDTO;
import com.central.mall.service.ILogisticsTrackService;
import com.central.mall.service.IOrderService;
import com.central.mall.service.IPayService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mall/order")
@RequiredArgsConstructor
@Tag(name = "订单管理", description = "小程序端订单接口")
@Validated
public class OrderController {

    private final IOrderService orderService;
    private final IPayService payService;
    private final ILogisticsTrackService logisticsTrackService;

    @PostMapping
    @Operation(summary = "创建订单")
    public Result<Long> createOrder(@RequestBody @Validated CreateOrderDTO dto) {
        // Validate address required for physical goods
        if (dto.getGoodsType() != null && dto.getGoodsType() == 1 && dto.getAddressId() == null) {
            return Result.failed("实物商品需要选择收货地址");
        }
        // Validate items provided
        if ((dto.getCartItemIds() == null || dto.getCartItemIds().isEmpty())
                && (dto.getItems() == null || dto.getItems().isEmpty())) {
            return Result.failed("请选择要购买的商品");
        }
        Long userId = getCurrentUserId();
        Long orderId = orderService.createOrder(userId, dto);
        return Result.succeed(orderId);
    }

    @GetMapping
    @Operation(summary = "订单列表")
    public Result<?> getOrderList(@RequestParam(required = false) Integer status) {
        Long userId = getCurrentUserId();
        return Result.succeed(orderService.getOrderList(userId, status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "订单详情")
    public Result<?> getOrderDetail(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        try {
            Map<String, Object> detail = orderService.getOrderDetail(id, userId);
            return Result.succeed(detail);
        } catch (RuntimeException e) {
            return Result.failed("订单不存在");
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "取消订单")
    public Result<Boolean> cancelOrder(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        try {
            boolean result = orderService.cancelOrder(id, userId);
            return result ? Result.succeed(true) : Result.failed("取消失败");
        } catch (RuntimeException e) {
            return Result.failed(e.getMessage());
        }
    }

    @PutMapping("/{id}/confirm")
    @Operation(summary = "确认收货")
    public Result<Boolean> confirmReceipt(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        try {
            boolean result = orderService.confirmReceipt(id, userId);
            return result ? Result.succeed(true) : Result.failed("确认收货失败");
        } catch (RuntimeException e) {
            return Result.failed(e.getMessage());
        }
    }

    @PostMapping("/{id}/pay")
    @Operation(summary = "发起支付")
    public Result<?> initiatePay(@PathVariable Long id, @RequestParam String openId) {
        try {
            Map<String, String> paymentParams = payService.initiatePay(id, openId);
            return Result.succeed(paymentParams);
        } catch (RuntimeException e) {
            return Result.failed("支付发起失败: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/delivery")
    @Operation(summary = "物流轨迹 (DELIVERY-03, DELIVERY-04)")
    public Result<LogisticsTrackDTO> getOrderDelivery(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        try {
            // Validate order belongs to user
            Map<String, Object> detail = orderService.getOrderDetail(id, userId);
            if (detail == null) {
                return Result.failed("订单不存在");
            }
            // Only allow viewing delivery for shipped or completed orders
            Integer status = (Integer) detail.get("status");
            if (status != null && status < 3) {
                return Result.failed("订单尚未发货，无法查看物流");
            }
            LogisticsTrackDTO logisticsInfo = logisticsTrackService.getLogisticsInfo(id);
            return Result.succeed(logisticsInfo);
        } catch (RuntimeException e) {
            return Result.failed("物流信息不存在");
        }
    }

    private Long getCurrentUserId() {
        // TODO: integrate with real auth context
        return 1L;
    }
}