/**
 * Order API Service - ADMIN-03
 * Endpoints for order management in admin panel
 */
import { request } from '@/utils/request';

// Order status constants
export const ORDER_STATUS = {
  ALL: null,
  PENDING_PAYMENT: 1,   // 待付款
  PAID: 2,              // 已付款
  SHIPPED: 3,           // 已发货
  COMPLETED: 4,         // 已完成
  CANCELLED: 5,         // 已取消
} as const;

export const ORDER_STATUS_TEXT: Record<number, string> = {
  [ORDER_STATUS.PENDING_PAYMENT]: '待付款',
  [ORDER_STATUS.PAID]: '已付款',
  [ORDER_STATUS.SHIPPED]: '已发货',
  [ORDER_STATUS.COMPLETED]: '已完成',
  [ORDER_STATUS.CANCELLED]: '已取消',
};

// Order list params
export interface OrderListParams {
  page?: number;
  pageSize?: number;
  orderNo?: string;
  status?: number | null;
  startTime?: string;
  endTime?: string;
  keyword?: string;
}

// Order list item DTO
export interface OrderListDTO {
  id: number;
  orderNo: string;
  userId: number;
  goodsType: number;
  goodsTypeDesc: string;
  totalAmount: string;
  payAmount: string;
  status: number;
  statusDesc: string;
  itemCount: number;
  remark: string;
  payTime: string;
  shipTime: string;
  createTime: string;
}

// Order item DTO
export interface OrderItemDTO {
  id: number;
  goodsId: number;
  goodsName: string;
  skuId: number;
  specs: string; // JSON: "{"颜色":"红色"}"
  price: string;
  quantity: number;
  subtotal: string;
  image: string;
}

// Delivery DTO
export interface DeliveryDTO {
  expressCode: string;
  expressName: string;
  waybillNo: string;
  createTime: string;
}

// Order detail DTO
export interface OrderDetailDTO {
  id: number;
  orderNo: string;
  userId: number;
  goodsType: number;
  goodsTypeDesc: string;
  totalAmount: string;
  freightAmount: string;
  payAmount: string;
  status: number;
  statusDesc: string;
  remark: string;
  payTime: string;
  shipTime: string;
  completeTime: string;
  createTime: string;
  // Address (physical goods)
  addressId: number;
  addressName: string;
  addressPhone: string;
  addressDetail: string;
  // Items
  items: OrderItemDTO[];
  // Delivery
  delivery: DeliveryDTO | null;
  // Refund
  refundTime: string | null;
}

// Adjust order price params
export interface AdjustOrderPriceParams {
  orderId: number;
  adjustAmount: number; // Must be negative (decrease only)
  reason?: string;
}

// Admin remark params
export interface AdminRemarkParams {
  remark: string;
}

// Close order params
export interface CloseOrderParams {
  reason: string;
}

// Ship order params
export interface ShipOrderParams {
  expressCode: string;
  expressName: string;
  waybillNo: string;
}

// API response with pagination
export interface PageResponse<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
}

export interface ApiResponse<T> {
  code: number;
  msg?: string;
  datas?: T;
  data?: T;
}

/**
 * Get paginated order list with filters
 */
export async function getOrderList(params: OrderListParams): Promise<PageResponse<OrderListDTO>> {
  const response = await request<ApiResponse<PageResponse<OrderListDTO>>>('/api-mall/api/mall/admin/order/list', {
    method: 'GET',
    params: {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      orderNo: params.orderNo,
      status: params.status,
      startTime: params.startTime,
      endTime: params.endTime,
      keyword: params.keyword,
    },
  });
  // 兼容多种响应格式
  const data = response?.datas || response?.data || response;
  return data || { records: [], total: 0, size: 20, current: 1 };
}

/**
 * Get order detail by ID
 */
