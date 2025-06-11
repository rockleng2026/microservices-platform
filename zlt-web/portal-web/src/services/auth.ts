// 使用fetch API实现request函数
const request = async (url: string, options: any) => {
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: options.headers || {},
    body: options.data,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  return response.json();
};

const API_BASE = process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:9900' : '';

/**
 * Portal用户登录
 */
export async function login(data: {
  grant_type: string;
  username: string;
  password: string;
  client_id: string;
  client_secret: string;
  account_type: string;
}) {
  return request(`${API_BASE}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: new URLSearchParams(data).toString(),
  });
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser() {
  const token = localStorage.getItem('access_token');
  return request(`${API_BASE}/api-portal-org/users/current`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
}

/**
 * 获取当前用户菜单权限
 */
export async function getCurrentUserMenus() {
  const token = localStorage.getItem('access_token');
  return request(`${API_BASE}/api-portal-org/menus/current`, {
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
  return request(`${API_BASE}/api-portal-org/users/switch-position`, {
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
 */
export async function logout() {
  const token = localStorage.getItem('access_token');
  try {
    await request(`${API_BASE}/oauth/remove/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.warn('登出接口调用失败:', error);
  } finally {
    // 清除本地存储
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    localStorage.removeItem('user_menus');
  }
} 