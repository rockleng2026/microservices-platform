import { request } from '../utils/request';

// 统一处理响应数据格式兼容性
const handleResponse = (response: any) => {
  if (response.resp_code === 0 || response.success) {
    const data = response.data || response.datas;
    if (data && data.records) {
      return {
        success: true,
        data: {
          list: data.records,
          total: data.total,
          current: data.current,
          size: data.size,
        },
      };
    }
    return { success: true, data };
  } else {
    return {
      success: false,
      message: response.resp_msg || response.message || '请求失败',
    };
  }
};

// ==================== 部门分红配置 ====================

// 分页查询
export const getDepartmentBonusList = (params: any) => {
  return request('/api-soo/api/soo/department-bonus-config/page', {
    method: 'GET',
    params,
  }).then(handleResponse);
};

// 新增
export const addDepartmentBonus = (data: any) => {
  return request('/api-soo/api/soo/department-bonus-config', {
    method: 'POST',
    data,
  }).then(handleResponse);
};

// 编辑
export const updateDepartmentBonus = (id: string, data: any) => {
  return request(`/api-soo/api/soo/department-bonus-config/${id}`, {
    method: 'PUT',
    data,
  }).then(handleResponse);
};

// 删除
export const deleteDepartmentBonus = (id: string) => {
  return request(`/api-soo/api/soo/department-bonus-config/${id}`, {
    method: 'DELETE',
  }).then(handleResponse);
}; 

// ==================== 月度绩效管理 ====================

// 分页查询
export const getMonthlyPerformanceList = (params: any) => {
  return request('/api-soo/api/soo/monthly-performance/page', {
    method: 'GET',
    params,
  }).then((response: any) => {
    console.log('月度绩效分页查询响应:', response);
    // 新老结构兼容：data为数组，count为总数
    if (Array.isArray(response.data) && typeof response.count === 'number') {
      return {
        success: true,
        data: {
          list: response.data,
          total: response.count,
        },
      };
    }
    // 兼容原有结构
    return handleResponse(response);
  });
};

// 新增
export const addMonthlyPerformance = (data: any) => {
  console.log('新增月度绩效请求数据:', data);
  return request('/api-soo/api/soo/monthly-performance', {
    method: 'POST',
    data,
  }).then(handleResponse);
};

// 编辑
export const updateMonthlyPerformance = (id: string, data: any) => {
  console.log('更新月度绩效请求数据:', data);
  return request(`/api-soo/api/soo/monthly-performance/${id}`, {
    method: 'PUT',
    data,
  }).then(handleResponse);
};

// 删除
export const deleteMonthlyPerformance = (id: string) => {
  return request(`/api-soo/api/soo/monthly-performance/${id}`, {
    method: 'DELETE',
  }).then(handleResponse);
};

// 批量保存
export const batchSaveMonthlyPerformance = (data: any[]) => {
  return request('/api-soo/api/soo/monthly-performance/batch', {
    method: 'POST',
    data,
  }).then(handleResponse);
};

// 查询单条
export const getMonthlyPerformanceById = (id: string) => {
  return request(`/api-soo/api/soo/monthly-performance/${id}`, {
    method: 'GET',
  }).then(handleResponse);
};

// 查询员工历史绩效
export const getMonthlyPerformanceHistory = (employeeId: string) => {
  return request(`/api-soo/api/soo/monthly-performance/history/${employeeId}`, {
    method: 'GET',
  }).then(handleResponse);
}; 

// ==================== 组织架构API ====================

// 获取部门树形结构
export const getDepartmentTree = (params?: any) => {
  console.log('请求部门树形结构:', params);
  return request('/api-organization/api/organization/departments/tree', {
    method: 'GET',
    params,
  }).then((response: any) => {
    console.log('部门树形结构响应:', response);
    return handleResponse(response);
  });
};

// 根据部门ID查询员工列表
export const getEmployeesByDepartment = (departmentId: string, includeSubDept = false) => {
  console.log('根据部门查询员工:', { departmentId, includeSubDept });
  return request(`/api-organization/api/organization/employee/department/${departmentId}`, {
    method: 'GET',
    params: { includeSubDept },
  }).then((response: any) => {
    console.log('部门员工列表响应:', response);
    return handleResponse(response);
  });
};

// 分页查询员工列表
export const getEmployeePage = (params: any) => {
  console.log('分页查询员工列表:', params);
  return request('/api-organization/api/organization/employee/page', {
    method: 'GET',
    params,
  }).then((response: any) => {
    console.log('员工分页查询响应:', response);
    return handleResponse(response);
  });
};

// 根据员工ID获取详情
export const getEmployeeById = (employeeId: string) => {
  console.log('查询员工详情:', employeeId);
  return request(`/api-organization/api/organization/employee/${employeeId}`, {
    method: 'GET',
  }).then((response: any) => {
    console.log('员工详情响应:', response);
    return handleResponse(response);
  });
}; 