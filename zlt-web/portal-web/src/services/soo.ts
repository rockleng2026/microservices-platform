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
export const getMonthlyPerformanceList = (params?: any) => {
  return request('/api-soo/api/soo/monthly-performance/page', {
    method: 'GET',
    params,
  });
};

// 新增
export const addMonthlyPerformance = (data: any) => {
  return request('/api-soo/api/soo/monthly-performance', {
    method: 'POST',
    data,
  });
};

// 编辑
export const updateMonthlyPerformance = (id: string, data: any) => {
  return request(`/api-soo/api/soo/monthly-performance/${id}`, {
    method: 'PUT',
    data,
  });
};

// 删除
export const deleteMonthlyPerformance = (id: string) => {
  return request(`/api-soo/api/soo/monthly-performance/${id}`, {
    method: 'DELETE',
  });
};

// 批量保存
export const batchSaveMonthlyPerformance = (data: any[]) => {
  return request('/api-soo/api/soo/monthly-performance/batch', {
    method: 'POST',
    data,
  });
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

// 批量导入相关API
export const downloadImportTemplate = () => {
  return request('/api-soo/api/soo/monthly-performance/import/template', {
    method: 'POST',
    responseType: 'blob',
  });
};

export const importMonthlyPerformance = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return request('/api-soo/api/soo/monthly-performance/import', {
    method: 'POST',
    data: formData,
  });
};

