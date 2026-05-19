/**
 * 促销管理 API 服务 - ADMIN-05
 * 促销活动 CRUD + 会员积分管理
 */
import { request } from '@/utils/request';

// API 基础路径 - 通过网关访问 mall-center
const MALL_CENTER_API = '/api-mall';

// ===================== Promotion APIs =====================

/**
 * 获取促销活动列表（分页）
 */
export async function getPromotionList(params: {
  page?: number;
  pageSize?: number;
  status?: number | null; // 0=禁用, 1=启用, 2=已过期
  keyword?: string;
  startTime?: string;
  endTime?: string;
}): Promise<{ records: PromotionDTO[]; total: number; size: number; current: number }> {
  const response = await request(`${MALL_CENTER_API}/api/mall/admin/promotions`, {
    method: 'GET',
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      status: params.status,
      keyword: params.keyword,
      startTime: params.startTime,
      endTime: params.endTime,
    },
  });
  // 兼容多种响应格式
  const data = response?.datas || response?.data || response;
  return {
    records: data?.records || data || [],
    total: data?.total || 0,
    size: data?.size || 20,
    current: data?.current || 1,
  };
}

/**
 * 创建促销活动
 */
export async function createPromotion(data: Partial<PromotionDTO>): Promise<void> {
  await request(`${MALL_CENTER_API}/api/mall/admin/promotions`, {
    method: 'POST',
    data,
  });
}

/**
 * 更新促销活动
 */
export async function updatePromotion(id: number, data: Partial<PromotionDTO>): Promise<void> {
  await request(`${MALL_CENTER_API}/api/mall/admin/promotions/${id}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 删除促销活动
 */
export async function deletePromotion(id: number): Promise<void> {
  await request(`${MALL_CENTER_API}/api/mall/admin/promotions/${id}`, {
    method: 'DELETE',
  });
}

/**
 * 启用/禁用促销活动
 */
export async function togglePromotion(id: number, enabled: boolean): Promise<void> {
  await request(`${MALL_CENTER_API}/api/mall/admin/promotions/${id}/toggle`, {
    method: 'PUT',
    data: { enabled },
  });
}

// ===================== Points APIs =====================

/**
 * 获取积分规则
 */
export async function getPointsRules(): Promise<PointsRuleDTO[]> {
  const response = await request(`${MALL_CENTER_API}/api/mall/member/points-rules`, {
    method: 'GET',
  });
  // 兼容多种响应格式
  const data = response?.datas || response?.data || response;
  return Array.isArray(data) ? data : [];
}

/**
 * 调整会员积分
 */
export async function adjustPoints(userId: number, points: number, reason: string): Promise<void> {
  await request(`${MALL_CENTER_API}/api/mall/admin/member/${userId}/points?remark=${encodeURIComponent(reason)}`, {
    method: 'PUT',
    data: points,
  });
}

/**
 * 获取会员积分余额
 */
export async function getMemberPoints(userId: number): Promise<number> {
  const response = await request(`${MALL_CENTER_API}/api/mall/member/points/${userId}`, {
    method: 'GET',
  });
  return response?.datas || response?.balance || response || 0;
}

// ===================== Types =====================

/**
 * 促销活动状态枚举
 */
export enum PromotionStatus {
  DISABLED = 0,   // 禁用
  ENABLED = 1,    // 启用
  EXPIRED = 2,     // 已过期
}

/**
 * 促销活动类型枚举
 */
export enum PromotionType {
  DISCOUNT = 1,   // 折扣
  GIFT = 2,       // 赠品
  BUNDLE = 3,     // 套餐
}

/**
 * 促销活动 DTO
 */
export interface PromotionDTO {
  id?: number;
  name: string;              // 活动名称
  type: PromotionType;       // 活动类型
  startTime: string;         // 开始时间
  endTime: string;           // 结束时间
  status: PromotionStatus;   // 状态
  rules?: string;            // 规则配置 (JSON)
  goodsScope?: string;       // 适用商品范围 (JSON)
  discountRate?: number;      // 折扣率 (type=DISCOUNT 时)
  giftId?: number;           // 赠品ID (type=GIFT 时)
  bundleIds?: number[];      // 套餐商品ID列表 (type=BUNDLE 时)
  createTime?: string;
  updateTime?: string;
}

/**
 * 积分规则 DTO
 */
export interface PointsRuleDTO {
  id?: number;
  name: string;              // 规则名称
  pointsType: number;        // 积分类型: 1=购物, 2=签到, 3=活动
  pointsValue: number;       // 积分值
  condition: string;         // 触发条件
  status: number;            // 状态: 0=禁用, 1=启用
}

/**
 * 会员积分调整请求
 */
export interface PointsAdjustDTO {
  userId: number;
  points: number;            // 正数=增加, 负数=减少
  reason: string;
}

// 类型文本映射
export const PROMOTION_TYPE_TEXT: Record<number, string> = {
  [PromotionType.DISCOUNT]: '折扣',
  [PromotionType.GIFT]: '赠品',
  [PromotionType.BUNDLE]: '套餐',
};

export const PROMOTION_STATUS_TEXT: Record<number, string> = {
  [PromotionStatus.DISABLED]: '禁用',
  [PromotionStatus.ENABLED]: '启用',
  [PromotionStatus.EXPIRED]: '已过期',
};

export const PROMOTION_STATUS_COLOR: Record<number, string> = {
  [PromotionStatus.DISABLED]: 'default',
  [PromotionStatus.ENABLED]: 'success',
  [PromotionStatus.EXPIRED]: 'error',
};