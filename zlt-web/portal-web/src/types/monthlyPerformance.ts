export interface MonthlyPerformance {
  id?: number;
  month: string;
  employeeId: number;
  employeeName?: string;
  departmentId?: number;
  departmentName?: string;
  performanceScore: number;
  personalProjectRevenue?: number;
  personalProjectMargin?: number;
  personalProjectProfit?: number;
  teamProjectId?: string;
  teamProjectRevenue?: number;
  teamProjectMargin?: number;
  teamProjectProfit?: number;
  teamMemberCount?: number;
  kpiScores?: string;
  performanceRemark?: string;
  status?: number;
  delflag?: number;
  createdAt?: string;
} 