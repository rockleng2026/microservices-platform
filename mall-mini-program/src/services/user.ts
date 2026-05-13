import { API_BASE } from '@/config/api'

const request = <T>(url: string, options?: any): Promise<T> => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${url}`,
      ...options,
      header: {
        'x-tenant-header': 'default',
        'Authorization': uni.getStorageSync('token') || '',
        ...options?.header
      },
      success: (res: any) => {
        if (res.statusCode === 200) {
          if (res.data.code === 200 || res.data.code === 0) {
            resolve(res.data.datas || res.data.data || res.data)
          } else {
            reject(new Error(res.data.msg || '请求失败'))
          }
        } else {
          reject(res)
        }
      },
      fail: reject
    })
  })
}

export interface UserProfile {
  userId: number
  nickname: string
  avatar: string
  phone?: string
  gender?: number
  birthday?: string
  province?: string
  city?: string
}

// Get user info from local storage
export const getLocalUserInfo = (): UserProfile | null => {
  const userInfo = uni.getStorageSync('userInfo')
  return userInfo || null
}

// Update user profile locally
export const updateLocalUserInfo = (profile: Partial<UserProfile>): void => {
  const userInfo = uni.getStorageSync('userInfo') || {}
  uni.setStorageSync('userInfo', { ...userInfo, ...profile })
}

// Get user profile from server
export const getUserProfile = (): Promise<UserProfile> => {
  return request<UserProfile>('/api/mall/member/info', { method: 'GET' })
}

// Update user profile on server
export const updateProfile = (profile: Partial<UserProfile>): Promise<any> => {
  return request('/api/mall/member/update', {
    method: 'POST',
    data: profile
  })
}