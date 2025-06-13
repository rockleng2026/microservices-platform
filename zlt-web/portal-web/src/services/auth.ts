// 使用fetch API实现request函数
const request = async (url: string, options: any) => {
  console.log('发送请求到:', url);
  console.log('请求选项:', options);
  
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: options.headers || {},
    body: options.data,
  });
  
  console.log('响应状态:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('请求失败，响应文本:', errorText);
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  const result = await response.json();
  console.log('响应结果:', result);
  return result;
};

// API基础地址 - 与layui-web保持一致
const API_BASE = 'http://127.0.0.1:9900';

/**
 * 获取图形验证码 (返回图片URL)
 * 与layui-web保持一致的实现方式
 */
export async function getCaptcha(deviceId: string) {
  // 直接返回验证码图片的完整URL，与layui-web项目保持一致
  return `${API_BASE}/api-uaa/validata/code/${deviceId}`;
}

/**
 * Portal用户登录（带验证码）
 */
export async function login(data: {
  username: string;
  password: string;
  validCode: string;
  deviceId: string;
  client_id: string;
  client_secret: string;
  account_type?: string;
}) {
  // 使用HTTP Basic认证方式 - 完全参照layui-web的实现
  const credentials = btoa(`${data.client_id}:${data.client_secret}`);
  console.log('Basic认证凭据:', `${data.client_id}:${data.client_secret}`);
  console.log('Base64编码后:', credentials);
  
  // 构建查询参数 - 完全参照layui-web的实现
  const params = new URLSearchParams({
    grant_type: 'password_code',
    username: data.username,
    password: data.password,
    validCode: data.validCode,
    deviceId: data.deviceId,
  });
  
  if (data.account_type) {
    params.append('account_type', data.account_type);
  }
  
  const requestUrl = `${API_BASE}/api-uaa/oauth/token?${params.toString()}`;
  console.log('登录请求URL:', requestUrl);
  
  try {
    const result = await request(requestUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    console.log('登录响应:', result);
    
    // 检查响应格式
    if (result) {
      // 如果resp_code存在，按照标准格式处理
      if (result.resp_code !== undefined) {
        return result;
      }
      // 如果直接返回token，包装成标准格式
      else if (result.access_token) {
        return {
          resp_code: 0,
          resp_msg: 'ok',
          datas: result
        };
      }
    }
    
    // 如果都不匹配，返回错误
    throw new Error(result?.resp_msg || result?.error_description || '登录响应格式错误');
    
  } catch (error: any) {
    console.error('登录请求失败:', error);
    throw error;
  }
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser() {
  const token = localStorage.getItem('access_token');
  return request(`${API_BASE}/api-portal/users/current`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

/**
 * 获取当前用户菜单权限
 * @param positionId 可选的岗位ID，用于获取特定岗位的菜单权限
 */
export async function getCurrentUserMenus(positionId?: number) {
  const token = localStorage.getItem('access_token');
  const url = positionId 
    ? `${API_BASE}/api-portal/api/menus/current?positionId=${positionId}`
    : `${API_BASE}/api-portal/api/menus/current`;
  
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
  return request(`${API_BASE}/api-portal/users/switch-position`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: new URLSearchParams({ positionId: positionId.toString() }).toString(),
  });
}

/**
 * 用户登出
 * 参考layui-web和react-web的最佳实践
 */
export async function logout() {
  const token = localStorage.getItem('access_token');
  
  console.log('开始执行退出登录...');
  
  // 如果没有token，直接清理本地存储并跳转
  if (!token) {
    console.warn('未找到访问令牌，直接清理本地存储');
    clearLocalStorage();
    redirectToLogin();
    return;
  }
  
  try {
    // 调用后端退出接口 - 使用标准的OAuth2退出端点
    console.log('调用后端退出接口:', `${API_BASE}/api-uaa/oauth/remove/token`);
    
    const response = await request(`${API_BASE}/api-uaa/oauth/remove/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    console.log('退出接口响应:', response);
    
  } catch (error: any) {
    console.warn('退出接口调用失败，但继续执行本地清理:', error);
    
    // 即使后端接口失败，也要继续清理本地存储
    // 这是参考react-web的做法，确保用户总是能够退出
  }
  
  // 清除本地存储
  clearLocalStorage();
  
  // 跳转到登录页面
  redirectToLogin();
  
  console.log('退出登录完成');
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