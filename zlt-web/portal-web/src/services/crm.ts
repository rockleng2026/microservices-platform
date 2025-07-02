import { request } from "@/utils/request";

// 工具函数：处理长整型字段，防止精度丢失
const convertLongFields = (data: any): any => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(convertLongFields);
  }
  
  if (typeof data === 'object') {
    const converted = { ...data };
    
    // 需要转换的长整型字段
    const longFields = [
      'customerId', 'customer_id',
      'opportunityId', 'opportunity_id', 
      'followId', 'follow_id',
      'transferId', 'transfer_id',
      'employeeId', 'employee_id',
      'ownerEmployeeId', 'owner_employee_id',
      'fromEmployeeId', 'from_employee_id',
      'toEmployeeId', 'to_employee_id',
      'createdBy', 'created_by',
      'updatedBy', 'updated_by'
    ];
    
    longFields.forEach(field => {
      if (converted[field] && typeof converted[field] === 'string') {
        // 如果是字符串形式的数字，转换为数字
        const num = parseInt(converted[field], 10);
        if (!isNaN(num)) {
          converted[field] = num;
        }
      }
    });
    
    // 递归处理嵌套对象
    Object.keys(converted).forEach(key => {
      if (typeof converted[key] === 'object') {
        converted[key] = convertLongFields(converted[key]);
      }
    });
    
    return converted;
  }
  
  return data;
};

// 客户管理
export const getCustomerList = (params: any) =>
  request('/api-crm/api/customer/page', { 
    method: 'POST', 
    data: { 
      page: params.page || 1,
      size: params.size || 20,
      customerName: params.search,
      customerStatus: params.status,
      customerType: params.type,
      ownerEmployeeId: params.ownerEmployeeId,
      startDate: params.startDate,
      endDate: params.endDate
    } 
  }).then(convertLongFields);

export const getCustomerById = (customerId: number | string) =>
  request(`/api-crm/api/customer/${customerId}`, { method: 'GET' })
    .then(convertLongFields);

export const createCustomer = (data: any) =>
  request('/api-crm/api/customer', { method: 'POST', data: convertLongFields(data) });

export const updateCustomer = (customerId: number | string, data: any) =>
  request(`/api-crm/api/customer/${customerId}`, { method: 'PUT', data: convertLongFields(data) });

export const deleteCustomer = (customerId: number | string) =>
  request(`/api-crm/api/customer/${customerId}`, { method: 'DELETE' });

export const batchDeleteCustomers = (customerIds: (number | string)[]) =>
  request('/api-crm/api/customer/batch', { method: 'DELETE', data: customerIds });

// 客户验证接口
export const checkCustomerName = (customerName: string, customerId?: number | string) =>
  request('/api-crm/api/customer/check-name', { 
    method: 'POST', 
    data: { customerName, customerId: customerId ? convertLongFields({ customerId }).customerId : undefined } 
  });

export const checkPhone = (phone: string, customerId?: number | string) =>
  request('/api-crm/api/customer/check-phone', { 
    method: 'POST', 
    data: { phone, customerId: customerId ? convertLongFields({ customerId }).customerId : undefined } 
  });

export const checkEmail = (email: string, customerId?: number | string) =>
  request('/api-crm/api/customer/check-email', { 
    method: 'POST', 
    data: { email, customerId: customerId ? convertLongFields({ customerId }).customerId : undefined } 
  });

// 客户统计接口
export const getCustomerStatistics = (params: any) =>
  request('/api-crm/api/customer/statistics', { 
    method: 'POST', 
    data: {
      startDate: params.startDate,
      endDate: params.endDate,
      ownerEmployeeId: params.ownerEmployeeId
    }
  }).then(convertLongFields);

// 商机管理
export const getOpportunityList = (params: any) =>
  request('/api-crm/api/opportunity/page', { 
    method: 'POST', 
    data: {
      page: params.page || 1,
      size: params.size || 20,
      opportunityName: params.search,
      customerId: params.customerId,
      stage: params.stage,
      opportunitySource: params.source,
      ownerEmployeeId: params.ownerEmployeeId,
      startDate: params.startDate,
      endDate: params.endDate
    }
  }).then(convertLongFields);

export const getOpportunityById = (opportunityId: number | string) =>
  request(`/api-crm/api/opportunity/${opportunityId}`, { method: 'GET' })
    .then(convertLongFields);

export const createOpportunity = (data: any) =>
  request('/api-crm/api/opportunity', { method: 'POST', data: convertLongFields(data) });

export const updateOpportunity = (opportunityId: number | string, data: any) =>
  request(`/api-crm/api/opportunity/${opportunityId}`, { method: 'PUT', data: convertLongFields(data) });

export const deleteOpportunity = (opportunityId: number | string) =>
  request(`/api-crm/api/opportunity/${opportunityId}`, { method: 'DELETE' });

// 商机统计接口
export const getOpportunityFunnelStatistics = (params: any) =>
  request('/api-crm/api/opportunity/funnel-statistics', { 
    method: 'POST', 
    data: {
      startDate: params.startDate,
      endDate: params.endDate,
      ownerEmployeeId: params.ownerEmployeeId
    }
  }).then(convertLongFields);

