/**
 * 优惠券管理 API 服务层
 * 基于 mall-center AdminCouponController
 */
import { request } from '@/utils/request';

// API 常量
const API_BASE = '/api-mall/api/mall/admin/coupon';

/**
 * 优惠券模板 DTO
 */
export interface CouponTemplateDTO {
  id?: string;
  name: string;
  type: number;
  faceValue?: number;
  discountRate?: number;
  minAmount?: number;
  maxDiscount?: number;
  totalCount: number;
  remainCount: number;
  perUserLimit: number;
  validType: number;
  startTime?: string;
  endTime?: string;
  validDays?: number;
  status: number;
  createTime?: string;
}

/**
 * 优惠券统计结果
 */
export interface CouponStatistics {
  totalCount: number;
  remainCount: number;
  issuedCount: number;
  usedCount: number;
  unusedCount: number;
  usageRate: string;
}

/**
 * 领取码生成结果
 */
export interface ClaimCodeResult {
  claimCode: string;
  claimUrl: string;
  expireTime: string;
  expireDays: number;
}

/**
 * 获取优惠券模板列表
 */
export async function getCouponTemplateList(): Promise<CouponTemplateDTO[]> {
  const response = await request<{ datas?: CouponTemplateDTO[] }>(`${API_BASE}/template/list`, {
    method: 'GET',
  });
  return response.datas || [];
}

/**
 * 创建优惠券模板
 */
export async function createCouponTemplate(data: Partial<CouponTemplateDTO>): Promise<string> {
  const response = await request<{ datas?: string }>(`${API_BASE}/template`, {
    method: 'POST',
    data,
  });
  return response.datas || '';
}

/**
 * 更新优惠券模板
 */
export async function updateCouponTemplate(id: string, data: Partial<CouponTemplateDTO>): Promise<boolean> {
  const response = await request<{ datas?: boolean }>(`${API_BASE}/template/${id}`, {
    method: 'PUT',
    data,
  });
  return response.datas || false;
}

/**
 * 发布优惠券
 */
export async function publishCoupon(id: string): Promise<boolean> {
  const response = await request<{ datas?: boolean }>(`${API_BASE}/template/${id}/publish`, {
    method: 'POST',
  });
  return response.datas || false;
}

/**
 * 下架优惠券
 */
export async function offlineCoupon(id: string): Promise<boolean> {
  const response = await request<{ datas?: boolean }>(`${API_BASE}/template/${id}/offline`, {
    method: 'POST',
  });
  return response.datas || false;
}

/**
 * 向指定用户发放优惠券 (ADMIN-04-05)
 */
export async function issueCoupon(templateId: string, userId: number): Promise<number> {
  const response = await request<{ datas?: number }>(`${API_BASE}/template/${templateId}/issue`, {
    method: 'POST',
    data: { userId },
  });
  return response.datas as number;
}

/**
 * 获取优惠券使用统计 (ADMIN-04-06)
 */
export async function getCouponStatistics(templateId: string): Promise<CouponStatistics> {
  const response = await request<{ datas?: CouponStatistics }>(`${API_BASE}/template/${templateId}/statistics`, {
    method: 'GET',
  });
  return response.datas as CouponStatistics;
}

/**
 * 生成限时领取码 (D-11)
 */
export async function generateClaimCode(templateId: string, expireDays: number = 7): Promise<ClaimCodeResult> {
  const response = await request<{ datas?: ClaimCodeResult }>(`${API_BASE}/template/${templateId}/claim-code`, {
    method: 'GET',
    params: { expireDays },
  });
  return response.datas as ClaimCodeResult;
}

/**
 * 删除优惠券模板
 */
export async function deleteCouponTemplate(id: string): Promise<boolean> {
  const response = await request<{ datas?: boolean }>(`${API_BASE}/template/${id}`, {
    method: 'DELETE',
  });
  return response.datas || false;
}