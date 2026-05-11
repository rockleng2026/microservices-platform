import { request } from '@/utils/request';

// API基础路径 - 通过网关访问 mall-center
// 网关路由: /api-mall/** -> lb://mall-center, StripPrefix=1
// 所以实际路径是: /api-mall/api/mall/admin/...
const MALL_CENTER_API = '/api-mall';

// 获取今日统计数据
export async function getTodayStatistics(): Promise<any> {
  const response = await request(`${MALL_CENTER_API}/api/mall/admin/statistics/today`, {
    method: 'GET',
  });
  // 兼容多种响应格式
  return response?.datas || response?.data || response || null;
}

// 获取销售趋势
export async function getSalesTrend(
  type: 'day' | 'week' | 'month' = 'day',
  startDate?: string,
  endDate?: string
): Promise<any[]> {
  // 后端要求 startDate 和 endDate 参数
  const response = await request(`${MALL_CENTER_API}/api/mall/admin/statistics/sales-trend`, {
    method: 'GET',
    params: { type, startDate: startDate || getDefaultStartDate(type), endDate: endDate || getDefaultEndDate() },
  });
  // 兼容多种响应格式
  const data = response?.datas || response?.data || response;
  return Array.isArray(data) ? data : [];
}

// 获取默认开始日期
function getDefaultStartDate(type: string): string {
  const now = new Date();
  if (type === 'day') {
    now.setDate(now.getDate() - 7); // 7天前
  } else if (type === 'week') {
    now.setDate(now.getDate() - 30); // 30天前
  } else {
    now.setMonth(now.getMonth() - 3); // 3个月前
  }
  return now.toISOString().split('T')[0];
}

// 获取默认结束日期
function getDefaultEndDate(): string {
  return new Date().toISOString().split('T')[0];
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
// TODO: 后端暂无此API，暂时返回空数组
export async function getTopProducts(limit: number = 10): Promise<any[]> {
  // 后端 /api/mall/admin/statistics/top-products 接口不存在
  // 暂时返回空数组，避免前端报错
  console.warn('[API] getTopProducts: 后端接口不存在，暂时返回空数据');
  return [];
  // 正式上线前需要后端实现此接口
  /*
  const response = await request(`${MALL_CENTER_API}/api/mall/admin/statistics/top-products`, {
    method: 'GET',
    params: { limit },
  });
  const data = response?.datas || response?.data || response;
  return Array.isArray(data) ? data : [];
  */
}