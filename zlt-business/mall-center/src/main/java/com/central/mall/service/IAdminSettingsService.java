package com.central.mall.service;

import com.central.mall.model.dto.SettingsDTO;

import java.util.List;
import java.util.Map;

/**
 * 管理员系统设置服务接口
 */
public interface IAdminSettingsService {

    /**
     * 获取设置值（解密后，用于内部调用）
     *
     * @param key 设置键
     * @return 解密后的值
     */
    String getSetting(String key);

    /**
     * 获取设置（敏感字段脱敏，用于展示）
     *
     * @param key 设置键
     * @return 脱敏后的设置DTO
     */
    SettingsDTO getSettingMasked(String key);

    /**
     * 设置配置项（敏感字段AES加密存储）
     *
     * @param key        设置键
     * @param value      设置值
     * @param type       值类型：string/int/json
     * @param description 描述
     * @return 是否成功
     */
    boolean setSetting(String key, String value, String type, String description);

    /**
     * 获取所有设置（脱敏）
     *
     * @return 所有设置列表
     */
    List<SettingsDTO> getAllSettings();

    /**
     * 获取微信支付配置（解密后的配置，供支付调用）
     *
     * @return 微信支付配置Map
     */
    Map<String, String> getWechatPayConfig();
}
