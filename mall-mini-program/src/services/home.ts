import { API_BASE, BANNER_LIST, CATEGORIES, HOT_GOODS } from '@/config/api'

export interface BannerDTO {
  id: number
  title: string
  imageUrl: string
  linkType: 1 | 2
  goodsId?: number
  externalUrl?: string
  sort: number
}

export interface Category {
  id: number
  name: string
  icon: string
  parentId: number
  children?: Category[]
}

export interface MallGoods {
  id: number
  name: string
  mainImage: string
  price: number
  sales: number
}

export interface GoodsListResponse {
  datas: MallGoods[]
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
        'x-tenant-header': 'default',
        ...options?.header
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

// Get banner list
export const getBannerList = (): Promise<BannerDTO[]> => {
  return request<BannerDTO[]>(BANNER_LIST, { method: 'GET' })
}

// Get categories
export const getCategories = (): Promise<Category[]> => {
  return request<Category[]>(CATEGORIES, { method: 'GET' })
}

// Get hot goods
export const getHotGoods = (limit = 10): Promise<MallGoods[]> => {
  return request<MallGoods[]>(`${HOT_GOODS}?limit=${limit}`, { method: 'GET' })
}