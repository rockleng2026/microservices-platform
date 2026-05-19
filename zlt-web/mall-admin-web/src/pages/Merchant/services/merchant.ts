/**
 * 商户管理 API 服务层
 * 基于 AdminMerchantController 后端接口实现
 */
import { request } from '@/utils/request';
import type { ApiResponse } from '../Orders/services/orders';

// API 常量
const API_BASE = '/api/mall/admin/merchant';

// 商户状态枚举
export const MERCHANT_STATUS = {
  PENDING_REVIEW: 0,   // 待审核
  APPROVED: 1,         // 已通过
  REJECTED: 2,         // 已拒绝
  DISABLED: 3,         // 已禁用
} as const;

export const MERCHANT_STATUS_TEXT: Record<number, string> = {
  [MERCHANT_STATUS.PENDING_REVIEW]: '待审核',
  [MERCHANT_STATUS.APPROVED]: '已通过',
  [MERCHANT_STATUS.REJECTED]: '已拒绝',
  [MERCHANT_STATUS.DISABLED]: '已禁用',
};

/**
 * 商户 DTO
 */
export interface MerchantDTO {
  id: number;
  merchantName: string;
  merchantCode: string;       // 商户编码
  contactName: string;
  contactPhone: string;
  contactEmail?: string;
  businessLicense?: string;   // 营业执照
  status: number;
  statusDesc: string;
  rejectReason?: string;      // 拒绝原因
  reviewTime?: string;
  createTime: string;
  updateTime?: string;
}

/**
 * 商户列表查询参数
 */
export interface MerchantListParams {
  page?: number;
  pageSize?: number;
  status?: number | null;     // 商户状态筛选
  keyword?: string;           // 商户名称或编码关键字
}

/**
 * 商户审核 DTO
 */
export interface MerchantReviewDTO {
  status: number;             // 1=通过, 2=拒绝
  rejectReason?: string;      // 拒绝原因，审核拒绝时必填
}

// API response with pagination
export interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}

/**
 * 获取商户分页列表
 * @param params page, pageSize, status?, keyword?
 */
export async function getMerchantList(params: MerchantListParams): Promise<PageResponse<MerchantDTO>> {
  const response = await request<ApiResponse<PageResponse<MerchantDTO>>>(`${API_BASE}/list`, {
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
 * 获取商户详情
 * @param id 商户 ID
 */
export async function getMerchantDetail(id: number): Promise<MerchantDTO | null> {
  try {
    const response = await request<ApiResponse<MerchantDTO>>(`${API_BASE}/${id}`, {
      method: 'GET',
    });
    return response.datas || null;
  } catch (error) {
    console.error('Failed to fetch merchant detail:', error);
    return null;
  }
}

/**
 * 审核商户（通过/拒绝）
 * @param id 商户 ID
 * @param data 审核数据 { status: 1|2, rejectReason?: string }
 */
export async function reviewMerchant(id: number, data: MerchantReviewDTO): Promise<boolean> {
  const response = await request<ApiResponse<boolean>>(`${API_BASE}/review/${id}`, {
    method: 'POST',
    data,
  });
  return response.datas || false;
}
