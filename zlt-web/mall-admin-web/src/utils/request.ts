/**
 * Request utility for API calls
 * 基于原生 fetch 的简单封装
 */

export interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  resp_code: number;
  resp_msg?: string;
  datas?: T;
  data?: T;
}

export async function request<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...rest } = options;

  // 处理 URL 参数
  let fullUrl = url;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString;
    }
  }

  const response = await fetch(fullUrl, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...rest.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data as T;
}

export interface Result<T> {
  resp_code: number;
  resp_msg?: string;
  datas?: T;
}