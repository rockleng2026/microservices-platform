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
    return result;
  } catch (error) {
    throw error;
  }
} 