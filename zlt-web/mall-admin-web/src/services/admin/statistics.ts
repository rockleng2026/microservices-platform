import { request } from '@/utils/request';
import { notification } from 'antd';
import { API_BASE_URL } from '@/config/api';

export interface StatisticsDTO {
  todayOrderCount: number;
  todaySalesAmount: number;
  waitDeliveryCount: number;
  todayNewUsers: number;
  yesterdayOrderCount: number;
  yesterdaySalesAmount: number;
  totalPv: number;
  avgOrderAmount: number;
}

export interface SalesTrendDTO {
  date: string;
  orderCount: number;
  salesAmount: number;
  userCount: number;
}

export interface StockWarningDTO {
  skuId: number;
  skuName: string;
  goodsId: number;
  goodsName: string;
  realStock: number;
  warningStock: number;
  soldToday: number;
}

export interface UserAnalysisDTO {
  todayNewUsers: number;
  weekNewUsers: number;
  monthNewUsers: number;
  activeUsers: number;
  avgOrderAmount: number;
}

// 获取今日统计数据
export async function getTodayStatistics(): Promise<StatisticsDTO> {
  const response = await request(`${API_BASE_URL}/statistics/today`, {
    method: 'GET',
  });
  return response.datas || response.data || response;
}

// 获取销售趋势
export async function getSalesTrend(
  type: 'day' | 'week' | 'month' = 'day',
  startDate?: string,
  endDate?: string
): Promise<SalesTrendDTO[]> {
  const response = await request(`${API_BASE_URL}/statistics/sales-trend`, {
    method: 'GET',
    params: { type, startDate, endDate },
  });
  return response.datas || response.data || response || [];
}

// 获取库存预警列表
export async function getStockWarningList(): Promise<StockWarningDTO[]> {
  const response = await request(`${API_BASE_URL}/statistics/stock-warning`, {
    method: 'GET',
  });
  return response.datas || response.data || response || [];
}

// 获取用户分析数据
export async function getUserAnalysis(): Promise<UserAnalysisDTO> {
  const response = await request(`${API_BASE_URL}/statistics/user-analysis`, {
    method: 'GET',
  });
  return response.datas || response.data || response;
}