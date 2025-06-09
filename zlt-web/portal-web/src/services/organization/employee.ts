import { request } from '@/utils/request';

export interface Employee {
  id: number;
  empNo: string;
  name: string;
  gender: number;
  birthDate: string;
  age: number;
  idCardNo: string;
  phoneNumber: string;
  email: string;
  address: string;
  education: string;
  graduateSchool: string;
  major: string;
  departmentId: number;
  departmentName: string;
  positionId: number;
  positionName: string;
  employmentType: string;
  status: number;
  hireDate: string;
  probationEndDate?: string;
  leaveDate?: string;
  leaveReason?: string;
  avatar?: string;
  emergencyContact: string;
  emergencyPhone: string;
  bankAccount: string;
  bankName: string;
  salary: number;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeDetail extends Employee {
  parentName?: string;
  gradeName?: string;
  directorName?: string;
  path?: string;
}

export interface EmployeeStatistics {
  totalCount: number;
  onJobCount: number;
  probationCount: number;
  leaveCount: number;
  maleCount: number;
  femaleCount: number;
  averageAge: number;
  educationDistribution: {
    bachelor: number;
    master: number;
    doctor: number;
    other: number;
  };
  employmentTypeDistribution: {
    fullTime: number;
    partTime: number;
    intern: number;
    contractor: number;
  };
}

export interface EmployeePageParams {
  page?: number;
  size?: number;
  keyword?: string;
  departmentId?: number;
  positionId?: number;
  status?: number;
  employmentType?: string;
}

export interface EmployeeImportData {
  successCount: number;
  failedCount: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

/**
 * 分页查询员工列表
 */
export async function getEmployeePage(params: EmployeePageParams) {
  return request('/api/organization/employees/page', {
    method: 'GET',
    params,
  });
}

/**
 * 获取员工详情
 */
export async function getEmployeeDetail(id: number) {
  return request(`/api/organization/employees/${id}`, {
    method: 'GET',
  });
}

/**
 * 创建员工
 */
export async function createEmployee(data: Partial<Employee>) {
  return request('/api/organization/employees', {
    method: 'POST',
    data,
  });
}

/**
 * 更新员工
 */
export async function updateEmployee(id: number, data: Partial<Employee>) {
  return request(`/api/organization/employees/${id}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 删除员工
 */
export async function deleteEmployee(id: number) {
  return request(`/api/organization/employees/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 批量删除员工
 */
export async function deleteEmployees(ids: number[]) {
  return request('/api/organization/employees/batch', {
    method: 'DELETE',
    data: ids,
  });
}

/**
 * 更新员工状态
 */
export async function updateEmployeeStatus(id: number, status: number) {
  return request(`/api/organization/employees/${id}/status`, {
    method: 'PUT',
    params: { status },
  });
}

/**
 * 员工调动
 */
export async function transferEmployee(id: number, newDepartmentId: number, newPositionId?: number) {
  return request(`/api/organization/employees/${id}/transfer`, {
    method: 'PUT',
    params: { 
      newDepartmentId, 
      newPositionId 
    },
  });
}

/**
 * 员工转正
 */
export async function confirmEmployee(id: number) {
  return request(`/api/organization/employees/${id}/confirm`, {
    method: 'PUT',
  });
}

/**
 * 员工离职
 */
export async function resignEmployee(id: number, leaveDate: string, leaveReason: string) {
  return request(`/api/organization/employees/${id}/resign`, {
    method: 'PUT',
    params: { 
      leaveDate, 
      leaveReason 
    },
  });
}

/**
 * 根据部门查询员工
 */
export async function getEmployeesByDepartment(departmentId: number, includeSubDepartments: boolean = false) {
  return request(`/api/organization/employees/department/${departmentId}`, {
    method: 'GET',
    params: { includeSubDepartments },
  });
}

/**
 * 根据岗位查询员工
 */
export async function getEmployeesByPosition(positionId: number) {
  return request(`/api/organization/employees/position/${positionId}`, {
    method: 'GET',
  });
}

/**
 * 获取员工统计信息
 */
export async function getEmployeeStatistics(departmentId?: number) {
  return request('/api/organization/employees/statistics', {
    method: 'GET',
    params: { departmentId },
  });
}

/**
 * 获取即将到期试用期员工
 */
export async function getExpiringProbationEmployees(days: number = 7) {
  return request('/api/organization/employees/expiring-probation', {
    method: 'GET',
    params: { days },
  });
}

/**
 * 获取生日员工
 */
export async function getBirthdayEmployees(startDate: string, endDate: string) {
  return request('/api/organization/employees/birthday', {
    method: 'GET',
    params: { startDate, endDate },
  });
}

/**
 * 验证工号是否可用
 */
export async function checkEmpNoAvailable(empNo: string, excludeId?: number) {
  return request('/api/organization/employees/check-emp-no', {
    method: 'GET',
    params: { empNo, excludeId },
  });
}

/**
 * 验证身份证号是否可用
 */
export async function checkIdCardNoAvailable(idCardNo: string, excludeId?: number) {
  return request('/api/organization/employees/check-id-card', {
    method: 'GET',
    params: { idCardNo, excludeId },
  });
}

/**
 * 验证手机号是否可用
 */
export async function checkPhoneNumberAvailable(phoneNumber: string, excludeId?: number) {
  return request('/api/organization/employees/check-phone', {
    method: 'GET',
    params: { phoneNumber, excludeId },
  });
}

/**
 * 验证邮箱是否可用
 */
export async function checkEmailAvailable(email: string, excludeId?: number) {
  return request('/api/organization/employees/check-email', {
    method: 'GET',
    params: { email, excludeId },
  });
}

/**
 * 导入员工
 */
export async function importEmployees(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  return request('/api/organization/employees/import', {
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 导出员工
 */
export async function exportEmployees(departmentId?: number) {
  return request('/api/organization/employees/export', {
    method: 'GET',
    params: { departmentId },
    responseType: 'blob',
  });
}

/**
 * 生成工号
 */
export async function generateEmpNo(departmentId: number) {
  return request('/api/organization/employees/generate-emp-no', {
    method: 'GET',
    params: { departmentId },
  });
}

/**
 * 下载员工导入模板
 */
export async function downloadEmployeeTemplate() {
  return request('/api/organization/employees/download-template', {
    method: 'GET',
    responseType: 'blob',
  });
} 