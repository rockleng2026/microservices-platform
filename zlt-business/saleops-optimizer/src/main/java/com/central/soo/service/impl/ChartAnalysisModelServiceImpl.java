package com.central.soo.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.common.model.PageResult;
import com.central.soo.engine.DynamicFormulaEngine;
import com.central.soo.mapper.ChartAnalysisModelMapper;
import com.central.soo.mapper.ChartSeriesMapper;
import com.central.soo.mapper.ChartSimulationMapper;
import com.central.soo.model.entity.ChartAnalysisModel;
import com.central.soo.model.entity.ChartSeries;
import com.central.soo.model.entity.ChartSimulation;
import com.central.soo.model.entity.FinancialModel;
import com.central.soo.service.ChartAnalysisModelService;
import com.central.soo.service.FinancialModelService;
import com.central.soo.utils.PageResultUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 图表分析模型配置服务实现
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Slf4j
@Service
public class ChartAnalysisModelServiceImpl 
        extends ServiceImpl<ChartAnalysisModelMapper, ChartAnalysisModel> 
        implements ChartAnalysisModelService {

    @Autowired
    private ChartAnalysisModelMapper chartAnalysisModelMapper;

    @Autowired
    private ChartSeriesMapper chartSeriesMapper;

    @Autowired
    private ChartSimulationMapper chartSimulationMapper;

    @Autowired
    private FinancialModelService financialModelService;

    @Autowired
    private DynamicFormulaEngine formulaEngine;

    @Autowired
    private ObjectMapper objectMapper;

    // ==================== 基础CRUD ====================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ChartAnalysisModel createChartModel(ChartAnalysisModel chartModel) {
        log.info("创建图表分析模型: {}", chartModel.getChartName());
        
        // 验证财务模型是否存在
        FinancialModel financialModel = financialModelService.getById(chartModel.getModelId());
        if (financialModel == null) {
            throw new RuntimeException("财务模型不存在: " + chartModel.getModelId());
        }
        
        // 设置默认值
        if (chartModel.getSimulationSteps() == null) {
            chartModel.setSimulationSteps(10);
        }
        if (!StringUtils.hasText(chartModel.getChartType())) {
            chartModel.setChartType("line");
        }
        
        chartModel.setCreatedAt(new Date());
        chartModel.setUpdatedAt(new Date());
        
        // 保存图表模型
        boolean saved = save(chartModel);
        if (!saved) {
            throw new RuntimeException("保存图表分析模型失败");
        }
        
        log.info("图表分析模型创建成功，ID: {}", chartModel.getId());
        return chartModel;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ChartAnalysisModel updateChartModel(ChartAnalysisModel chartModel) {
        log.info("更新图表分析模型: {}", chartModel.getId());
        
        ChartAnalysisModel existingModel = getById(chartModel.getId());
        if (existingModel == null) {
            throw new RuntimeException("图表分析模型不存在: " + chartModel.getId());
        }
        
        // 记录更新前的数据
        log.info("更新前数据: {}", existingModel);
        log.info("更新数据: {}", chartModel);
        
        // 确保所有字段都被正确设置
        existingModel.setChartName(chartModel.getChartName());
        existingModel.setChartType(chartModel.getChartType());
        existingModel.setSimulationSteps(chartModel.getSimulationSteps());
        existingModel.setXAxisName(chartModel.getXAxisName());
        existingModel.setXAxisField(chartModel.getXAxisField());
        existingModel.setXAxisUnit(chartModel.getXAxisUnit());
        existingModel.setYAxisName(chartModel.getYAxisName());
        existingModel.setYAxisUnit(chartModel.getYAxisUnit());
        existingModel.setModelId(chartModel.getModelId());
        existingModel.setUpdatedAt(new Date());
        
        boolean updated = updateById(existingModel);
        if (!updated) {
            throw new RuntimeException("更新图表分析模型失败");
        }
        
        log.info("图表分析模型更新成功，ID: {}", existingModel.getId());
        return existingModel;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteChartModel(Long chartId) {
        log.info("删除图表分析模型: {}", chartId);
        
        // 删除相关的图表系列
        chartSeriesMapper.deleteByChartId(chartId);
        
        // 删除相关的模拟结果
        chartSimulationMapper.deleteByChartId(chartId);
        
        // 删除图表模型
        boolean deleted = removeById(chartId);
        
        log.info("图表分析模型删除结果: {}", deleted);
        return deleted;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchDeleteChartModels(List<Long> chartIds) {
        log.info("批量删除图表分析模型: {}", chartIds);
        
        if (chartIds.isEmpty()) {
            return true;
        }
        
        // 删除相关的图表系列
        for (Long chartId : chartIds) {
            chartSeriesMapper.deleteByChartId(chartId);
        }
        
        // 删除相关的模拟结果
        for (Long chartId : chartIds) {
            chartSimulationMapper.deleteByChartId(chartId);
        }
        
        // 批量删除图表模型
        boolean deleted = removeByIds(chartIds);
        
        log.info("批量删除图表分析模型结果: {}", deleted);
        return deleted;
    }

    // ==================== 查询方法 ====================

    @Override
    public PageResult<ChartAnalysisModel> pageChartModels(
            Page<ChartAnalysisModel> page, Long modelId, String chartName, String chartType) {
        
        log.info("分页查询图表分析模型: modelId={}, chartName={}, chartType={}", 
                 modelId, chartName, chartType);
        
        IPage<ChartAnalysisModel> result = chartAnalysisModelMapper.selectChartModelPageWithDetails(
                page, modelId, chartName, chartType);
        
        return PageResultUtil.buildPageResult(result);
    }

    @Override
    public List<ChartAnalysisModel> getChartModelsByModelId(Long modelId) {
        log.info("查询财务模型的图表配置: {}", modelId);
        return chartAnalysisModelMapper.selectByModelId(modelId);
    }

    @Override
    public ChartAnalysisModel getChartModelWithSeries(Long chartId) {
        log.info("查询图表配置详情: {}", chartId);
        
        ChartAnalysisModel chartModel = chartAnalysisModelMapper.selectChartWithSeries(chartId);
        if (chartModel != null) {
            // 加载图表系列
            List<ChartSeries> seriesList = chartSeriesMapper.selectByChartId(chartId);
            chartModel.setChartSeriesList(seriesList);
        }
        
        return chartModel;
    }

    @Override
    public List<ChartAnalysisModel> getChartModelsByField(String fieldName) {
        log.info("查询使用字段的图表: {}", fieldName);
        return chartAnalysisModelMapper.selectChartsByField(fieldName);
    }

    // ==================== 业务方法 ====================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ChartAnalysisModel copyChartModel(Long sourceChartId, Long targetModelId, String newChartName) {
        log.info("复制图表分析模型: {} -> {}", sourceChartId, newChartName);
        
        // 获取源图表配置
        ChartAnalysisModel sourceChart = getChartModelWithSeries(sourceChartId);
        if (sourceChart == null) {
            throw new RuntimeException("源图表不存在: " + sourceChartId);
        }
        
        // 创建新图表
        ChartAnalysisModel newChart = new ChartAnalysisModel();
        BeanUtils.copyProperties(sourceChart, newChart, "id", "createdAt", "updatedAt");
        newChart.setModelId(targetModelId);
        newChart.setChartName(newChartName);
        
        ChartAnalysisModel createdChart = createChartModel(newChart);
        
        // 复制图表系列
        if (sourceChart.getChartSeriesList() != null) {
            for (ChartSeries sourceSeries : sourceChart.getChartSeriesList()) {
                ChartSeries newSeries = new ChartSeries();
                BeanUtils.copyProperties(sourceSeries, newSeries, "id", "createdAt");
                newSeries.setChartId(createdChart.getId());
                chartSeriesMapper.insert(newSeries);
            }
        }
        
        log.info("图表分析模型复制成功，新图表ID: {}", createdChart.getId());
        return createdChart;
    }

    @Override
    public Map<String, Object> validateChartModel(Long chartId) {
        log.info("验证图表配置: {}", chartId);
        
        Map<String, Object> result = new HashMap<>();
        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        
        ChartAnalysisModel chartModel = getChartModelWithSeries(chartId);
        if (chartModel == null) {
            errors.add("图表配置不存在");
            result.put("valid", false);
            result.put("errors", errors);
            return result;
        }
        
        // 验证财务模型
        FinancialModel financialModel = financialModelService.getById(chartModel.getModelId());
        if (financialModel == null) {
            errors.add("关联的财务模型不存在");
        }
        
        // 验证轴字段配置
        if (!StringUtils.hasText(chartModel.getXAxisField())) {
            errors.add("X轴字段未配置");
        }
        // 验证轴字段配置
        if (!StringUtils.hasText(chartModel.getXAxisName())) {
            errors.add("X轴字段名称未配置");
        }
        if (!StringUtils.hasText(chartModel.getYAxisName())) {
            errors.add("Y轴字段名称未配置");
        }
        
        // 验证图表系列
        if (chartModel.getChartSeriesList() == null || chartModel.getChartSeriesList().isEmpty()) {
            warnings.add("未配置图表系列");
        } else {
            for (ChartSeries series : chartModel.getChartSeriesList()) {
                if (!StringUtils.hasText(series.getSeriesField())) {
                    errors.add("系列字段未配置: " + series.getSeriesName());
                }
                if ("variable".equals(series.getSeriesType()) && !StringUtils.hasText(series.getSeriesValue())) {
                    warnings.add("变量系列未设置默认值: " + series.getSeriesName());
                }
            }
        }
        
        // 验证模拟步数
        if (chartModel.getSimulationSteps() == null || chartModel.getSimulationSteps() <= 0) {
            warnings.add("模拟步数未正确设置");
        }
        
        result.put("valid", errors.isEmpty());
        result.put("errors", errors);
        result.put("warnings", warnings);
        result.put("chartModel", chartModel);
        
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> simulateChartData(Long chartId, Map<String, Object> parameters) {
        log.info("执行图表数据模拟: chartId={}", chartId);
        
        ChartAnalysisModel chartModel = getChartModelWithSeries(chartId);
        if (chartModel == null) {
            throw new RuntimeException("图表配置不存在: " + chartId);
        }
        
        // 获取财务模型
        FinancialModel financialModel = financialModelService.getById(chartModel.getModelId());
        if (financialModel == null) {
            throw new RuntimeException("财务模型不存在: " + chartModel.getModelId());
        }
        
        try {
            // 生成模拟运行ID
            Long runId = System.currentTimeMillis();
            
            // 执行数据模拟
            List<ChartSimulation> simulationResults = new ArrayList<>();
            
            // 获取X轴范围和步长
            BigDecimal xMin = getParameterValue(parameters, "xMin", BigDecimal.ZERO);
            BigDecimal xMax = getParameterValue(parameters, "xMax", new BigDecimal("1000000"));
            int steps = chartModel.getSimulationSteps();
            BigDecimal stepSize = xMax.subtract(xMin).divide(new BigDecimal(steps), 2, RoundingMode.HALF_UP);
            
            // 对每个系列生成数据点
            for (ChartSeries series : chartModel.getChartSeriesList()) {
                for (int i = 0; i <= steps; i++) {
                    BigDecimal xValue = xMin.add(stepSize.multiply(new BigDecimal(i)));
                    
                    // 准备计算参数
                    Map<String, Object> calcParams = new HashMap<>(parameters);
                    calcParams.put(chartModel.getXAxisField(), xValue);
                    
                    // 处理系列特定参数
                    if ("variable".equals(series.getSeriesType()) && StringUtils.hasText(series.getSeriesValue())) {
                        // 解析系列值表达式
                        Object seriesParamValue = parseSeriesValue(series.getSeriesValue(), calcParams);
                        calcParams.put(series.getSeriesField() + "_param", seriesParamValue);
                    }
                    
                    try {
                        // 使用公式引擎计算Y值
                        DynamicFormulaEngine.CalculationResult calcResult = formulaEngine.executeFormula(series.getSeriesField(), calcParams);
                        BigDecimal yValue = calcResult.isSuccess() ? calcResult.getValue() : BigDecimal.ZERO;
                        
                        // 创建模拟结果记录
                        ChartSimulation simulation = new ChartSimulation();
                        simulation.setRunId(runId);
                        simulation.setChartId(chartId);
                        simulation.setSeriesId(series.getId());
                        simulation.setXValue(xValue);
                        simulation.setYValue(yValue);
                        simulation.setCalculatedAt(LocalDateTime.now());
                        
                        simulationResults.add(simulation);
                        
                    } catch (Exception e) {
                        log.warn("计算数据点失败: x={}, series={}, error={}", xValue, series.getSeriesName(), e.getMessage());
                    }
                }
            }
            
            // 批量保存模拟结果
            if (!simulationResults.isEmpty()) {
                chartSimulationMapper.batchInsert(simulationResults);
            }
            
            // 构建返回结果
            Map<String, Object> result = new HashMap<>();
            result.put("runId", runId);
            result.put("chartId", chartId);
            result.put("totalPoints", simulationResults.size());
            result.put("seriesCount", chartModel.getChartSeriesList().size());
            result.put("simulationTime", LocalDateTime.now());
            result.put("chartData", formatChartData(simulationResults, chartModel));
            
            log.info("图表数据模拟完成: runId={}, points={}", runId, simulationResults.size());
            return result;
            
        } catch (Exception e) {
            log.error("图表数据模拟失败: chartId=" + chartId, e);
            throw new RuntimeException("模拟计算失败: " + e.getMessage(), e);
        }
    }

    @Override
    public Map<String, Object> generateChartData(Long chartId, Map<String, Object> variableValues, 
                                                Double maxX, Integer totalPoints) {
        log.info("生成图表数据: chartId={}, maxX={}, totalPoints={}", chartId, maxX, totalPoints);
        
        // 获取图表配置
        ChartAnalysisModel chartModel = getChartModelWithSeries(chartId);
        if (chartModel == null) {
            throw new RuntimeException("图表模型不存在: " + chartId);
        }
        
        // 获取系列配置
        List<ChartSeries> seriesList = chartModel.getChartSeriesList();
        if (seriesList.isEmpty()) {
            throw new RuntimeException("图表系列配置为空: " + chartId);
        }
        
        // 计算X轴最大值
        BigDecimal xMax;
        if (maxX != null && maxX > 0) {
            xMax = BigDecimal.valueOf(maxX);
        } else {
            // 从变量值中获取X轴字段的值，然后乘以10
            Object xAxisValue = variableValues.get(chartModel.getXAxisField());
            if (xAxisValue != null) {
                BigDecimal baseValue = new BigDecimal(xAxisValue.toString());
                xMax = baseValue.multiply(BigDecimal.valueOf(10));
                log.info("从变量值计算X轴最大值: {} * 10 = {}", baseValue, xMax);
            } else {
                xMax = BigDecimal.valueOf(1000); // 默认值
                log.info("使用默认X轴最大值: {}", xMax);
            }
        }
        
        // 计算步长
        BigDecimal stepSize = xMax.divide(BigDecimal.valueOf(totalPoints), 10, RoundingMode.HALF_UP);
        
        log.info("图表数据生成参数: xMax={}, totalPoints={}, stepSize={}", xMax, totalPoints, stepSize);
        
        // 生成数据点
        List<Map<String, Object>> chartData = new ArrayList<>();
        for (int i = 0; i <= totalPoints; i++) {
            BigDecimal xValue = stepSize.multiply(BigDecimal.valueOf(i));
            
            for (ChartSeries series : seriesList) {
                try {
                    // 构建计算上下文
                    Map<String, Object> context = new HashMap<>(variableValues);
                    context.put("x", xValue);
                    context.put(chartModel.getXAxisField(), xValue);
                    
                    // 获取变量数据类型映射
                    Map<String, String> variableDataTypes = getVariableDataTypes(chartModel.getModelId());
                    
                    // 计算系列值
                    Object seriesValue = parseSeriesValue(series.getSeriesValue(), context, variableDataTypes);
                    
                    // 构建数据点
                    Map<String, Object> dataPoint = new HashMap<>();
                    dataPoint.put("x", xValue.doubleValue());
                    dataPoint.put("y", new BigDecimal(seriesValue.toString()).doubleValue());
                    dataPoint.put("seriesName", series.getSeriesName());
                    dataPoint.put("seriesId", series.getId());
                    dataPoint.put("seriesColor", series.getColor());
                    dataPoint.put("seriesField", series.getSeriesField());
                    dataPoint.put("label", xValue.toString());
                    
                    chartData.add(dataPoint);
                    
                } catch (Exception e) {
                    log.error("计算系列值失败: seriesId={}, xValue={}, error={}", 
                             series.getId(), xValue, e.getMessage());
                }
            }
        }
        
        // 构建返回结果
        Map<String, Object> result = new HashMap<>();
        result.put("chartId", chartId);
        result.put("chartName", chartModel.getChartName());
        result.put("chartType", chartModel.getChartType());
        result.put("xAxisName", chartModel.getXAxisName());
        result.put("xAxisField", chartModel.getXAxisField());
        result.put("xAxisUnit", chartModel.getXAxisUnit());
        result.put("yAxisName", chartModel.getYAxisName());
        result.put("yAxisUnit", chartModel.getYAxisUnit());
        result.put("dataPoints", chartData.size());
        result.put("maxX", xMax.doubleValue());
        result.put("stepSize", stepSize.doubleValue());
        result.put("seriesList", seriesList);
        result.put("data", chartData);
        
        log.info("图表数据生成完成: chartId={}, 数据点数量={}", chartId, chartData.size());
        return result;
    }

    @Override
    public boolean updateSimulationSteps(List<Long> chartIds, Integer simulationSteps) {
        log.info("更新图表模拟步数: chartIds={}, steps={}", chartIds, simulationSteps);
        
        if (chartIds.isEmpty() || simulationSteps == null || simulationSteps <= 0) {
            return false;
        }
        
        int updated = chartAnalysisModelMapper.batchUpdateSimulationSteps(chartIds, simulationSteps);
        return updated > 0;
    }

    @Override
    public ChartAnalysisModel generatePresetChartConfig(Long modelId, String chartType) {
        log.info("生成预设图表配置: modelId={}, chartType={}", modelId, chartType);
        
        ChartAnalysisModel preset = new ChartAnalysisModel();
        preset.setModelId(modelId);
        preset.setChartType(chartType);
        preset.setSimulationSteps(20);
        
        switch (chartType) {
            case "line":
                preset.setChartName("盈亏平衡分析图");
                preset.setXAxisField("revenue");
                preset.setXAxisUnit("元");
                preset.setYAxisName("net_profit");
                preset.setYAxisUnit("元");
                break;
            case "bar":
                preset.setChartName("成本结构分析图");
                preset.setXAxisField("period");
                preset.setXAxisUnit("月");
                preset.setYAxisName("cost");
                preset.setYAxisUnit("元");
                break;
            case "scatter":
                preset.setChartName("敏感性分析图");
                preset.setXAxisField("parameter_value");
                preset.setXAxisUnit("%");
                preset.setYAxisName("result_change");
                preset.setYAxisUnit("%");
                break;
            default:
                preset.setChartName("自定义分析图");
                preset.setXAxisField("x_field");
                preset.setYAxisName("y_field");
        }
        
        return preset;
    }

    // ==================== 统计分析 ====================

    @Override
    public List<Map<String, Object>> countChartsByModel() {
        return chartAnalysisModelMapper.countChartsByModel();
    }

    @Override
    public List<Map<String, Object>> countChartsByType() {
        return chartAnalysisModelMapper.countChartsByType();
    }

    @Override
    public Map<String, Object> getChartUsageStats(Long chartId, String startDate, String endDate) {
        return chartAnalysisModelMapper.selectChartUsageStats(chartId, startDate, endDate);
    }

    // ==================== 数据导入导出 ====================

    @Override
    public String exportChartConfigs(List<Long> chartIds) {
        log.info("导出图表配置: {}", chartIds);
        
        try {
            List<Map<String, Object>> chartConfigs = new ArrayList<>();
            
            for (Long chartId : chartIds) {
                ChartAnalysisModel chartModel = getChartModelWithSeries(chartId);
                if (chartModel != null) {
                    Map<String, Object> config = new HashMap<>();
                    config.put("chartModel", chartModel);
                    config.put("seriesList", chartModel.getChartSeriesList());
                    chartConfigs.add(config);
                }
            }
            
            return objectMapper.writeValueAsString(chartConfigs);
            
        } catch (JsonProcessingException e) {
            log.error("导出图表配置失败", e);
            throw new RuntimeException("导出失败: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public List<ChartAnalysisModel> importChartConfigs(String configJson, Long targetModelId) {
        log.info("导入图表配置到模型: {}", targetModelId);
        
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> chartConfigs = objectMapper.readValue(configJson, List.class);
            
            List<ChartAnalysisModel> importedCharts = new ArrayList<>();
            
            for (Map<String, Object> config : chartConfigs) {
                @SuppressWarnings("unchecked")
                Map<String, Object> chartModelData = (Map<String, Object>) config.get("chartModel");
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> seriesListData = (List<Map<String, Object>>) config.get("seriesList");
                
                // 创建图表模型
                ChartAnalysisModel chartModel = objectMapper.convertValue(chartModelData, ChartAnalysisModel.class);
                chartModel.setId(null);
                chartModel.setModelId(targetModelId);
                chartModel.setChartName(chartModel.getChartName() + "_导入");
                
                ChartAnalysisModel importedChart = createChartModel(chartModel);
                
                // 导入图表系列
                if (seriesListData != null) {
                    for (Map<String, Object> seriesData : seriesListData) {
                        ChartSeries series = objectMapper.convertValue(seriesData, ChartSeries.class);
                        series.setId(null);
                        series.setChartId(importedChart.getId());
                        chartSeriesMapper.insert(series);
                    }
                }
                
                importedCharts.add(importedChart);
            }
            
            log.info("图表配置导入完成，共导入 {} 个图表", importedCharts.size());
            return importedCharts;
            
        } catch (Exception e) {
            log.error("导入图表配置失败", e);
            throw new RuntimeException("导入失败: " + e.getMessage(), e);
        }
    }

    // ==================== 模板管理 ====================

    @Override
    public boolean saveAsTemplate(Long chartId, String templateName) {
        // TODO: 实现图表模板保存逻辑
        return true;
    }

    @Override
    public ChartAnalysisModel createFromTemplate(String templateName, Long modelId, String chartName) {
        // TODO: 实现从模板创建图表逻辑
        return generatePresetChartConfig(modelId, "line");
    }

    @Override
    public List<Map<String, Object>> getChartTemplates() {
        // TODO: 实现获取图表模板列表逻辑
        return new ArrayList<>();
    }

    // ==================== 数据清理 ====================

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int cleanupInvalidCharts() {
        log.info("清理无效的图表配置");
        
        // TODO: 实现清理逻辑
        // 1. 删除没有关联财务模型的图表
        // 2. 删除配置不完整的图表
        // 3. 删除长期未使用的图表
        
        return 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int deleteByModelId(Long modelId) {
        log.info("删除财务模型下的所有图表配置: {}", modelId);
        
        // 获取要删除的图表ID列表
        List<ChartAnalysisModel> charts = getChartModelsByModelId(modelId);
        List<Long> chartIds = charts.stream().map(ChartAnalysisModel::getId).collect(Collectors.toList());
        
        if (!chartIds.isEmpty()) {
            // 删除相关的图表系列
            for (Long chartId : chartIds) {
                chartSeriesMapper.deleteByChartId(chartId);
            }
            
            // 删除相关的模拟结果
            for (Long chartId : chartIds) {
                chartSimulationMapper.deleteByChartId(chartId);
            }
        }
        
        // 删除图表配置
        return chartAnalysisModelMapper.deleteByModelId(modelId);
    }

    // ==================== 私有辅助方法 ====================

    private BigDecimal getParameterValue(Map<String, Object> parameters, String key, BigDecimal defaultValue) {
        Object value = parameters.get(key);
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof BigDecimal) {
            return (BigDecimal) value;
        }
        if (value instanceof Number) {
            return new BigDecimal(value.toString());
        }
        try {
            return new BigDecimal(value.toString());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private Object parseSeriesValue(String seriesValue, Map<String, Object> context) {
        return parseSeriesValue(seriesValue, context, null);
    }

    private Object parseSeriesValue(String seriesValue, Map<String, Object> context, Map<String, String> variableDataTypes) {
        if (!StringUtils.hasText(seriesValue)) {
            return BigDecimal.ZERO;
        }
        
        // 简单的表达式解析，支持基础运算
        if (seriesValue.contains("base")) {
            // 替换 base 为上下文中的基础值
            BigDecimal baseValue = getParameterValue(context, "base_value", BigDecimal.ONE);
            seriesValue = seriesValue.replace("base", baseValue.toString());
        }
        
        try {
            // 使用公式引擎计算（支持变量数据类型）
            DynamicFormulaEngine.CalculationResult calcResult = formulaEngine.executeFormula(seriesValue, context, variableDataTypes);
            if (calcResult.isSuccess()) {
                return calcResult.getValue();
            } else {
                log.warn("公式计算失败: {}, 错误: {}", seriesValue, calcResult.getErrors());
                // 如果公式计算失败，尝试作为数值解析
                return parseAsNumber(seriesValue);
            }
        } catch (Exception e) {
            log.warn("公式引擎异常: {}, 错误: {}", seriesValue, e.getMessage());
            // 如果计算失败，尝试作为数值解析
            return parseAsNumber(seriesValue);
        }
    }
    
    /**
     * 尝试将字符串解析为数字
     */
    private BigDecimal parseAsNumber(String value) {
        try {
            // 移除所有空格
            value = value.trim();
            
            // 如果是纯数字，直接解析
            if (value.matches("-?\\d+(\\.\\d+)?")) {
                return new BigDecimal(value);
            }
            
            // 如果是变量引用，尝试从上下文中获取
            if (value.matches("[a-zA-Z_][a-zA-Z0-9_]*")) {
                // 这里可以添加变量查找逻辑
                log.warn("未找到变量: {}", value);
                return BigDecimal.ZERO;
            }
            
            // 如果都失败，返回0
            log.warn("无法解析数值: {}", value);
            return BigDecimal.ZERO;
            
        } catch (NumberFormatException e) {
            log.warn("数值解析失败: {}", value);
            return BigDecimal.ZERO;
        }
    }

    /**
     * 获取财务模型变量的数据类型映射
     */
    private Map<String, String> getVariableDataTypes(Long modelId) {
        Map<String, String> variableDataTypes = new HashMap<>();
        
        // 根据已知的变量名判断数据类型
        // 这里可以根据实际业务需求扩展
        String[] percentageVariables = {
            "variable_cost_rate", "gross_margin", "profit_margin", "tax_rate", 
            "discount_rate", "inflation_rate", "growth_rate"
        };
        
        for (String varName : percentageVariables) {
            variableDataTypes.put(varName, "percentage");
        }
        
        log.debug("设置变量数据类型映射: modelId={}, types={}", modelId, variableDataTypes);
        
        return variableDataTypes;
    }

    private Map<String, Object> formatChartData(List<ChartSimulation> simulationResults, ChartAnalysisModel chartModel) {
        Map<String, Object> chartData = new HashMap<>();
        
        // 按系列分组数据
        Map<Long, List<ChartSimulation>> seriesData = simulationResults.stream()
                .collect(Collectors.groupingBy(ChartSimulation::getSeriesId));
        
        List<Map<String, Object>> series = new ArrayList<>();
        
        for (Map.Entry<Long, List<ChartSimulation>> entry : seriesData.entrySet()) {
            Long seriesId = entry.getKey();
            List<ChartSimulation> points = entry.getValue();
            
            // 查找系列信息
            ChartSeries chartSeries = chartModel.getChartSeriesList().stream()
                    .filter(s -> s.getId().equals(seriesId))
                    .findFirst()
                    .orElse(null);
            
            if (chartSeries != null) {
                Map<String, Object> seriesInfo = new HashMap<>();
                seriesInfo.put("id", seriesId);
                seriesInfo.put("name", chartSeries.getSeriesName());
                seriesInfo.put("type", chartSeries.getSeriesType());
                seriesInfo.put("color", chartSeries.getColor());
                
                // 格式化数据点
                List<Map<String, Object>> dataPoints = points.stream()
                        .sorted(Comparator.comparing(ChartSimulation::getXValue))
                        .map(point -> {
                            Map<String, Object> dataPoint = new HashMap<>();
                            dataPoint.put("x", point.getXValue());
                            dataPoint.put("y", point.getYValue());
                            return dataPoint;
                        })
                        .collect(Collectors.toList());
                
                seriesInfo.put("data", dataPoints);
                series.add(seriesInfo);
            }
        }
        
        chartData.put("chart", chartModel);
        chartData.put("series", series);
        chartData.put("totalPoints", simulationResults.size());
        
        return chartData;
    }
} 