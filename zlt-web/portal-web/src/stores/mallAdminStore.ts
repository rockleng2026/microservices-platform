import { create } from 'zustand';
import {
  getTodayStatistics,
  getSalesTrend,
  getStockWarningList,
  getUserAnalysis,
  getTopProducts,
} from '@/services/mall-admin/statistics';
import {
  getWeChatConfig as fetchWeChatConfig,
  updateWeChatConfig as saveWeChatConfig,
  testWeChatConfig as checkWeChatConfig,
  WeChatConfig,
} from '@/services/mall-admin/wechatConfig';

// WeChat config status type
export type WeChatConfigStatus = 'unconfigured' | 'configured' | 'testing' | 'success' | 'failed';

interface WeChatConfigState {
  wechatConfig: WeChatConfig | null;
  wechatConfigStatus: WeChatConfigStatus;
  wechatConfigLoading: boolean;
  wechatConfigError: string | null;
}

interface AdminState {
  // 统计数据
  statistics: any;
  salesTrend: any[];
  stockWarnings: any[];
  userAnalysis: any;
  topProducts: any[];

  // 微信支付配置状态 (ADMIN-11)
  wechatConfig: WeChatConfig | null;
  wechatConfigStatus: WeChatConfigStatus;
  wechatConfigLoading: boolean;
  wechatConfigError: string | null;

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
  // 微信支付配置方法 (ADMIN-11)
  fetchWeChatConfig: () => Promise<void>;
  updateWeChatConfig: (config: WeChatConfig) => Promise<boolean>;
  testWeChatConfig: () => Promise<{ success: boolean; message: string }>;
  clearAll: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  // 初始状态
  statistics: null,
  salesTrend: [],
  stockWarnings: [],
  userAnalysis: null,
  topProducts: [],

  // 微信支付配置状态 (ADMIN-11)
  wechatConfig: null,
  wechatConfigStatus: 'unconfigured',
  wechatConfigLoading: false,
  wechatConfigError: null,

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
    set((state) => ({
      loading: { ...state.loading, statistics: true },
      error: { ...state.error, statistics: null },
    }));

    try {
      const data = await getTodayStatistics();
      set((state) => ({
        statistics: data,
        loading: { ...state.loading, statistics: false },
      }));
    } catch (error: any) {
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

  // 获取微信支付配置 (ADMIN-11-01)
  fetchWeChatConfig: async () => {
    set((state) => ({
      wechatConfigLoading: true,
      wechatConfigError: null,
    }));

    try {
      const config = await fetchWeChatConfig();
      set((state) => ({
        wechatConfig: config,
        wechatConfigStatus: config ? 'configured' : 'unconfigured',
        wechatConfigLoading: false,
      }));
    } catch (error: any) {
      set((state) => ({
        wechatConfigError: error.message || '获取微信支付配置失败',
        wechatConfigStatus: 'failed',
        wechatConfigLoading: false,
      }));
    }
  },

  // 更新微信支付配置 (ADMIN-11-01)
  updateWeChatConfig: async (config: WeChatConfig) => {
    set((state) => ({
      wechatConfigLoading: true,
      wechatConfigError: null,
    }));

    try {
      const success = await saveWeChatConfig(config);
      if (success) {
        set((state) => ({
          wechatConfig: config,
          wechatConfigStatus: 'configured',
          wechatConfigLoading: false,
        }));
      } else {
        set((state) => ({
          wechatConfigError: '更新微信支付配置失败',
          wechatConfigStatus: 'failed',
          wechatConfigLoading: false,
        }));
      }
      return success;
    } catch (error: any) {
      set((state) => ({
        wechatConfigError: error.message || '更新微信支付配置失败',
        wechatConfigStatus: 'failed',
        wechatConfigLoading: false,
      }));
      return false;
    }
  },

  // 测试微信支付配置连通性 (ADMIN-11-02)
  testWeChatConfig: async () => {
    set((state) => ({
      wechatConfigStatus: 'testing',
      wechatConfigError: null,
    }));

    try {
      const result = await checkWeChatConfig();
      set((state) => ({
        wechatConfigStatus: result.success ? 'success' : 'failed',
        wechatConfigError: result.success ? null : result.message,
      }));
      return result;
    } catch (error: any) {
      set((state) => ({
        wechatConfigStatus: 'failed',
        wechatConfigError: error.message || '测试微信支付配置失败',
      }));
      return { success: false, message: error.message || '测试微信支付配置失败' };
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
      wechatConfig: null,
      wechatConfigStatus: 'unconfigured',
      wechatConfigLoading: false,
      wechatConfigError: null,
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