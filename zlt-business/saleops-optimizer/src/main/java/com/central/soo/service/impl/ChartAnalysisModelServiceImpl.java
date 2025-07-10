package com.central.soo.service.impl;

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
        
        chartModel.setCreatedAt(LocalDateTime.now());
        chartModel.setUpdatedAt(LocalDateTime.now());
        
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
        
        chartModel.setUpdatedAt(LocalDateTime.now());
        
        boolean updated = updateById(chartModel);
        if (!updated) {
            throw new RuntimeException("更新图表分析模型失败");
        }
        
        log.info("图表分析模型更新成功，ID: {}", chartModel.getId());
        return chartModel;
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
        chartSeriesMapper.deleteByChartIds(chartIds);
        
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
        
        Page<ChartAnalysisModel> result = chartAnalysisModelMapper.selectChartModelPageWithDetails(
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
        if (!StringUtils.hasText(chartModel.getYAxisField())) {
            errors.add("Y轴字段未配置");
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
                        BigDecimal yValue = formulaEngine.calculateFormula(series.getSeriesField(), calcParams);
                        
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
                preset.setYAxisField("net_profit");
                preset.setYAxisUnit("元");
                break;
            case "bar":
                preset.setChartName("成本结构分析图");
                preset.setXAxisField("period");
                preset.setXAxisUnit("月");
                preset.setYAxisField("cost");
                preset.setYAxisUnit("元");
                break;
            case "scatter":
                preset.setChartName("敏感性分析图");
                preset.setXAxisField("parameter_value");
                preset.setXAxisUnit("%");
                preset.setYAxisField("result_change");
                preset.setYAxisUnit("%");
                break;
            default:
                preset.setChartName("自定义分析图");
                preset.setXAxisField("x_field");
                preset.setYAxisField("y_field");
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
            chartSeriesMapper.deleteByChartIds(chartIds);
            
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
        if (!StringUtils.hasText(seriesValue)) {
            return null;
        }
        
        // 简单的表达式解析，支持基础运算
        if (seriesValue.contains("base")) {
            // 替换 base 为上下文中的基础值
            BigDecimal baseValue = getParameterValue(context, "base_value", BigDecimal.ONE);
            seriesValue = seriesValue.replace("base", baseValue.toString());
        }
        
        try {
            // 使用公式引擎计算
            return formulaEngine.calculateFormula(seriesValue, context);
        } catch (Exception e) {
            // 如果计算失败，尝试作为数值解析
            try {
                return new BigDecimal(seriesValue);
            } catch (NumberFormatException ne) {
                return seriesValue;
            }
        }
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