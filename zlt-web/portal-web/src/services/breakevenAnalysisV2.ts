import { request } from '@/utils/request';

// 盈亏平衡分析请求接口
export interface BreakevenCalculateRequest {
  modelId: number;
  variableValues: Record<string, any>;
}

// 场景分析请求接口
export interface ScenarioAnalysisRequest {
  modelId: number;
  scenarios: Array<{
    scenarioName: string;
    [key: string]: any;
  }>;
}

// 敏感性分析请求接口
export interface SensitivityAnalysisRequest {
  modelId: number;
  baseValues: Record<string, any>;
  sensitivityConfig: {
    variables: string[];
    changePercent: number;
  };
}

// 预测分析请求接口
export interface ForecastAnalysisRequest {
  modelId: number;
  baseValues: Record<string, any>;
  forecastConfig: {
    periods: number;
    growthRate: number;
    periodType: string;
  };
}

// 图表数据请求接口
export interface ChartDataRequest {
  modelId: number;
  variableValues: Record<string, any>;
  chartType?: string;
  dataPoints?: number;
}

// 保存分析请求接口
export interface SaveAnalysisRequest {
  analysisName: string;
  modelId: number;
  analysisResult: Record<string, any>;
  variableValues: Record<string, any>;
}

// 导出报告请求接口
export interface ExportReportRequest {
  exportFormat: string;
  analysisResult: Record<string, any>;
}

// API响应接口
export interface ApiResponse<T> {
  resp_code: number;
  resp_msg?: string;
  datas: T;
}

/**
 * 盈亏平衡分析V2 API服务类
 */
export class BreakevenAnalysisV2API {
  private static readonly BASE_URL = '/api-soo/api/soo/v2/breakeven';

  /**
   * 获取可用的财务模型列表
   */
  static async getAvailableModels(): Promise<ApiResponse<any[]>> {
    return request(`${this.BASE_URL}/models`, {
      method: 'GET',
    });
  }

  /**
   * 获取模型的变量列表
   */
  static async getModelVariables(modelId: number): Promise<ApiResponse<any[]>> {
    return request(`${this.BASE_URL}/models/${modelId}/variables`, {
      method: 'GET',
    });
  }

  /**
   * 执行盈亏平衡分析
   */
  static async calculateBreakeven(params: BreakevenCalculateRequest): Promise<ApiResponse<any>> {
    return request(`${this.BASE_URL}/calculate`, {
      method: 'POST',
      data: params,
    });
  }

  /**
   * 批量场景分析
   */
  static async performScenarioAnalysis(params: ScenarioAnalysisRequest): Promise<ApiResponse<any>> {
    return request(`${this.BASE_URL}/scenario-analysis`, {
      method: 'POST',
      data: params,
    });
  }

  /**
   * 敏感性分析
   */
  static async performSensitivityAnalysis(params: SensitivityAnalysisRequest): Promise<ApiResponse<any>> {
    return request(`${this.BASE_URL}/sensitivity-analysis`, {
      method: 'POST',
      data: params,
    });
  }

  /**
   * 预测分析
   */
  static async performForecastAnalysis(params: ForecastAnalysisRequest): Promise<ApiResponse<any>> {
    return request(`${this.BASE_URL}/forecast-analysis`, {
      method: 'POST',
      data: params,
    });
  }

  /**
   * 获取盈亏平衡图表数据
   */
  static async getBreakevenChartData(params: ChartDataRequest): Promise<ApiResponse<any>> {
    return request(`${this.BASE_URL}/chart-data`, {
      method: 'POST',
      data: params,
    });
  }

  /**
   * 保存分析结果
   */
  static async saveAnalysisResult(params: SaveAnalysisRequest): Promise<ApiResponse<any>> {
    return request(`${this.BASE_URL}/save-analysis`, {
      method: 'POST',
      data: params,
    });
  }

  /**
   * 获取分析历史列表
   */
  static async getAnalysisHistory(modelId?: number, page = 1, size = 20): Promise<ApiResponse<any[]>> {
    const queryParams = new URLSearchParams();
    if (modelId) queryParams.append('modelId', modelId.toString());
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());

    return request(`${this.BASE_URL}/analysis-history?${queryParams.toString()}`, {
      method: 'GET',
    });
  }

  /**
   * 导出分析报告
   */
  static async exportAnalysisReport(params: ExportReportRequest): Promise<ApiResponse<any>> {
    return request(`${this.BASE_URL}/export-report`, {
      method: 'POST',
      data: params,
    });
  }
}

export default BreakevenAnalysisV2API; 