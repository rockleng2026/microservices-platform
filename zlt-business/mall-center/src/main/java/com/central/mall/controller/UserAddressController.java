package com.central.mall.controller;

import com.central.common.model.Result;
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
        Long userId = 1L; // TODO: 从Token获取
        return Result.success(userAddressService.getByUserId(userId));
    }

    @PostMapping
    @Operation(summary = "新增地址")
    public Result<Void> addAddress(@RequestBody MallUserAddress address) {
        Long userId = 1L; // TODO: 从Token获取
        address.setUserId(userId);
        userAddressService.save(address);
        return Result.success();
    }

    @PutMapping("/{id}")
    @Operation(summary = "修改地址")
    public Result<Void> updateAddress(@PathVariable Long id, @RequestBody MallUserAddress address) {
        address.setId(id);
        userAddressService.updateById(address);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除地址")
    public Result<Void> deleteAddress(@PathVariable Long id) {
        userAddressService.removeById(id);
        return Result.success();
    }

    @PutMapping("/{id}/default")
    @Operation(summary = "设为默认")
    public Result<Void> setDefault(@PathVariable Long id) {
        Long userId = 1L; // TODO: 从Token获取
        userAddressService.setDefault(userId, id);
        return Result.success();
    }
}