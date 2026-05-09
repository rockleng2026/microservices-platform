/**
 * Request utility for API calls
 * Wrapper around umi request with Result<T> handling
 */
import { request } from 'umi';

export interface Result<T> {
  resp_code: number;
  resp_msg?: string;
  datas?: T;
}

/**
 * Send request and return response data
 * Automatically unwraps Result<T> structure
 */
export async function request<T>(url: string, options?: Parameters<typeof request>[1]): Promise<Result<T>> {
  return request<T>(url, options);
}

// Re-export for convenience
export { request };