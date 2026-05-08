package com.central.mall.controller;

import com.central.common.model.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/mall/auth")
@RequiredArgsConstructor
@Tag(name = "用户认证", description = "小程序端认证接口")
public class AuthController {

    @PostMapping("/login")
    @Operation(summary = "微信授权登录")
    public Result<Map<String, Object>> wxLogin(@RequestBody Map<String, String> params) {
        String code = params.get("code");
        // TODO: 正式实现
        // 1. 调用微信接口用code换取openid
        // 2. 绑定或创建用户记录
        // 3. 生成JWT Token返回
        // 暂时返回模拟数据
        Map<String, Object> result = new HashMap<>();
        result.put("token", "MOCK_TOKEN_" + System.currentTimeMillis());
        result.put("userId", 1L);
        return Result.succeed(result);
    }
}