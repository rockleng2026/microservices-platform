// import { message } from 'antd'
import { multiTableService } from '../utils/request'

// 表格相关接口
export interface TableInfo {
  id: number | string
  tenantId?: number
  name: string
  description?: string
  teamId?: number
  icon?: string
  color?: string
  createdBy?: number
  createTime?: string
  updateTime?: string
  status?: number // 状态：1=正常，0=删除
  deletedAt?: string
  // 前端扩展字段（用于显示）
  rowCount?: number
  columnCount?: number
}

export interface TableListResponse {
  code: number
  count: number
  data: TableInfo[]
}

export interface Result<T> {
  datas: T
  resp_code: number
  resp_msg: string
}

// 获取表格列表
export const getTableList = async (params?: {
  page?: number
  limit?: number
  name?: string
}): Promise<TableListResponse> => {
  const response = await multiTableService.get<TableListResponse>('/api/tables', { params })
  return response.data
}

// 创建表格
export const createTable = async (data: {
  name: string
  description?: string
}): Promise<Result<string>> => {
  const response = await multiTableService.post<Result<string>>('/api/tables', data)
  return response.data
}

// 获取表格详情
export const getTableDetail = async (tableId: string) => {
  const response = await multiTableService.get(`/api/tables/${tableId}`)
  return response.data
}

// 更新表格
export const updateTable = async (tableId: string, data: {
  name?: string
  description?: string
}) => {
  const response = await multiTableService.put(`/api/tables/${tableId}`, data)
  return response.data
}

// 删除表格
export const deleteTable = async (tableId: string) => {
  const response = await multiTableService.delete(`/api/tables/${tableId}`)
  return response.data
}

export default multiTableService 