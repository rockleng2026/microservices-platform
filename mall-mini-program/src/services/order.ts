import { API_BASE, ORDER_CREATE, ORDER_LIST, ORDER_DETAIL } from '@/config/api'
import { getCommonHeaders } from '@/utils/helpers'

// Re-export API constants for convenience
export { ORDER_CREATE, ORDER_LIST, ORDER_DETAIL }

// Request wrapper
const request = <T>(url: string, options?: any): Promise<T> => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${url}`,
      ...options,
      header: {
        ...options?.header,
        ...getCommonHeaders()
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

// Order item model
export interface OrderItem {
  id: number
  orderId: number
  skuId: number
  goodsName: string
  goodsImage: string
  price: number
  quantity: number
  specs?: string
}

// Address model
export interface Address {
  id: number
  userId: number
  receiverName: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  isDefault: number
}

// Logistics info
export interface LogisticsInfo {
  company: string
  trackingNo: string
  timeline: Array<{
    time: string
    content: string
  }>
}

// Order model
export interface Order {
  id: number
  orderNo: string
  userId: number
  status: 'pending_payment' | 'paid' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunding'
  totalAmount: number
  discountAmount: number
  freightFee: number
  finalAmount: number
  remark?: string
  createdAt: string
  paidAt?: string
  shippedAt?: string
  deliveredAt?: string
  items: OrderItem[]
  address: Address
  logistics?: LogisticsInfo
}

// Order list response
export interface OrderListResponse {
  list: Order[]
  total: number
  page: number
  pageSize: number
}

// Order create params
export interface OrderCreateParams {
  skuIds: number[]
  addressId: number
  couponId?: number
  remark?: string
}

// Create order
export const createOrder = (params: OrderCreateParams): Promise<Order> => {
  return request<Order>(ORDER_CREATE, {
    method: 'POST',
    data: params
  })
}

// Tab status mapping: tab index -> status filter (backend uses English enums)
// 0: all (no status param), 1: PENDING, 2: PAID, 3: SHIPPED, 4: DELIVERED/COMPLETED
export const TAB_STATUS_MAP: (string | undefined)[] = [
  undefined,      // 0: all
  'PENDING',      // 1: 待付款
  'PAID',         // 2: 待发货
  'SHIPPED',      // 3: 已发货
  'COMPLETED'     // 4: 已完成
]

// Backend status enum to integer mapping
const STATUS_ENUM_TO_INT: Record<string, number> = {
  PENDING: 1,
  PAID: 2,
  SHIPPED: 3,
  COMPLETED: 4,
  CANCELLED: 5,
  REFUNDING: 6,
  REFUNDED: 7,
  CLOSED: 8
}

// Get order list
export const getOrderList = (status: string | undefined, page: number = 1, pageSize: number = 10): Promise<{ list: any[], total: number, page: number, pageSize: number }> => {
  const parts: string[] = []
  if (status) {
    const statusInt = STATUS_ENUM_TO_INT[status]
    if (statusInt !== undefined) parts.push(`status=${statusInt}`)
  }
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${ORDER_LIST}?${parts.join('&')}`,
      method: 'GET',
      header: getCommonHeaders(),
      success: (res: any) => {
        if (res.statusCode === 200 && res.data) {
          // Backend returns { datas: [...orders], resp_code, resp_msg }
          const orders = res.data.datas || []
          resolve({
            list: orders,
            total: orders.length,
            page,
            pageSize
          })
        } else {
          reject(res)
        }
      },
      fail: reject
    })
  })
}

// Get order detail
export const getOrderDetail = (orderId: number): Promise<Order> => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${ORDER_DETAIL}/${orderId}`,
      method: 'GET',
      header: getCommonHeaders(),
      success: (res: any) => {
        if (res.statusCode === 200 && res.data) {
          // Backend wraps in Result: { code, msg, datas }
          const orderData = res.data.datas || res.data
          resolve(orderData)
        } else {
          reject(res)
        }
      },
      fail: reject
    })
  })
}

// Cancel order
export const cancelOrder = (orderId: number): Promise<void> => {
  return request<void>(`${ORDER_DETAIL}/${orderId}`, {
    method: 'DELETE'
  })
}

// Confirm receipt
export const confirmReceipt = (orderId: number): Promise<void> => {
  return request<void>(`${ORDER_DETAIL}/${orderId}/confirm`, {
    method: 'PUT'
  })
}

// Get logistics info for an order
export const getLogistics = (orderId: number): Promise<LogisticsInfo> => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${ORDER_DETAIL}/${orderId}/delivery`,
      method: 'GET',
      header: getCommonHeaders(),
      success: (res: any) => {
        if (res.statusCode === 200 && res.data) {
          const data = res.data.datas || res.data
          resolve(data)
        } else {
          reject(res)
        }
      },
      fail: reject
    })
  })
}
