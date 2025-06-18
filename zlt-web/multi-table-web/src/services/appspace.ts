import { multiTableService } from '../utils/request'

export interface AppSpace {
  id?: number
  uniCode?: string
  tenantId?: string
  name: string
  description?: string
  teamId?: number
  icon?: string
  color?: string
  createdBy?: number
  tableCount?: number
  viewCount?: number
  isTemplate?: number
  templateCategory?: string
  status?: number
  createTime?: string
  updateTime?: string
}

export interface AppSpaceListResponse {
  resp_code: number
  resp_msg: string
  datas: AppSpace[]
}

export interface AppSpaceResponse {
  resp_code: number
  resp_msg: string
  datas: AppSpace
}

export interface AppSpaceCreateRequest {
  name: string
  description?: string
  teamId?: number
  icon?: string
  color?: string
}

/**
 * 获取应用空间列表
 */
export const getAppSpaceList = async (): Promise<AppSpaceListResponse> => {
  const response = await multiTableService.get('/api/app-spaces')
  return response.data
}

/**
 * 根据团队ID获取应用空间列表
 */
export const getAppSpaceListByTeam = async (teamId: number): Promise<AppSpaceListResponse> => {
  const response = await multiTableService.get(`/api/app-spaces/team/${teamId}`)
  return response.data
}

/**
 * 根据编码获取应用空间详情
 */
export const getAppSpaceByCode = async (uniCode: string): Promise<AppSpaceResponse> => {
  const response = await multiTableService.get(`/api/app-spaces/${uniCode}`)
  return response.data
}

/**
 * 创建应用空间
 */
export const createAppSpace = async (data: AppSpaceCreateRequest): Promise<any> => {
  const response = await multiTableService.post('/api/app-spaces', data)
  return response.data
}

/**
 * 更新应用空间
 */
export const updateAppSpace = async (id: number, data: Partial<AppSpace>): Promise<any> => {
  const response = await multiTableService.put(`/api/app-spaces/${id}`, data)
  return response.data
}

/**
 * 删除应用空间
 */
export const deleteAppSpace = async (id: number): Promise<any> => {
  const response = await multiTableService.delete(`/api/app-spaces/${id}`)
  return response.data
}

/**
 * 创建应用空间（包含默认表格和字段）
 */
export const createAppSpaceWithDefaults = async (tenantId: string, teamId: number, createdBy: number): Promise<AppSpaceResponse> => {
  const response = await multiTableService.post(`/api/app-spaces/create-with-defaults`, null, {
    params: {
      tenantId,
      teamId,
      createdBy
    }
  })
  return response.data
} 