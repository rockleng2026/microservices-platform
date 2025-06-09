import { request } from 'umi';

/**
 * 获取当前用户信息
 */
export async function currentUser(options?: { [key: string]: any }) {
  return request<ApiResponse<API.CurrentUser>>('/api/user/current', {
    method: 'GET',
    ...(options || {}),
  });
}

/**
 * 用户登录
 */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<ApiResponse<API.LoginResult>>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/**
 * 用户登出
 */
export async function logout(options?: { [key: string]: any }) {
  return request<ApiResponse<any>>('/api/auth/logout', {
    method: 'POST',
    ...(options || {}),
  });
}

/**
 * 获取用户权限菜单
 */
export async function getUserMenus(options?: { [key: string]: any }) {
  return request<ApiResponse<MenuItem[]>>('/api/permission/menu/current', {
    method: 'GET',
    ...(options || {}),
  });
}

/**
 * 获取用户权限列表
 */
export async function getUserPermissions(options?: { [key: string]: any }) {
  return request<ApiResponse<string[]>>('/api/permission/function/current', {
    method: 'GET',
    ...(options || {}),
  });
}

/**
 * 刷新Token
 */
export async function refreshToken(refreshToken: string) {
  return request<ApiResponse<{ token: string; refreshToken: string }>>('/api/auth/refresh', {
    method: 'POST',
    data: { refreshToken },
  });
}

/**
 * 修改密码
 */
export async function changePassword(data: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  return request<ApiResponse<any>>('/api/user/change-password', {
    method: 'POST',
    data,
  });
}

/**
 * 更新用户信息
 */
export async function updateUserInfo(data: Partial<API.CurrentUser>) {
  return request<ApiResponse<API.CurrentUser>>('/api/user/update', {
    method: 'PUT',
    data,
  });
}

/**
 * 上传用户头像
 */
export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('avatar', file);
  
  return request<ApiResponse<string>>('/api/user/avatar', {
    method: 'POST',
    data: formData,
  });
} 