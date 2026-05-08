package com.central.mall.controller.admin;

import com.central.common.model.Result;
import com.central.mall.model.dto.SettingsDTO;
import com.central.mall.service.IAdminSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 管理员-系统设置控制器
 * D-11: 微信支付参数AES加密存储
 */
@RestController
@RequestMapping("/api/mall/admin/settings")
@RequiredArgsConstructor
@Tag(name = "管理员-系统设置", description = "系统设置管理（微信支付参数等）")
public class AdminSettingsController {

    private final IAdminSettingsService adminSettingsService;

    /**
     * 获取所有设置（脱敏展示）
     */
    @GetMapping
    @Operation(summary = "获取所有系统设置")
    public Result<List<SettingsDTO>> getAllSettings() {
        return Result.success(adminSettingsService.getAllSettings());
    }

    /**
     * 更新设置
     */
    @PutMapping
    @Operation(summary = "更新系统设置")
    public Result<Boolean> setSetting(@RequestBody SettingsDTO settingsDTO) {
        boolean success = adminSettingsService.setSetting(
                settingsDTO.getKey(),
                settingsDTO.getValue(),
                settingsDTO.getType(),
                settingsDTO.getDescription()
        );
        return Result.success(success);
    }

    /**
     * 获取微信支付配置（解密后的完整配置，用于支付接口调用）
     */
    @GetMapping("/wx-config")
    @Operation(summary = "获取微信支付配置")
    public Result<Map<String, String>> getWechatPayConfig() {
        return Result.success(adminSettingsService.getWechatPayConfig());
    }

    /**
     * 测试解密（管理员测试接口）
     */
    @PostMapping("/test-decrypt")
    @Operation(summary = "测试解密功能")
    public Result<String> testDecrypt(@RequestBody Map<String, String> request) {
        String key = request.get("key");
        String decrypted = adminSettingsService.getSetting(key);
        return Result.success(decrypted);
    }
}
