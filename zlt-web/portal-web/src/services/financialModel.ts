import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/config/api';

const API_BASE = `${API_ENDPOINTS.SOO}/api/soo/v2/models`;

export interface FinancialModel {
  id: number;
  modelName: string;
  modelCode: string;
  modelCategory: string;
  modelDescription?: string;
  isActive: boolean;
  variableCount?: number;
  chartCount?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  // 后端返回的其他字段
  modelVersion?: string;
  parentModelId?: number;
  isTemplate?: boolean;
  modelConfig?: any;
  validationRules?: any;
  creatorId?: number;
  tenantId?: string;
}

export interface ModelFormData {
  modelName: string;
  modelCode: string;
  modelCategory: string;
  modelDescription?: string;
  isActive: boolean;
}

export interface PageParams {
  current?: number;
  pageSize?: number;
  keyword?: string;
  category?: string;
  status?: string;
}

export interface PageResult<T> {
  data: T[];
  count: number;
  page: number;
  size: number;
  pages: number;
}

export interface ApiResponse<T = any> {
  resp_code: number;
  datas: T;
  resp_msg: string;
}

/**
 * 财务模型管理API服务
 */
export class FinancialModelAPI {
  
  /**
   * 获取财务模型分页列表
   */
  static async getModels(params: PageParams): Promise<PageResult<FinancialModel>> {
    const response = await request<PageResult<FinancialModel>>(API_BASE, {
      method: 'GET',
      params: {
        page: params.current || 1,
        size: params.pageSize || 20,
        keyword: params.keyword,
        category: params.category,
        isActive: params.status === 'active' ? true : params.status === 'inactive' ? false : undefined,
      },
    });

    // 直接返回PageResult格式的响应
    return response;
  }

  /**
   * 根据ID获取财务模型详情
   */
  static async getModelById(id: number): Promise<FinancialModel> {
    const response = await request<ApiResponse<FinancialModel>>(`${API_BASE}/${id}`, {
      method: 'GET',
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '获取模型详情失败');
  }

  /**
   * 创建财务模型
   */
  static async createModel(data: ModelFormData): Promise<FinancialModel> {
    const response = await request<ApiResponse<FinancialModel>>(API_BASE, {
      method: 'POST',
      data,
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '创建模型失败');
  }

  /**
   * 更新财务模型
   */
  static async updateModel(id: number, data: ModelFormData): Promise<FinancialModel> {
    const response = await request<ApiResponse<FinancialModel>>(`${API_BASE}/${id}`, {
      method: 'PUT',
      data,
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '更新模型失败');
  }

  /**
   * 删除财务模型
   */
  static async deleteModel(id: number): Promise<boolean> {
    const response = await request<ApiResponse<boolean>>(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '删除模型失败');
  }

  /**
   * 导出单个财务模型到Excel
   */
  static async exportModelToExcel(id: number): Promise<void> {
    const token = localStorage.getItem('access_token');
    const tenant = localStorage.getItem('tenant_id') || 'default';
    
    const response = await fetch(`${API_BASE}/${id}/export/excel`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-tenant-header': tenant,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('导出失败');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `财务模型_${id}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * 批量导出财务模型到Excel
   */
  static async exportModelsToExcel(modelIds: number[]): Promise<void> {
    const token = localStorage.getItem('access_token');
    const tenant = localStorage.getItem('tenant_id') || 'default';
    
    const response = await fetch(`${API_BASE}/export/excel/batch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-tenant-header': tenant,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(modelIds),
    });

    if (!response.ok) {
      throw new Error('批量导出失败');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `财务模型批量导出_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * 导出所有财务模型到Excel
   */
  static async exportAllModelsToExcel(): Promise<void> {
    const token = localStorage.getItem('access_token');
    const tenant = localStorage.getItem('tenant_id') || 'default';
    
    const response = await fetch(`${API_BASE}/export/excel/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-tenant-header': tenant,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('导出失败');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `财务模型全量导出_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * 克隆财务模型
   */
  static async cloneModel(
    id: number, 
    newModelCode: string, 
    newModelName: string, 
    includeVariables: boolean = true,
    includeCharts: boolean = true
  ): Promise<FinancialModel> {
    const response = await request<ApiResponse<FinancialModel>>(`${API_BASE}/${id}/clone`, {
      method: 'POST',
      data: {
        newModelCode,
        newModelName,
        includeVariables,
        includeCharts,
      },
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '克隆模型失败');
  }

  /**
   * 获取模型统计信息
   */
  static async getModelStatistics(id: number): Promise<any> {
    const response = await request<ApiResponse<any>>(`${API_BASE}/${id}/statistics`, {
      method: 'GET',
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '获取模型统计失败');
  }

  /**
   * 验证模型配置
   */
  static async validateModel(id: number): Promise<any> {
    const response = await request<ApiResponse<any>>(`${API_BASE}/${id}/validate`, {
      method: 'POST',
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '验证模型失败');
  }

  /**
   * 切换模型状态
   */
  static async toggleModelStatus(id: number, isActive: boolean): Promise<boolean> {
    const response = await request<ApiResponse<boolean>>(`${API_BASE}/${id}/status`, {
      method: 'PUT',
      params: { isActive },
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '切换模型状态失败');
  }

  /**
   * 导出模型配置
   */
  static async exportModelConfig(id: number): Promise<void> {
    const token = localStorage.getItem('access_token');
    const tenant = localStorage.getItem('tenant_id') || 'default';
    
    const response = await fetch(`${API_BASE}/${id}/export`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-tenant-header': tenant,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('导出失败');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `财务模型配置_${id}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * 导入模型配置
   */
  static async importModelConfig(configJson: string): Promise<FinancialModel> {
    const response = await request<ApiResponse<FinancialModel>>(`${API_BASE}/import`, {
      method: 'POST',
      data: { configJson },
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '导入模型配置失败');
  }

  /**
   * 获取分类汇总
   */
  static async getCategorySummary(): Promise<any[]> {
    const response = await request<ApiResponse<any[]>>(`${API_BASE}/categories/summary`, {
      method: 'GET',
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '获取分类汇总失败');
  }

  /**
   * 获取最近使用的模型
   */
  static async getRecentlyUsedModels(limit: number = 10): Promise<FinancialModel[]> {
    const response = await request<ApiResponse<FinancialModel[]>>(`${API_BASE}/recent`, {
      method: 'GET',
      params: { limit },
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '获取最近使用模型失败');
  }

  /**
   * 根据模型编码获取模型
   */
  static async getModelByCode(modelCode: string): Promise<FinancialModel> {
    const response = await request<ApiResponse<FinancialModel>>(`${API_BASE}/code/${modelCode}`, {
      method: 'GET',
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '根据编码获取模型失败');
  }
} 