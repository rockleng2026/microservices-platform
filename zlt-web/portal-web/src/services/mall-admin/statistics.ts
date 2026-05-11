import { request } from '@/utils/request';

// API基础路径 - 通过网关访问 mall-center
// 网关StripPrefix=1去掉/api-mall, 需要保留完整后端路径
const MALL_CENTER_API = '/api-mall/mall-center';

// 获取今日统计数据
export async function getTodayStatistics(): Promise<any> {
  console.log('[API] getTodayStatistics called, URL:', `${MALL_CENTER_API}/api/mall/admin/statistics/today`);
  const response = await request(`${MALL_CENTER_API}/api/mall/admin/statistics/today`, {
    method: 'GET',
  });
  console.log('[API] getTodayStatistics response:', response);
  // 兼容多种响应格式
  return response?.datas || response?.data || response || null;
}

// 获取销售趋势
export async function getSalesTrend(
  type: 'day' | 'week' | 'month' = 'day',
  startDate?: string,
  endDate?: string
): Promise<any[]> {
  const response = await request(`${MALL_CENTER_API}/api/mall/admin/statistics/sales-trend`, {
    method: 'GET',
    params: { type, startDate, endDate },
  });
  // 兼容多种响应格式
  const data = response?.datas || response?.data || response;
  return Array.isArray(data) ? data : [];
}

// 获取库存预警列表
export async function getStockWarningList(): Promise<any[]> {
  const response = await request(`${MALL_CENTER_API}/api/mall/admin/statistics/stock-warning`, {
    method: 'GET',
  });
  // 兼容多种响应格式
  const data = response?.datas || response?.data || response;
  return Array.isArray(data) ? data : [];
}

// 获取用户分析数据
export async function getUserAnalysis(): Promise<any> {
  const response = await request(`${MALL_CENTER_API}/api/mall/admin/statistics/user-analysis`, {
    method: 'GET',
  });
  // 兼容多种响应格式
  return response?.datas || response?.data || response || null;
}

// 获取热销商品排行
export async function getTopProducts(limit: number = 10): Promise<any[]> {
  const response = await request(`${MALL_CENTER_API}/api/mall/admin/statistics/top-products`, {
    method: 'GET',
    params: { limit },
  });
  // 兼容多种响应格式
  const data = response?.datas || response?.data || response;
  return Array.isArray(data) ? data : [];
}