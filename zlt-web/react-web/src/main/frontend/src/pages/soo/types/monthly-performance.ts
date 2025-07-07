export interface MonthlyPerformance {
  id: number;
  month: string;
  employeeId: number;
  employeeName: string;
  departmentId?: number;
  departmentName?: string;
  performanceScore: number;
  personalProjectRevenue?: number;
  personalProjectMargin?: number;
  teamProjectId?: string;
  teamProjectRevenue?: number;
  teamProjectMargin?: number;
  status?: number;
}

export interface MonthlyPerformanceQuery {
  pageNum: number;
  pageSize: number;
  month?: string;
  departmentId?: number | string;
  employeeName?: string;
}

export interface MonthlyPerformancePageResult {
  data: MonthlyPerformance[];
  count: number;
  resp_code: number;
  resp_msg?: string;
} 