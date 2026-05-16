package com.central.mall.controller;

import com.central.common.model.Result;
import com.central.mall.common.UserContext;
import com.central.mall.service.ICartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mall/cart")
@RequiredArgsConstructor
@Tag(name = "购物车管理", description = "小程序端购物车接口")
public class CartController {

    private final ICartService cartService;

    @PostMapping
    @Operation(summary = "加入购物车")
    public Result<Void> addToCart(@RequestBody Map<String, Object> params) {
        Long userId = getCurrentUserId();
        Long skuId = Long.valueOf(params.get("skuId").toString());
        Integer quantity = Integer.valueOf(params.get("quantity").toString());
        cartService.addToCart(userId, skuId, quantity);
        return Result.succeed();
    }

    @GetMapping("/list")
    @Operation(summary = "购物车列表")
    public Result<List<Map<String, Object>>> getCartList() {
        Long userId = getCurrentUserId();
        return Result.succeed(cartService.getCartList(userId));
    }

    @GetMapping("/total")
    @Operation(summary = "购物车总价")
    public Result<BigDecimal> getCartTotal(@RequestParam List<Long> checkedSkuIds) {
        Long userId = getCurrentUserId();
        return Result.succeed(cartService.calculateTotal(userId, checkedSkuIds));
    }

    @PutMapping("/{id}")
    @Operation(summary = "修改数量或选中状态")
    public Result<Void> updateCart(@PathVariable Long id, @RequestBody Map<String, Object> params) {
        Long userId = getCurrentUserId();
        if (params.containsKey("quantity")) {
            cartService.updateQuantity(id, userId, Integer.valueOf(params.get("quantity").toString()));
        }
        if (params.containsKey("checked")) {
            cartService.updateChecked(id, userId, Integer.valueOf(params.get("checked").toString()));
        }
        return Result.succeed();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除购物车项")
    public Result<Void> deleteCartItem(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        cartService.deleteCartItem(id, userId);
        return Result.succeed();
    }

    @DeleteMapping("/clear")
    @Operation(summary = "清空已选中")
    public Result<Void> clearChecked() {
        Long userId = getCurrentUserId();
        cartService.clearChecked(userId);
        return Result.succeed();
    }

    private Long getCurrentUserId() {
        return UserContext.getCurrentUserId();
    }
}