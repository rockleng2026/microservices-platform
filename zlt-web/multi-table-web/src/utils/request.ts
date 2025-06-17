import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'

// 通用的请求拦截器配置
const setupInterceptors = (instance: AxiosInstance, serviceName: string) => {
  // 请求拦截器
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // 从localStorage获取token
      const token = localStorage.getItem('access_token')
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      // 从存储的用户信息中获取tenantId并设置请求头
      const currentUser = localStorage.getItem('currentUser')
      if (currentUser && config.headers) {
        try {
          const userInfo = JSON.parse(currentUser)
          if (userInfo.tenantId) {
            config.headers['x-tenant-header'] = userInfo.tenantId
          }
        } catch (error) {
          console.warn('解析用户信息失败，无法设置tenant header:', error)
        }
      }
      
      console.log(`${serviceName}请求:`, config.method?.toUpperCase(), config.url, config.data)
      console.log(`${serviceName}请求头:`, config.headers)
      return config
    },
    (error) => {
      console.error(`${serviceName}请求错误:`, error)
      return Promise.reject(error)
    }
  )

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log(`${serviceName}响应:`, response.status, response.config.url, response.data)
      return response
    },
    (error) => {
      console.error(`${serviceName}响应错误:`, error)
      
      const { response } = error
      if (response) {
        const { status, data } = response
        
        switch (status) {
          case 400:
            message.error(data?.message || data?.resp_msg || '请求参数错误')
            break
          case 401:
            message.error('未授权，请重新登录')
            // 清除token并跳转登录页
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            localStorage.removeItem('userInfo')
            localStorage.removeItem('currentUser')
            localStorage.removeItem('basicUserInfo')
            window.location.href = '/login'
            break
          case 403:
            message.error('拒绝访问')
            break
          case 404:
            message.error('请求地址不存在')
            break
          case 500:
            message.error(data?.resp_msg || data?.message || '服务器内部错误')
            break
          default:
            message.error(`请求失败：${status}`)
        }
      } else if (error.code === 'ECONNABORTED') {
        message.error('请求超时')
      } else {
        message.error('网络错误')
      }
      
      return Promise.reject(error)
    }
  )
}

// 创建服务实例的工厂函数
export const createService = (baseURL: string, serviceName: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  
  setupInterceptors(instance, serviceName)
  return instance
}

// 创建默认的axios实例（UAA服务）
const service: AxiosInstance = createService('http://127.0.0.1:9900/api-uaa', 'UAA')

// 创建Portal服务的axios实例
export const portalService: AxiosInstance = createService('http://127.0.0.1:9900/api-portal', 'Portal')

// 创建多维表格服务的axios实例
export const multiTableService: AxiosInstance = createService('http://127.0.0.1:9900/api-multitable', 'MultiTable')

export default service 