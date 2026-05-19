/**
 * Logistics API Service - ADMIN-07
 * Endpoints for logistics tracking and express company management
 */
import { request } from '@/utils/request';

// ============= Express Company Types =============

// Express list params
export interface ExpressListParams {
  page?: number;
  pageSize?: number;
  status?: number | null;
  keyword?: string;
}

// Express DTO
export interface ExpressDTO {
  id?: number;
  name: string;        // 顺丰/中通/圆通
  code: string;        // SF/YT/YTO
  logo?: string;
  sort: number;
  status: number;
  createTime?: string;
}

// Express status constants
export const EXPRESS_STATUS = {
  DISABLED: 0,
  ENABLED: 1,
} as const;

// Express status options for filters
export const EXPRESS_STATUS_OPTIONS = [
  { label: '全部', value: -1 },
  { label: '已启用', value: EXPRESS_STATUS.ENABLED },
  { label: '已禁用', value: EXPRESS_STATUS.DISABLED },
];

// Express status text mapping
export const EXPRESS_STATUS_TEXT: Record<number, string> = {
  [EXPRESS_STATUS.ENABLED]: '已启用',
  [EXPRESS_STATUS.DISABLED]: '已禁用',
};

// ============= Logistics Tracking Types =============

// Single logistics trace record
export interface LogisticsTrace {
  time: string;        // Trace timestamp
  location: string;    // Location info
  description: string; // Trace description
}

// Logistics track DTO
export interface LogisticsTrackDTO {
  orderId: number;
  orderNo: string;
  waybillNo: string;
  expressCode: string;
  expressName: string;
  status: number;       // 0=pending, 1=in_transit, 2=delivered, 3=returned, 4=exception
  statusDesc: string;
  traces: LogisticsTrace[];
  lastUpdateTime: string;
}

// Logistics status constants
export const LOGISTICS_STATUS = {
  PENDING: 0,       // 待发货
  IN_TRANSIT: 1,    // 运输中
  DELIVERED: 2,     // 已签收
  RETURNED: 3,      // 退回了
  EXCEPTION: 4,     // 异常
} as const;

// Logistics status text mapping
export const LOGISTICS_STATUS_TEXT: Record<number, string> = {
  [LOGISTICS_STATUS.PENDING]: '待发货',
  [LOGISTICS_STATUS.IN_TRANSIT]: '运输中',
  [LOGISTICS_STATUS.DELIVERED]: '已签收',
  [LOGISTICS_STATUS.RETURNED]: '退回了',
  [LOGISTICS_STATUS.EXCEPTION]: '异常',
};

// Logistics status color mapping for UI
export const LOGISTICS_STATUS_COLORS: Record<number, string> = {
  [LOGISTICS_STATUS.PENDING]: 'default',
  [LOGISTICS_STATUS.IN_TRANSIT]: 'processing',
  [LOGISTICS_STATUS.DELIVERED]: 'success',
  [LOGISTICS_STATUS.RETURNED]: 'warning',
  [LOGISTICS_STATUS.EXCEPTION]: 'error',
};

// ============= API Response Types =============

// Page response wrapper
export interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}

// Generic API response
export interface ApiResponse<T> {
  code: number;
  msg?: string;
  datas?: T;
  data?: T;
}

// ============= Express Company API Functions =============

/**
 * Get paginated express company list
 * GET /api/mall/admin/express/list
 */
export async function getExpressList(params: ExpressListParams): Promise<PageResponse<ExpressDTO>> {
  const response = await request<ApiResponse<PageResponse<ExpressDTO>>>('/api/mall/admin/express/list', {
    method: 'GET',
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      status: params.status,
      keyword: params.keyword,
    },
  });
  return response.datas || { records: [], total: 0, size: 20, current: 1 };
}

/**
 * Create new express company
 * POST /api/mall/admin/express
 */
export async function createExpress(data: ExpressDTO): Promise<boolean> {
  const response = await request<ApiResponse<boolean>>('/api/mall/admin/express', {
    method: 'POST',
    data,
  });
  return response.datas || false;
}

/**
 * Update express company
 * PUT /api/mall/admin/express
 */
export async function updateExpress(data: ExpressDTO): Promise<boolean> {
  const response = await request<ApiResponse<boolean>>('/api/mall/admin/express', {
    method: 'PUT',
    data,
  });
  return response.datas || false;
}

/**
 * Delete express company
 * DELETE /api/mall/admin/express/{id}
 */
export async function deleteExpress(id: number): Promise<boolean> {
  const response = await request<ApiResponse<boolean>>(`/api/mall/admin/express/${id}`, {
    method: 'DELETE',
  });
  return response.datas || false;
}

/**
 * Update express company status (enable/disable)
 * PUT /api/mall/admin/express/{id}/status/{status}
 */
export async function updateExpressStatus(id: number, status: number): Promise<boolean> {
  const response = await request<ApiResponse<boolean>>(`/api/mall/admin/express/${id}/status/${status}`, {
    method: 'PUT',
  });
  return response.datas || false;
}

// ============= Logistics Tracking API Functions =============

/**
 * Get logistics tracking info by order ID
 * GET /api/mall/admin/logistics/tracking?orderId=xxx
 */
export async function getLogisticsTracking(orderId: number): Promise<LogisticsTrackDTO | null> {
  const response = await request<ApiResponse<LogisticsTrackDTO>>('/api/mall/admin/logistics/tracking', {
    method: 'GET',
    params: { orderId },
  });
  return response.datas || null;
}