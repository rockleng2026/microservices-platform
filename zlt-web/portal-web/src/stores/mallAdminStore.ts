import { create } from 'zustand';
import {
  getTodayStatistics,
  getSalesTrend,
  getStockWarningList,
  getUserAnalysis,
  getTopProducts,
} from '@/services/mall-admin/statistics';

interface AdminState {
  // 统计数据
  statistics: any;
  salesTrend: any[];
  stockWarnings: any[];
  userAnalysis: any;
  topProducts: any[];

  // 加载状态
  loading: {
    statistics: boolean;
    salesTrend: boolean;
    stockWarnings: boolean;
    userAnalysis: boolean;
    topProducts: boolean;
  };

  // 错误状态
  error: {
    statistics: string | null;
    salesTrend: string | null;
    stockWarnings: string | null;
    userAnalysis: string | null;
    topProducts: string | null;
  };

  // 操作方法
  fetchStatistics: () => Promise<void>;
  fetchSalesTrend: (type?: 'day' | 'week' | 'month', startDate?: string, endDate?: string) => Promise<void>;
  fetchStockWarnings: () => Promise<void>;
  fetchUserAnalysis: () => Promise<void>;
  fetchTopProducts: (limit?: number) => Promise<void>;
  clearAll: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  // 初始状态
  statistics: null,
  salesTrend: [],
  stockWarnings: [],
  userAnalysis: null,
  topProducts: [],

  loading: {
    statistics: false,
    salesTrend: false,
    stockWarnings: false,
    userAnalysis: false,
    topProducts: false,
  },

  error: {
    statistics: null,
    salesTrend: null,
    stockWarnings: null,
    userAnalysis: null,
    topProducts: null,
  },

  // 获取今日统计数据
  fetchStatistics: async () => {
    console.log('[Store] fetchStatistics called');
    set((state) => ({
      loading: { ...state.loading, statistics: true },
      error: { ...state.error, statistics: null },
    }));

    try {
      console.log('[Store] calling getTodayStatistics API');
      const data = await getTodayStatistics();
      console.log('[Store] getTodayStatistics returned:', data);
      set((state) => ({
        statistics: data,
        loading: { ...state.loading, statistics: false },
      }));
    } catch (error: any) {
      console.error('[Store] fetchStatistics error:', error);
      set((state) => ({
        error: { ...state.error, statistics: error.message || '获取统计数据失败' },
        loading: { ...state.loading, statistics: false },
      }));
    }
  },

  // 获取销售趋势
  fetchSalesTrend: async (type = 'day', startDate?: string, endDate?: string) => {
    set((state) => ({
      loading: { ...state.loading, salesTrend: true },
      error: { ...state.error, salesTrend: null },
    }));

    try {
      const data = await getSalesTrend(type, startDate, endDate);
      set((state) => ({
        salesTrend: data,
        loading: { ...state.loading, salesTrend: false },
      }));
    } catch (error: any) {
      set((state) => ({
        error: { ...state.error, salesTrend: error.message || '获取销售趋势失败' },
        loading: { ...state.loading, salesTrend: false },
      }));
    }
  },

  // 获取库存预警
  fetchStockWarnings: async () => {
    set((state) => ({
      loading: { ...state.loading, stockWarnings: true },
      error: { ...state.error, stockWarnings: null },
    }));

    try {
      const data = await getStockWarningList();
      set((state) => ({
        stockWarnings: data,
        loading: { ...state.loading, stockWarnings: false },
      }));
    } catch (error: any) {
      set((state) => ({
        error: { ...state.error, stockWarnings: error.message || '获取库存预警失败' },
        loading: { ...state.loading, stockWarnings: false },
      }));
    }
  },

  // 获取用户分析
  fetchUserAnalysis: async () => {
    set((state) => ({
      loading: { ...state.loading, userAnalysis: true },
      error: { ...state.error, userAnalysis: null },
    }));

    try {
      const data = await getUserAnalysis();
      set((state) => ({
        userAnalysis: data,
        loading: { ...state.loading, userAnalysis: false },
      }));
    } catch (error: any) {
      set((state) => ({
        error: { ...state.error, userAnalysis: error.message || '获取用户分析失败' },
        loading: { ...state.loading, userAnalysis: false },
      }));
    }
  },

  // 获取热销商品排行
  fetchTopProducts: async (limit = 10) => {
    set((state) => ({
      loading: { ...state.loading, topProducts: true },
      error: { ...state.error, topProducts: null },
    }));

    try {
      const data = await getTopProducts(limit);
      set((state) => ({
        topProducts: data || [],
        loading: { ...state.loading, topProducts: false },
      }));
    } catch (error: any) {
      set((state) => ({
        error: { ...state.error, topProducts: error.message || '获取热销排行失败' },
        loading: { ...state.loading, topProducts: false },
      }));
    }
  },

  // 清空所有数据
  clearAll: () => {
    set({
      statistics: null,
      salesTrend: [],
      stockWarnings: [],
      userAnalysis: null,
      topProducts: [],
      loading: {
        statistics: false,
        salesTrend: false,
        stockWarnings: false,
        userAnalysis: false,
        topProducts: false,
      },
      error: {
        statistics: null,
        salesTrend: null,
        stockWarnings: null,
        userAnalysis: null,
        topProducts: null,
      },
    });
  },
}));