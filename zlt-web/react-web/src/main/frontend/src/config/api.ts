/**
 * API Configuration
 * Centralized API endpoint constants
 */

// Order API endpoints
export const ORDER_API = {
  LIST: '/api/mall/admin/order/list',
  DETAIL: '/api/mall/admin/order',
  ADJUST_PRICE: '/api/mall/admin/order',
  ADMIN_REMARK: '/api/mall/admin/order',
  CLOSE: '/api/mall/admin/order',
  SHIP: '/api/mall/admin/order',
} as const;
