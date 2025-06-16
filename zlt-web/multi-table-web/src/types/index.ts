// 表格相关类型定义
export interface TableSchema {
  id: string
  name: string
  description?: string
  teamId: string
  createdBy: string
  createdAt: string
  updatedAt: string
  fields: FieldSchema[]
}

// 字段类型定义
export interface FieldSchema {
  id: string
  tableId: string
  name: string
  type: FieldType
  config: FieldConfig
  orderIndex: number
  required?: boolean
  unique?: boolean
  description?: string
}

// 字段类型枚举
export enum FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  BOOLEAN = 'BOOLEAN',
  USER = 'USER',
  FORMULA = 'FORMULA',
  LINK = 'LINK',
  ATTACHMENT = 'ATTACHMENT',
  SINGLE_SELECT = 'SINGLE_SELECT',
  MULTI_SELECT = 'MULTI_SELECT'
}

// 字段配置
export interface FieldConfig {
  [key: string]: any
  // 文本字段配置
  maxLength?: number
  // 数字字段配置
  min?: number
  max?: number
  precision?: number
  // 选择字段配置
  options?: SelectOption[]
  // 关联字段配置
  linkedTableId?: string
  linkedFieldId?: string
  // 公式字段配置
  formula?: string
}

// 选择选项
export interface SelectOption {
  id: string
  label: string
  color?: string
  value: string
}

// 视图类型定义
export interface ViewSchema {
  id: string
  tableId: string
  name: string
  type: ViewType
  config: ViewConfig
  createdBy: string
  createdAt: string
  updatedAt: string
}

// 视图类型枚举
export enum ViewType {
  GRID = 'GRID',
  KANBAN = 'KANBAN',
  GALLERY = 'GALLERY',
  FORM = 'FORM',
  CALENDAR = 'CALENDAR',
  GANTT = 'GANTT'
}

// 视图配置
export interface ViewConfig {
  filters?: FilterConfig[]
  sorts?: SortConfig[]
  groups?: GroupConfig[]
  hiddenFields?: string[]
  fieldWidths?: Record<string, number>
}

// 过滤配置
export interface FilterConfig {
  fieldId: string
  operator: FilterOperator
  value: any
}

// 过滤操作符
export enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  IS_EMPTY = 'is_empty',
  IS_NOT_EMPTY = 'is_not_empty'
}

// 排序配置
export interface SortConfig {
  fieldId: string
  direction: 'asc' | 'desc'
}

// 分组配置
export interface GroupConfig {
  fieldId: string
  direction: 'asc' | 'desc'
}

// 行数据类型
export interface RowData {
  id: string
  tableId: string
  data: Record<string, any>
  createdBy: string
  createdAt: string
  updatedBy: string
  updatedAt: string
}

// 用户信息
export interface UserInfo {
  id: string
  username: string
  email: string
  avatar?: string
  displayName?: string
}

// 团队信息
export interface TeamInfo {
  id: string
  name: string
  description?: string
  ownerId: string
  members: TeamMember[]
  createdAt: string
  updatedAt: string
}

// 团队成员
export interface TeamMember {
  userId: string
  role: TeamRole
  joinedAt: string
}

// 团队角色
export enum TeamRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER'
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  code?: number
}

// 分页参数
export interface PaginationParams {
  page: number
  pageSize: number
  total?: number
}

// 分页响应
export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationParams
} 