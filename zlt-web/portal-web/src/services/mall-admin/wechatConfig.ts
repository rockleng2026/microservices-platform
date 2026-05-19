/**
 * 微信支付配置服务 - ADMIN-11-01
 * 提供微信支付参数配置和测试功能
 */
import { request } from '@/utils/request';

// 微信支付配置项
export interface WeChatConfig {
  appId: string;
  mchId: string;
  apiKey: string;
  certPath: string;
}

// 设置项DTO（与后端SettingsDTO对应）
interface SettingDTO {
  key: string;
  value: string;
  type?: string;
  description?: string;
}

// 微信支付配置的key前缀
const WX_PAY_KEYS = {
  APP_ID: 'wx_pay_app_id',
  MCH_ID: 'wx_pay_mch_id',
  API_KEY: 'wx_pay_api_key',
  CERT_PATH: 'wx_pay_cert_path',
};

/**
 * 获取所有系统设置（脱敏展示）
 * @returns 设置列表
 */
export async function getAllSettings(): Promise<SettingDTO[]> {
  const response = await request<{ datas?: SettingDTO[] }>('/api-mall/api/mall/admin/settings', {
    method: 'GET',
  });
  return response.datas || [];
}

/**
 * 更新单个设置
 * @param key 设置键
 * @param value 设置值
 * @param type 设置类型
 * @param description 设置描述
 */
export async function setSetting(
  key: string,
  value: string,
  type: string = 'string',
  description?: string
): Promise<boolean> {
  const response = await request<{ datas?: boolean }>('/api-mall/api/mall/admin/settings', {
    method: 'PUT',
    data: { key, value, type, description },
  });
  return response.datas || false;
}

/**
 * 获取微信支付配置 - ADMIN-11-01
 * 从所有设置中过滤wx_pay_*相关的配置项
 */
export async function getWeChatConfig(): Promise<WeChatConfig | null> {
  try {
    const settings = await getAllSettings();

    const config: WeChatConfig = {
      appId: '',
      mchId: '',
      apiKey: '',
      certPath: '',
    };

    settings.forEach((setting) => {
      switch (setting.key) {
        case WX_PAY_KEYS.APP_ID:
          config.appId = setting.value || '';
          break;
        case WX_PAY_KEYS.MCH_ID:
          config.mchId = setting.value || '';
          break;
        case WX_PAY_KEYS.API_KEY:
          // API密钥需要脱敏展示，只显示后4位
          config.apiKey = setting.value ? `****${setting.value.slice(-4)}` : '';
          break;
        case WX_PAY_KEYS.CERT_PATH:
          config.certPath = setting.value || '';
          break;
      }
    });

    // 检查是否有任何配置
    const hasConfig = config.appId || config.mchId || config.apiKey || config.certPath;
    return hasConfig ? config : null;
  } catch (error) {
    console.error('Failed to get WeChat config:', error);
    return null;
  }
}

/**
 * 更新微信支付配置 - ADMIN-11-01
 * @param config 微信支付配置
 */
export async function updateWeChatConfig(config: WeChatConfig): Promise<boolean> {
  try {
    const updates = [
      setSetting(WX_PAY_KEYS.APP_ID, config.appId, 'string', '微信支付AppID'),
      setSetting(WX_PAY_KEYS.MCH_ID, config.mchId, 'string', '微信支付商户号'),
      setSetting(WX_PAY_KEYS.API_KEY, config.apiKey, 'string', '微信支付API密钥'),
      setSetting(WX_PAY_KEYS.CERT_PATH, config.certPath, 'string', '微信支付证书路径'),
    ];

    const results = await Promise.all(updates);
    return results.every((result) => result === true);
  } catch (error) {
    console.error('Failed to update WeChat config:', error);
    return false;
  }
}

/**
 * 测试微信支付配置连通性 - ADMIN-11-02
 * 通过测试解密功能验证配置是否正确
 */
export async function testWeChatConfig(): Promise<{ success: boolean; message: string }> {
  try {
    // 获取解密后的配置进行验证
    const response = await request<{ datas?: string }>('/api-mall/api/mall/admin/settings/test-decrypt', {
      method: 'POST',
      data: { key: WX_PAY_KEYS.MCH_ID },
    });

    const decryptedMchId = response.datas;

    if (decryptedMchId && decryptedMchId.length > 0) {
      return { success: true, message: '微信支付配置连接成功' };
    } else {
      return { success: false, message: '微信支付配置无效' };
    }
  } catch (error: any) {
    console.error('Failed to test WeChat config:', error);
    return {
      success: false,
      message: error.message || '微信支付配置测试失败',
    };
  }
}