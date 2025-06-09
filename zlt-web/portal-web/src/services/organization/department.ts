import { request } from '@/utils/request';

const API_PREFIX = '/api/organization/departments';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface DepartmentTreeParams {
  parentId?: number;
  includeDisabled?: boolean;
}

export interface DepartmentPageParams {
  page?: number;
  size?: number;
  keyword?: string;
  parentId?: number;
  gradeId?: number;
  status?: number;
}

export interface CreateDepartmentParams {
  name: string;
  parentId?: number;
  depNo?: string;
  directorId?: number;
  gradeid: number;
  tel?: string;
  address?: string;
  description?: string;
  status: number;
}

export interface UpdateDepartmentParams extends CreateDepartmentParams {
  id: number;
}

export interface ExportDepartmentsParams {
  parentId?: number;
}

/**
 * 获取部门树
 */
export async function getDepartmentTree(params: DepartmentTreeParams) {
  return request(`${API_PREFIX}/tree`, {
    method: 'GET',
    params,
  });
}

/**
 * 分页查询部门
 */
export async function getDepartmentPage(params: DepartmentPageParams) {
  return request(`${API_PREFIX}/page`, {
    method: 'GET',
    params,
  });
}

/**
 * 获取部门详情
 */
export async function getDepartmentDetail(id: number) {
  return request(`${API_PREFIX}/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建部门
 */
export async function createDepartment(data: CreateDepartmentParams) {
  return request(`${API_PREFIX}`, {
    method: 'POST',
    data,
  });
}

/**
 * 更新部门
 */
export async function updateDepartment(id: number, data: Partial<CreateDepartmentParams>) {
  return request(`${API_PREFIX}/${id}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 删除部门
 */
export async function deleteDepartment(id: number) {
  return request(`${API_PREFIX}/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 批量删除部门
 */
export async function deleteDepartments(ids: number[]) {
  return request(`${API_PREFIX}/batch`, {
    method: 'DELETE',
    data: ids,
  });
}

/**
 * 更新部门状态
 */
export async function updateDepartmentStatus(id: number, status: number) {
  return request(`${API_PREFIX}/${id}/status`, {
    method: 'PUT',
    params: { status },
  });
}

/**
 * 移动部门
 */
export async function moveDepartment(id: number, newParentId: number) {
  return request(`${API_PREFIX}/${id}/move`, {
    method: 'PUT',
    params: { newParentId },
  });
}

/**
 * 复制部门结构
 */
export async function copyDepartmentStructure(sourceId: number, targetParentId: number, includeEmployees: boolean) {
  return request(`${API_PREFIX}/${sourceId}/copy`, {
    method: 'POST',
    params: { targetParentId, includeEmployees },
  });
}

/**
 * 获取部门统计信息
 */
export async function getDepartmentStatistics(id: number) {
  return request(`${API_PREFIX}/${id}/statistics`, {
    method: 'GET',
  });
}

/**
 * 获取部门路径
 */
export async function getDepartmentPath(id: number) {
  return request(`${API_PREFIX}/${id}/path`, {
    method: 'GET',
  });
}

/**
 * 获取用户可管理的部门
 */
export async function getUserManageableDepartments() {
  return request(`${API_PREFIX}/manageable`, {
    method: 'GET',
  });
}

/**
 * 检查部门编号可用性
 */
export async function checkDepartmentNoAvailable(depNo: string, excludeId?: number) {
  return request(`${API_PREFIX}/check-depno`, {
    method: 'GET',
    params: { depNo, excludeId },
  });
}

/**
 * 批量导入部门
 */
export async function importDepartments(data: FormData) {
  return request(`${API_PREFIX}/import`, {
    method: 'POST',
    data,
    requestType: 'form',
  });
}

/**
 * 导出部门数据
 */
export async function exportDepartments(params: ExportDepartmentsParams) {
  return request(`${API_PREFIX}/export`, {
    method: 'GET',
    params,
  });
}

/**
 * 验证部门层级
 */
export async function validateDepartmentLevel(parentId?: number, gradeId?: number) {
  return request(`${API_PREFIX}/validate-level`, {
    method: 'GET',
    params: { parentId, gradeId },
  });
} 