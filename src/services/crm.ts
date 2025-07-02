import { request } from "@/utils/request";

// 客户管理相关API
export const getCustomerList = (params: any) => {
  return request('/api-crm/customer/list', {
    method: 'GET',
    params,
  });
};

export const createCustomer = (data: any) => {
  return request('/api-crm/customer', {
    method: 'POST',
    data,
  });
};

export const updateCustomer = (customerId: number, data: any) => {
  return request(`/api-crm/customer/${customerId}`, {
    method: 'PUT',
    data,
  });
};

export const deleteCustomer = (customerId: number) => {
  return request(`/api-crm/customer/${customerId}`, {
    method: 'DELETE',
  });
};

export const getCustomerDetail = (customerId: number) => {
  return request(`/api-crm/customer/${customerId}`, {
    method: 'GET',
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