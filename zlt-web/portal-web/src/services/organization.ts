import { request } from 'umi';

/**
 * 部门管理API
 */

// 获取部门树
export async function getDepartmentTree(params?: any) {
  return request<ApiResponse<Department[]>>('/api/organization/departments/tree', {
    method: 'GET',
    params,
  });
}

// 获取部门列表
export async function getDepartments(params?: TableSearchParams) {
  return request<ApiResponse<PageResponse<Department>>>('/api/organization/departments', {
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
  return request<ApiResponse<Department>>('/api/organization/departments', {
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
  return request<ApiResponse<void>>(`/api/organization/departments/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 员工管理API
 */

// 获取员工列表
export async function getEmployees(params?: TableSearchParams) {
  return request<ApiResponse<PageResponse<Employee>>>('/api/organization/employees', {
    method: 'GET',
    params,
  });
}

// 获取员工详情
export async function getEmployeeById(id: number) {
  return request<ApiResponse<Employee>>(`/api/organization/employees/${id}`, {
    method: 'GET',
  });
}

// 创建员工
export async function createEmployee(data: Partial<Employee>) {
  return request<ApiResponse<Employee>>('/api/organization/employees', {
    method: 'POST',
    data,
  });
}

// 更新员工
export async function updateEmployee(id: number, data: Partial<Employee>) {
  return request<ApiResponse<Employee>>(`/api/organization/employees/${id}`, {
    method: 'PUT',
    data,
  });
}

// 删除员工
export async function deleteEmployee(id: number) {
  return request<ApiResponse<void>>(`/api/organization/employees/${id}`, {
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
export async function getWorkPositions(params?: TableSearchParams) {
  return request<ApiResponse<PageResponse<WorkPosition>>>('/api/organization/positions', {
    method: 'GET',
    params,
  });
}

// 获取岗位详情
export async function getWorkPositionById(id: number) {
  return request<ApiResponse<WorkPosition>>(`/api/organization/positions/${id}`, {
    method: 'GET',
  });
}

// 创建岗位
export async function createWorkPosition(data: Partial<WorkPosition>) {
  return request<ApiResponse<WorkPosition>>('/api/organization/positions', {
    method: 'POST',
    data,
  });
}

// 更新岗位
export async function updateWorkPosition(id: number, data: Partial<WorkPosition>) {
  return request<ApiResponse<WorkPosition>>(`/api/organization/positions/${id}`, {
    method: 'PUT',
    data,
  });
}

// 删除岗位
export async function deleteWorkPosition(id: number) {
  return request<ApiResponse<void>>(`/api/organization/positions/${id}`, {
    method: 'DELETE',
  });
} 