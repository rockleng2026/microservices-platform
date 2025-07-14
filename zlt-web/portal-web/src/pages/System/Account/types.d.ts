export interface AccountItem {
  id: number;
  employeeId: number;
  employeeName: string;
  username: string;
  mobile: string;
  email: string;
  status: number;
  createdAt: string;
  [key: string]: any;
} 