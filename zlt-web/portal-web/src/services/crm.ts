import { request } from "@/utils/request";

// 客户管理
export const getCustomerList = (params: any) =>
  request('/api-crm/api/customer/list', { method: 'GET', params });

export const createCustomer = (data: any) =>
  request('/api-crm/api/customer', { method: 'POST', data });

export const updateCustomer = (customerId: number, data: any) =>
  request(`/api-crm/api/customer/${customerId}`, { method: 'PUT', data });

export const deleteCustomer = (customerId: number) =>
  request(`/api-crm/api/customer/${customerId}`, { method: 'DELETE' });

// 商机管理
export const getOpportunityList = (params: any) =>
  request('/api-crm/opportunity/list', { method: 'GET', params });

// 跟进记录
export const getFollowRecords = (params: any) =>
  request('/api-crm/follow/list', { method: 'GET', params });

// 客户移交
export const getTransferRecords = (params: any) =>
  request('/api-crm/transfer/list', { method: 'GET', params });

export const createTransferRequest = (data: any) =>
  request('/api-crm/transfer', { method: 'POST', data });

export const approveTransfer = (transferId: number, data: any) =>
  request(`/api-crm/transfer/${transferId}/approve`, { method: 'PUT', data });

// 工作台
export const getDashboardOverview = () =>
  request('/api-crm/dashboard/overview', { method: 'GET' });