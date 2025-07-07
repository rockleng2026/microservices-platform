import { request } from '@/utils/request';

// 统一处理响应数据格式兼容性
const handleResponse = (response: any) => {
  console.log('API响应原始数据:', response);
  
  // 处理成功响应
  if (response.resp_code === 0 || response.success) {
    const data = response.data || response.datas;
    
    // 如果是分页数据且包含records字段
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
    
    // 直接返回数据
    return { 
      success: true, 
      data,
      resp_code: response.resp_code || 0
    };
  } else {
    // 处理失败响应
    return {
      success: false,
      message: response.resp_msg || response.message || '请求失败',
      resp_code: response.resp_code || response.code || 1
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

// ===========================
// 薪酬计算任务管理 API
// ===========================

/**
 * 创建薪酬计算任务
 */
export async function createSalaryCalculationTask(params: {
  taskName: string;
  calculationMonth: string;
  calculationType: 'FULL' | 'DEPARTMENT' | 'EMPLOYEE';
  targetDepartmentIds?: number[];
  targetEmployeeIds?: number[];
  excludeEmployeeIds?: number[];
  remark?: string;
  calculationRules?: {
    baseCalculation?: boolean;
    performanceCalculation?: boolean;
    commissionCalculation?: boolean;
    socialSecurityCalculation?: boolean;
    taxCalculation?: boolean;
  };
}) {
  return request('/api-soo/api/soo/salary/tasks', {
    method: 'POST',
    data: params,
  });
}

/**
 * 执行薪酬计算任务
 */
export async function executeSalaryCalculationTask(taskId: string) {
  return request(`/api-soo/api/soo/salary/tasks/${taskId}/execute`, {
    method: 'POST',
  });
}

/**
 * 查询薪酬计算任务列表
 */
export async function getSalaryCalculationTasks(params: {
  page?: number;
  size?: number;
  month?: string;
  status?: string;
  taskName?: string;
}) {
  return request('/api-soo/api/soo/salary/tasks', {
    method: 'GET',
    params,
  }).then(handleResponse);
}

/**
 * 获取任务详情
 */
export async function getSalaryTaskDetail(taskId: string) {
  return request(`/api-soo/api/soo/salary/tasks/${taskId}`, {
    method: 'GET',
  });
}

/**
 * 获取任务执行进度
 */
export async function getSalaryTaskProgress(taskId: string) {
  return request(`/api-soo/api/soo/salary/tasks/${taskId}/progress`, {
    method: 'GET',
  });
}

/**
 * 获取薪酬计算任务统计
 */
export async function getSalaryTaskStatistics() {
  return request('/api-soo/api/soo/salary/tasks/statistics', {
    method: 'GET',
  }).then(handleResponse);
}

/**
 * 确认任务结果
 */
export async function confirmSalaryTask(taskId: string) {
  return request(`/api-soo/api/soo/salary/tasks/${taskId}/confirm`, {
    method: 'POST',
  });
}

/**
 * 取消任务执行
 */
export async function cancelSalaryTask(taskId: string) {
  return request(`/api-soo/api/soo/salary/tasks/${taskId}/cancel`, {
    method: 'POST',
  });
}

// ===========================
// 工资计算结果管理 API
// ===========================

/**
 * 查询工资计算结果
 */
export async function getPayrollResults(params: {
  page?: number;
  size?: number;
  taskId?: string;
  month?: string;
  startMonth?: string;
  endMonth?: string;
  departmentIds?: number[];
  employeeIds?: number[];
  employeeName?: string;
  calculationStatus?: string;
  approvalStatus?: string;
  isFinal?: boolean;
  isCurrentVersion?: boolean;
}) {
  return request('/api-soo/api/soo/salary/results', {
    method: 'GET',
    params,
  });
}

/**
 * 获取员工工资详情
 */
export async function getPayrollDetail(resultId: number) {
  return request(`/api-soo/api/soo/salary/results/${resultId}`, {
    method: 'GET',
  });
}

/**
 * 重新计算单个员工工资
 */
export async function recalculateEmployeeSalary(params: {
  taskId: string;
  employeeId: number;
}) {
  return request('/api-soo/api/soo/salary/results/recalculate', {
    method: 'POST',
    data: params,
  });
}

/**
 * 批量审批工资结果
 */
export async function batchApprovePayroll(params: {
  resultIds: number[];
  approvalStatus: 'APPROVED' | 'REJECTED';
  approvalRemark?: string;
}) {
  return request('/api-soo/api/soo/salary/results/approve', {
    method: 'POST',
    data: params,
  });
}

/**
 * 调整工资结果
 */
export async function adjustPayrollResult(params: {
  resultId: number;
  adjustmentType: string;
  adjustmentAmount: number;
  adjustmentReason: string;
}) {
  return request('/api-soo/api/soo/salary/results/adjust', {
    method: 'POST',
    data: params,
  });
}

/**
 * 获取工资计算日志
 */
export async function getCalculationLog(resultId: number) {
  return request(`/api-soo/api/soo/salary/results/${resultId}/log`, {
    method: 'GET',
  });
}

// ===========================
// 薪酬统计分析 API
// ===========================

/**
 * 获取薪酬统计汇总
 */
export async function getSalarySummary(taskId: string) {
  return request(`/api-soo/api/soo/salary/summary/${taskId}`, {
    method: 'GET',
  });
}

/**
 * 获取部门薪酬统计
 */
export async function getDepartmentSalarySummary(taskId: string, departmentId: number) {
  return request(`/api-soo/api/soo/salary/summary/${taskId}/department/${departmentId}`, {
    method: 'GET',
  });
}

/**
 * 获取薪酬趋势分析
 */
export async function getSalaryTrend(params: {
  startMonth?: string;
  endMonth?: string;
  departmentIds?: number[];
  employeeIds?: number[];
}) {
  return request('/api-soo/api/soo/salary/trend', {
    method: 'GET',
    params,
  });
}

/**
 * 获取薪酬分布分析
 */
export async function getSalaryDistribution(taskId: string) {
  return request(`/api-soo/api/soo/salary/distribution/${taskId}`, {
    method: 'GET',
  });
}

/**
 * 导出工资计算结果
 */
export async function exportPayrollResults(params: {
  taskId?: string;
  month?: string;
  departmentIds?: number[];
  employeeIds?: number[];
  exportType: 'EXCEL' | 'PDF';
  includeDetails?: boolean;
}) {
  return request('/api-soo/api/soo/salary/export', {
    method: 'POST',
    data: params,
    responseType: 'blob',
  });
}

// ===========================
// 盈亏平衡分析 API
// ===========================

/**
 * 基于薪酬数据生成盈亏平衡分析
 */
export async function generateBreakevenAnalysis(params: {
  taskId: string;
  analysisName: string;
  analysisType: 'monthly' | 'quarterly' | 'yearly';
  period: string;
  currentTotalRevenue: number;
  currentGrossMargin: number;
  fixedOperatingCost: number;
  variableOperatingCost: number;
}) {
  return request('/api-soo/api/soo/salary/breakeven/generate', {
    method: 'POST',
    data: params,
  });
}

/**
 * 获取盈亏平衡分析列表
 */
export async function getBreakevenAnalysisList(params: {
  page?: number;
  size?: number;
  taskId?: string;
  analysisType?: string;
  period?: string;
}) {
  return request('/api-soo/api/soo/salary/breakeven/list', {
    method: 'GET',
    params,
  });
}

/**
 * 获取成本结构分析
 */
export async function getCostStructureAnalysis(taskId: string) {
  return request(`/api-soo/api/soo/salary/cost-structure/${taskId}`, {
    method: 'GET',
  });
}

// ===========================
// 工资条生成管理API
// ===========================

/**
 * 创建工资条生成任务
 */
export async function createPayslipTask(params: {
  taskName: string;
  salaryTaskId: string;
  templateId: string;
  targetType: 'ALL' | 'DEPARTMENT' | 'EMPLOYEE';
  targetDepartmentIds?: number[];
  targetEmployeeIds?: number[];
  deliveryMethod: 'EMAIL' | 'SMS' | 'MANUAL';
}) {
  return request('/api-soo/api/soo/salary/payslip/tasks', {
    method: 'POST',
    data: params,
  });
}

/**
 * 获取工资条生成任务列表
 */
export async function getPayslipTasks(params: {
  page?: number;
  size?: number;
  salaryTaskId?: string;
  status?: string;
}) {
  return request('/api-soo/api/soo/salary/payslip/tasks', {
    method: 'GET',
    params,
  });
}

/**
 * 执行工资条生成任务
 */
export async function executePayslipTask(taskId: string) {
  return request(`/api-soo/api/soo/salary/payslip/tasks/${taskId}/execute`, {
    method: 'POST',
  });
}

/**
 * 获取工资条记录列表
 */
export async function getPayslipRecords(params: {
  page?: number;
  size?: number;
  taskId?: string;
  employeeId?: number;
  month?: string;
  deliveryStatus?: string;
  viewStatus?: string;
}) {
  return request('/api-soo/api/soo/salary/payslip/records', {
    method: 'GET',
    params,
  });
}

/**
 * 批量发送工资条
 */
export async function batchSendPayslips(params: {
  recordIds: number[];
  deliveryMethod: 'EMAIL' | 'SMS';
}) {
  return request('/api-soo/api/soo/salary/payslip/send', {
    method: 'POST',
    data: params,
  });
}

/**
 * 预览工资条
 */
export async function previewPayslip(recordId: number) {
  return request(`/api-soo/api/soo/salary/payslip/records/${recordId}/preview`, {
    method: 'GET',
  });
}

/**
 * 下载工资条
 */
export async function downloadPayslip(recordId: number) {
  return request(`/api-soo/api/soo/salary/payslip/records/${recordId}/download`, {
    method: 'GET',
    responseType: 'blob',
  });
}

// ===========================
// 数据验证 API
// ===========================

/**
 * 验证薪酬计算数据
 */
export async function validateCalculationData(taskId: string) {
  return request(`/api-soo/api/soo/salary/validate/${taskId}`, {
    method: 'POST',
  }).then(handleResponse);
}

/**
 * 检查基础数据完整性
 */
export async function checkDataIntegrity(params: {
  month: string;
  employeeIds?: number[];
}) {
  return request('/api-soo/api/soo/salary/data-integrity', {
    method: 'POST',
    data: params,
  });
}

// ===========================
// 辅助接口
// ===========================

/**
 * 获取员工列表（用于选择）
 */
export async function getEmployeeOptions(params: {
  departmentId?: number;
  keyword?: string;
  page?: number;
  size?: number;
}) {
  return request('/api-organization/api/organization/employees', {
    method: 'GET',
    params,
  });
}

/**
 * 获取部门列表（用于选择）
 */
export async function getDepartmentOptions() {
  return request('/api-organization/api/organization/departments/tree', {
    method: 'GET',
  }).then((response: any) => {
    console.log('部门列表API响应:', response);
    // 适配响应格式，支持 datas 和 data 两种格式
    if (response.resp_code === 0 || response.success) {
      const data = response.data || response.datas || [];
      return { success: true, data };
    } else {
      return {
        success: false,
        message: response.resp_msg || response.message || '获取部门列表失败',
      };
    }
  });
}

/**
 * 获取工资条模板列表
 */
export async function getPayslipTemplates() {
  return request('/api-soo/api/soo/salary/payslip/templates', {
    method: 'GET',
  });
}

/**
 * 获取薪酬配置信息
 */
export async function getSalaryConfig(employeeId: number) {
  return request(`/api-soo/api/soo/config/employee-salary/${employeeId}`, {
    method: 'GET',
  });
}

/**
 * 获取地区工资系数
 */
export async function getRegionalCoefficients() {
  return request('/api-soo/api/soo/config/regional-coefficients', {
    method: 'GET',
  });
}

/**
 * 获取社保公积金配置
 */
export async function getSocialSecurityConfig(region: string, year: number) {
  return request(`/api-soo/api/soo/config/social-security/${region}/${year}`, {
    method: 'GET',
  });
}

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
  executeSalaryCalculationTask,
  getSalaryCalculationTasks,
  getSalaryTaskDetail,
  getSalaryTaskProgress,
  getSalaryTaskStatistics,
  confirmSalaryTask,
  cancelSalaryTask,
  getPayrollResults,
  getPayrollDetail,
  recalculateEmployeeSalary,
  batchApprovePayroll,
  adjustPayrollResult,
  getCalculationLog,
  getSalarySummary,
  getDepartmentSalarySummary,
  getSalaryTrend,
  getSalaryDistribution,
  exportPayrollResults,
  generateBreakevenAnalysis,
  getBreakevenAnalysisList,
  getCostStructureAnalysis,
  
  // 工资条生成
  createPayslipTask,
  getPayslipTasks,
  executePayslipTask,
  getPayslipRecords,
  batchSendPayslips,
  previewPayslip,
  downloadPayslip,
  
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
  validateCalculationData,
  checkDataIntegrity,
  getEmployeeOptions,
  getDepartmentOptions,
  getPayslipTemplates,
  getSalaryConfig,
  getRegionalCoefficients,
  getSocialSecurityConfig,
  
  // 现有接口（保持兼容性）
  getDepartments: getDepartmentTree,
  getEmployees: getEmployeePage,
}; 
