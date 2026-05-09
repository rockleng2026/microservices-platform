/**
 * Banner API Service - ADMIN-10
 * Endpoints for banner management in admin panel
 */
import { request } from '@/utils/request';

// Banner DTO
export interface BannerDTO {
  id?: number;
  title: string;
  imageUrl: string;
  linkType: number;      // 1=goods, 2=external
  goodsId?: number;      // linkType=1
  externalUrl?: string;  // linkType=2
  sort?: number;
  status: number;        // 0=禁用, 1=启用
}

// API response with data wrapper
export interface ApiResponse<T> {
  code: number;
  msg?: string;
  datas?: T;
  data?: T;
}

/**
 * Get all banners (no pagination, max 5 enforced at service layer)
 */
export async function getBannerList(): Promise<BannerDTO[]> {
  const response = await request<ApiResponse<BannerDTO[]>>('/api/mall/admin/banner/list', {
    method: 'GET',
  });
  return response.datas || [];
}

/**
 * Create a new banner
 */
export async function createBanner(banner: Omit<BannerDTO, 'id'>): Promise<boolean> {
  const response = await request<ApiResponse<boolean>>('/api/mall/admin/banner', {
    method: 'POST',
    data: banner,
  });
  return response.datas || false;
}

/**
 * Update an existing banner
 */
export async function updateBanner(banner: BannerDTO): Promise<boolean> {
  const response = await request<ApiResponse<boolean>>('/api/mall/admin/banner', {
    method: 'PUT',
    data: banner,
  });
  return response.datas || false;
}

/**
 * Delete a banner by ID
 */
export async function deleteBanner(id: number): Promise<boolean> {
  const response = await request<ApiResponse<boolean>>(`/api/mall/admin/banner/${id}`, {
    method: 'DELETE',
  });
  return response.datas || false;
}

/**
 * Update single banner sort order (for drag-sort)
 */
export async function updateBannerSort(id: number, sort: number): Promise<boolean> {
  const response = await request<ApiResponse<boolean>>(`/api/mall/admin/banner/${id}/sort/${sort}`, {
    method: 'PUT',
  });
  return response.datas || false;
}

// Link type options
export const LINK_TYPE = {
  GOODS: 1,      // 商品详情页
  EXTERNAL: 2,   // 外部链接
} as const;

export const LINK_TYPE_TEXT: Record<number, string> = {
  [LINK_TYPE.GOODS]: '商品详情页',
  [LINK_TYPE.EXTERNAL]: '外部链接',
};

// Status options
export const STATUS = {
  DISABLED: 0,   // 禁用
  ENABLED: 1,    // 启用
} as const;

export const STATUS_TEXT: Record<number, string> = {
  [STATUS.DISABLED]: '禁用',
  [STATUS.ENABLED]: '启用',
};
