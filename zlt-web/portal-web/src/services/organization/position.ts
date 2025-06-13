import { request } from '@/utils/request';

// API基础地址
const API_BASE = 'http://127.0.0.1:9900/api-portal';

// 岗位数据类型定义
export interface WorkPosition {
  id: string;
  name: string;
  shortName?: string;
  departmentId: string;
  departmentName: string;
  departmentPath?: string;
  positionLevel: number;
  positionLevelName: string;
  jobDescription?: string;
  requirements?: string;
  salaryRange?: string;
  maxEmployees?: number;
  currentEmployees: number;
  menuIds?: string;
  menuFuncIds?: string;
  isManager: number;
  isDirector: number;
  sortOrder?: number;
  status: number;
  statusDesc: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  createdByName?: string;
  updatedBy: string;
  updatedByName?: string;
}

// 查询参数类型
export interface WorkPositionPageParams {
  current?: number;
  size?: number;
  name?: string;
  shortName?: string;
  departmentId?: string;
  positionLevel?: number;
  isManager?: number;
  isDirector?: number;
  status?: number;
  keyword?: string;
  sortField?: string;
  sortOrder?: string;
}

// 保存DTO类型
export interface WorkPositionSaveDTO {
  id?: string;
  name: string;
  shortName?: string;
  departmentId: string;
  positionLevel?: number;
  jobDescription?: string;
  requirements?: string;
  salaryRange?: string;
  maxEmployees?: number;
  menuIds?: string;
  menuFuncIds?: string;
  isManager?: number;
  isDirector?: number;
  sortOrder?: number;
  status?: number;
}

/**
 * 分页查询岗位列表
 */
export async function getWorkPositionPage(params: WorkPositionPageParams) {
  return request(`${API_BASE}/api/workposition/page`, {
    method: 'GET',
    params,
  });
}

/**
 * 获取岗位详情
 */
export async function getWorkPositionDetail(id: string) {
  return request(`${API_BASE}/api/workposition/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建岗位
 */
export async function createWorkPosition(data: WorkPositionSaveDTO) {
  return request(`${API_BASE}/api/workposition`, {
    method: 'POST',
    data,
  });
}

/**
 * 更新岗位
 */
export async function updateWorkPosition(id: string, data: WorkPositionSaveDTO) {
  return request(`${API_BASE}/api/workposition/${id}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 删除岗位
 */
export async function deleteWorkPosition(id: string) {
  return request(`${API_BASE}/api/workposition/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 批量删除岗位
 */
export async function deleteWorkPositions(ids: string[]) {
  return request(`${API_BASE}/api/workposition/batch`, {
    method: 'DELETE',
    data: ids,
  });
}

/**
 * 更新岗位状态
 */
export async function updateWorkPositionStatus(ids: string[], status: number) {
  return request(`${API_BASE}/api/workposition/status`, {
    method: 'PUT',
    data: { ids, status },
  });
}

/**
 * 复制岗位
 */
export async function copyWorkPosition(sourceId: string, targetDepartmentId: string, newName: string) {
  return request(`${API_BASE}/api/workposition/copy`, {
    method: 'POST',
    data: {
      sourceId,
      targetDepartmentId,
      newName,
    },
  });
}

/**
 * 根据部门查询岗位
 */
export async function getWorkPositionsByDepartment(departmentId: string) {
  return request(`${API_BASE}/api/workposition/department/${departmentId}`, {
    method: 'GET',
  });
}

/**
 * 根据员工ID查询岗位列表
 */
export async function getWorkPositionsByEmployee(employeeId: string) {
  return request(`${API_BASE}/api/workposition/employee/${employeeId}`, {
    method: 'GET',
  });
}

/**
 * 根据用户ID查询岗位列表
 */
export async function getWorkPositionsByUser(userId: string) {
  return request(`${API_BASE}/api/workposition/user/${userId}`, {
    method: 'GET',
  });
}

/**
 * 查询管理岗位列表
 */
export async function getManagerPositions() {
  return request(`${API_BASE}/api/workposition/manager`, {
    method: 'GET',
  });
}

/**
 * 验证岗位名称是否可用
 */
export async function checkPositionNameAvailable(name: string, departmentId: string, excludeId?: string) {
  return request(`${API_BASE}/api/workposition/check-name`, {
    method: 'GET',
    params: { name, departmentId, excludeId },
  });
}

/**
 * 配置岗位权限
 */
export async function configWorkPositionPermissions(positionId: string, menuIds: string, menuFuncIds: string) {
  return request(`${API_BASE}/api/workposition/${positionId}/permissions`, {
    method: 'POST',
    data: {
      menuIds,
      menuFuncIds,
    },
  });
}

/**
 * 获取岗位权限配置
 */
export async function getWorkPositionPermissions(positionId: string) {
  return request(`${API_BASE}/api/workposition/${positionId}/permissions`, {
    method: 'GET',
  });
}

/**
 * 获取菜单树（用于权限配置）
 */
export async function getMenuTree() {
  return request(`${API_BASE}/api/menus/tree`, {
    method: 'GET',
  });
} 