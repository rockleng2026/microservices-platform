import { request } from 'umi';
import type { 
  RegionalSalaryCoefficient, 
  RegionalSalaryCoefficientQuery,
  CopyToNewRegionRequest 
} from '../types/regional-salary-coefficient';

const API_PREFIX = '/api/soo/regional-salary-coefficient';

export const regionalSalaryCoefficientApi = {
  // 分页查询
  page: (params: RegionalSalaryCoefficientQuery) => {
    return request.get(`${API_PREFIX}/page`, { params });
  },

  // 根据ID查询
  getById: (id: number) => {
    return request.get(`${API_PREFIX}/${id}`);
  },

  // 新增
  create: (data: RegionalSalaryCoefficient) => {
    return request.post(API_PREFIX, data);
  },

  // 更新
  update: (id: number, data: RegionalSalaryCoefficient) => {
    return request.put(`${API_PREFIX}/${id}`, data);
  },

  // 删除
  delete: (id: number) => {
    return request.delete(`${API_PREFIX}/${id}`);
  },

  // 批量删除
  batchDelete: (ids: number[]) => {
    return request.delete(`${API_PREFIX}/batch`, { data: ids });
  },

  // 批量更新状态
  batchUpdateStatus: (ids: number[], status: number) => {
    return request.put(`${API_PREFIX}/batch-status`, null, {
      params: { ids: ids.join(','), status }
    });
  },

  // 获取有效工资系数
  getEffectiveCoefficient: (region: string, targetDate: string) => {
    return request.get(`${API_PREFIX}/effective-coefficient`, {
      params: { region, targetDate }
    });
  },

  // 获取有效地区列表
  getActiveRegions: () => {
    return request.get(`${API_PREFIX}/active-regions`);
  },

  // 复制到新地区
  copyToNewRegion: (data: CopyToNewRegionRequest) => {
    return request.post(`${API_PREFIX}/copy-to-new-region`, null, {
      params: data
    });
  }
}; 