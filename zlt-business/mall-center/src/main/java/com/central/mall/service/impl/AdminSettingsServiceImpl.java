package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.mall.config.TenantInterceptor;
import com.central.mall.mapper.MallSettingsMapper;
import com.central.mall.model.dto.SettingsDTO;
import com.central.mall.model.entity.MallSettings;
import com.central.mall.service.IAdminSettingsService;
import com.central.mall.utils.AesUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 管理员系统设置服务实现
 * D-11: 微信支付参数AES加密存储
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminSettingsServiceImpl extends ServiceImpl<MallSettingsMapper, MallSettings> implements IAdminSettingsService {

    /**
     * 需要AES加密的敏感配置key
     */
    private static final Set<String> ENCRYPTED_KEYS = Set.of(
            "wx_app_id", "wx_mch_id", "wx_api_key", "wx_notify_url"
    );

    /**
     * 需要脱敏展示的配置key（显示后4位）
     */
    private static final String MASKED_KEY = "wx_api_key";

    /**
     * AES密钥（生产环境应从配置中心获取）
     */
    @Value("${mall.aes.key:1234567890123456}")
    private String aesKey;

    private final RedissonClient redissonClient;

    @Override
    public String getSetting(String key) {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        LambdaQueryWrapper<MallSettings> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallSettings::getTenantId, tenantId)
                .eq(MallSettings::getSettingKey, key)
                .last("LIMIT 1");
        MallSettings setting = baseMapper.selectOne(wrapper);
        if (setting == null) {
            return null;
        }
        // 如果是加密key则解密
        if (ENCRYPTED_KEYS.contains(key)) {
            return AesUtil.decrypt(setting.getSettingValue(), aesKey);
        }
        return setting.getSettingValue();
    }

    @Override
    public SettingsDTO getSettingMasked(String key) {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        LambdaQueryWrapper<MallSettings> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallSettings::getTenantId, tenantId)
                .eq(MallSettings::getSettingKey, key)
                .last("LIMIT 1");
        MallSettings setting = baseMapper.selectOne(wrapper);
        if (setting == null) {
            return null;
        }

        SettingsDTO dto = new SettingsDTO();
        dto.setKey(setting.getSettingKey());
        dto.setType(setting.getValueType());
        dto.setDescription(setting.getDescription());

        // 敏感字段脱敏
        if (MASKED_KEY.equals(key)) {
            String rawValue = setting.getSettingValue();
            if (StringUtils.hasText(rawValue) && rawValue.length() >= 4) {
                dto.setValue("****" + rawValue.substring(rawValue.length() - 4));
            } else {
                dto.setValue("****");
            }
        } else if (ENCRYPTED_KEYS.contains(key)) {
            // 加密字段解密展示（非敏感字段如wx_notify_url）
            dto.setValue(AesUtil.decrypt(setting.getSettingValue(), aesKey));
        } else {
            dto.setValue(setting.getSettingValue());
        }

        return dto;
    }

    @Override
    public boolean setSetting(String key, String value, String type, String description) {
        String tenantId = TenantInterceptor.getCurrentTenantId();

        // 检查是否已存在
        LambdaQueryWrapper<MallSettings> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallSettings::getTenantId, tenantId)
                .eq(MallSettings::getSettingKey, key)
                .last("LIMIT 1");
        MallSettings existing = baseMapper.selectOne(wrapper);

        MallSettings setting = new MallSettings();
        setting.setTenantId(tenantId);
        setting.setSettingKey(key);
        setting.setValueType(type);
        setting.setDescription(description);

        // 敏感字段加密存储
        if (ENCRYPTED_KEYS.contains(key)) {
            setting.setSettingValue(AesUtil.encrypt(value, aesKey));
        } else {
            setting.setSettingValue(value);
        }

        if (existing != null) {
            setting.setId(existing.getId());
            setting.setCreateTime(existing.getCreateTime());
            return baseMapper.updateById(setting) > 0;
        } else {
            return baseMapper.insert(setting) > 0;
        }
    }

    @Override
    public List<SettingsDTO> getAllSettings() {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        LambdaQueryWrapper<MallSettings> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallSettings::getTenantId, tenantId);
        List<MallSettings> settings = baseMapper.selectList(wrapper);

        return settings.stream().map(s -> {
            SettingsDTO dto = new SettingsDTO();
            dto.setKey(s.getSettingKey());
            dto.setType(s.getValueType());
            dto.setDescription(s.getDescription());

            if (MASKED_KEY.equals(s.getSettingKey())) {
                String rawValue = s.getSettingValue();
                if (StringUtils.hasText(rawValue) && rawValue.length() >= 4) {
                    dto.setValue("****" + rawValue.substring(rawValue.length() - 4));
                } else {
                    dto.setValue("****");
                }
            } else if (ENCRYPTED_KEYS.contains(s.getSettingKey())) {
                dto.setValue(AesUtil.decrypt(s.getSettingValue(), aesKey));
            } else {
                dto.setValue(s.getSettingValue());
            }
            return dto;
        }).collect(Collectors.toList());
    }

    @Override
    public Map<String, String> getWechatPayConfig() {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        Map<String, String> config = new HashMap<>();

        // 获取微信支付相关配置（解密后）
        String appId = getSetting("wx_app_id");
        String mchId = getSetting("wx_mch_id");
        String apiKey = getSetting("wx_api_key");
        String notifyUrl = getSetting("wx_notify_url");

        if (StringUtils.hasText(appId)) {
            config.put("appId", appId);
        }
        if (StringUtils.hasText(mchId)) {
            config.put("mchId", mchId);
        }
        if (StringUtils.hasText(apiKey)) {
            config.put("apiKey", apiKey);
        }
        if (StringUtils.hasText(notifyUrl)) {
            config.put("notifyUrl", notifyUrl);
        }

        return config;
    }
}
