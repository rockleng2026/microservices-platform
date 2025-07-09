import { request } from '@/utils/request';

const API_PREFIX = '/api-soo/api/soo/breakeven';

// ==================== 盈亏平衡分析核心API ====================

/**
 * 创建盈亏平衡分析 - 根据设计文档实现
 */
export async function createAnalysis(data: any) {
  return request(`${API_PREFIX}/analysis`, {
    method: 'POST',
    data: {
      analysisName: data.analysisName,
      analysisType: data.analysisType || 'monthly',
      period: data.analysisPeriod,
      parameters: {
        currentTotalRevenue: data.currentRevenue,
        currentGrossMargin: data.grossMargin,
        fixedOperatingCost: data.fixedCost,
        variableOperatingCost: data.variableCost,
        totalEmployees: data.totalEmployees,
        avgBaseSalary: data.avgSalary,
        avgPerformanceRatio: data.avgPerformanceRatio || 0.8
      },
      scenarios: data.scenarios || [
        { name: '保守场景', grossMargin: 0.1 },
        { name: '基准场景', grossMargin: 0.3 },
        { name: '乐观场景', grossMargin: 0.65 }
      ],
      description: data.description
    }
  });
}

/**
 * 实时参数调整 - 核心联动计算功能
 */
export async function adjustParameterRealtime(analysisId: string, parameterName: string, newValue: number) {
  return request(`${API_PREFIX}/analysis/${analysisId}/parameters`, {
    method: 'PUT',
    data: {
      parameterName,
      newValue,
      triggerRecalculation: true,
      cascadeLevel: 'full'
    }
  });
}

/**
 * 批量参数更新
 */
export async function batchUpdateParameters(analysisId: string, parameters: Record<string, number>) {
  return request(`${API_PREFIX}/analysis/${analysisId}/parameters/batch`, {
    method: 'PUT',
    data: {
      parameters,
      triggerRecalculation: true,
      cascadeLevel: 'full'
    }
  });
}

/**
 * 获取分析详情 - 包含完整的计算结果
 */
export async function getAnalysisDetail(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}`, {
    method: 'GET'
  });
}

/**
 * 获取实时计算结果
 */
export async function getRealTimeResults(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/realtime`, {
    method: 'GET'
  });
}

// ==================== 场景分析API ====================

/**
 * 获取场景分析结果
 */
export async function getScenarios(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/scenarios`, {
    method: 'GET'
  });
}

/**
 * 创建新场景
 */
export async function createScenario(analysisId: string, scenarioData: any) {
  return request(`${API_PREFIX}/analysis/${analysisId}/scenarios`, {
    method: 'POST',
    data: {
      scenarioName: scenarioData.name,
      scenarioType: scenarioData.type || 'custom',
      scenarioDescription: scenarioData.description,
      scenarioParameters: scenarioData.parameters,
      grossMargin: scenarioData.grossMargin
    }
  });
}

/**
 * 场景对比分析
 */
export async function compareScenarios(analysisId: string, scenarioIds: string[]) {
  return request(`${API_PREFIX}/analysis/${analysisId}/scenarios/compare`, {
    method: 'POST',
    data: { scenarioIds }
  });
}

/**
 * 切换到指定场景
 */
export async function switchToScenario(analysisId: string, scenarioId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/scenarios/${scenarioId}/activate`, {
    method: 'POST'
  });
}

// ==================== 敏感性分析API ====================

/**
 * 执行敏感性分析
 */
export async function runSensitivityAnalysis(analysisId: string, options?: any) {
  return request(`${API_PREFIX}/analysis/${analysisId}/sensitivity`, {
    method: 'POST',
    data: {
      parameters: options?.parameters || [
        'currentTotalRevenue', 'currentGrossMargin', 'fixedOperatingCost', 
        'variableOperatingCost', 'totalEmployees', 'avgBaseSalary'
      ],
      variationRange: options?.variationRange || 0.1,
      stepSize: options?.stepSize || 0.01,
      confidenceLevel: options?.confidenceLevel || 0.95
    }
  });
}

/**
 * 获取敏感性分析结果
 */
export async function getSensitivityAnalysis(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/sensitivity`, {
    method: 'GET'
  });
}

/**
 * 运行自定义敏感性分析
 */
export async function runCustomSensitivityAnalysis(analysisId: string, data: any) {
  return request(`${API_PREFIX}/analysis/${analysisId}/sensitivity/custom`, {
    method: 'POST',
    data: {
      parameterName: data.parameterName,
      currentValue: data.currentValue,
      testValue: data.testValue,
      analysisNote: data.analysisNote
    }
  });
}

/**
 * 获取参数敏感性排名
 */
export async function getSensitivityRanking(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/sensitivity/ranking`, {
    method: 'GET'
  });
}

// ==================== 预测分析API ====================

/**
 * 创建预测分析
 */
