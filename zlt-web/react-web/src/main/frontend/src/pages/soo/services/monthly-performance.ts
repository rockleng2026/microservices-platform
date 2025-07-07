import request from '../../util/request';
import type { MonthlyPerformance, MonthlyPerformanceQuery, MonthlyPerformancePageResult } from '../types/monthly-performance';

export async function getMonthlyPerformancePage(params: MonthlyPerformanceQuery): Promise<MonthlyPerformancePageResult> {
  return request.get('/api/soo/monthly-performance/page', { params });
}

export async function batchSaveMonthlyPerformance(data: MonthlyPerformance[]): Promise<void> {
  return request.post('/api/soo/monthly-performance/batch', data);
} 