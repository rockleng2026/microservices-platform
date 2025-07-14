import { request } from '@/utils/request';
import { getApiUrl } from '@/config/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
}

export async function getAccountList(params: any) {
  return request<ApiResponse<any>>(getApiUrl('/users/account/page', 'PORTAL'), {
    method: 'GET',
    params,
  });
}

export async function createAccount(data: any) {
  return request<ApiResponse<any>>(getApiUrl('/users/account/create', 'PORTAL'), {
    method: 'POST',
    data,
  });
}

export async function updateAccount(id: number, data: any) {
  return request<ApiResponse<any>>(getApiUrl(`/users/account/${id}`, 'PORTAL'), {
    method: 'PUT',
    data,
  });
}

export async function disableAccount(id: number) {
  return request<ApiResponse<any>>(getApiUrl(`/users/account/${id}/disable`, 'PORTAL'), {
    method: 'POST',
  });
}

export async function enableAccount(id: number) {
  return request<ApiResponse<any>>(getApiUrl(`/users/account/${id}/enable`, 'PORTAL'), {
    method: 'POST',
  });
}

export async function cancelAccount(id: number) {
  return request<ApiResponse<any>>(getApiUrl(`/users/account/${id}/cancel`, 'PORTAL'), {
    method: 'POST',
  });
}

export async function resetPassword(id: number, newPassword: string) {
  return request<ApiResponse<any>>(getApiUrl(`/users/account/${id}/reset-password`, 'PORTAL'), {
    method: 'POST',
    data: { newPassword },
  });
}

export async function batchCancelAccount(ids: string[]) {
  return request<ApiResponse<any>>(getApiUrl('/users/account/batch-cancel', 'PORTAL'), {
    method: 'POST',
    data: ids,
  });
} 