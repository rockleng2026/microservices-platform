// API configuration for mall-mini-program
// 网关路由地址
export const API_BASE = 'http://localhost:9900/mall-center'

// 默认租户ID
export const TENANT_ID = 'default'

// API endpoints
export const BANNER_LIST = '/api/mall/admin/banner/list'
export const CATEGORIES = '/api/mall/goods/categories'
export const HOT_GOODS = '/api/mall/goods/hot'
export const GOODS_LIST = '/api/mall/goods/list'
export const GOODS_DETAIL = '/api/mall/goods'
export const CART_API = '/api/mall/cart'
export const CART_SYNC_API = '/api/mall/cart/sync'
export const EVALUATE_LIST = '/api/mall/evaluate/goods'
export const REFUND_APPLY = '/api/mall/refund/apply'
export const REFUND_DETAIL = '/api/mall/refund'
export const REFUND_CANCEL = '/api/mall/refund'
export const ADDRESS_LIST = '/api/mall/address/list'
export const ORDER_CREATE = '/api/mall/order'
export const ORDER_LIST = '/api/mall/order'
export const ORDER_DETAIL = '/api/mall/order'
export const PAY_CREATE = '/api/mall/pay/create'
export const COUPON_LIST = '/api/mall/coupon/available'