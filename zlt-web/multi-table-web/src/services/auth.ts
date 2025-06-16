import request from '../utils/request'

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