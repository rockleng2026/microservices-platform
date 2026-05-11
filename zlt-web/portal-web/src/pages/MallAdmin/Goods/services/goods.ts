/**
 * 商品管理 API 服务层
 * 基于 AdminGoodsController 后端接口实现
 */
import { request } from '@/utils/request';

// API 常量 - 通过网关访问 (网关StripPrefix=1去掉/api-mall,需要保留完整路径)
const API_BASE = '/api-mall/api/mall/admin/goods';

/**
 * 商品列表项 DTO
 */
export interface AdminGoodsDTO {
  id: number;
  categoryId: number;
  name: string;
  subTitle?: string;
  mainImage?: string;
  images?: string;        // JSON array string: "[\"url1\",\"url2\"]"
  detail?: string;
  price: number | string;
  goodsType: number;     // 1=实物, 2=虚拟
  virtualUrl?: string;
  virtualFileId?: number;
  virtualExpire?: string;
  skus?: SkuDTO[];
  status: number;        // 0=下架, 1=上架
  sort?: number;
  stock?: number;        // 库存数量
  sales?: number;        // 已售数量
  createTime?: string;
}

/**
 * SKU 规格 DTO
 */
export interface SkuDTO {
  id?: number;
  skuCode?: string;
  specs: string;         // JSON: "{\"颜色\":\"红色\",\"尺寸\":\"XL\"}"
  price: number | string;
  stock: number;
  image?: string;
  status?: number;       // 0=下架, 1=上架
}

/**
 * 商品分页响应
 */
export interface GoodsPageResponse {
  records: AdminGoodsDTO[];
  total: number;
  size: number;
  current: number;
}

// 商品类型枚举
export const GOODS_TYPE = {
  PHYSICAL: 1,
  VIRTUAL: 2,
} as const;

export const GOODS_TYPE_TEXT: Record<number, string> = {
  [GOODS_TYPE.PHYSICAL]: '实物',
  [GOODS_TYPE.VIRTUAL]: '虚拟',
};

// 商品状态枚举
export const GOODS_STATUS = {
  OFFLINE: 0,
  ONLINE: 1,
} as const;

export const GOODS_STATUS_TEXT: Record<number, string> = {
  [GOODS_STATUS.OFFLINE]: '下架',
  [GOODS_STATUS.ONLINE]: '上架',
};

/**
 * 获取商品分页列表
 * @param params page, pageSize, keyword?, categoryId?, status?, goodsType?
 */
export async function getGoodsList(params: {
  page?: number;
  pageSize?: number;
  keyword?: string;
  categoryId?: number;
  status?: number;
  goodsType?: number;
}): Promise<GoodsPageResponse> {
  const response = await request<{ datas?: GoodsPageResponse }>(`${API_BASE}/list`, {
    method: 'GET',
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      keyword: params.keyword,
      categoryId: params.categoryId,
      status: params.status,
      goodsType: params.goodsType,
    },
  });
  return response.datas || { records: [], total: 0, size: 20, current: 1 };
}

/**
 * 获取商品详情（含 SKUs）
 * @param id 商品 ID
 */
export async function getGoodsDetail(id: number): Promise<AdminGoodsDTO> {
  const response = await request<{ datas?: AdminGoodsDTO }>(`${API_BASE}/${id}`, {
    method: 'GET',
  });
  return response.datas!;
}

/**
 * 获取商品详情（detail 接口）
 * @param id 商品 ID
 */
export async function getGoodsByDetail(id: number): Promise<AdminGoodsDTO> {
  const response = await request<{ datas?: AdminGoodsDTO }>(`${API_BASE}/detail/${id}`, {
    method: 'GET',
  });
  return response.datas!;
}

/**
 * 创建商品（发布）
 * @param goods 商品数据
 */
export async function createGoods(goods: Partial<AdminGoodsDTO>): Promise<boolean> {
  const response = await request<{ datas?: boolean }>(`${API_BASE}`, {
    method: 'POST',
    data: goods,
  });
  return response.datas || false;
}

/**
 * 更新商品
 * @param goods 商品数据（需包含 id）
 */
export async function updateGoods(goods: Partial<AdminGoodsDTO>): Promise<boolean> {
  const response = await request<{ datas?: boolean }>(`${API_BASE}`, {
    method: 'PUT',
    data: goods,
  });
  return response.datas || false;
}

/**
 * 删除商品（软删除）
 * @param id 商品 ID
 */
export async function deleteGoods(id: number): Promise<boolean> {
  const response = await request<{ datas?: boolean }>(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  return response.datas || false;
}

/**
 * 批量更新商品状态
 * @param goodsIds 商品 ID 数组
 * @param status 目标状态 0=下架, 1=上架
 */
export async function batchUpdateStatus(goodsIds: number[], status: number): Promise<boolean> {
  const response = await request<{ datas?: boolean }>(`${API_BASE}/batch/status`, {
    method: 'PUT',
    data: { goodsIds, status },
  });
  return response.datas || false;
}

/**
 * 更新单个商品状态
 * @param id 商品 ID
 * @param status 目标状态 0=下架, 1=上架
 */
export async function updateGoodsStatus(id: number, status: number): Promise<boolean> {
  const response = await request<{ datas?: boolean }>(`${API_BASE}/${id}/status/${status}`, {
    method: 'PUT',
  });
  return response.datas || false;
}