export async function createForecast(analysisId: string, forecastData: any) {
  return request(`${API_PREFIX}/analysis/${analysisId}/forecast`, {
    method: 'POST',
    data: {
      forecastName: forecastData.name,
      forecastType: forecastData.type || 'short_term',
      forecastPeriod: forecastData.period || '12',
      modelType: forecastData.model || 'linear_regression',
      historicalWindow: forecastData.historicalWindow || 24,
      confidenceLevel: forecastData.confidenceLevel || 0.95
    }
  });
}

/**
 * 获取预测分析结果
 */
export async function getForecastAnalysis(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/forecast`, {
    method: 'GET'
  });
}

/**
 * 更新预测模型
 */
export async function updateForecastModel(analysisId: string, modelData: any) {
  return request(`${API_PREFIX}/analysis/${analysisId}/forecast/model`, {
    method: 'PUT',
    data: modelData
  });
}

/**
 * 获取预测趋势图数据
 */
export async function getForecastTrends(analysisId: string, options?: any) {
  return request(`${API_PREFIX}/analysis/${analysisId}/forecast/trends`, {
    method: 'GET',
    params: options
  });
}

// ==================== 列表和统计API ====================

/**
 * 分页查询分析列表
 */
export async function getAnalysisList(params: any) {
  return request(`${API_PREFIX}/analysis`, {
    method: 'GET',
    params
  });
}

/**
 * 获取分析统计信息
 */
export async function getAnalysisStatistics(params: any) {
  return request(`${API_PREFIX}/statistics`, {
    method: 'GET',
    params
  });
}

/**
 * 获取仪表板数据
 */
export async function getDashboardData(params?: any) {
  return request(`${API_PREFIX}/dashboard`, {
    method: 'GET',
    params
  });
}

// ==================== 计算引擎API ====================

/**
 * 触发重新计算
 */
export async function recalculateAnalysis(analysisId: string, options?: any) {
  return request(`${API_PREFIX}/analysis/${analysisId}/recalculate`, {
    method: 'POST',
    data: {
      recalculationType: options?.type || 'full',
      cascadeLevel: options?.cascadeLevel || 'full',
      updateForecast: options?.updateForecast ?? true
    }
  });
}

/**
 * 获取计算状态
 */
export async function getCalculationStatus(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/calculation/status`, {
    method: 'GET'
  });
}

/**
 * 停止计算任务
 */
export async function stopCalculation(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/calculation/stop`, {
    method: 'POST'
  });
}

// ==================== 配置和模板API ====================

/**
 * 获取系统配置
 */
export async function getSystemConfig() {
  return request(`${API_PREFIX}/config`, {
    method: 'GET'
  });
}

/**
 * 获取分析模板
 */
export async function getAnalysisTemplate(templateType: string) {
  return request(`${API_PREFIX}/templates/${templateType}`, {
    method: 'GET'
  });
}

/**
 * 保存分析模板
 */
export async function saveAnalysisTemplate(templateName: string, data: any) {
  return request(`${API_PREFIX}/templates`, {
    method: 'POST',
    data: {
      templateName,
      templateType: data.templateType || 'custom',
      templateData: data
    }
  });
}

/**
 * 获取用户模板列表
 */
export async function getUserTemplates() {
  return request(`${API_PREFIX}/templates/user`, {
    method: 'GET'
  });
}

// ==================== 导出和报告API ====================

/**
 * 导出分析报告
 */
export async function exportAnalysisReport(analysisId: string, exportFormat: string = 'excel') {
  return request(`${API_PREFIX}/analysis/${analysisId}/export`, {
    method: 'POST',
    data: { format: exportFormat },
    responseType: 'blob'
  });
}

/**
 * 导出场景对比报告
 */
export async function exportScenarioComparison(analysisId: string, scenarioIds: string[], format: string = 'excel') {
  return request(`${API_PREFIX}/analysis/${analysisId}/scenarios/export`, {
    method: 'POST',
    data: { scenarioIds, format },
    responseType: 'blob'
  });
}

/**
 * 导出敏感性分析报告
 */
export async function exportSensitivityReport(analysisId: string, format: string = 'excel') {
  return request(`${API_PREFIX}/analysis/${analysisId}/sensitivity/export`, {
    method: 'POST',
    data: { format },
    responseType: 'blob'
  });
}

// ==================== 实时协作API ====================

/**
 * 建立WebSocket连接进行实时计算
 */
export function createRealtimeConnection(analysisId: string, onUpdate: (data: any) => void) {
  // WebSocket连接逻辑，用于实时接收计算结果更新
  const ws = new WebSocket(`ws://localhost:8080${API_PREFIX}/analysis/${analysisId}/realtime`);
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onUpdate(data);
  };
  
  return ws;
}

/**
 * 发送实时参数变更
 */
export function sendRealtimeParameterChange(ws: WebSocket, parameterName: string, value: number) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'parameter_change',
      parameter: parameterName,
      value
    }));
  }
} 