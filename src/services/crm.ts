import { request } from "@/utils/request";

// CRM枚举类定义 - 前端显示中文，传入后端使用英文
export const CRMEnums = {
  // 客户类型
  CustomerType: {
    INDIVIDUAL: { value: 'individual', label: '个人' },
    ENTERPRISE: { value: 'enterprise', label: '企业' },
  },
  
  // 客户状态
  CustomerStatus: {
    POTENTIAL: { value: 'potential', label: '意向' },
    CONFIRMED: { value: 'confirmed', label: '正式' },
    LOST: { value: 'lost', label: '流失' },
  },
  
  // 商机阶段
  OpportunityStage: {
    POTENTIAL: { value: 'potential', label: '潜在客户' },
    INITIAL_CONTACT: { value: 'initial_contact', label: '初步接触' },
    REQUIREMENT_CONFIRMED: { value: 'requirement_confirmed', label: '需求确认' },
    SOLUTION_DEMO: { value: 'solution_demo', label: '方案演示' },
    BUSINESS_NEGOTIATION: { value: 'business_negotiation', label: '商务谈判' },
    CONTRACT_SIGNED: { value: 'contract_signed', label: '合同签署' },
    WON: { value: 'won', label: '已成交' },
    LOST: { value: 'lost', label: '已失败' },
  },
  
  // 跟进方式
  FollowType: {
    PHONE: { value: 'phone', label: '电话' },
    VISIT: { value: 'visit', label: '拜访' },
    EMAIL: { value: 'email', label: '邮件' },
    WECHAT: { value: 'wechat', label: '微信' },
    OTHER: { value: 'other', label: '其他' },
  },
  
  // 审批状态
  ApprovalStatus: {
    PENDING: { value: 'pending', label: '待审批' },
    APPROVED: { value: 'approved', label: '已通过' },
    REJECTED: { value: 'rejected', label: '已拒绝' },
  },
  
  // 性别
  Gender: {
    MALE: { value: 'male', label: '男' },
    FEMALE: { value: 'female', label: '女' },
    UNKNOWN: { value: 'unknown', label: '未知' },
  },
  
  // 婚姻状况
  MaritalStatus: {
    SINGLE: { value: 'single', label: '未婚' },
    MARRIED: { value: 'married', label: '已婚' },
    DIVORCED: { value: 'divorced', label: '离异' },
    WIDOWED: { value: 'widowed', label: '丧偶' },
    UNKNOWN: { value: 'unknown', label: '未知' },
  },
  
  // 教育程度
  Education: {
    PRIMARY: { value: 'primary', label: '小学' },
    JUNIOR: { value: 'junior', label: '初中' },
    SENIOR: { value: 'senior', label: '高中' },
    COLLEGE: { value: 'college', label: '大专' },
    BACHELOR: { value: 'bachelor', label: '本科' },
    MASTER: { value: 'master', label: '硕士' },
    DOCTOR: { value: 'doctor', label: '博士' },
    OTHER: { value: 'other', label: '其他' },
  },
  
  // 企业性质
  CompanyNature: {
    STATE_OWNED: { value: 'state_owned', label: '国有企业' },
    PRIVATE: { value: 'private', label: '民营企业' },
    FOREIGN: { value: 'foreign', label: '外资企业' },
    JOINT_VENTURE: { value: 'joint_venture', label: '合资企业' },
    OTHER: { value: 'other', label: '其他' },
  },
};

// 枚举工具函数
export const EnumUtils = {
  // 根据value获取label
  getLabel: (enumObj: any, value: string): string => {
    const item = Object.values(enumObj).find((item: any) => item.value === value);
    return (item as any)?.label || value;
  },
  
  // 获取枚举选项数组
  getOptions: (enumObj: any): Array<{ value: string; label: string }> => {
    return Object.values(enumObj) as Array<{ value: string; label: string }>;
  },
  
  // 根据label获取value
  getValue: (enumObj: any, label: string): string => {
    const item = Object.values(enumObj).find((item: any) => item.label === label);
    return (item as any)?.value || label;
  },
};

