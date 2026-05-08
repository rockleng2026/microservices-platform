package com.central.mall.controller;

import com.central.common.model.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/mall/user")
@RequiredArgsConstructor
@Tag(name = "用户管理", description = "小程序端用户接口")
public class UserController {

    @GetMapping("/info")
    @Operation(summary = "获取个人信息")
    public Result<Map<String, Object>> getUserInfo() {
        // TODO: 从Token获取真实userId
        Long userId = 1L;
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("userId", userId);
        userInfo.put("nickname", "测试用户");
        userInfo.put("avatar", "/images/avatar/default.jpg");
        userInfo.put("phone", "13800138000");
        return Result.success(userInfo);
    }

    @GetMapping("/address/list")
    @Operation(summary = "获取收货地址列表")
    public Result<Object> getAddressList() {
        // TODO: 实现收货地址列表
        return Result.success(null);
    }
}