export const getImportStatus = () => {
  return request('/api-soo/api/soo/monthly-performance/import/status', {
    method: 'GET',
  });
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

// ==================== 薪酬计算模块 ====================

// 创建工资计算任务
export const createSalaryCalculationTask = (data: any) => {
  return request('/api-soo/api/soo/salary/calculate/monthly', {
    method: 'POST',
    data,
  }).then(handleResponse);
};

// 执行工资计算任务
export const executeCalculationTask = (taskId: number) => {
  return request(`/api-soo/api/soo/salary/task/${taskId}/execute`, {
    method: 'POST',
  }).then(handleResponse);
};

// 获取计算任务状态
export const getTaskStatus = (taskId: number) => {
  return request(`/api-soo/api/soo/salary/task/${taskId}/status`, {
    method: 'GET',
  }).then(handleResponse);
};

// 获取计算任务列表
export const getSalaryCalculationTasks = (params: any) => {
  return request('/api-soo/api/soo/salary/tasks', {
    method: 'GET',
    params,
  }).then(handleResponse);
};

// 获取工资计算结果
export const getPayrollResults = (params: any) => {
  return request('/api-soo/api/soo/salary/results', {
    method: 'GET',
    params,
  }).then(handleResponse);
};

// 计算单个员工工资
export const calculateEmployeeSalary = (employeeId: number, month: string) => {
  return request(`/api-soo/api/soo/salary/calculate/employee/${employeeId}`, {
    method: 'POST',
    params: { month },
  }).then(handleResponse);
};

// 审核工资计算结果
export const approveSalary = (data: any) => {
  return request('/api-soo/api/soo/salary/approve', {
    method: 'POST',
    data,
  }).then(handleResponse);
};

// 调整工资计算结果
export const adjustSalary = (data: any) => {
  return request('/api-soo/api/soo/salary/adjust', {
    method: 'POST',
    data,
  }).then(handleResponse);
};

// 重新计算工资
export const recalculateSalary = (resultIds: number[]) => {
  return request('/api-soo/api/soo/salary/recalculate', {
    method: 'POST',
    data: { resultIds },
  }).then(handleResponse);
};

// 获取工资计算详情
export const getPayrollDetail = (resultId: number) => {
  return request(`/api-soo/api/soo/salary/result/${resultId}`, {
    method: 'GET',
  }).then(handleResponse);
};

// 导出工资数据
export const exportPayrollData = (params: any) => {
  return request('/api-soo/api/soo/salary/export', {
    method: 'GET',
    params,
    responseType: 'blob',
  });
};

// 获取工资统计数据
export const getSalaryStatistics = (params: any) => {
  return request('/api-soo/api/soo/salary/statistics', {
    method: 'GET',
    params,
  }).then(handleResponse);
};

// 获取薪资趋势数据
export const getSalaryTrend = (params: any) => {
  return request('/api-soo/api/soo/salary/trend', {
    method: 'GET',
    params,
  }).then(handleResponse);
};

// 获取计算统计数据
export const getSalaryCalculationStats = () => {
  return request('/api-soo/api/soo/salary/task/stats', {
    method: 'GET',
  }).then(handleResponse);
};

// ==================== 工资条生成模块 ====================

// 获取工资条模板列表
export const getPayslipTemplates = () => {
  return request('/api-soo/api/soo/payslip/templates', {
    method: 'GET',
  }).then(handleResponse);
};

// 创建工资条批量生成任务
export const createPayslipBatchTask = (data: any) => {
  return request('/api-soo/api/soo/payslip/generate/batch', {
    method: 'POST',
    data,
  }).then(handleResponse);
};

// 执行工资条生成任务
export const executePayslipGenerationTask = (taskId: number) => {
  return request(`/api-soo/api/soo/payslip/task/${taskId}/execute`, {
    method: 'POST',
  }).then(handleResponse);
};

// 获取工资条生成任务状态
export const getPayslipTaskStatus = (taskId: number) => {
  return request(`/api-soo/api/soo/payslip/task/${taskId}/status`, {
    method: 'GET',
  }).then(handleResponse);
};

// 获取工资条列表
export const getPayslips = (params: any) => {
  return request('/api-soo/api/soo/payslip/list', {
    method: 'GET',
    params,
  }).then(handleResponse);
};

// 获取工资条批量任务列表
export const getPayslipBatchTasks = () => {
  return request('/api-soo/api/soo/payslip/tasks', {
    method: 'GET',
  }).then(handleResponse);
};

// 下载工资条
export const downloadPayslip = (payslipId: number) => {
  return request(`/api-soo/api/soo/payslip/${payslipId}/download`, {
    method: 'GET',
    responseType: 'blob',
  });
};

// 发送工资条
export const sendPayslip = (payslipId: number, data: any) => {
  return request(`/api-soo/api/soo/payslip/${payslipId}/send`, {
    method: 'POST',
    data,
  }).then(handleResponse);
};

// 批量发送工资条
export const batchSendPayslips = (data: any) => {
  return request('/api-soo/api/soo/payslip/send/batch', {
    method: 'POST',
    data,
  }).then(handleResponse);
};

// 生成单个工资条
export const generateSinglePayslip = (data: any) => {
  return request('/api-soo/api/soo/payslip/generate/single', {
    method: 'POST',
    data,
  }).then(handleResponse);
};

// ==================== 薪酬配置模块 ====================

// 获取薪酬计算规则
export const getSalaryCalculationRules = (params: any) => {
  return request('/api-soo/api/soo/salary/rules', {
    method: 'GET',
    params,
  }).then(handleResponse);
};

// 创建薪酬计算规则
export const createSalaryCalculationRule = (data: any) => {
  return request('/api-soo/api/soo/salary/rules', {
    method: 'POST',
    data,
  }).then(handleResponse);
};

// 更新薪酬计算规则
export const updateSalaryCalculationRule = (id: number, data: any) => {
  return request(`/api-soo/api/soo/salary/rules/${id}`, {
    method: 'PUT',
    data,
  }).then(handleResponse);
};

// 删除薪酬计算规则
export const deleteSalaryCalculationRule = (id: number) => {
  return request(`/api-soo/api/soo/salary/rules/${id}`, {
    method: 'DELETE',
  }).then(handleResponse);
};

// 测试薪酬计算规则
export const testSalaryCalculationRule = (data: any) => {
  return request('/api-soo/api/soo/salary/rules/test', {
    method: 'POST',
    data,
  }).then(handleResponse);
};

// ==================== 薪酬报表模块 ====================

// 获取部门薪酬统计
export const getDepartmentSalaryStats = (params: any) => {
  return request('/api-soo/api/soo/salary/department-stats', {
    method: 'GET',
    params,
  }).then(handleResponse);
};

// 获取薪酬成本分析
export const getSalaryCostAnalysis = (params: any) => {
  return request('/api-soo/api/soo/salary/cost-analysis', {
    method: 'GET',
    params,
  }).then(handleResponse);
};

// 获取薪酬趋势分析
export const getSalaryTrendAnalysis = (params: any) => {
  return request('/api-soo/api/soo/salary/trend-analysis', {
    method: 'GET',
    params,
  }).then(handleResponse);
};

// 获取员工薪酬对比
export const getEmployeeSalaryComparison = (params: any) => {
  return request('/api-soo/api/soo/salary/employee-comparison', {
    method: 'GET',
    params,
  }).then(handleResponse);
};

// 导出薪酬报表
export const exportSalaryReport = (params: any) => {
  return request('/api-soo/api/soo/salary/report/export', {
    method: 'GET',
    params,
    responseType: 'blob',
  });
};

// ==================== 辅助接口 ====================

// 验证薪酬计算数据
export const validateSalaryCalculationData = (data: any) => {
  return request('/api-soo/api/soo/salary/validate', {
    method: 'POST',
    data,
  }).then(handleResponse);
};

// 获取薪酬计算日志
export const getSalaryCalculationLogs = (params: any) => {
  return request('/api-soo/api/soo/salary/logs', {
    method: 'GET',
    params,
  }).then(handleResponse);
};

// 统一导出 sooApi 对象（保持向后兼容）
export const sooApi = {
  // 薪酬计算
  createSalaryCalculationTask,
  executeCalculationTask,
  getTaskStatus,
  getSalaryCalculationTasks,
  getPayrollResults,
  calculateEmployeeSalary,
  approveSalary,
  adjustSalary,
  recalculateSalary,
  getPayrollDetail,
  exportPayrollData,
  getSalaryStatistics,
  getSalaryTrend,
  getSalaryCalculationStats,
  
  // 工资条生成
  getPayslipTemplates,
  createPayslipBatchTask,
  executePayslipGenerationTask,
  getPayslipTaskStatus,
  getPayslips,
  getPayslipBatchTasks,
  downloadPayslip,
  sendPayslip,
  batchSendPayslips,
  generateSinglePayslip,
  
  // 薪酬配置
  getSalaryCalculationRules,
  createSalaryCalculationRule,
  updateSalaryCalculationRule,
  deleteSalaryCalculationRule,
  testSalaryCalculationRule,
  
  // 薪酬报表
  getDepartmentSalaryStats,
  getSalaryCostAnalysis,
  getSalaryTrendAnalysis,
  getEmployeeSalaryComparison,
  exportSalaryReport,
  
  // 辅助接口
  validateSalaryCalculationData,
  getSalaryCalculationLogs,
  
  // 现有接口（保持兼容性）
  getDepartments: getDepartmentTree,
  getEmployees: getEmployeePage,
}; 