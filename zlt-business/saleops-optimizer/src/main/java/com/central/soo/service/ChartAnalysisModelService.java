package com.central.soo.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.central.common.model.PageResult;
import com.central.soo.model.entity.ChartAnalysisModel;

import java.util.List;
import java.util.Map;

/**
 * 图表分析模型配置服务接口
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
public interface ChartAnalysisModelService extends IService<ChartAnalysisModel> {

    // ==================== 基础CRUD ====================

    /**
     * 创建图表分析模型
     * 
     * @param chartModel 图表模型信息
     * @return 创建的图表模型
     */
    ChartAnalysisModel createChartModel(ChartAnalysisModel chartModel);

    /**
     * 更新图表分析模型
     * 
     * @param chartModel 图表模型信息
     * @return 更新的图表模型
     */
    ChartAnalysisModel updateChartModel(ChartAnalysisModel chartModel);

    /**
     * 删除图表分析模型
     * 
     * @param chartId 图表ID
     * @return 删除结果
     */
    boolean deleteChartModel(Long chartId);

    /**
     * 批量删除图表分析模型
     * 
     * @param chartIds 图表ID列表
     * @return 删除结果
     */
    boolean batchDeleteChartModels(List<Long> chartIds);

    // ==================== 查询方法 ====================

    /**
     * 分页查询图表分析模型列表
     * 
     * @param page 分页对象
     * @param modelId 财务模型ID
     * @param chartName 图表名称（模糊匹配）
     * @param chartType 图表类型
     * @return 分页结果
     */
    PageResult<ChartAnalysisModel> pageChartModels(
            Page<ChartAnalysisModel> page,
            Long modelId,
            String chartName,
            String chartType
    );

    /**
     * 根据财务模型ID查询所有图表配置
     * 
     * @param modelId 财务模型ID
     * @return 图表配置列表
     */
    List<ChartAnalysisModel> getChartModelsByModelId(Long modelId);

    /**
     * 查询图表配置详情（包含系列信息）
     * 
     * @param chartId 图表ID
     * @return 图表配置详情
     */
    ChartAnalysisModel getChartModelWithSeries(Long chartId);

    /**
     * 根据字段标识查询使用该字段的图表
     * 
     * @param fieldName 字段标识
     * @return 图表列表
     */
    List<ChartAnalysisModel> getChartModelsByField(String fieldName);

    // ==================== 业务方法 ====================

    /**
     * 复制图表分析模型
     * 
     * @param sourceChartId 源图表ID
     * @param targetModelId 目标财务模型ID
     * @param newChartName 新图表名称
     * @return 复制的图表模型
     */
    ChartAnalysisModel copyChartModel(Long sourceChartId, Long targetModelId, String newChartName);

    /**
     * 验证图表配置的完整性
     * 
     * @param chartId 图表ID
     * @return 验证结果
     */
    Map<String, Object> validateChartModel(Long chartId);

    /**
     * 执行图表数据模拟
     * 
     * @param chartId 图表ID
     * @param parameters 模拟参数
     * @return 模拟结果
     */
    Map<String, Object> simulateChartData(Long chartId, Map<String, Object> parameters);

    /**
     * 生成图表数据
     * 
     * @param chartId 图表ID
     * @param variableValues 变量值映射
     * @param maxX X轴最大值（可选）
     * @param totalPoints 数据点总数
     * @param breakevenPoint 盈亏平衡点数据（可选）
     * @return 图表数据
     */
    Map<String, Object> generateChartData(Long chartId, Map<String, Object> variableValues, 
                                         Double maxX, Integer totalPoints, Map<String, Object> breakevenPoint);

    /**
     * 更新图表的模拟步数
     * 
     * @param chartIds 图表ID列表
     * @param simulationSteps 新的模拟步数
     * @return 更新结果
     */
    boolean updateSimulationSteps(List<Long> chartIds, Integer simulationSteps);

    /**
     * 生成图表预设配置
     * 
     * @param modelId 财务模型ID
     * @param chartType 图表类型
     * @return 预设配置
     */
    ChartAnalysisModel generatePresetChartConfig(Long modelId, String chartType);

    // ==================== 统计分析 ====================

    /**
     * 统计各财务模型的图表数量
     * 
     * @return 统计结果
     */
    List<Map<String, Object>> countChartsByModel();

    /**
     * 查询图表类型使用统计
     * 
     * @return 图表类型统计
     */
    List<Map<String, Object>> countChartsByType();

    /**
     * 查询图表配置的使用历史统计
     * 
     * @param chartId 图表ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 使用统计信息
     */
    Map<String, Object> getChartUsageStats(Long chartId, String startDate, String endDate);

    // ==================== 数据导入导出 ====================

    /**
     * 导出图表配置
     * 
     * @param chartIds 图表ID列表
     * @return 配置JSON
     */
    String exportChartConfigs(List<Long> chartIds);

    /**
     * 导入图表配置
     * 
     * @param configJson 配置JSON
     * @param targetModelId 目标财务模型ID
     * @return 导入的图表列表
     */
    List<ChartAnalysisModel> importChartConfigs(String configJson, Long targetModelId);

    // ==================== 模板管理 ====================

    /**
     * 保存图表配置为模板
     * 
     * @param chartId 图表ID
     * @param templateName 模板名称
     * @return 保存结果
     */
    boolean saveAsTemplate(Long chartId, String templateName);

    /**
     * 从模板创建图表
     * 
     * @param templateName 模板名称
     * @param modelId 财务模型ID
     * @param chartName 图表名称
     * @return 创建的图表
     */
    ChartAnalysisModel createFromTemplate(String templateName, Long modelId, String chartName);

    /**
     * 获取图表模板列表
     * 
     * @return 模板列表
     */
    List<Map<String, Object>> getChartTemplates();

    // ==================== 数据清理 ====================

    /**
     * 清理无效的图表配置
     * 
     * @return 清理的数量
     */
    int cleanupInvalidCharts();

    /**
     * 删除指定财务模型下的所有图表配置
     * 
     * @param modelId 财务模型ID
     * @return 删除的数量
     */
    int deleteByModelId(Long modelId);
} 