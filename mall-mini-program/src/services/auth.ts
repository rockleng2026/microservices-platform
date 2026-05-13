import { API_BASE } from '@/config/api'

const request = <T>(url: string, options?: any): Promise<T> => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${url}`,
      ...options,
      header: {
        'x-tenant-header': 'default',
        ...options?.header
      },
      success: (res: any) => {
        if (res.statusCode === 200) {
          // 解析后端返回的标准Result格式 (resp_code: 0表示成功, 200也可能)
          if (res.data.resp_code === 0 || res.data.resp_code === 200 || res.data.code === 0 || res.data.code === 200) {
            resolve(res.data.datas || res.data.data || res.data)
          } else {
            reject(new Error(res.data.resp_msg || res.data.msg || '请求失败'))
          }
        } else {
          reject(res)
        }
      },
      fail: reject
    })
  })
}

export interface LoginResult {
  token: string
  userId: number
  nickname?: string
  avatar?: string
}

export interface SendCodeResult {
  code?: string  // 测试环境返回
  expire: number
}

// 微信授权登录
export const wxLogin = (code: string, nickname?: string, avatar?: string): Promise<LoginResult> => {
  return request<LoginResult>('/api/mall/auth/wxlogin', {
    method: 'POST',
    data: { code, nickname, avatar }
  })
}

// 账号密码登录
export const login = (username: string, password: string): Promise<LoginResult> => {
  return request<LoginResult>('/api/mall/auth/login', {
    method: 'POST',
    data: { username, password }
  })
}

// 用户注册
export const register = (params: {
  username: string
  password: string
  phone: string
  code?: string
}): Promise<LoginResult> => {
  return request<LoginResult>('/api/mall/auth/register', {
    method: 'POST',
    data: params
  })
}

// 发送验证码
export const sendCode = (phone: string, type: 'login' | 'register' | 'reset'): Promise<SendCodeResult> => {
  return request<SendCodeResult>('/api/mall/auth/send-code', {
    method: 'POST',
    data: { phone, type }
  })
}

// 重置密码
export const resetPassword = (phone: string, code: string, newPassword: string): Promise<any> => {
  return request('/api/mall/auth/reset-pwd', {
    method: 'POST',
    data: { phone, code, newPassword }
  })
}

// 获取用户信息
export const getUserInfo = (): Promise<any> => {
  return request('/api/mall/user/info', { method: 'GET' })
}