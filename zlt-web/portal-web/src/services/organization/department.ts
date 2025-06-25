import { request } from '@/utils/request';

// API基础地址
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
  operationType?: 'add' | 'edit'; // 操作类型标识
}

export interface UpdateDepartmentParams extends CreateDepartmentParams {
  id: number;
  operationType: 'edit'; // 编辑操作必须有此标识
}

export interface ExportDepartmentsParams {
  parentId?: number;
}

/**
 * 获取部门树
 */
export async function getDepartmentTree(params: DepartmentTreeParams = {}) {
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
export async function getDepartmentDetail(id: number | string) {
  return request(`${API_PREFIX}/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建部门
 */
export async function createDepartment(data: CreateDepartmentParams) {
  return request(`${API_PREFIX}/save`, {
    method: 'POST',
    data,
  });
}

/**
 * 更新部门
 */
export async function updateDepartment(data: UpdateDepartmentParams) {
  return request(`${API_PREFIX}/save`, {
    method: 'POST',
    data,
  });
}

/**
 * 删除部门
 */
export async function deleteDepartment(id: number | string) {
  return request(`${API_PREFIX}/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 批量删除部门
 */
export async function deleteDepartments(ids: (number | string)[]) {
  return request(`${API_PREFIX}/batch`, {
    method: 'DELETE',
    data: ids,
  });
}

/**
 * 更新部门状态
 */
export async function updateDepartmentStatus(id: number | string, status: number) {
  return request(`${API_PREFIX}/${id}/status`, {
    method: 'PUT',
    params: { status },
  });
}

/**
 * 移动部门
 */
export async function moveDepartment(id: number | string, newParentId: number | string) {
  return request(`${API_PREFIX}/${id}/move`, {
    method: 'PUT',
    params: { newParentId },
  });
}

/**
 * 复制部门结构
 */
export async function copyDepartmentStructure(sourceId: number | string, targetParentId: number | string) {
  return request(`${API_PREFIX}/${sourceId}/copy`, {
    method: 'POST',
    params: { targetParentId },
  });
}

/**
 * 获取部门统计信息
 */
export async function getDepartmentStatistics(id: number | string) {
  return request(`${API_PREFIX}/${id}/statistics`, {
    method: 'GET',
  });
}

/**
 * 获取部门路径
 */
export async function getDepartmentPath(id: number | string) {
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
export async function checkDepartmentNoAvailable(depNo: string, excludeId?: number | string) {
  return request(`${API_PREFIX}/check-depno`, {
    method: 'GET',
    params: { depNo, excludeId },
  });
}

/**
 * 检查部门名称是否可用
 */
export async function checkDepartmentNameAvailable(name: string, parentId: number | string, excludeId?: number | string) {
  return request(`${API_PREFIX}/check-name`, {
    method: 'GET',
    params: { name, parentId, excludeId },
  });
}

/**
 * 批量导入部门
 */
export async function importDepartments(data: FormData) {
  return request(`${API_PREFIX}/import`, {
    method: 'POST',
    data,
  });
}

/**
 * 导出部门数据
 */
export async function exportDepartments(params: ExportDepartmentsParams = {}) {
  return request(`${API_PREFIX}/export`, {
    method: 'GET',
    params,
  });
}

/**
 * 验证部门级别
 */
export async function validateDepartmentLevel(parentId?: number | string, gradeId?: number) {
  return request(`${API_PREFIX}/validate-level`, {
    method: 'GET',
    params: { parentId, gradeId },
  });
}

/**
 * 批量查询员工所属大部门
 */
export async function batchGetEmployeeMainDepartments(employeeIds: string[]) {
  return request(`${API_PREFIX}/batch-main-departments`, {
    method: 'POST',
    data: employeeIds,
  });
} 