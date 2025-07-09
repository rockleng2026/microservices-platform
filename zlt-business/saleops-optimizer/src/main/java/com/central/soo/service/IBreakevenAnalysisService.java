package com.central.soo.service;

import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.soo.model.dto.BreakevenAnalysisDTO;
import com.central.soo.model.dto.BreakevenQueryDTO;
import com.central.soo.model.entity.BreakevenAnalysis;
import com.central.soo.model.entity.BreakevenForecast;
import com.central.soo.model.entity.BreakevenScenario;
import com.central.soo.model.entity.BreakevenSensitivity;

import java.util.List;
import java.util.Map;

/**
 * 盈亏平衡分析服务接口
 */
public interface IBreakevenAnalysisService {

    /**
     * 创建盈亏平衡分析
     *
     * @param analysisDTO 分析参数
     * @return 分析结果
     */
    Result<BreakevenAnalysis> createAnalysis(BreakevenAnalysisDTO analysisDTO);

    /**
     * 分页查询盈亏平衡分析列表
     *
     * @param queryDTO 查询参数
     * @return 分页结果
     */
    PageResult<BreakevenAnalysis> getAnalysisList(BreakevenQueryDTO queryDTO);

    /**
     * 根据分析ID获取详情
     *
     * @param analysisId 分析ID
     * @return 分析详情
     */
    Result<BreakevenAnalysis> getAnalysisDetail(String analysisId);

    /**
     * 重新计算分析
     *
     * @param analysisId 分析ID
     * @return 计算结果
     */
    Result<BreakevenAnalysis> recalculateAnalysis(String analysisId);

    /**
     * 更新分析配置
     *
     * @param analysisId 分析ID
     * @param analysisDTO 更新参数
     * @return 更新结果
     */
    Result<BreakevenAnalysis> updateAnalysis(String analysisId, BreakevenAnalysisDTO analysisDTO);

    /**
     * 删除分析
     *
     * @param analysisId 分析ID
     * @return 删除结果
     */
    Result<String> deleteAnalysis(String analysisId);

    /**
     * 批量删除分析
     *
     * @param analysisIds 分析ID列表
     * @return 删除结果
     */
    Result<String> batchDeleteAnalysis(List<String> analysisIds);

    /**
     * 归档分析
     *
     * @param analysisId 分析ID
     * @return 归档结果
     */
    Result<String> archiveAnalysis(String analysisId);

    /**
     * 复制分析
     *
     * @param analysisId 原分析ID
     * @param newAnalysisName 新分析名称
     * @return 复制结果
     */
    Result<BreakevenAnalysis> copyAnalysis(String analysisId, String newAnalysisName);

    // ==================== 场景分析相关 ====================

    /**
     * 获取分析的场景列表
     *
     * @param analysisId 分析ID
     * @return 场景列表
     */
    Result<List<BreakevenScenario>> getScenarios(String analysisId);

    /**
     * 添加场景
     *
     * @param analysisId 分析ID
     * @param scenarioConfig 场景配置
     * @return 添加结果
     */
    Result<BreakevenScenario> addScenario(String analysisId, BreakevenAnalysisDTO.ScenarioConfig scenarioConfig);

    /**
     * 更新场景
     *
     * @param scenarioId 场景ID
     * @param scenarioConfig 场景配置
     * @return 更新结果
     */
    Result<BreakevenScenario> updateScenario(String scenarioId, BreakevenAnalysisDTO.ScenarioConfig scenarioConfig);

    /**
     * 删除场景
     *
     * @param scenarioId 场景ID
     * @return 删除结果
     */
    Result<String> deleteScenario(String scenarioId);

    /**
     * 比较场景
     *
     * @param scenarioIds 场景ID列表
     * @return 比较结果
     */
    Result<Map<String, Object>> compareScenarios(List<String> scenarioIds);

    // ==================== 敏感性分析相关 ====================

    /**
     * 获取敏感性分析结果
     *
     * @param analysisId 分析ID
     * @return 敏感性分析结果
     */
    Result<List<BreakevenSensitivity>> getSensitivityAnalysis(String analysisId);

