import { request } from '@/utils/request';

export async function getAccrualConfig(projectId: number) {
  return request(`/api-project/api/v2/project/${projectId}/accrual-config`);
}

export async function saveAccrualConfig(projectId: number, configs: any[]) {
  return request(`/api-project/api/v2/project/${projectId}/accrual-config`, { method: 'POST', data: configs });
}

export async function getAccrualDetail(projectId: number) {
  return request(`/api-project/api/v2/project/${projectId}/accrual-detail`);
}

export async function saveAccrualDetail(projectId: number, details: any[]) {
  return request(`/api-project/api/v2/project/${projectId}/accrual-detail`, { method: 'POST', data: details });
}

export async function autoCalcAccrualDetail(projectId: number, params: any) {
  return request(`/api-project/api/v2/project/${projectId}/accrual-calc`, { method: 'POST', data: params });
} 