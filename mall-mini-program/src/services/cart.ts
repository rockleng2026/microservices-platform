import { API_BASE, CART_API, CART_SYNC_API, TENANT_ID } from '@/config/api'
import type { CartItem } from '@/stores/cart'

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
          resolve(res.data)
        } else {
          reject(res)
        }
      },
      fail: reject
    })
  })
}

// Get cart list from server (with full goods details)
export const getCartList = (userId: string): Promise<CartItem[]> => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${CART_API}/list`,
      method: 'GET',
      header: { 'x-tenant-header': TENANT_ID, 'x-user-id': userId },
      success: (res: any) => {
        if (res.statusCode === 200 && res.data.datas) {
          const items: any[] = res.data.datas || []
          // Map backend field names to CartItem interface
          const mapped = items.map((item: any) => ({
            skuId: item.skuId,
            quantity: item.quantity,
            goodsName: item.goodsName,
            goodsImage: item.mainImage,
            price: item.skuPrice,
            specs: item.skuSpecs
          }))
          resolve(mapped)
        } else {
          resolve([])
        }
      },
      fail: (err) => {
        console.warn('getCartList failed, using local cache', err)
        resolve([])
      }
    })
  })
}

// Sync local cart items to server
export const syncCartToServer = (items: CartItem[], userId: string): Promise<void> => {
  return request<void>(CART_SYNC_API, {
    method: 'POST',
    data: { items },
    header: { 'x-tenant-header': TENANT_ID, 'x-user-id': userId }
  })
}

// Add item to cart
export const addToCart = (skuId: number, quantity: number): Promise<void> => {
  return request<void>(CART_API, {
    method: 'POST',
    data: { skuId, quantity },
    header: { 'x-user-id': uni.getStorageSync('userId') || '1' }
  })
}