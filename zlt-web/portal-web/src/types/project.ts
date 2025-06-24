/**
 * 项目管理相关类型定义
 */

// 项目状态枚举
export enum ProjectStatus {
  INIT = 'init',
  RUNNING = 'running',
  CLOSED = 'closed',
  REJECTED = 'rejected',
  CLOSURE_PENDING = 'closure_pending',
}

// 审批状态枚举
export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

// 表单模式
export type FormMode = 'create' | 'edit' | 'view';

// 项目参与人信息
export interface ProjectParticipant {
  id?: string;
  participantId: string;
  participantName?: string;
  participantUsername?: string;
  participantEmail?: string;
  participantPhone?: string;
  departmentName?: string;
  role: string;
}

// 项目信息
export interface Project {
  id: string;
  name: string;
  category?: string;
  participants?: string; // JSON字符串
  participantDetails?: ProjectParticipant[]; // 解析后的参与人详情
  leaderId?: string;
  leaderName?: string;
  customerName?: string;
  customerContact?: string;
  startTime?: string;
  status: ProjectStatus;
  processInstanceId?: string;
  finalStatus?: ApprovalStatus;
  tenantId: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  delflag: number;
}

// 项目查询参数
export interface ProjectQueryParams {
  page: number;
  size: number;
  name?: string;
  category?: string;
  status?: string;
  leaderId?: string;
  customerName?: string;
  keyword?: string;
  startTimeBegin?: string;
  startTimeEnd?: string;
  finalStatus?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// 项目保存参数
export interface ProjectSaveParams {
  id?: string;
  name: string;
  category?: string;
  leaderId?: string;
  customerName?: string;
  customerContact?: string;
  startTime?: string;
  participants?: ProjectParticipantInput[];
}

// 项目参与人输入
export interface ProjectParticipantInput {
  participantId: string;
  role: string;
}

// 项目统计数据
export interface ProjectStatistics {
  totalCount: number;
  initCount: number;
  runningCount: number;
  closedCount: number;
  rejectedCount: number;
  monthlyData: {
    month: string;
    count: number;
  }[];
  categoryData: {
    category: string;
    count: number;
  }[];
}

// 产品毛利分配指导
export interface ProductProfitDistributionGuide {
  id: string;
  productName: string;
  role: string;
  commissionType: 'ratio' | 'amount';
  valueRange?: string;
  remark?: string;
  tenantId: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
  delflag: number;
}

// 产品毛利分配查询参数
export interface ProfitGuideQueryParams {
  page: number;
  size: number;
  productName?: string;
  role?: string;
  commissionType?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

// 产品毛利分配保存参数
export interface ProfitGuideSaveParams {
  id?: string;
  productName: string;
  role: string;
  commissionType: 'ratio' | 'amount';
  valueRange?: string;
  remark?: string;
}

// 项目模板
export interface ProjectTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  participantRoles: string[]; // 参与角色列表
  templateData: any; // 模板数据（JSON）
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

// 审批记录
export interface ApprovalRecord {
  id: string;
  bizType: string;
  bizId: string;
  processInstanceId: string;
  initiatorId: string;
  initiatorName?: string;
  status: ApprovalStatus;
  currentTask?: string;
  approvers?: string[];
  createdAt: string;
}

// API响应格式（匹配后端实际返回格式）
export interface ApiResponse<T = any> {
  resp_code: number;
  resp_msg: string;
  datas: T;
}

// 分页响应格式
export interface PageResult<T = any> {
  records: T[];
  total: number;
  pages: number;
  current: number;
  size: number;
}

// 表格操作类型
export type TableAction = 'view' | 'edit' | 'delete' | 'approval' | 'participant';

