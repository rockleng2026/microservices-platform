import { API_BASE, GOODS_LIST, GOODS_DETAIL, EVALUATE_LIST, TENANT_ID } from '@/config/api'
import type { MallGoods } from './home'

export interface GoodsListParams {
  page?: number
  pageSize?: number
  categoryId?: number
  keyword?: string
  sortField?: string
  sortOrder?: string
}

export interface GoodsDetailResponse {
  id: number
  name: string
  subTitle?: string
  mainImage: string
  images: string[]
  detail: string
  price: number
  sales: number
  status: number
  goodsType: number
  categoryId: number
  categoryName?: string
  skus?: MallGoodsSku[]
}

export interface MallGoodsSku {
  id: number
  goodsId: number
  specs: string
  price: number
  stock: number
  status: number
}

export interface EvaluateDTO {
  id: number
  orderId: number
  star: number
  content: string
  images: string[]
  userNickname: string
  createTime: string
}

export interface EvaluateListResponse {
  datas: EvaluateDTO[]
  pageNum: number
  pageSize: number
  total: number
}

// Request wrapper
const request = <T>(url: string, options?: any): Promise<T> => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${url}`,
      ...options,
      header: {
        ...options?.header,
        'x-tenant-header': TENANT_ID
      },
      success: (res: any) => {
        if (res.statusCode === 200) {
          resolve(res.data.datas || res.data.data || res.data)
        } else {
          reject(res)
        }
      },
      fail: reject
    })
  })
}

// Get goods list
export const getGoodsList = (params: GoodsListParams): Promise<{ datas: MallGoods[], pageNum: number, pageSize: number, total: number }> => {
  const parts: string[] = []
  if (params.page) parts.push(`page=${params.page}`)
  if (params.pageSize) parts.push(`pageSize=${params.pageSize}`)
  if (params.categoryId) parts.push(`categoryId=${params.categoryId}`)
  if (params.keyword) parts.push(`keyword=${encodeURIComponent(params.keyword)}`)
  if (params.sortField) parts.push(`sortField=${params.sortField}`)
  if (params.sortOrder) parts.push(`sortOrder=${params.sortOrder}`)

  const query = parts.length > 0 ? '?' + parts.join('&') : ''
  return request<any>(`${GOODS_LIST}${query}`, { method: 'GET' })
}

// Get goods detail
export const getGoodsDetail = (id: number): Promise<GoodsDetailResponse> => {
  return request<GoodsDetailResponse>(`${GOODS_DETAIL}/${id}`, { method: 'GET' })
}

// Get evaluate list
export const getEvaluateList = (goodsId: number, page = 1, pageSize = 5): Promise<EvaluateListResponse> => {
  return request<EvaluateListResponse>(`${EVALUATE_LIST}/${goodsId}?page=${page}&pageSize=${pageSize}`, { method: 'GET' })
}

// Get goods evaluations with object params (per Task 6)
export const getGoodsEvaluates = (goodsId: number, params: { page?: number; pageSize?: number } = {}): Promise<EvaluateListResponse> => {
  const page = params.page || 1
  const pageSize = params.pageSize || 5
  return request<EvaluateListResponse>(`${EVALUATE_LIST}/${goodsId}?page=${page}&pageSize=${pageSize}`, { method: 'GET' })
}