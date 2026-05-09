import { API_BASE, CART_API, CART_SYNC_API } from '@/config/api'
import type { CartItem } from '@/stores/cart'

// Request wrapper
const request = <T>(url: string, options?: any): Promise<T> => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${url}`,
      ...options,
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
  return request<CartItem[]>(CART_API, {
    method: 'GET',
    header: { 'x-user-id': userId }
  })
}

// Sync local cart items to server
export const syncCartToServer = (items: CartItem[], userId: string): Promise<void> => {
  return request<void>(CART_SYNC_API, {
    method: 'POST',
    data: { items },
    header: { 'x-user-id': userId }
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