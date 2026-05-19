// @ts-ignore
/* eslint-disable */
/**
 * 优惠券管理 API 服务层
 * 基于 mall-center AdminCouponController
 *
 * 后端 API 前缀: /api-mall/admin/coupon
 * 代理配置需添加: '/api-mall/': { target: 'http://127.0.0.1:9210', changeOrigin: true }
 */

import { request } from 'umi';

// ==================== Types ====================

/** 优惠券模板状态 */
export type CouponStatus = 0 | 1 | 2;
/** 优惠券类型: 1=满减券, 2=折扣券 */
export type CouponType = 1 | 2;
/** 有效期类型: 1=固定时间, 2=领券后N天 */
export type ValidType = 1 | 2;

/** 优惠券模板 (MallCouponTemplate) */
export interface MallCouponTemplate {
  id: number;
  name: string;
  type: CouponType;
  faceValue: string;      // type=1: 减免金额（元）
  discountRate: string;   // type=2: 折扣率（8折=0.8）
  minAmount: string;
  maxDiscount: string;    // type=2时最高优惠
  totalCount: number;
  remainCount: number;
  perUserLimit: number;
  validType: ValidType;
  startTime: string;
  endTime: string;
  validDays: number;      // validType=2时有效
  status: CouponStatus;   // 0=下架, 1=发放中, 2=已过期
  createTime: string;
}

/** 创建/编辑优惠券请求参数 */
export interface CouponTemplateParams {
  name: string;
  type: CouponType;
  faceValue?: string;     // type=1 时必填
  discountRate?: string;  // type=2 时必填
  minAmount: string;
  maxDiscount?: string;   // type=2 时显示
  totalCount: number;
  perUserLimit: number;
  validType: ValidType;
  startTime?: string;     // validType=1 时必填
  endTime?: string;       // validType=1 时必填
  validDays?: number;    // validType=2 时必填
}

// ==================== API Methods ====================

/**
 * 获取优惠券模板列表
 * GET /api-mall/admin/coupon/template/list
 * 后端无分页，直接返回列表
 */
export async function getCouponTemplateList(status?: CouponStatus): Promise<MallCouponTemplate[]> {
  const params: Record<string, unknown> = {};
  if (status !== undefined) {
    params.status = status;
  }
  const response = await request<{ datas?: MallCouponTemplate[] }>('/api-mall/admin/coupon/template/list', {
    method: 'GET',
    params,
  });
  return response.datas || [];
}

/**
 * 创建优惠券模板
 * POST /api-mall/admin/coupon/template
 */
export async function createCouponTemplate(data: CouponTemplateParams): Promise<number> {
  const response = await request<{ datas?: number }>('/api-mall/admin/coupon/template', {
    method: 'POST',
    data,
  });
  return response.datas as number;
}

/**
 * 编辑优惠券模板
 * PUT /api-mall/admin/coupon/template/{id}
 */
export async function updateCouponTemplate(id: number, data: CouponTemplateParams): Promise<boolean> {
  const response = await request<{ datas?: boolean }>(`/api-mall/admin/coupon/template/${id}`, {
    method: 'PUT',
    data,
  });
  return response.datas as boolean;
}

/**
 * 发布优惠券（上线）
 * POST /api-mall/admin/coupon/template/{id}/publish
 */
export async function publishCoupon(id: number): Promise<boolean> {
  const response = await request<{ datas?: boolean }>(`/api-mall/admin/coupon/template/${id}/publish`, {
    method: 'POST',
  });
  return response.datas as boolean;
}

/**
 * 下架优惠券
 * POST /api-mall/admin/coupon/template/{id}/offline
 * 也用于提前失效
 */
export async function offlineCoupon(id: number): Promise<boolean> {
  const response = await request<{ datas?: boolean }>(`/api-mall/admin/coupon/template/${id}/offline`, {
    method: 'POST',
  });
  return response.datas as boolean;
}

/**
 * 删除优惠券模板
 * DELETE /api-mall/admin/coupon/template/{id}
 */
export async function deleteCoupon(id: number): Promise<boolean> {
  const response = await request<{ datas?: boolean }>(`/api-mall/admin/coupon/template/${id}`, {
    method: 'DELETE',
  });
  return response.datas as boolean;
}

/**
 * 向指定用户发放优惠券 (ADMIN-04-05)
 * POST /api-mall/admin/coupon/template/{id}/issue
 */
export async function issueCoupon(templateId: number, userId: number): Promise<number> {
  const response = await request<{ datas?: number }>(`/api-mall/admin/coupon/template/${templateId}/issue`, {
    method: 'POST',
    data: { userId },
  });
  return response.datas as number;
}

/** 优惠券统计结果 */
export interface CouponStatistics {
  totalCount: number;
  remainCount: number;
  issuedCount: number;
  usedCount: number;
  unusedCount: number;
  usageRate: string;
}

/**
 * 获取优惠券使用统计 (ADMIN-04-06)
 * GET /api-mall/admin/coupon/template/{id}/statistics
 */
export async function getCouponStatistics(templateId: number): Promise<CouponStatistics> {
  const response = await request<{ datas?: CouponStatistics }>(`/api-mall/admin/coupon/template/${templateId}/statistics`, {
    method: 'GET',
  });
  return response.datas as CouponStatistics;
}

/** 领取码生成结果 */
export interface ClaimCodeResult {
  claimCode: string;
  claimUrl: string;
  expireTime: string;
  expireDays: number;
}

/**
 * 生成限时领取码 (D-11)
 * GET /api-mall/admin/coupon/template/{id}/claim-code
 */
export async function generateClaimCode(templateId: number, expireDays: number = 7): Promise<ClaimCodeResult> {
  const response = await request<{ datas?: ClaimCodeResult }>(`/api-mall/admin/coupon/template/${templateId}/claim-code`, {
    method: 'GET',
    params: { expireDays },
  });
  return response.datas as ClaimCodeResult;
}