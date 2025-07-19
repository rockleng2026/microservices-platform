import { request } from '@/utils/request';
import { API_ENDPOINTS } from '@/config/api';

interface ApiResponse<T> {
  resp_code: number;
  resp_msg: string;
  datas: T;
}

const API_BASE = `${API_ENDPOINTS.SOO}/api/soo/v2/model-instances`;

export interface FinancialModelInstance {
  id: number;
  instanceCode: string;
  instanceName: string;
  modelId: number;
  projectId?: number;
  instanceStatus: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  instanceVersion: string;
  instanceDescription?: string;
  instanceConfig?: string;
  calculationResult?: string;
  lastCalculatedAt?: string;
  calculationStatus: 'PENDING' | 'CALCULATING' | 'COMPLETED' | 'FAILED';
  creatorId: number;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  // 关联信息
  financialModel?: {
    id: number;
    modelName: string;
    modelCode: string;
  };
  creatorName?: string;
  projectName?: string;
}

export interface ModelInstanceVariable {
  id: number;
  instanceId: number;
  variableId: number;
  variableValue?: string;
  calculatedValue?: string;
  isCalculated: number;
  calculationError?: string;
  createdAt: string;
  updatedAt: string;
  // 关联信息
  modelVariable?: {
    id: number;
    variableCode: string;
    variableName: string;
    variableType: string;
    dataType: string;
    unit?: string;
    isRequired: boolean;
    displayOrder: number;
  };
  variableCode?: string;
  variableName?: string;
  variableType?: string;
  dataType?: string;
  unit?: string;
  isRequired?: boolean;
  displayOrder?: number;
}

export interface InstanceFormData {
  instanceCode: string;
  instanceName: string;
  modelId: number;
  projectId?: number;
  instanceDescription?: string;
  instanceVersion?: string;
  variables?: ModelInstanceVariable[];
}

export interface CalculationRequest {
  instanceId: number;
  calculationType: 'MANUAL' | 'AUTO' | 'SCHEDULED';
}

export interface CalculationResult {
  success: boolean;
  message: string;
  data?: any;
  executionTime?: number;
}

export interface PageResult<T> {
  data: T[];
  count: number;
  page: number;
  size: number;
  pages: number;
  resp_code: number;
  resp_msg?: string;
}

export class FinancialModelInstanceAPI {
  /**
   * 分页查询模型实例列表
   */
  static async getInstances(params: {
    page: number;
    size: number;
    modelId?: number;
    projectId?: number;
    instanceStatus?: string;
    keyword?: string;
  }): Promise<PageResult<FinancialModelInstance>> {
    const response = await request<PageResult<FinancialModelInstance>>(API_BASE, {
      method: 'GET',
      params,
    });

    // 直接返回PageResult格式的响应
    return response;
  }

