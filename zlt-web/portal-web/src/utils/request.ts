// 基础请求函数，暂时简化处理
export async function request<T = any>(url: string, options: any = {}): Promise<T> {
  const { method = 'GET', data, params, ...rest } = options;
  
  let requestUrl = url;
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
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