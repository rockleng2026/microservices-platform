import { request } from '../utils/request';
import { API_ENDPOINTS, API_PATHS, getApiUrl } from '@/config/api';

/**
 * Portal用户相关API接口
 * 使用统一的API配置管理
 */

// 响应适配器
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

// 接口类型定义
interface PortalUser {
  id: number;
  username: string;
  nickname?: string;
  avatar?: string;
  mobile?: string;
  email?: string;
  enabled: boolean;
  workPositions?: WorkPosition[];
  currentPositionId?: number;
  currentPositionName?: string;
  departmentId?: number;
  departmentName?: string;
  roles?: string[];
  permissions?: string[];
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
  const response = await request(API_PATHS.CURRENT_USER, {
    method: 'GET',
    ...(options || {}),
  });
  return adaptResponse<PortalUser>(response);
}

/**
 * 获取用户所有岗位信息
 */
export async function getUserPositions(options?: { [key: string]: any }) {
  const response = await request(API_PATHS.USER_POSITIONS, {
    method: 'GET',
    ...(options || {}),
  });
  return adaptResponse<WorkPosition[]>(response);
}

/**
 * 获取用户当前岗位的菜单权限
 */
export async function getCurrentUserMenus(options?: { [key: string]: any }) {
  const response = await request(API_PATHS.USER_MENUS, {
    method: 'GET',
    ...(options || {}),
  });
  return adaptResponse<MenuPermission[]>(response);
}

/**
 * 切换用户当前岗位
 */
export async function switchUserPosition(positionId: number, options?: { [key: string]: any }) {
  const response = await request(getApiUrl('/users/switch-position', 'PORTAL'), {
    method: 'POST',
    params: { positionId },
    ...(options || {}),
  });
  return adaptResponse<string>(response);
}

/**
 * 获取用户个性化配置
 */
export async function getUserPersonalConfig(options?: { [key: string]: any }) {
  const response = await request(API_PATHS.USER_CONFIG, {
    method: 'GET',
    ...(options || {}),
  });
  return adaptResponse<UserPersonalConfig>(response);
}

/**
 * 保存用户个性化配置
 */
export async function saveUserPersonalConfig(config: UserPersonalConfig, options?: { [key: string]: any }) {
  const response = await request(API_PATHS.USER_CONFIG, {
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
  const response = await request(getApiUrl('/users/default-position', 'PORTAL'), {
    method: 'POST',
    params: { positionId },
    ...(options || {}),
  });
  return adaptResponse<string>(response);
}

export type { PortalUser, WorkPosition, MenuPermission, UserPersonalConfig }; 