// 转换长整型字段以避免精度丢失
const convertLongFields = (data: any): any => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => convertLongFields(item));
  }
  
  if (typeof data === 'object') {
    const converted = { ...data };
    // 转换可能的长整型字段
    if (converted.customerId) converted.customerId = String(converted.customerId);
    if (converted.ownerEmployeeId) converted.ownerEmployeeId = String(converted.ownerEmployeeId);
    if (converted.createdBy) converted.createdBy = String(converted.createdBy);
    if (converted.updatedBy) converted.updatedBy = String(converted.updatedBy);
    return converted;
  }
  
  return data;
};

// ==================== 客户管理相关API ====================

// 分页查询客户列表
export const getCustomerPage = (params: any) => {
  return request('/api-crm/customer/page', {
    method: 'POST',
    data: params,
  }).then(convertLongFields);
};

// 根据ID查询客户详情
export const getCustomerDetail = (customerId: string) => {
  return request(`/api-crm/customer/${customerId}`, {
    method: 'GET',
  }).then(convertLongFields);
};

// 创建客户
export const createCustomer = (data: any) => {
  return request('/api-crm/customer', {
    method: 'POST',
    data: convertLongFields(data),
  });
};

// 更新客户
export const updateCustomer = (data: any) => {
  return request('/api-crm/customer', {
    method: 'PUT',
    data: convertLongFields(data),
  });
};

// 删除客户
export const deleteCustomer = (customerId: string) => {
  return request(`/api-crm/customer/${customerId}`, {
    method: 'DELETE',
  });
};

// 批量删除客户
export const batchDeleteCustomers = (customerIds: string[]) => {
  return request('/api-crm/customer/batch', {
    method: 'DELETE',
    data: customerIds,
  });
};

// 商机管理相关API
export const getOpportunityList = (params: any) => {
  return request('/api-crm/opportunity/list', {
    method: 'GET',
    params,
  });
};

export const createOpportunity = (data: any) => {
  return request('/api-crm/opportunity', {
    method: 'POST',
    data,
  });
};

export const updateOpportunity = (opportunityId: number, data: any) => {
  return request(`/api-crm/opportunity/${opportunityId}`, {
    method: 'PUT',
    data,
  });
};

export const deleteOpportunity = (opportunityId: number) => {
  return request(`/api-crm/opportunity/${opportunityId}`, {
    method: 'DELETE',
  });
};

// 跟进记录相关API
export const getFollowRecordList = (params: any) => {
  return request('/api-crm/follow/list', {
    method: 'GET',
    params,
  });
};

export const createFollowRecord = (data: any) => {
  return request('/api-crm/follow', {
    method: 'POST',
    data,
  });
};

export const updateFollowRecord = (followId: number, data: any) => {
  return request(`/api-crm/follow/${followId}`, {
    method: 'PUT',
    data,
  });
};

export const deleteFollowRecord = (followId: number) => {
  return request(`/api-crm/follow/${followId}`, {
    method: 'DELETE',
  });
};

// 客户移交相关API
export const getTransferList = (params: any) => {
  return request('/api-crm/transfer/list', {
    method: 'GET',
    params,
  });
};

export const createTransfer = (data: any) => {
  return request('/api-crm/transfer', {
    method: 'POST',
    data,
  });
};

export const approveTransfer = (transferId: number, data: any) => {
  return request(`/api-crm/transfer/${transferId}/approve`, {
    method: 'PUT',
    data,
  });
};

export const rejectTransfer = (transferId: number, data: any) => {
  return request(`/api-crm/transfer/${transferId}/reject`, {
    method: 'PUT',
    data,
  });
};

// 工作台统计相关API
export const getDashboardStats = () => {
  return request('/api-crm/dashboard/stats', {
    method: 'GET',
  });
};

export const getCustomerStats = () => {
  return request('/api-crm/dashboard/customer-stats', {
    method: 'GET',
  });
};

export const getOpportunityStats = () => {
  return request('/api-crm/dashboard/opportunity-stats', {
    method: 'GET',
  });
};

export const getRecentActivities = () => {
  return request('/api-crm/dashboard/recent-activities', {
    method: 'GET',
  });
};