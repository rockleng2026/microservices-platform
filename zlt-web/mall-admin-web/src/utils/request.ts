/**
 * Request utility for API calls
 */
import { request } from 'umi';

export { request };

export interface Result<T> {
  resp_code: number;
  resp_msg?: string;
  datas?: T;
}