export async function getOrderDetail(id: number): Promise<OrderDetailDTO | null> {
  const response = await request<ApiResponse<any>>(`/api-mall/api/mall/admin/order/${id}`, {
    method: 'GET',
  });
  // 兼容多种响应格式
  const raw = response?.datas || response?.data || response;

  if (!raw || !raw.order) {
    return null;
  }

  const o = raw.order;
  const items = (raw.items || []).map((item: any) => ({
    id: item.id,
    goodsId: item.goodsId,
    goodsName: item.goodsName,
    skuId: item.skuId,
    specs: item.specs || '{}',
    price: item.price != null ? String(item.price) : '0',
    quantity: item.quantity,
    subtotal: item.subtotal != null ? String(item.subtotal) : '0',
    image: item.image || '',
  }));

  return {
    id: o.id,
    orderNo: o.orderNo || '',
    userId: o.userId,
    goodsType: o.goodsType,
    goodsTypeDesc: o.goodsTypeName || (o.goodsType === 1 ? '实物商品' : '虚拟商品'),
    totalAmount: o.totalAmount != null ? String(o.totalAmount) : '0',
    freightAmount: o.freightAmount != null ? String(o.freightAmount) : '0',
    payAmount: o.payAmount != null ? String(o.payAmount) : '0',
    status: o.status,
    statusDesc: o.statusName || ORDER_STATUS_TEXT[o.status] || '未知',
    remark: o.remark || '',
    payTime: o.payTime || '',
    shipTime: o.shipTime || '',
    completeTime: o.completeTime || '',
    createTime: o.createTime || '',
    // Address (physical goods)
    addressId: raw.address?.id || o.addressId || 0,
    addressName: raw.address?.consigneeName || o.consigneeName || '',
    addressPhone: raw.address?.consigneePhone || o.consigneePhone || '',
    addressDetail: raw.address?.detailAddress || o.detailAddress || '',
    items,
    delivery: raw.delivery ? {
      expressCode: raw.delivery.expressCode || '',
      expressName: raw.delivery.expressName || '',
      waybillNo: raw.delivery.waybillNo || '',
      createTime: raw.delivery.createTime || '',
    } : null,
    refundTime: raw.refund?.refundTime || null,
  };
}

/**
 * Adjust order price (decrease only)
 * adjustAmount must be negative (reduces the price)
 */
export async function adjustOrderPrice(params: AdjustOrderPriceParams): Promise<boolean> {
  const response = await request<ApiResponse<boolean>>(`/api-mall/api/mall/admin/order/${params.orderId}/adjust-amount`, {
    method: 'POST',
    data: {
      orderId: params.orderId,
      adjustAmount: params.adjustAmount,
      reason: params.reason || '',
    },
  });
  // 兼容多种响应格式
  return response?.datas || response?.data || false;
}

/**
 * Add admin remark to order
 */
export async function addAdminRemark(orderId: number, remark: string): Promise<boolean> {
  const response = await request<ApiResponse<boolean>>(`/api-mall/api/mall/admin/order/${orderId}/admin-remark`, {
    method: 'POST',
    data: { remark },
  });
  // 兼容多种响应格式
  return response?.datas || response?.data || false;
}

/**
 * Close order with reason
 */
export async function closeOrder(orderId: number, reason: string): Promise<boolean> {
  const response = await request<ApiResponse<boolean>>(`/api-mall/api/mall/admin/order/${orderId}/close`, {
    method: 'POST',
    data: { reason },
  });
  // 兼容多种响应格式
  return response?.datas || response?.data || false;
}

/**
 * Ship order with express info
 */
export async function shipOrder(orderId: number, params: ShipOrderParams): Promise<boolean> {
  const response = await request<ApiResponse<boolean>>(`/api-mall/api/mall/admin/order/${orderId}/ship`, {
    method: 'POST',
    data: {
      expressCode: params.expressCode,
      expressName: params.expressName,
      waybillNo: params.waybillNo,
    },
  });
  // 兼容多种响应格式
  return response?.datas || response?.data || false;
}

// Close order reason options
export const CLOSE_ORDER_REASONS = [
  { label: '买家主动取消', value: '买家主动取消' },
  { label: '库存不足', value: '库存不足' },
  { label: '商品已下架', value: '商品已下架' },
  { label: '地址信息有误', value: '地址信息有误' },
  { label: '其他', value: '其他' },
];
