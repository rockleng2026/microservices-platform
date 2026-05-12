/**
 * Member Address API Service - ADMIN-08
 * Address management for members in admin panel
 * Backend endpoint: /api-mall/api/mall/admin/member/{userId}/addresses
 */
import { request } from '@/utils/request';

// Address DTO - matches MallUserAddress entity
export interface MemberAddressDTO {
  id: number;
  userId: number;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: number;
  createTime: string;
  updateTime: string;
}

// Create/Update address params - matches MallUserAddress entity fields
export interface AddressParams {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault?: number;
}

export interface ApiResponse<T> {
  code: number;
  msg?: string;
  datas?: T;
  data?: T;
}

/**
 * Get addresses for a specific user
 * Endpoint: GET /api-mall/api/mall/admin/member/{userId}/addresses
 */
export async function getMemberAddresses(userId: number): Promise<MemberAddressDTO[]> {
  const response = await request<ApiResponse<MemberAddressDTO[]>>(
    `/api-mall/api/mall/admin/member/${userId}/addresses`,
    { method: 'GET' }
  );
  return response?.datas || response?.data || [];
}

/**
 * Create address for member
 * Endpoint: POST /api-mall/api/mall/admin/member/{userId}/address
 */
export async function createMemberAddress(userId: number, params: AddressParams): Promise<boolean> {
  const response = await request<ApiResponse<boolean>>(
    `/api-mall/api/mall/admin/member/${userId}/address`,
    {
      method: 'POST',
      data: params,
    }
  );
  return response?.datas || response?.data || false;
}

/**
 * Update member address
 * Endpoint: PUT /api-mall/api/mall/admin/member/address/{id}
 */
export async function updateMemberAddress(addressId: number, params: AddressParams): Promise<boolean> {
  const response = await request<ApiResponse<boolean>>(
    `/api-mall/api/mall/admin/member/address/${addressId}`,
    {
      method: 'PUT',
      data: params,
    }
  );
  return response?.datas || response?.data || false;
}

/**
 * Delete member address
 * Endpoint: DELETE /api-mall/api/mall/admin/member/address/{id}
 */
export async function deleteMemberAddress(addressId: number): Promise<boolean> {
  const response = await request<ApiResponse<boolean>>(
    `/api-mall/api/mall/admin/member/address/${addressId}`,
    { method: 'DELETE' }
  );
  return response?.datas || response?.data || false;
}