export const getOpportunityWinStatistics = (params: any) =>
  request('/api-crm/api/opportunity/win-statistics', { 
    method: 'POST', 
    data: {
      startDate: params.startDate,
      endDate: params.endDate,
      ownerEmployeeId: params.ownerEmployeeId
    }
  }).then(convertLongFields);

// 跟进记录
export const getFollowRecords = (params: any) =>
  request('/api-crm/api/customer-follow/page', { 
    method: 'POST', 
    data: {
      page: params.page || 1,
      size: params.size || 20,
      customerId: params.customerId,
      employeeId: params.employeeId,
      followType: params.followType,
      stage: params.stage,
      startDate: params.startDate,
      endDate: params.endDate
    }
  }).then(convertLongFields);

export const getFollowRecordById = (followId: number | string) =>
  request(`/api-crm/api/customer-follow/${followId}`, { method: 'GET' })
    .then(convertLongFields);

export const createFollowRecord = (data: any) =>
  request('/api-crm/api/customer-follow', { method: 'POST', data: convertLongFields(data) });

export const updateFollowRecord = (followId: number | string, data: any) =>
  request(`/api-crm/api/customer-follow/${followId}`, { method: 'PUT', data: convertLongFields(data) });

export const deleteFollowRecord = (followId: number | string) =>
  request(`/api-crm/api/customer-follow/${followId}`, { method: 'DELETE' });

// 跟进统计接口
export const getFollowStatistics = (params: any) =>
  request('/api-crm/api/customer-follow/statistics', { 
    method: 'POST', 
    data: {
      employeeId: params.employeeId,
      startDate: params.startDate,
      endDate: params.endDate
    }
  }).then(convertLongFields);

export const getPendingFollowList = (params: any) =>
  request('/api-crm/api/customer-follow/pending', { 
    method: 'POST', 
    data: {
      employeeId: params.employeeId,
      days: params.days || 30
    }
  }).then(convertLongFields);

// 客户移交
export const getTransferRecords = (params: any) =>
  request('/api-crm/api/customer-transfer/page', { 
    method: 'POST', 
    data: {
      page: params.page || 1,
      size: params.size || 20,
      customerId: params.customerId,
      fromEmployeeId: params.fromEmployeeId,
      toEmployeeId: params.toEmployeeId,
      approvalStatus: params.status,
      startDate: params.startDate,
      endDate: params.endDate
    }
  }).then(convertLongFields);

export const getTransferRecordById = (transferId: number | string) =>
  request(`/api-crm/api/customer-transfer/${transferId}`, { method: 'GET' })
    .then(convertLongFields);

export const createTransferRequest = (data: any) =>
  request('/api-crm/api/customer-transfer', { method: 'POST', data: convertLongFields(data) });

export const approveTransfer = (transferId: number | string, data: any) =>
  request(`/api-crm/api/customer-transfer/${transferId}/approve`, { 
    method: 'PUT', 
    data: {
      approvalStatus: data.status,
      approvalNotes: data.notes,
      approverId: convertLongFields({ approverId: data.approverId }).approverId
    }
  });

export const getPendingApprovals = (approverId?: number | string) =>
  request('/api-crm/api/customer-transfer/pending-approvals', { 
    method: 'POST', 
    data: { approverId: approverId ? convertLongFields({ approverId }).approverId : undefined }
  }).then(convertLongFields);

// 工作台
export const getDashboardOverview = (params: any = {}) =>
  request('/api-crm/api/dashboard/overview', { 
    method: 'POST', 
    data: {
      startDate: params.startDate,
      endDate: params.endDate,
      ownerEmployeeId: params.ownerEmployeeId
    }
  }).then(convertLongFields);

export const getCustomerStats = (params: any = {}) =>
  request('/api-crm/api/dashboard/customer-stats', { 
    method: 'POST', 
    data: {
      startDate: params.startDate,
      endDate: params.endDate,
      ownerEmployeeId: params.ownerEmployeeId
    }
  }).then(convertLongFields);

export const getOpportunityStats = (params: any = {}) =>
  request('/api-crm/api/dashboard/opportunity-stats', { 
    method: 'POST', 
    data: {
      startDate: params.startDate,
      endDate: params.endDate,
      ownerEmployeeId: params.ownerEmployeeId
    }
  }).then(convertLongFields);

export const getSalesStats = (params: any = {}) =>
  request('/api-crm/api/dashboard/sales-stats', { 
    method: 'POST', 
    data: {
      startDate: params.startDate,
      endDate: params.endDate,
      ownerEmployeeId: params.ownerEmployeeId
    }
  }).then(convertLongFields);

// 员工相关接口 - 调用CRM服务提供的员工接口
export const getEmployeeList = (params: any = {}) =>
  request('/api-crm/api/employee/list', { 
    method: 'GET', 
    params: {
      page: params.page || 1,
      size: params.size || 100, // 加载更多员工用于选择
      search: params.search
    }
  }).then(convertLongFields);

export const getEmployeesByDepartment = (departmentId: number | string) =>
  request(`/api-crm/api/employee/department/${departmentId}`, { 
    method: 'GET' 
  }).then(convertLongFields);