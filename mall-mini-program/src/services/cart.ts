import { API_BASE, CART_API } from '@/config/api'

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

// Add item to cart
export const addToCart = (skuId: number, quantity: number): Promise<void> => {
  return request<void>(CART_API, {
    method: 'POST',
    data: { skuId, quantity },
    header: { 'x-user-id': uni.getStorageSync('userId') || '1' }
  })
}
