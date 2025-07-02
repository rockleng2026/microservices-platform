import { request } from '@/utils/request';
// 引入统一API配置
import { API_ENDPOINTS, API_PATHS, getApiUrl } from '@/config/api';

/**
 * 部门管理API
 */

// 获取部门树
export async function getDepartmentTree(params?: any) {
  return request<ApiResponse<Department[]>>(getApiUrl('/api/organization/departments/tree', 'PORTAL'), {
    method: 'GET',
    params,
  });
}

// 获取部门列表
export async function getDepartments(params?: any) {
  return request<ApiResponse<any>>('/api/organization/departments', {
    method: 'GET',
    params,
  });
}

// 获取部门详情
export async function getDepartmentById(id: number) {
  return request<ApiResponse<Department>>(`/api/organization/departments/${id}`, {
    method: 'GET',
  });
}

// 创建部门
export async function createDepartment(data: Partial<Department>) {
  return request<ApiResponse<Department>>(getApiUrl('/api/organization/departments', 'PORTAL'), {
    method: 'POST',
    data,
  });
}

// 更新部门
export async function updateDepartment(id: number, data: Partial<Department>) {
  return request<ApiResponse<Department>>(`/api/organization/departments/${id}`, {
    method: 'PUT',
    data,
  });
}

// 删除部门
export async function deleteDepartment(id: number) {
  return request<ApiResponse<string>>(`/api/organization/departments/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 员工管理API
 */

// 获取员工列表
export async function getEmployeeList(params?: any) {
  return request<ApiResponse<Employee[]>>(getApiUrl('/api/organization/employee/page', 'PORTAL'), {
    method: 'GET',
    params,
  });
}

// 获取员工详情
export async function getEmployeeDetail(id: number) {
  return request<ApiResponse<Employee>>(getApiUrl(`/api/organization/employees/${id}`, 'PORTAL'), {
    method: 'GET',
  });
}

// 创建员工
export async function createEmployee(data: Partial<Employee>) {
  return request<ApiResponse<Employee>>(getApiUrl('/api/organization/employees', 'PORTAL'), {
    method: 'POST',
    data,
  });
}

// 更新员工
export async function updateEmployee(id: number, data: Partial<Employee>) {
  return request<ApiResponse<Employee>>(getApiUrl(`/api/organization/employees/${id}`, 'PORTAL'), {
    method: 'PUT',
    data,
  });
}

// 删除员工
export async function deleteEmployee(id: number) {
  return request<ApiResponse<string>>(getApiUrl(`/api/organization/employees/${id}`, 'PORTAL'), {
    method: 'DELETE',
  });
}

// 导入员工
export async function importEmployees(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  return request<ApiResponse<{ successCount: number; errorCount: number }>>('/api/organization/employees/import', {
    method: 'POST',
    data: formData,
  });
}

// 导出员工
export async function exportEmployees(params?: any) {
  return request('/api/organization/employees/export', {
    method: 'GET',
    params,
    responseType: 'blob',
  });
}

/**
 * 岗位管理API
 */

// 获取岗位列表
export async function getPositionList(params?: any) {
  return request<ApiResponse<Position[]>>(getApiUrl('/api/organization/positions', 'PORTAL'), {
    method: 'GET',
    params,
  });
}

// 获取岗位详情
export async function getPositionDetail(id: number) {
  return request<ApiResponse<Position>>(getApiUrl(`/api/organization/positions/${id}`, 'PORTAL'), {
    method: 'GET',
  });
}

// 创建岗位
export async function createPosition(data: Partial<Position>) {
  return request<ApiResponse<Position>>(getApiUrl('/api/organization/positions', 'PORTAL'), {
    method: 'POST',
    data,
  });
}

// 更新岗位
export async function updatePosition(id: number, data: Partial<Position>) {
  return request<ApiResponse<Position>>(getApiUrl(`/api/organization/positions/${id}`, 'PORTAL'), {
    method: 'PUT',
    data,
  });
}

// 删除岗位
export async function deletePosition(id: number) {
  return request<ApiResponse<string>>(getApiUrl(`/api/organization/positions/${id}`, 'PORTAL'), {
    method: 'DELETE',
  });
}

// 类型定义
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  resp_code?: number;
  resp_msg?: string;
  datas?: T;
}

interface Department {
  id: number;
  name: string;
  shortName?: string;
  parentId?: number;
  parentName?: string;
  level: number;
  sort: number;
  manager?: string;
  managerId?: number;
  phone?: string;
  email?: string;
  address?: string;
  description?: string;
  enabled: boolean;
  children?: Department[];
  path?: string;
}

interface Employee {
  id: number;
  empNo: string;
  name: string;
  nameEn?: string;
  gender: number;
  birthDate?: string;
  age?: number;
  idCard?: string;
  mobile?: string;
  email?: string;
  avatar?: string;
  departmentId: number;
  departmentName?: string;
  positionId?: number;
  positionName?: string;
  secondaryPositionIds?: string;
  secondaryPositions?: Position[];
  gradeId?: number;
  gradeName?: string;
  employmentType: number;
  employmentStatus: number;
  entryDate?: string;
  workDays?: number;
  education?: string;
  probationEndDate?: string;
  regularizationDate?: string;
  leaveDate?: string;
  leaveReason?: string;
  workYears?: number;
  educationLevel?: string;
  graduationSchool?: string;
  major?: string;
  maritalStatus?: number;
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  enabled: boolean;
}

interface Position {
  id: number;
  name: string;
  shortName?: string;
  deptId?: number;
  deptName?: string;
  workgrade?: number;
  workcontent?: string;
  functionIDs?: string;
  permissions?: string;
  enabled: boolean;
  sort?: number;
}

// 类型定义已在 typings.d.ts 中全局声明

export type { Department, Employee, Position, ApiResponse }; 