    /**
     * 重新进行敏感性分析
     *
     * @param analysisId 分析ID
     * @param sensitivityConfig 敏感性配置
     * @return 分析结果
     */
    Result<List<BreakevenSensitivity>> recalculateSensitivity(String analysisId, 
                                                             BreakevenAnalysisDTO.SensitivityConfig sensitivityConfig);

    /**
     * 获取参数敏感性排名
     *
     * @param analysisId 分析ID
     * @return 敏感性排名
     */
    Result<List<Map<String, Object>>> getSensitivityRanking(String analysisId);

    // ==================== 预测分析相关 ====================

    /**
     * 获取预测分析结果
     *
     * @param analysisId 分析ID
     * @return 预测结果
     */
    Result<BreakevenForecast> getForecastAnalysis(String analysisId);

    /**
     * 重新进行预测分析
     *
     * @param analysisId 分析ID
     * @param forecastConfig 预测配置
     * @return 预测结果
     */
    Result<BreakevenForecast> recalculateForecast(String analysisId, 
                                                 BreakevenAnalysisDTO.ForecastConfig forecastConfig);

    /**
     * 获取预测趋势图数据
     *
     * @param analysisId 分析ID
     * @return 趋势图数据
     */
    Result<Map<String, Object>> getForecastTrends(String analysisId);

    // ==================== 统计分析相关 ====================

    /**
     * 获取分析统计信息
     *
     * @param queryDTO 查询参数
     * @return 统计信息
     */
    Result<Map<String, Object>> getAnalysisStatistics(BreakevenQueryDTO queryDTO);

    /**
     * 获取分析执行历史
     *
     * @param analysisId 分析ID
     * @return 执行历史
     */
    Result<List<Map<String, Object>>> getAnalysisHistory(String analysisId);

    /**
     * 获取成本结构分析
     *
     * @param analysisId 分析ID
     * @return 成本结构分析
     */
    Result<Map<String, Object>> getCostStructureAnalysis(String analysisId);

    /**
     * 获取盈利能力分析
     *
     * @param analysisId 分析ID
     * @return 盈利能力分析
     */
    Result<Map<String, Object>> getProfitabilityAnalysis(String analysisId);

    // ==================== 导出相关 ====================

    /**
     * 导出分析报告
     *
     * @param analysisId 分析ID
     * @param exportFormat 导出格式
     * @return 导出文件字节数组
     */
    byte[] exportAnalysisReport(String analysisId, String exportFormat);

    /**
     * 导出分析数据
     *
     * @param queryDTO 查询参数
     * @param exportFormat 导出格式
     * @return 导出文件字节数组
     */
    byte[] exportAnalysisData(BreakevenQueryDTO queryDTO, String exportFormat);

    // ==================== 配置管理相关 ====================

    /**
     * 获取分析配置模板
     *
     * @param templateType 模板类型
     * @return 配置模板
     */
    Result<BreakevenAnalysisDTO> getAnalysisTemplate(String templateType);

    /**
     * 保存分析配置模板
     *
     * @param templateName 模板名称
     * @param analysisDTO 分析配置
     * @return 保存结果
     */
    Result<String> saveAnalysisTemplate(String templateName, BreakevenAnalysisDTO analysisDTO);

    /**
     * 获取用户配置模板列表
     *
     * @return 模板列表
     */
    Result<List<Map<String, Object>>> getUserTemplates();

    // ==================== 自动化相关 ====================

    /**
     * 启用自动重算
     *
     * @param analysisId 分析ID
     * @return 启用结果
     */
    Result<String> enableAutoRecalculation(String analysisId);

    /**
     * 禁用自动重算
     *
     * @param analysisId 分析ID
     * @return 禁用结果
     */
    Result<String> disableAutoRecalculation(String analysisId);

    /**
     * 执行定时自动重算任务
     *
     * @return 执行结果
     */
    Result<String> executeScheduledRecalculation();

    /**
     * 获取自动重算状态
     *
     * @param analysisId 分析ID
     * @return 状态信息
     */
    Result<Map<String, Object>> getAutoRecalculationStatus(String analysisId);
} 