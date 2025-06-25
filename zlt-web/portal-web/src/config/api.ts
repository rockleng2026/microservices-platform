/**
 * API 服务配置
 * 统一管理所有后端服务的 BASE_URL，方便环境切换
 */

// 基础服务地址配置
const SERVICE_CONFIG = {
  // 开发环境配置
  development: {
    GATEWAY_URL: 'http://127.0.0.1:9900',
    API_BASE_URL: 'http://127.0.0.1:9900',
  },
  
  // 测试环境配置
  test: {
    GATEWAY_URL: 'http://test-gateway.example.com:9900',
    API_BASE_URL: 'http://test-gateway.example.com:9900',
  },
  
  // 生产环境配置
  production: {
    GATEWAY_URL: 'http://prod-gateway.example.com:9900',
    API_BASE_URL: 'http://prod-gateway.example.com:9900',
  }
};

// 当前环境
const CURRENT_ENV = process.env.NODE_ENV || 'development';

// 获取当前环境配置
const getCurrentConfig = () => {
  return SERVICE_CONFIG[CURRENT_ENV as keyof typeof SERVICE_CONFIG] || SERVICE_CONFIG.development;
};

// 导出当前环境的配置
const currentConfig = getCurrentConfig();

// API 基础地址
export const API_BASE_URL = currentConfig.API_BASE_URL;
export const GATEWAY_URL = currentConfig.GATEWAY_URL;

// 各服务的 API 地址
export const API_ENDPOINTS = {
  // 网关基础地址
  GATEWAY: GATEWAY_URL,
  
  // UAA 认证服务
  UAA: `${API_BASE_URL}/api-uaa`,
  
  // Portal 门户服务
  PORTAL: `${API_BASE_URL}/api-portal`,
  
  // 组织架构服务
  ORGANIZATION: `${API_BASE_URL}/api-portal`,
  
  // 项目管理服务
  PROJECT: `${API_BASE_URL}/api-project`,
  
  // 多表单服务
  MULTITABLE: `${API_BASE_URL}/api-multitable`,
  
  // 文件服务
  FILE: `${API_BASE_URL}/api-file`,
  
  // 系统管理服务
  SYSTEM: `${API_BASE_URL}/api-system`,
};

// 常用的完整API路径
export const API_PATHS = {
  // 认证相关
  LOGIN: `${API_ENDPOINTS.UAA}/oauth/token`,
  LOGOUT: `${API_ENDPOINTS.UAA}/oauth/logout`,
  CAPTCHA: (deviceId: string) => `${API_ENDPOINTS.UAA}/validata/code/${deviceId}`,
  
  // 用户相关
  CURRENT_USER: `${API_ENDPOINTS.PORTAL}/users/current`,
  USER_MENUS: `${API_ENDPOINTS.PORTAL}/users/menus`,
  USER_POSITIONS: `${API_ENDPOINTS.PORTAL}/users/positions`,
  USER_CONFIG: `${API_ENDPOINTS.PORTAL}/users/personal-config`,
  
  // 组织架构相关
  DEPARTMENTS: `${API_ENDPOINTS.ORGANIZATION}/api/organization/departments`,
  EMPLOYEES: `${API_ENDPOINTS.ORGANIZATION}/api/organization/employees`,
  POSITIONS: `${API_ENDPOINTS.ORGANIZATION}/api/organization/positions`,
  
  // 项目管理相关
  PROJECTS: `${API_ENDPOINTS.PROJECT}/api/projects`,
  PROJECT_CLOSURE: `${API_ENDPOINTS.PROJECT}/api/project-closure`,
  PROJECT_PROFIT: `${API_ENDPOINTS.PROJECT}/api/profit-distribution`,
};

// 环境信息
export const ENV_INFO = {
  current: CURRENT_ENV,
  isDevelopment: CURRENT_ENV === 'development',
  isTest: CURRENT_ENV === 'test',
  isProduction: CURRENT_ENV === 'production',
};

// 调试信息（仅开发环境）
if (ENV_INFO.isDevelopment) {
  console.log('🔧 API 配置信息:', {
    environment: CURRENT_ENV,
    baseUrl: API_BASE_URL,
    endpoints: API_ENDPOINTS,
  });
}

/**
 * 获取完整的API URL
 * @param path API路径
 * @param serviceKey 服务标识
 * @returns 完整的URL
 */
export function getApiUrl(path: string, serviceKey?: keyof typeof API_ENDPOINTS): string {
  if (path.startsWith('http')) {
    return path; // 已经是完整URL
  }
  
  const baseUrl = serviceKey ? API_ENDPOINTS[serviceKey] : API_BASE_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
}

/**
 * 更新环境配置（仅用于运行时切换，如开发调试）
 * @param env 环境名称
 */
export function switchEnvironment(env: keyof typeof SERVICE_CONFIG): void {
  if (ENV_INFO.isDevelopment) {
    console.warn('🔄 切换API环境到:', env);
    const newConfig = SERVICE_CONFIG[env];
    Object.assign(currentConfig, newConfig);
  } else {
    console.warn('⚠️ 非开发环境不允许运行时切换环境配置');
  }
}

export default {
  API_BASE_URL,
  GATEWAY_URL,
  API_ENDPOINTS,
  API_PATHS,
  ENV_INFO,
  getApiUrl,
  switchEnvironment,
}; 