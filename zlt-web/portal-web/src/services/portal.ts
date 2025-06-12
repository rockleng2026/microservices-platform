import { request } from '../utils/request';

/**
 * Portal用户相关API接口
 */

// API基础地址
const API_BASE = 'http://127.0.0.1:9900';

// 响应适配器 - 将后端响应格式转换为前端期望的格式
function adaptResponse<T>(response: any): { success: boolean; data: T; message: string } {
  if (response.resp_code === 0) {
    return {
      success: true,
      data: response.datas,
      message: response.resp_msg || '操作成功'
    };
  } else {
    return {
      success: false,
      data: null as any,
      message: response.resp_msg || '操作失败'
    };
  }
}

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
  const response = await request(`${API_BASE}/api-portal/users/current`, {
    method: 'GET',
    ...(options || {}),
  });
  return adaptResponse<PortalUser>(response);
}

/**
 * 获取用户的所有岗位信息
 */
export async function getUserPositions(options?: { [key: string]: any }) {
  const response = await request(`${API_BASE}/api-portal/users/positions`, {
    method: 'GET',
    ...(options || {}),
  });
  return adaptResponse<WorkPosition[]>(response);
}

/**
 * 切换用户岗位
 */
export async function switchUserPosition(positionId: number, options?: { [key: string]: any }) {
  const response = await request(`${API_BASE}/api-portal/users/switch-position`, {
    method: 'POST',
    params: { positionId },
    ...(options || {}),
  });
  return adaptResponse<PortalUser>(response);
}

/**
 * 获取用户当前岗位的菜单权限
 */
export async function getCurrentUserMenus(options?: { [key: string]: any }) {
  const response = await request(`${API_BASE}/api-portal/users/menus`, {
    method: 'GET',
    ...(options || {}),
  });
  return adaptResponse<MenuPermission[]>(response);
}

/**
 * 获取指定岗位的菜单权限
 */
export async function getPositionMenus(positionId?: number, options?: { [key: string]: any }) {
  const response = await request(`${API_BASE}/api-portal/menus/current`, {
    method: 'GET',
    params: positionId ? { positionId } : {},
    ...(options || {}),
  });
  return adaptResponse<MenuPermission[]>(response);
}

/**
 * 获取用户个性化配置
 */
export async function getUserPersonalConfig(options?: { [key: string]: any }) {
  const response = await request(`${API_BASE}/api-portal/users/personal-config`, {
    method: 'GET',
    ...(options || {}),
  });
  return adaptResponse<UserPersonalConfig>(response);
}

/**
 * 保存用户个性化配置
 */
export async function saveUserPersonalConfig(config: UserPersonalConfig, options?: { [key: string]: any }) {
  const response = await request(`${API_BASE}/api-portal/users/personal-config`, {
    method: 'POST',
    data: config,
    ...(options || {}),
  });
  return adaptResponse<string>(response);
}

/**
 * 更新用户默认岗位
 */
export async function updateDefaultPosition(positionId: number, options?: { [key: string]: any }) {
  const response = await request(`${API_BASE}/api-portal/users/default-position`, {
    method: 'POST',
    params: { positionId },
    ...(options || {}),
  });
  return adaptResponse<string>(response);
}

export type { PortalUser, WorkPosition, MenuPermission, UserPersonalConfig }; 