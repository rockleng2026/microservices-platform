import request, { portalService } from '../utils/request'

export interface LoginForm {
  username: string
  password: string
  validCode: string
  deviceId: string
}

export interface LoginResponse {
  resp_code: number
  resp_msg?: string
  datas: {
    access_token: string
    token_type: string
    refresh_token: string
    expires_in: number
    scope?: string
    account_type?: string
    userInfo?: {
      id: string
      username: string
      nickname: string
      roles: string[]
    }
  }
}

// 员工信息接口
export interface Employee {
  id: string
  empNo: string
  name: string
  nameEn: string
  birthDate: string
  age: number | null
  gender: number
  idCard: string
  mobile: string
  email: string
  departmentId: string
  departmentName: string
  positionId: string
  positionName: string
  gradeId: string
  employmentType: number
  employmentStatus: number
  entryDate: string
  probationEndDate: string | null
  regularizationDate: string | null
  leaveDate: string | null
  leaveReason: string | null
  loginAccountFlag: boolean | null
  education: string
  graduationSchool: string | null
  major: string | null
  nation: string | null
  healthStatus: string | null
  height: number | null
  weight: number | null
  maritalStatus: string | null
  workYears: number | null
  birthplace: string | null
  address: string | null
  emergencyContact: string | null
  emergencyPhone: string | null
  specialty: string | null
  avatar: string | null
  remark: string | null
  delflag: number
  tenantId: string
  createdAt: string
  updatedAt: string
  createdBy: number | null
  updatedBy: number | null
  active: boolean
  probation: boolean
  employmentTypeName: string
  employmentStatusName: string
  genderName: string
}

// 职位信息接口
export interface Position {
  id: number
  name: string
  shortName: string
  departmentId: number
  positionLevel: number
  jobDescription: string
  requirements: string
  salaryRange: string
  maxEmployees: number
  menuIds: string
  menuFuncIds: string
  isManager: number
  isDirector: number
  sortOrder: number
  status: number
  delflag: number | null
  tenantId: string
  createdAt: string
  updatedAt: string
  createdBy: number | null
  updatedBy: number | null
}

// 个人配置接口
export interface PersonalConfig {
  id: number
  userId: number
  defaultPositionId: number
  theme: string
  layoutConfig: string
  language: string
  timezone: string
  homePage: string
  notificationConfig: string
  extendConfig: string
  enabled: boolean
  tenantId: string
  createdAt: string
  updatedAt: string
  createdBy: number
  updatedBy: number
}

// 租户信息接口
export interface Tenant {
  code: string
  name: string
  id: string
}

// 完整用户信息接口
export interface CurrentUserInfo {
  id: number
  createTime: string
  updateTime: string
  username: string
  password: string
  nickname: string
  headImgUrl: string | null
  mobile: string
  sex: number
  enabled: boolean
  type: string
  openId: string | null
  creatorId: number | null
  roles: any[] | null
  roleId: number | null
  oldPassword: string | null
  newPassword: string | null
  permissions: any[] | null
  employeeId: number
  tenantId: string
  company: string | null
  employee: Employee
  positions: Position[]
  currentPosition: Position
  menus: any[] | null
  personalConfig: PersonalConfig
  tenant: Tenant
  del: boolean
}

// 获取当前用户信息响应接口
export interface CurrentUserResponse {
  datas: CurrentUserInfo
  resp_code: number
  resp_msg: string
}

// 用户登录
export const login = async (data: LoginForm): Promise<LoginResponse> => {
  // 客户端凭据
  const clientId = 'webApp'
  const clientSecret = 'webApp'
  
  // 创建Basic认证头
  const credentials = btoa(`${clientId}:${clientSecret}`)
  const authHeader = `Basic ${credentials}`
  
  // 构建查询参数
  const params = new URLSearchParams({
    grant_type: 'password_code',
    username: data.username,
    password: data.password,
    validCode: data.validCode,
    deviceId: data.deviceId,
    account_type: 'portal'
  })
  
  const response = await request.post<LoginResponse>(`/oauth/token?${params}`, null, {
    headers: {
      'Authorization': authHeader
    }
  })
  return response.data
}

// 获取当前用户完整信息
export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  const response = await portalService.get<CurrentUserResponse>('/users/current')
  return response.data
}

// 获取验证码
export const getCaptcha = (uuid: string): string => {
  return `http://127.0.0.1:9900/api-uaa/validata/code/${uuid}`
}

// 刷新token
export const refreshToken = async (refresh_token: string) => {
  const response = await request.post('/oauth/token', {
    grant_type: 'refresh_token',
    refresh_token
  })
  return response.data
}

// 用户登出
export const logout = async () => {
  const response = await request.post('/oauth/logout')
  return response.data
}

// 获取用户信息
export const getUserInfo = async () => {
  const response = await request.get('/user/current')
  return response.data
} 