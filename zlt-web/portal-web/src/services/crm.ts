import { request } from '@/utils/request';

/**
 * CRM客户关系管理系统 API
 */

// 获取客户列表
export async function getCustomerList(params?: any) {
  return request('/api-crm/customers', {
    method: 'GET',
    params,
  });
}

// 创建客户
export async function createCustomer(data: any) {
  return request('/api-crm/customers', {
    method: 'POST',
    data,
  });
}

// 获取工作台数据
export async function getDashboardOverview() {
  return request('/api-crm/dashboard/overview', {
    method: 'GET',
  });
}
