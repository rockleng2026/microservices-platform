import { request } from '@/utils/request';

export interface WorkPosition {
  id: number;
  name: string;
  positionCode: string;
  departmentId: number;
  departmentName: string;
  level: string;
  responsibilities: string;
  requirements: string;
  salaryRange: string;
  isManager: boolean;
  status: number;
  maxHeadcount: number;
  currentHeadcount: number;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkPositionDetail extends WorkPosition {
  permissions: string[];
  employees: Array<{
    id: number;
    name: string;
    empNo: string;
    status: number;
  }>;
}

export interface WorkPositionPageParams {
  page?: number;
  size?: number;
  keyword?: string;
  departmentId?: number;
  level?: string;
  status?: number;
}

/**
 * 分页查询岗位列表
 */
export async function getWorkPositionPage(params: WorkPositionPageParams) {
  return request('/api/organization/positions/page', {
    method: 'GET',
    params,
  });
}

/**
 * 获取岗位详情
 */
export async function getWorkPositionDetail(id: number) {
  return request(`/api/organization/positions/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建岗位
 */
export async function createWorkPosition(data: Partial<WorkPosition>) {
  return request('/api/organization/positions', {
    method: 'POST',
    data,
  });
}

/**
 * 更新岗位
 */
export async function updateWorkPosition(id: number, data: Partial<WorkPosition>) {
  return request(`/api/organization/positions/${id}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 删除岗位
 */
export async function deleteWorkPosition(id: number) {
  return request(`/api/organization/positions/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 批量删除岗位
 */
export async function deleteWorkPositions(ids: number[]) {
  return request('/api/organization/positions/batch', {
    method: 'DELETE',
    data: ids,
  });
}

/**
 * 更新岗位状态
 */
export async function updateWorkPositionStatus(id: number, status: number) {
  return request(`/api/organization/positions/${id}/status`, {
    method: 'PUT',
    params: { status },
  });
}

/**
 * 复制岗位
 */
export async function copyWorkPosition(id: number, targetDepartmentId: number) {
  return request(`/api/organization/positions/${id}/copy`, {
    method: 'POST',
    params: { targetDepartmentId },
  });
}

/**
 * 根据部门查询岗位
 */
export async function getWorkPositionsByDepartment(departmentId: number, includeSubDepartments: boolean = false) {
  return request(`/api/organization/positions/department/${departmentId}`, {
    method: 'GET',
    params: { includeSubDepartments },
  });
}

/**
 * 查询可用岗位（用于下拉选择）
 */
export async function getAvailableWorkPositions(departmentId?: number) {
  return request('/api/organization/positions/available', {
    method: 'GET',
    params: { departmentId },
  });
}

/**
 * 验证岗位名称是否可用
 */
export async function checkPositionNameAvailable(name: string, departmentId: number, excludeId?: number) {
  return request('/api/organization/positions/check-name', {
    method: 'GET',
    params: { name, departmentId, excludeId },
  });
}

/**
 * 验证岗位编号是否可用
 */
export async function checkPositionCodeAvailable(positionCode: string, excludeId?: number) {
  return request('/api/organization/positions/check-code', {
    method: 'GET',
    params: { positionCode, excludeId },
  });
}

/**
 * 生成岗位编号
 */
export async function generatePositionCode(departmentId: number) {
  return request('/api/organization/positions/generate-code', {
    method: 'GET',
    params: { departmentId },
  });
} 