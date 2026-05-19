/**
 * Member API Service - ADMIN-08
 * Endpoints for member/user management in admin panel
 */
import { request } from '@/utils/request';
import { API_BASE_URL } from '@/config/api';

// Member list params
export interface MemberListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;      // user ID or name
  status?: number | null;
  startTime?: string;
  endTime?: string;
}

// Member DTO
export interface MemberDTO {
  id: number;
  userId: number;
  nickname: string;
  phone: string;
  email?: string;
  avatar?: string;
  gender: number;        // 0=unknown, 1=male, 2=female
  genderDesc: string;
  birthday?: string;
  level: number;         // 会员等级
  levelName: string;
  points: number;        // 积分
  totalOrders: number;   // 累计订单
  totalAmount: string;   // 累计消费
  lastLoginTime: string;
  createTime: string;
  status: number;        // 1=normal, 0=disabled
}

// User statistics DTO (ADMIN-08-04)
export interface UserStatisticsDTO {
  totalUsers: number;
  newUsersToday: number;
  activeUsers: number;
  totalOrders: number;
  totalAmount: string;
}

// API response with pagination
export interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}

export interface ApiResponse<T> {
  code: number;
  msg?: string;
  datas?: T;
  data?: T;
}

/**
 * Get paginated member list with filters
 */
export async function getMemberList(params: MemberListParams): Promise<PageResponse<MemberDTO>> {
  const response = await request<ApiResponse<PageResponse<MemberDTO>>>(
    `${API_BASE_URL}/api/mall/admin/member/list`,
    {
      method: 'GET',
      params: {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        keyword: params.keyword,
        status: params.status,
        startTime: params.startTime,
        endTime: params.endTime,
      },
    }
  );
  if (!response.datas) {
    return { records: [], total: 0, size: 20, current: 1 };
  }
  return response.datas;
}

/**
 * Get member detail by ID
 * Returns null if member not found or on error
 */
export async function getMemberDetail(id: number): Promise<MemberDTO | null> {
  try {
    const response = await request<ApiResponse<MemberDTO>>(
      `${API_BASE_URL}/api/mall/admin/member/${id}`,
      {
        method: 'GET',
      }
    );
    return response.datas || null;
  } catch (error) {
    console.error('Failed to get member detail:', error);
    return null;
  }
}

/**
 * Get user/member statistics (ADMIN-08-04)
 * Returns default values if statistics API fails
 */
export async function getMemberStatistics(): Promise<UserStatisticsDTO> {
  try {
    const response = await request<ApiResponse<UserStatisticsDTO>>(
      `${API_BASE_URL}/api/mall/admin/member/statistics`,
      {
        method: 'GET',
      }
    );
    return response.datas || {
      totalUsers: 0,
      newUsersToday: 0,
      activeUsers: 0,
      totalOrders: 0,
      totalAmount: '0',
    };
  } catch (error) {
    console.error('Failed to get member statistics:', error);
    return {
      totalUsers: 0,
      newUsersToday: 0,
      activeUsers: 0,
      totalOrders: 0,
      totalAmount: '0',
    };
  }
}

/**
 * Update member status (enable/disable)
 */
export async function updateMemberStatus(id: number, status: number): Promise<boolean> {
  const response = await request<ApiResponse<boolean>>(
    `${API_BASE_URL}/api/mall/admin/member/${id}/status`,
    {
      method: 'PUT',
      data: { status },
    }
  );
  return response.datas || false;
}

// Gender options
export const GENDER_OPTIONS = [
  { label: '未知', value: 0 },
  { label: '男', value: 1 },
  { label: '女', value: 2 },
];

// Status tag color mapping
export const STATUS_COLORS: Record<number, string> = {
  1: 'success',
  0: 'error',
};

// Status text mapping
export const STATUS_TEXT: Record<number, string> = {
  1: '正常',
  0: '已禁用',
};
