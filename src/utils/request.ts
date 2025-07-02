// 基础请求函数，自动携带认证Token和租户ID
export async function request<T = any>(url: string, options: any = {}): Promise<T> {
  const { method = 'GET', data, params, ...rest } = options;
  
  // 自动添加认证Token和租户ID
  const token = localStorage.getItem('access_token');
  const tenantId = localStorage.getItem('tenant_id') || 'default';
  
  const defaultHeaders: any = {
    'Content-Type': 'application/json',
    'x-tenant-header': tenantId, // 添加租户头
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  let requestUrl = url;
  const requestOptions: RequestInit = {
    method,
    headers: {
      ...defaultHeaders,
      ...rest.headers,
    },
    ...rest,
  };

  // 处理GET请求的参数
  if (params && method === 'GET') {
    const searchParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        searchParams.append(key, params[key]);
      }
    });
    requestUrl += `?${searchParams.toString()}`;
  }

  // 处理请求体
  if (data && method !== 'GET') {
    if (data instanceof FormData) {
      requestOptions.body = data;
      // FormData时不设置Content-Type，让浏览器自动设置
      const headers = requestOptions.headers as any;
      if (headers) {
        delete headers['Content-Type'];
      }
    } else {
      requestOptions.body = JSON.stringify(data);
    }
  }

  try {
    const response = await fetch(requestUrl, requestOptions);
    const result = await response.json();
    
    // 处理401认证失败
    if (response.status === 401 || (result.resp_code === 1 && result.resp_msg && result.resp_msg.includes('Invalid access token'))) {
      // 清除本地存储的认证信息
      localStorage.removeItem('access_token');
      localStorage.removeItem('tenant_id');
      localStorage.removeItem('user_info');
      
      // 跳转到登录页面
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      
      throw new Error('登录已失效，请重新登录');
    }
    
    return result;
  } catch (error) {
    // 如果是网络错误等其他错误，直接抛出
    throw error;
  }
}

// 便捷的请求方法
const requestMethods = {
  get: <T = any>(url: string, params?: any): Promise<T> => 
    request(url, { method: 'GET', params }),
  
  post: <T = any>(url: string, data?: any): Promise<T> => 
    request(url, { method: 'POST', data }),
  
  put: <T = any>(url: string, data?: any): Promise<T> => 
    request(url, { method: 'PUT', data }),
  
  delete: <T = any>(url: string): Promise<T> => 
    request(url, { method: 'DELETE' }),
  
  patch: <T = any>(url: string, data?: any): Promise<T> => 
    request(url, { method: 'PATCH', data }),
};

export default requestMethods; 