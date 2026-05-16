package com.central.mall.controller;

import com.central.common.model.Result;
import com.central.mall.common.UserContext;
import com.central.mall.model.entity.MallUserAddress;
import com.central.mall.service.IUserAddressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mall/address")
@RequiredArgsConstructor
@Tag(name = "收货地址管理", description = "小程序端收货地址接口")
public class UserAddressController {

    private final IUserAddressService userAddressService;

    @GetMapping("/list")
    @Operation(summary = "地址列表")
    public Result<List<MallUserAddress>> getAddressList() {
        Long userId = getCurrentUserId();
        return Result.succeed(userAddressService.getByUserId(userId));
    }

    @PostMapping
    @Operation(summary = "新增地址")
    public Result<Void> addAddress(@RequestBody MallUserAddress address) {
        Long userId = getCurrentUserId();
        address.setUserId(userId);
        userAddressService.save(address);
        return Result.succeed();
    }

    @PutMapping("/{id}")
    @Operation(summary = "修改地址")
    public Result<Void> updateAddress(@PathVariable Long id, @RequestBody MallUserAddress address) {
        Long userId = getCurrentUserId();
        // Ownership check: verify address belongs to current user
        MallUserAddress existing = userAddressService.getById(id);
        if (existing == null || !existing.getUserId().equals(userId)) {
            return Result.failed("Address not found or access denied");
        }
        address.setId(id);
        address.setUserId(userId); // Prevent userId override
        userAddressService.updateById(address);
        return Result.succeed();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除地址")
    public Result<Void> deleteAddress(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        // Ownership check: verify address belongs to current user
        MallUserAddress existing = userAddressService.getById(id);
        if (existing == null || !existing.getUserId().equals(userId)) {
            return Result.failed("Address not found or access denied");
        }
        userAddressService.removeById(id);
        return Result.succeed();
    }

    @PutMapping("/{id}/default")
    @Operation(summary = "设为默认")
    public Result<Void> setDefault(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        // Ownership check
        MallUserAddress existing = userAddressService.getById(id);
        if (existing == null || !existing.getUserId().equals(userId)) {
            return Result.failed("Address not found or access denied");
        }
        userAddressService.setDefault(userId, id);
        return Result.succeed();
    }

    private Long getCurrentUserId() {
        return UserContext.getCurrentUserId();
    }
}