import { request } from '@/utils/request';
// 引入统一API配置
import { API_ENDPOINTS, API_PATHS, getApiUrl } from '@/config/api';

interface LoginParams {
  username: string;
  password: string;
  deviceId: string;
  validCode: string;
  rememberMe?: boolean;
}

interface LoginResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  resp_code?: number;
  resp_msg?: string;
  datas?: T;
}

// 使用统一配置的API基础地址（开发环境为空，使用相对路径）
const API_BASE = API_ENDPOINTS.GATEWAY;

/**
 * 用户登录
 */
export async function login(params: LoginParams) {
  const formData = new FormData();
  formData.append('username', params.username);
  formData.append('password', params.password);
  formData.append('deviceId', params.deviceId);
  formData.append('validCode', params.validCode);
  formData.append('grant_type', 'password_code');
  formData.append('account_type', 'portal');

  if (params.rememberMe) {
    formData.append('rememberMe', 'true');
  }

  return request<ApiResponse<LoginResult>>(API_PATHS.LOGIN, {
    method: 'POST',
    data: formData,
    headers: {
      'Authorization': 'Basic d2ViQXBwOndlYkFwcA==',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    requestType: 'form',
  });
}

/**
 * 用户登出
 * @param redirectUri 可选的登出后重定向地址
 */
export async function logout(redirectUri?: string) {
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    console.warn('未找到access_token，执行快速退出');
    quickLogout();
    return;
  }

  const params = new URLSearchParams({
    access_token: token,
  });
  
  if (redirectUri) {
    params.append('redirect_uri', redirectUri);
  }

  try {
    const result = await request(`${API_PATHS.LOGOUT}?${params.toString()}`, {
      method: 'GET',
    });
    
    // 清除本地存储
    clearLocalStorage();
    
    // 如果没有redirect_uri或者后端返回JSON，手动跳转到登录页
    if (!redirectUri) {
      redirectToLogin();
    }
    
    return result;
  } catch (error) {
    console.error('退出登录请求失败:', error);
    // 即使接口失败，也要清除本地存储并跳转
    clearLocalStorage();
    redirectToLogin();
    throw error;
  }
}

/**
 * 刷新令牌
 */
export async function refreshToken() {
  const refresh_token = localStorage.getItem('refresh_token');
  
  const formData = new FormData();
  formData.append('grant_type', 'refresh_token');
  formData.append('refresh_token', refresh_token || '');

  return request<ApiResponse<LoginResult>>(API_PATHS.LOGIN, {
    method: 'POST',
    data: formData,
    headers: {
      'Authorization': 'Basic d2ViQXBwOndlYkFwcA==',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    requestType: 'form',
  });
}

/**
 * 获取验证码
 */
export async function getCaptcha(deviceId: string) {
  return API_PATHS.CAPTCHA(deviceId);
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser() {
  const token = localStorage.getItem('access_token');
  return request(API_PATHS.CURRENT_USER, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

/**
 * 修改密码
 */
export async function changePassword(params: {
  oldPassword: string;
  newPassword: string;
}) {
  const token = localStorage.getItem('access_token');
  return request(getApiUrl('/api-portal/users/change-password', 'PORTAL'), {
    method: 'POST',
    data: params,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

export type { LoginParams, LoginResult, ApiResponse };

/**
 * 获取当前用户菜单权限
 * @param positionId 可选的岗位ID，用于获取特定岗位的菜单权限
 */
export async function getCurrentUserMenus(positionId?: number) {
  const token = localStorage.getItem('access_token');
  const url = positionId 
    ? `/api-portal/api/menus/current?positionId=${positionId}`
    : `/api-portal/api/menus/current`;
  
  return request(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

/**
 * 切换用户岗位
 */
export async function switchPosition(positionId: number) {
  const token = localStorage.getItem('access_token');
  return request(`/api-portal/users/switch-position`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: new URLSearchParams({ positionId: positionId.toString() }).toString(),
  });
}

/**
 * 快速退出（不调用后端接口）
 * 在网络异常或紧急情况下使用
 */
export async function quickLogout() {
  console.log('执行快速退出...');
  clearLocalStorage();
  redirectToLogin();
}

/**
 * 检查登录状态
 * 用于路由守卫和组件状态检查
 */
export function isLoggedIn(): boolean {
  const token = localStorage.getItem('access_token');
  const expiresAt = localStorage.getItem('token_expires_at');
  
  if (!token) {
    return false;
  }
  
  // 检查token是否过期
  if (expiresAt) {
    const now = Date.now();
    const expiry = parseInt(expiresAt, 10);
    if (now >= expiry) {
      console.warn('Token已过期');
      clearLocalStorage();
      return false;
    }
  }
  
  return true;
}

/**
 * 清除本地存储
 * 参考react-web的实现，清理所有相关的本地数据
 */
function clearLocalStorage() {
  console.log('清理本地存储...');
  
  const keysToRemove = [
    'access_token',
    'refresh_token', 
    'user_info',
    'user_menus',
    'current_user',
    'device_id',
    'login_time',
    'token_expires_at'
  ];
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`已清除: ${key}`);
  });
  
  // 清除sessionStorage中的临时数据
  sessionStorage.clear();
  
  console.log('本地存储清理完成');
}

/**
 * 跳转到登录页面
 * 参考layui-web的做法，使用location.replace避免回退
 */
function redirectToLogin() {
  console.log('跳转到登录页面...');
  
  // 获取当前页面路径，用于登录后重定向
  const currentPath = window.location.pathname + window.location.search;
  
  // 如果不是登录页面，将当前页面作为重定向参数
  if (currentPath !== '/login' && currentPath !== '/login.html') {
    const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
    console.log('重定向URL:', redirectUrl);
    window.location.replace(redirectUrl);
  } else {
    // 如果已经在登录页面，直接替换为登录页面
    window.location.replace('/login');
  }
} 