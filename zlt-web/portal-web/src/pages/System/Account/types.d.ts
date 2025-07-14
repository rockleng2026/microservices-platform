export interface AccountItem {
  userId: number;
  username: string;
  type: string;
  enabled: number;
  userMobile: string;
  userEmail: string | null;
  employeeId: number;
  employeeName: string;
  employeeMobile: string;
  employeeEmail: string;
  departmentId: number;
  departmentName: string;
  createTime: string;
  updateTime: string;
  [key: string]: any;
} 