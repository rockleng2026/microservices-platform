import { request } from '../utils/request';

// 统一处理响应数据格式兼容性
const handleResponse = (response: any) => {
  if (response.resp_code === 0 || response.success) {
    const data = response.data || response.datas;
    if (data && data.records) {
      return {
        success: true,
        data: {
          list: data.records,
          total: data.total,
          current: data.current,
          size: data.size,
        },
      };
    }
    return { success: true, data };
  } else {
    return {
      success: false,
      message: response.resp_msg || response.message || '请求失败',
    };
  }
};

// ==================== 部门分红配置 ====================

// 分页查询
export const getDepartmentBonusList = (params: any) => {
  return request('/api-soo/api/soo/department-bonus-config/page', {
    method: 'GET',
    params,
  }).then(handleResponse);
};

// 新增
export const addDepartmentBonus = (data: any) => {
  return request('/api-soo/api/soo/department-bonus-config', {
    method: 'POST',
    data,
  }).then(handleResponse);
};

// 编辑
export const updateDepartmentBonus = (id: string, data: any) => {
  return request(`/api-soo/api/soo/department-bonus-config/${id}`, {
    method: 'PUT',
    data,
  }).then(handleResponse);
};

// 删除
export const deleteDepartmentBonus = (id: string) => {
  return request(`/api-soo/api/soo/department-bonus-config/${id}`, {
    method: 'DELETE',
  }).then(handleResponse);
}; 