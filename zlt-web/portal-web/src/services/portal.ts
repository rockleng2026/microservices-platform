import { request } from 'umi';

/**
 * Portal用户相关API接口
 */

// 用户信息接口类型定义
interface PortalUser {
  user: {
    id: number;
    username: string;
    nickname?: string;
    avatar?: string;
    mobile?: string;
    email?: string;
  };
  employee: {
    id: number;
    empNo: string;
    name: string;
    departmentId: number;
    departmentName: string;
    positionId: number;
    positionName: string;
  };
  positions: WorkPosition[];
  currentPosition: WorkPosition;
  menus: MenuPermission[];
  personalConfig: UserPersonalConfig;
  tenant: {
    id: string;
    name: string;
  };
}

interface WorkPosition {
  id: number;
  name: string;
  shortname?: string;
  deptId?: number;
  deptName?: string;
  workgrade?: number;
  workcontent?: string;
  functionIDs?: string;
  permissions?: string;
}

interface MenuPermission {
  id: number;
  menuCode: string;
  menuName: string;
  menuType: 'menu' | 'button' | 'api';
  parentId: number;
  menuPath?: string;
  componentPath?: string;
  menuIcon?: string;
  sortOrder: number;
  isVisible: boolean;
  isExternal: boolean;
  menuStatus: boolean;
  perms?: string;
  children?: MenuPermission[];
}

interface UserPersonalConfig {
  id?: number;
  userId: number;
  defaultPositionId?: number;
  theme?: 'light' | 'dark' | 'auto';
  language?: string;
  layout?: any;
  notifications?: any;
}

/**
 * 获取当前登录用户的完整信息
 */
export async function getCurrentUserInfo(options?: { [key: string]: any }) {
  return request<ApiResponse<PortalUser>>('/api-portal/users/current', {
    method: 'GET',
    ...(options || {}),
  });
}

/**
 * 获取用户的所有岗位信息
 */
export async function getUserPositions(options?: { [key: string]: any }) {
  return request<ApiResponse<WorkPosition[]>>('/api-portal/users/positions', {
    method: 'GET',
    ...(options || {}),
  });
}

/**
 * 切换用户岗位
 */
export async function switchUserPosition(positionId: number, options?: { [key: string]: any }) {
  return request<ApiResponse<PortalUser>>('/api-portal/users/switch-position', {
    method: 'POST',
    params: { positionId },
    ...(options || {}),
  });
}

/**
 * 获取用户当前岗位的菜单权限
 */
export async function getCurrentUserMenus(options?: { [key: string]: any }) {
  return request<ApiResponse<MenuPermission[]>>('/api-portal/users/menus', {
    method: 'GET',
    ...(options || {}),
  });
}

/**
 * 获取指定岗位的菜单权限
 */
export async function getPositionMenus(positionId?: number, options?: { [key: string]: any }) {
  return request<ApiResponse<MenuPermission[]>>('/api-portal/menus/current', {
    method: 'GET',
    params: positionId ? { positionId } : {},
    ...(options || {}),
  });
}

/**
 * 获取用户个性化配置
 */
export async function getUserPersonalConfig(options?: { [key: string]: any }) {
  return request<ApiResponse<UserPersonalConfig>>('/api-portal/users/personal-config', {
    method: 'GET',
    ...(options || {}),
  });
}

/**
 * 保存用户个性化配置
 */
export async function saveUserPersonalConfig(config: UserPersonalConfig, options?: { [key: string]: any }) {
  return request<ApiResponse<string>>('/api-portal/users/personal-config', {
    method: 'POST',
    data: config,
    ...(options || {}),
  });
}

/**
 * 更新用户默认岗位
 */
export async function updateDefaultPosition(positionId: number, options?: { [key: string]: any }) {
  return request<ApiResponse<string>>('/api-portal/users/default-position', {
    method: 'POST',
    params: { positionId },
    ...(options || {}),
  });
}

export type { PortalUser, WorkPosition, MenuPermission, UserPersonalConfig }; 