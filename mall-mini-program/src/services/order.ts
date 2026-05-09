import { API_BASE, ORDER_CREATE, ORDER_LIST, ORDER_DETAIL } from '@/config/api'

// Re-export API constants for convenience
export { ORDER_CREATE, ORDER_LIST, ORDER_DETAIL }

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
    data: params,
    header: { 'x-user-id': uni.getStorageSync('userId') || '1' }
  })
}

// Tab status mapping: tab index -> status filter
// 0: all (no status param), 1: pending_payment, 2: paid, 3: shipped, 4: delivered+completed
export const TAB_STATUS_MAP: (string | undefined)[] = [
  undefined,           // 0: all
  'pending_payment',  // 1: 待付款
  'paid',             // 2: 待发货
  'shipped',          // 3: 待收货
  'delivered'         // 4: 已完成 (delivered or completed)
]

// Get order list
export const getOrderList = (status: string | undefined, page: number = 1, pageSize: number = 10): Promise<OrderListResponse> => {
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  params.append('page', String(page))
  params.append('pageSize', String(pageSize))
  return request<OrderListResponse>(`${ORDER_LIST}?${params.toString()}`, {
    method: 'GET'
  })
}

// Get order detail
export const getOrderDetail = (orderId: number): Promise<Order> => {
  return request<Order>(`${ORDER_DETAIL}/${orderId}`, {
    method: 'GET'
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
