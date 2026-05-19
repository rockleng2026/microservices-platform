/**
 * Refund API Service - ADMIN-06
 * Endpoints for refund audit management in admin panel
 */
import { request } from '@/utils/request';
import { API_BASE_URL } from '@/config/api';

// Refund API base path (proxied to mall-center backend)
const API_BASE = `${API_BASE_URL}/api/mall/admin/refund`;

// Refund status constants (per ADMIN-06-01)
export const REFUND_STATUS = {
  PENDING: 1,      // 待审核
  APPROVED: 2,      // 已通过
  REJECTED: 3,      // 已拒绝
  COMPLETED: 4,     // 已退款
} as const;

export const REFUND_STATUS_TEXT: Record<number, string> = {
  [REFUND_STATUS.PENDING]: '待审核',
  [REFUND_STATUS.APPROVED]: '已通过',
  [REFUND_STATUS.REJECTED]: '已拒绝',
  [REFUND_STATUS.COMPLETED]: '已退款',
};

// Refund list params
export interface RefundListParams {
  page?: number;
  pageSize?: number;
  orderId?: number;
  status?: number | null;
  startTime?: string;
  endTime?: string;
}

// Refund list item DTO
export interface RefundListDTO {
  id: number;
  orderId: number;
  orderNo: string;
  userId: number;
  userName: string;
  refundAmount: string;
  refundReason: string;
  refundDesc: string;
  status: number;
  statusDesc: string;
  applyTime: string;
  handleTime?: string;
  handleRemark?: string;
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
 * Get paginated refund list with filters
 * GET /api/mall/admin/refund/list
 */
export async function getRefundList(params: RefundListParams): Promise<PageResponse<RefundListDTO>> {
  const response = await request<ApiResponse<PageResponse<RefundListDTO>>>(`${API_BASE}/list`, {
    method: 'GET',
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      orderId: params.orderId,
      status: params.status,
      startTime: params.startTime,
      endTime: params.endTime,
    },
  });
  return response.datas || { records: [], total: 0, size: 20, current: 1 };
}

/**
 * Approve refund and trigger refund process
 * POST /api/mall/admin/refund/{id}/approve?remark=xxx
 */
export async function approveRefund(id: number, remark?: string): Promise<boolean> {
  const response = await request<ApiResponse<boolean>>(`${API_BASE}/${id}/approve`, {
    method: 'POST',
    params: {
      remark: remark || '',
    },
  });
  return response.datas || false;
}

/**
 * Reject refund application
 * POST /api/mall/admin/refund/{id}/reject?remark=xxx
 */
export async function rejectRefund(id: number, remark?: string): Promise<boolean> {
  const response = await request<ApiResponse<boolean>>(`${API_BASE}/${id}/reject`, {
    method: 'POST',
    params: {
      remark: remark || '',
    },
  });
  return response.datas || false;
}