  /**
   * 获取模型实例详情
   */
  static async getInstanceDetail(id: number): Promise<Map<string, any>> {
    const response = await request<ApiResponse<Map<string, any>>>(`${API_BASE}/${id}`, {
      method: 'GET',
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '获取模型实例详情失败');
  }

  /**
   * 创建模型实例
   */
  static async createInstance(data: InstanceFormData): Promise<FinancialModelInstance> {
    const response = await request<ApiResponse<FinancialModelInstance>>(API_BASE, {
      method: 'POST',
      data,
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '创建模型实例失败');
  }

  /**
   * 更新模型实例
   */
  static async updateInstance(id: number, data: Partial<InstanceFormData>): Promise<FinancialModelInstance> {
    const response = await request<ApiResponse<FinancialModelInstance>>(`${API_BASE}/${id}`, {
      method: 'PUT',
      data,
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '更新模型实例失败');
  }

  /**
   * 删除模型实例
   */
  static async deleteInstance(id: number): Promise<boolean> {
    const response = await request<ApiResponse<boolean>>(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '删除模型实例失败');
  }

  /**
   * 启用/禁用模型实例
   */
  static async toggleInstanceStatus(id: number, isActive: boolean): Promise<boolean> {
    const response = await request<ApiResponse<boolean>>(`${API_BASE}/${id}/status`, {
      method: 'PUT',
      data: { isActive },
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '更新模型实例状态失败');
  }

  /**
   * 克隆模型实例
   */
  static async cloneInstance(sourceInstanceId: number, newInstanceCode: string, newInstanceName: string): Promise<FinancialModelInstance> {
    const response = await request<ApiResponse<FinancialModelInstance>>(`${API_BASE}/${sourceInstanceId}/clone`, {
      method: 'POST',
      data: {
        newInstanceCode,
        newInstanceName,
      },
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '克隆模型实例失败');
  }

  /**
   * 验证模型实例
   */
  static async validateInstance(id: number): Promise<Map<string, any>> {
    const response = await request<ApiResponse<Map<string, any>>>(`${API_BASE}/${id}/validate`, {
      method: 'POST',
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '验证模型实例失败');
  }

  /**
   * 执行实例计算
   */
  static async executeCalculation(data: CalculationRequest): Promise<CalculationResult> {
    const response = await request<ApiResponse<CalculationResult>>(`${API_BASE}/${data.instanceId}/calculate`, {
      method: 'POST',
      data: {
        calculationType: data.calculationType,
      },
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '执行计算失败');
  }

  /**
   * 获取实例变量列表
   */
  static async getInstanceVariables(instanceId: number): Promise<ModelInstanceVariable[]> {
    const response = await request<ApiResponse<ModelInstanceVariable[]>>(`${API_BASE}/${instanceId}/variables`, {
      method: 'GET',
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '获取实例变量列表失败');
  }

  /**
   * 更新实例变量值
   */
  static async updateInstanceVariables(instanceId: number, variables: ModelInstanceVariable[]): Promise<boolean> {
    const response = await request<ApiResponse<boolean>>(`${API_BASE}/${instanceId}/variables`, {
      method: 'PUT',
      data: { variables },
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '更新实例变量失败');
  }

  /**
   * 导出实例配置
   */
  static async exportInstanceConfig(id: number): Promise<void> {
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
    link.download = `模型实例配置_${id}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * 导入实例配置
   */
  static async importInstanceConfig(configJson: string): Promise<FinancialModelInstance> {
    const response = await request<ApiResponse<FinancialModelInstance>>(`${API_BASE}/import`, {
      method: 'POST',
      data: { configJson },
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '导入实例配置失败');
  }

  /**
   * 根据模型ID获取实例列表
   */
  static async getInstancesByModelId(modelId: number): Promise<FinancialModelInstance[]> {
    const response = await request<ApiResponse<FinancialModelInstance[]>>(`${API_BASE}/by-model/${modelId}`, {
      method: 'GET',
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '获取模型实例列表失败');
  }

  /**
   * 根据项目ID获取实例列表
   */
  static async getInstancesByProjectId(projectId: number): Promise<FinancialModelInstance[]> {
    const response = await request<ApiResponse<FinancialModelInstance[]>>(`${API_BASE}/by-project/${projectId}`, {
      method: 'GET',
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '获取项目实例列表失败');
  }

  /**
   * 获取实例统计信息
   */
  static async getInstanceStatistics(): Promise<Map<string, any>> {
    const response = await request<ApiResponse<Map<string, any>>>(`${API_BASE}/statistics`, {
      method: 'GET',
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '获取实例统计信息失败');
  }

  /**
   * 获取最近使用的实例
   */
  static async getRecentlyUsedInstances(limit: number = 10): Promise<FinancialModelInstance[]> {
    const response = await request<ApiResponse<FinancialModelInstance[]>>(`${API_BASE}/recent`, {
      method: 'GET',
      params: { limit },
    });

    if (response.resp_code === 0) {
      return response.datas;
    }
    throw new Error(response.resp_msg || '获取最近使用的实例失败');
  }
} 