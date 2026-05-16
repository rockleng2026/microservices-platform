package com.central.mall.controller;

import com.central.common.model.Result;
import com.central.mall.common.UserContext;
import com.central.mall.service.IMarketingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

/**
 * 优惠券控制器
 */
@RestController
@RequestMapping("/api/mall/coupon")
@RequiredArgsConstructor
@Tag(name = "优惠券管理", description = "小程序端优惠券接口")
public class CouponController {

    private final IMarketingService marketingService;

    @GetMapping("/list")
    @Operation(summary = "用户优惠券列表 (MARKETING-03)")
    public Result<?> getUserCouponList(
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long pageSize) {
        Long userId = getCurrentUserId();
        Map<String, Object> pageDTO = Map.of(
            "page", page != null ? page : 1,
            "pageSize", pageSize != null ? pageSize : 20
        );
        return marketingService.getUserCouponList(userId, status, pageDTO);
    }

    @GetMapping("/available")
    @Operation(summary = "获取可用优惠券")
    public Result<?> getAvailableCoupons(
            @RequestParam(required = false) BigDecimal orderAmount) {
        Long userId = getCurrentUserId();
        return marketingService.getAvailableCoupons(userId, orderAmount);
    }

    @PostMapping("/{id}/claim")
    @Operation(summary = "领取优惠券 (MARKETING-03)")
    public Result<?> claimCoupon(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        return marketingService.claimCoupon(id, userId);
    }

    private Long getCurrentUserId() {
        return UserContext.getCurrentUserId();
    }
}
