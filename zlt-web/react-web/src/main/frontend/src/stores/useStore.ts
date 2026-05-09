/**
 * Order Store - ADMIN-03
 * Zustand store for order state management
 */
import { create } from 'zustand';
import {
  getOrderList,
  getOrderDetail,
  adjustOrderPrice,
  addAdminRemark,
  closeOrder,
  shipOrder,
  type OrderListDTO,
  type OrderDetailDTO,
  type OrderListParams,
  type AdjustOrderPriceParams,
  type ShipOrderParams,
} from '@/pages/Orders/services/orders';

interface OrderState {
  // Order list state
  orderList: OrderListDTO[];
  orderListLoading: boolean;
  orderListTotal: number;

  // Order detail state
  currentOrder: OrderDetailDTO | null;
  orderDetailLoading: boolean;

  // Actions - Order List
  fetchOrderList: (params: OrderListParams) => Promise<void>;

  // Actions - Order Detail
  fetchOrderDetail: (id: number) => Promise<void>;

  // Actions - Order Operations
  adjustPrice: (params: AdjustOrderPriceParams) => Promise<boolean>;
  addRemark: (orderId: number, remark: string) => Promise<boolean>;
  closeOrderById: (orderId: number, reason: string) => Promise<boolean>;
  shipOrderById: (orderId: number, params: ShipOrderParams) => Promise<boolean>;

  // Reset
  resetOrderList: () => void;
  resetOrderDetail: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  // Initial state
  orderList: [],
  orderListLoading: false,
  orderListTotal: 0,
  currentOrder: null,
  orderDetailLoading: false,

  // Fetch order list
  fetchOrderList: async (params: OrderListParams) => {
    set({ orderListLoading: true });
    try {
      const data = await getOrderList(params);
      set({
        orderList: data.records,
        orderListTotal: data.total,
        orderListLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch order list:', error);
      set({ orderListLoading: false });
    }
  },

  // Fetch order detail
  fetchOrderDetail: async (id: number) => {
    set({ orderDetailLoading: true });
    try {
      const data = await getOrderDetail(id);
      set({ currentOrder: data, orderDetailLoading: false });
    } catch (error) {
      console.error('Failed to fetch order detail:', error);
      set({ orderDetailLoading: false });
    }
  },

  // Adjust order price
  adjustPrice: async (params: AdjustOrderPriceParams) => {
    try {
      return await adjustOrderPrice(params);
    } catch (error) {
      console.error('Failed to adjust price:', error);
      return false;
    }
  },

  // Add admin remark
  addRemark: async (orderId: number, remark: string) => {
    try {
      return await addAdminRemark(orderId, remark);
    } catch (error) {
      console.error('Failed to add remark:', error);
      return false;
    }
  },

  // Close order
  closeOrderById: async (orderId: number, reason: string) => {
    try {
      return await closeOrder(orderId, reason);
    } catch (error) {
      console.error('Failed to close order:', error);
      return false;
    }
  },

  // Ship order
  shipOrderById: async (orderId: number, params: ShipOrderParams) => {
    try {
      return await shipOrder(orderId, params);
    } catch (error) {
      console.error('Failed to ship order:', error);
      return false;
    }
  },

  // Reset order list
  resetOrderList: () => {
    set({ orderList: [], orderListTotal: 0 });
  },

  // Reset order detail
  resetOrderDetail: () => {
    set({ currentOrder: null });
  },
}));
