import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/config/api';

const API_BASE = `${API_ENDPOINTS.SOO}/api/soo/v2/variables`;

export interface ModelVariable {
  id: number;
  modelId: number;
  variableName: string;
  variableCode: string;
  variableType: 'INPUT' | 'CALC' | 'API'; // 匹配数据库enum
  dataType: 'NUMBER' | 'DECIMAL' | 'PERCENTAGE' | 'CURRENCY' | 'BOOLEAN' | 'STRING'; // 匹配数据库enum
  defaultValue?: string | number;
  unit?: string;
  description?: string;
  formulaExpression?: string;
  isRequired: boolean;
  validationRules?: string;
  displayOrder: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VariableFormData {
  modelId: number;
  variableName: string;
  variableCode: string;
  variableType: 'input' | 'calculated' | 'constant'; // 前端使用的类型
  dataType: 'number' | 'string' | 'boolean' | 'date' | 'decimal' | 'percentage' | 'currency'; // 前端使用的类型
  defaultValue?: string | number;
  unit?: string;
  description?: string;
  formulaExpression?: string;
  isRequired: boolean;
  validationRules?: string;
  displayOrder: number;
  isVisible: boolean;
}

export interface PageParams {
  current?: number;
  pageSize?: number;
  modelId?: number;
  keyword?: string;
  variableType?: string;
  dataType?: string;
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
 * 模型变量管理API服务
 */
export class ModelVariableAPI {
  
  /**
   * 获取模型变量分页列表
   */
  static async getVariables(params: PageParams): Promise<PageResult<ModelVariable>> {
    const response = await request<ApiResponse<PageResult<ModelVariable>>>(API_BASE, {
      method: 'GET',
      params: {
        page: params.current || 1,
        size: params.pageSize || 20,
        modelId: params.modelId,
        keyword: params.keyword,
        variableType: params.variableType,
        dataType: params.dataType,
      },
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '获取变量列表失败');
  }

  /**
   * 根据ID获取变量详情
   */
  static async getVariableById(id: number): Promise<ModelVariable> {
    const response = await request<ApiResponse<ModelVariable>>(`${API_BASE}/${id}`, {
      method: 'GET',
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '获取变量详情失败');
  }

  /**
   * 创建模型变量
   */
  static async createVariable(data: VariableFormData): Promise<ModelVariable> {
    const response = await request<ApiResponse<ModelVariable>>(API_BASE, {
      method: 'POST',
      data,
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '创建变量失败');
  }

  /**
   * 更新模型变量
   */
  static async updateVariable(id: number, data: VariableFormData): Promise<ModelVariable> {
    const response = await request<ApiResponse<ModelVariable>>(`${API_BASE}/${id}`, {
      method: 'PUT',
      data,
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '更新变量失败');
  }

  /**
   * 删除模型变量
   */
  static async deleteVariable(id: number): Promise<boolean> {
    const response = await request<ApiResponse<boolean>>(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '删除变量失败');
  }

  /**
   * 批量删除变量
   */
  static async batchDeleteVariables(ids: number[]): Promise<boolean> {
    const response = await request<ApiResponse<boolean>>(`${API_BASE}/batch-delete`, {
      method: 'POST',
      data: { ids },
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '批量删除变量失败');
  }

  /**
   * 根据模型ID获取变量列表
   */
  static async getVariablesByModelId(modelId: number): Promise<ModelVariable[]> {
    const response = await request<ApiResponse<ModelVariable[]>>(`${API_BASE}/model/${modelId}`, {
      method: 'GET',
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '获取模型变量失败');
  }

  /**
   * 验证变量公式
   */
  static async validateFormula(modelId: number, formula: string): Promise<any> {
    const response = await request<ApiResponse<any>>(`${API_BASE}/validate-formula`, {
      method: 'POST',
      data: { modelId, formula },
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '验证公式失败');
  }

  /**
   * 复制变量
   */
  static async cloneVariable(
    id: number, 
    newVariableCode: string, 
    newVariableName: string
  ): Promise<ModelVariable> {
    const response = await request<ApiResponse<ModelVariable>>(`${API_BASE}/${id}/clone`, {
      method: 'POST',
      data: {
        newVariableCode,
        newVariableName,
      },
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '复制变量失败');
  }

  /**
   * 批量更新变量顺序
   */
  static async updateVariableOrder(variables: { id: number; displayOrder: number }[]): Promise<boolean> {
    const response = await request<ApiResponse<boolean>>(`${API_BASE}/update-order`, {
      method: 'PUT',
      data: { variables },
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '更新变量顺序失败');
  }

  /**
   * 获取变量统计信息
   */
  static async getVariableStatistics(modelId: number): Promise<any> {
    const response = await request<ApiResponse<any>>(`${API_BASE}/statistics/${modelId}`, {
      method: 'GET',
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '获取变量统计失败');
  }

  /**
   * 导出变量配置
   */
  static async exportVariables(modelId: number): Promise<string> {
    const response = await request<ApiResponse<string>>(`${API_BASE}/export/${modelId}`, {
      method: 'GET',
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '导出变量配置失败');
  }

  /**
   * 导入变量配置
   */
  static async importVariables(modelId: number, configJson: string): Promise<ModelVariable[]> {
    const response = await request<ApiResponse<ModelVariable[]>>(`${API_BASE}/import/${modelId}`, {
      method: 'POST',
      data: { configJson },
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '导入变量配置失败');
  }
} 