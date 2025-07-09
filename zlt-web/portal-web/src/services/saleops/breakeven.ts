import { request } from '@/utils/request';

const API_PREFIX = '/api/soo/breakeven';

// ==================== 分析管理API ====================

/**
 * 创建盈亏平衡分析
 */
export async function createAnalysis(data: any) {
  return request(`${API_PREFIX}/analysis`, {
    method: 'POST',
    data
  });
}

/**
 * 分页查询盈亏平衡分析列表
 */
export async function getAnalysisList(params: any) {
  return request(`${API_PREFIX}/analysis`, {
    method: 'GET',
    params
  });
}

/**
 * 获取分析详情
 */
export async function getAnalysisDetail(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}`, {
    method: 'GET'
  });
}

/**
 * 重新计算分析
 */
export async function recalculateAnalysis(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/recalculate`, {
    method: 'POST'
  });
}

/**
 * 更新分析配置
 */
export async function updateAnalysis(analysisId: string, data: any) {
  return request(`${API_PREFIX}/analysis/${analysisId}`, {
    method: 'PUT',
    data
  });
}

/**
 * 删除分析
 */
export async function deleteAnalysis(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}`, {
    method: 'DELETE'
  });
}

/**
 * 批量删除分析
 */
export async function batchDeleteAnalysis(analysisIds: string[]) {
  return request(`${API_PREFIX}/analysis/batch-delete`, {
    method: 'POST',
    data: analysisIds
  });
}

/**
 * 归档分析
 */
export async function archiveAnalysis(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/archive`, {
    method: 'POST'
  });
}

/**
 * 复制分析
 */
export async function copyAnalysis(analysisId: string, newAnalysisName: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/copy`, {
    method: 'POST',
    params: { newAnalysisName }
  });
}

// ==================== 场景分析API ====================

/**
 * 获取分析的场景列表
 */
export async function getScenarios(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/scenarios`, {
    method: 'GET'
  });
}

/**
 * 添加场景
 */
export async function addScenario(analysisId: string, data: any) {
  return request(`${API_PREFIX}/analysis/${analysisId}/scenarios`, {
    method: 'POST',
    data
  });
}

/**
 * 更新场景
 */
export async function updateScenario(scenarioId: string, data: any) {
  return request(`${API_PREFIX}/scenarios/${scenarioId}`, {
    method: 'PUT',
    data
  });
}

/**
 * 删除场景
 */
export async function deleteScenario(scenarioId: string) {
  return request(`${API_PREFIX}/scenarios/${scenarioId}`, {
    method: 'DELETE'
  });
}

/**
 * 比较场景
 */
export async function compareScenarios(scenarioIds: string[]) {
  return request(`${API_PREFIX}/scenarios/compare`, {
    method: 'POST',
    data: scenarioIds
  });
}

// ==================== 敏感性分析API ====================

/**
 * 获取敏感性分析结果
 */
export async function getSensitivityAnalysis(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/sensitivity`, {
    method: 'GET'
  });
}

/**
 * 重新进行敏感性分析
 */
export async function recalculateSensitivity(analysisId: string, data: any) {
  return request(`${API_PREFIX}/analysis/${analysisId}/sensitivity/recalculate`, {
    method: 'POST',
    data
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
 * 获取预测分析结果
 */
export async function getForecastAnalysis(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/forecast`, {
    method: 'GET'
  });
}

/**
 * 重新进行预测分析
 */
export async function recalculateForecast(analysisId: string, data: any) {
  return request(`${API_PREFIX}/analysis/${analysisId}/forecast/recalculate`, {
    method: 'POST',
    data
  });
}

/**
 * 获取预测趋势图数据
 */
export async function getForecastTrends(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/forecast/trends`, {
    method: 'GET'
  });
}

// ==================== 统计分析API ====================

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
 * 获取分析执行历史
 */
export async function getAnalysisHistory(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/history`, {
    method: 'GET'
  });
}

/**
 * 获取成本结构分析
 */
export async function getCostStructureAnalysis(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/cost-structure`, {
    method: 'GET'
  });
}

/**
 * 获取盈利能力分析
 */
export async function getProfitabilityAnalysis(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/profitability`, {
    method: 'GET'
  });
}

// ==================== 导出功能API ====================

/**
 * 导出分析报告
 */
export async function exportAnalysisReport(analysisId: string, exportFormat: string = 'excel') {
  return request(`${API_PREFIX}/analysis/${analysisId}/export`, {
    method: 'POST',
    params: { exportFormat },
    responseType: 'blob'
  });
}

/**
 * 导出分析数据
 */
export async function exportAnalysisData(data: any, exportFormat: string = 'excel') {
  return request(`${API_PREFIX}/export`, {
    method: 'POST',
    data,
    params: { exportFormat },
    responseType: 'blob'
  });
}

// ==================== 配置管理API ====================

/**
 * 获取分析配置模板
 */
export async function getAnalysisTemplate(templateType: string) {
  return request(`${API_PREFIX}/templates/${templateType}`, {
    method: 'GET'
  });
}

/**
 * 保存分析配置模板
 */
export async function saveAnalysisTemplate(templateName: string, data: any) {
  return request(`${API_PREFIX}/templates/${templateName}`, {
    method: 'POST',
    data
  });
}

/**
 * 获取用户配置模板列表
 */
export async function getUserTemplates() {
  return request(`${API_PREFIX}/templates`, {
    method: 'GET'
  });
}

// ==================== 自动化管理API ====================

/**
 * 启用自动重算
 */
export async function enableAutoRecalculation(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/auto-recalculation/enable`, {
    method: 'POST'
  });
}

/**
 * 禁用自动重算
 */
export async function disableAutoRecalculation(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/auto-recalculation/disable`, {
    method: 'POST'
  });
}

/**
 * 执行定时自动重算任务
 */
export async function executeScheduledRecalculation() {
  return request(`${API_PREFIX}/auto-recalculation/execute`, {
    method: 'POST'
  });
}

/**
 * 获取自动重算状态
 */
export async function getAutoRecalculationStatus(analysisId: string) {
  return request(`${API_PREFIX}/analysis/${analysisId}/auto-recalculation/status`, {
    method: 'GET'
  });
} 