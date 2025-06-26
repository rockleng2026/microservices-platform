/**
 * API配置统一管理
 */

// 获取当前环境
const ENV = process.env.NODE_ENV || 'development';

// 基础API地址配置
const SERVICE_CONFIG = {
  development: {
    GATEWAY_URL: '', // 开发环境使用相对路径，由代理处理
    API_BASE_URL: '',
  },
  test: {
    GATEWAY_URL: 'http://117.72.61.156:9900',
    API_BASE_URL: 'http://117.72.61.156:9900',
  },
  production: {
    GATEWAY_URL: process.env.API_GATEWAY_URL || 'http://117.72.61.156:9900',
    API_BASE_URL: process.env.API_GATEWAY_URL || 'http://117.72.61.156:9900',
  }
};

// 当前环境配置
const currentConfig = SERVICE_CONFIG[ENV as keyof typeof SERVICE_CONFIG];

// 导出基础配置
export const API_BASE_URL = currentConfig.API_BASE_URL;
export const GATEWAY_URL = currentConfig.GATEWAY_URL;

// 服务端点配置
export const API_ENDPOINTS = {
  GATEWAY: GATEWAY_URL,
  UAA: `${GATEWAY_URL}/api-uaa`,
  PORTAL: `${GATEWAY_URL}/api-portal`,
  ORGANIZATION: `${GATEWAY_URL}/api-organization`,
  PROJECT: `${GATEWAY_URL}/api-project`,
  USER: `${GATEWAY_URL}/api-user`,
};

// 常用API路径
export const API_PATHS = {
  // 认证相关
  LOGIN: `${API_ENDPOINTS.UAA}/oauth/token`,
  LOGOUT: `${API_ENDPOINTS.UAA}/oauth/logout`,
  CAPTCHA: (deviceId: string) => `${API_ENDPOINTS.UAA}/validata/code/${deviceId}`,
  
  // 用户相关
  CURRENT_USER: `${API_ENDPOINTS.PORTAL}/users/current`,
  USER_POSITIONS: `${API_ENDPOINTS.PORTAL}/users/positions`,
  SWITCH_POSITION: `${API_ENDPOINTS.PORTAL}/users/switch-position`,
  USER_MENUS: `${API_ENDPOINTS.PORTAL}/users/menus`,
  
  // 组织架构
  DEPARTMENTS: `${API_ENDPOINTS.ORGANIZATION}/departments`,
  EMPLOYEES: `${API_ENDPOINTS.ORGANIZATION}/employees`,
  POSITIONS: `${API_ENDPOINTS.ORGANIZATION}/positions`,
};

// 工具函数
export const getApiUrl = (path: string, service: keyof typeof API_ENDPOINTS = 'GATEWAY') => {
  const baseUrl = API_ENDPOINTS[service];
  return `${baseUrl}${path}`;
};

// 动态环境切换（仅开发环境）
export const switchEnvironment = (env: keyof typeof SERVICE_CONFIG) => {
  if (ENV === 'development') {
    console.warn('⚠️ 动态切换环境仅在开发环境可用');
  }
};

// 调试信息（仅开发环境）
if (ENV === 'development') {
  console.log('🔧 API 配置信息:', {
    environment: ENV,
    baseUrl: API_BASE_URL,
    endpoints: API_ENDPOINTS,
  });
} 