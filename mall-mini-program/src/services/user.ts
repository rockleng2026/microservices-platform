import { API_BASE, TENANT_ID, ADDRESS_SAVE } from '@/config/api'

const request = <T>(url: string, options?: any): Promise<T> => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${url}`,
      ...options,
      header: {
        ...options?.header,
        'x-tenant-header': TENANT_ID,
        'Authorization': uni.getStorageSync('token') || ''
      },
      success: (res: any) => {
        if (res.statusCode === 200) {
          if (res.data.resp_code === 200 || res.data.resp_code === 0) {
            resolve(res.data.datas || res.data.data || res.data)
          } else if (res.data.resp_code === 401) {
            // 未登录，清除本地用户信息并跳转登录页
            uni.removeStorageSync('token')
            uni.removeStorageSync('userInfo')
            uni.showToast({ title: '请先登录', icon: 'none' })
            setTimeout(() => {
              uni.navigateTo({ url: '/pages/login/index' })
            }, 1500)
            reject(new Error(res.data.resp_msg || '请先登录'))
          } else {
            reject(new Error(res.data.msg || res.data.resp_msg || '请求失败'))
          }
        } else if (res.statusCode === 401) {
          uni.removeStorageSync('token')
          uni.removeStorageSync('userInfo')
          uni.showToast({ title: '登录已过期，请重新登录', icon: 'none' })
          setTimeout(() => {
            uni.navigateTo({ url: '/pages/login/index' })
          }, 1500)
          reject(res)
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

// Get member info including points balance (MINI-09-01, MINI-09-07)
export const getMemberInfo = (): Promise<{
  userId: number;
  nickname: string;
  avatar: string;
  phone: string;
  points: number;
  level: number;
}> => {
  return request('/api/mall/member/info', { method: 'GET' });
};

// Get points history (MINI-09-07)
export const getPointsLog = (page: number = 1, pageSize: number = 10): Promise<{
  list: Array<{
    id: number;
    type: 'earn' | 'deduct';
    points: number;
    reason: string;
    createTime: string;
  }>;
  total: number;
}> => {
  return request('/api/mall/member/points/log', {
    method: 'GET',
    params: { page, pageSize }
  });
};

// Get user coupons (MINI-09-04)
export const getMyCoupons = (status?: number): Promise<{
  list: Array<{
    id: number;
    name: string;
    type: string;
    discount: number;
    minAmount: number;
    validStartTime: string;
    validEndTime: string;
    status: 'unused' | 'used' | 'expired';
  }>;
  total: number;
}> => {
  return request('/api/mall/member/coupons', {
    method: 'GET',
    params: { status }
  });
};

// Get favorites (MINI-09-05)
export const getFavorites = (page: number = 1, pageSize: number = 10): Promise<{
  list: Array<{
    id: number;
    goodsId: number;
    goodsName: string;
    price: number;
    image: string;
    createTime: string;
  }>;
  total: number;
}> => {
  return request('/api/mall/member/favorites', {
    method: 'GET',
    params: { page, pageSize }
  });
};

// Remove from favorites (MINI-09-06)
export const removeFavorite = (id: number): Promise<void> => {
  return request(`/api/mall/member/favorites/${id}`, { method: 'DELETE' });
};

// WeChat address response from wx.chooseAddress
export interface WeChatAddress {
  userName: string
  telNumber: string
  provinceName: string
  cityName: string
  countyName: string
  detailInfo: string
}

// Save WeChat address to backend
export const saveWeChatAddress = (wechatAddr: WeChatAddress): Promise<void> => {
  const addressDto = {
    receiverName: wechatAddr.userName,
    phone: wechatAddr.telNumber,
    province: wechatAddr.provinceName,
    city: wechatAddr.cityName,
    district: wechatAddr.countyName,
    detail: wechatAddr.detailInfo,
    isDefault: 0
  }
  return request<void>(ADDRESS_SAVE, {
    method: 'POST',
    data: addressDto
  })
}