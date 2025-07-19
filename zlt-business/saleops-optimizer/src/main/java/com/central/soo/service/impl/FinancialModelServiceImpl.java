package com.central.soo.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.common.model.PageResult;
import com.central.soo.mapper.FinancialModelMapper;
import com.central.soo.mapper.ModelVariableMapper;
import com.central.soo.mapper.ChartAnalysisModelMapper;
import com.central.soo.mapper.ChartSeriesMapper;
import com.central.soo.model.entity.FinancialModel;
import com.central.soo.model.entity.ModelVariable;
import com.central.soo.model.entity.ChartAnalysisModel;
import com.central.soo.model.entity.ChartSeries;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;

/**
 * 财务模型服务实现
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Slf4j
@Service
public class FinancialModelServiceImpl 
        extends ServiceImpl<FinancialModelMapper, FinancialModel> 
        implements FinancialModelService {

    @Autowired
    private FinancialModelMapper financialModelMapper;

    @Autowired
    private ModelVariableMapper modelVariableMapper;

    @Autowired
    private ChartAnalysisModelMapper chartAnalysisModelMapper;

    @Autowired
    private ChartSeriesMapper chartSeriesMapper;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public FinancialModel createModel(FinancialModel model) {
        log.info("创建财务模型: {}", model.getModelName());
        
        // 验证模型编码唯一性
        if (StringUtils.hasText(model.getModelCode())) {
            FinancialModel existingModel = getByModelCode(model.getModelCode(), model.getTenantId());
            if (existingModel != null) {
                throw new RuntimeException("模型编码已存在: " + model.getModelCode());
            }
        }
        
        // 设置默认值
        if (model.getModelVersion() == null) {
            model.setModelVersion("1.0.0");
        }
        if (model.getIsActive() == null) {
            model.setIsActive(true);
        }
        if (model.getIsTemplate() == null) {
            model.setIsTemplate(false);
        }
        
        // 时间字段由MyBatis自动填充
        
        boolean saved = save(model);
        if (!saved) {
            throw new RuntimeException("保存财务模型失败");
        }
        
        log.info("财务模型创建成功，ID: {}", model.getId());
        return model;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public FinancialModel updateModel(FinancialModel model) {
        log.info("更新财务模型: {}", model.getId());
        
        FinancialModel existingModel = getById(model.getId());
        if (existingModel == null) {
            throw new RuntimeException("财务模型不存在: " + model.getId());
        }
        
        model.setUpdatedAt(new Date());
        
        boolean updated = updateById(model);
        if (!updated) {
            throw new RuntimeException("更新财务模型失败");
        }
        
        log.info("财务模型更新成功，ID: {}", model.getId());
        return model;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public FinancialModel cloneModel(Long sourceModelId, String newModelCode, String newModelName, boolean includeVariables) {
        log.info("克隆财务模型: {} -> {}", sourceModelId, newModelName);
        
        FinancialModel sourceModel = getById(sourceModelId);
        if (sourceModel == null) {
            throw new RuntimeException("源模型不存在: " + sourceModelId);
        }
        
        // 创建新模型
        FinancialModel newModel = new FinancialModel();
        BeanUtils.copyProperties(sourceModel, newModel, "id", "createdTime", "updatedTime");
        newModel.setModelCode(newModelCode);
        newModel.setModelName(newModelName);
        newModel.setParentModelId(sourceModelId);
        
        FinancialModel createdModel = createModel(newModel);
        
        // 复制变量配置
        if (includeVariables) {
            List<ModelVariable> variables = modelVariableMapper.selectByModelId(sourceModelId);
            for (ModelVariable variable : variables) {
                ModelVariable newVariable = new ModelVariable();
                BeanUtils.copyProperties(variable, newVariable, "id", "createdTime", "updatedTime");
                newVariable.setModelId(createdModel.getId());
                modelVariableMapper.insert(newVariable);
            }
            
            // 复制图表配置
            List<ChartAnalysisModel> charts = chartAnalysisModelMapper.selectByModelId(sourceModelId);
            for (ChartAnalysisModel chart : charts) {
                ChartAnalysisModel newChart = new ChartAnalysisModel();
                BeanUtils.copyProperties(chart, newChart, "id", "createdTime", "updatedTime");
                newChart.setModelId(createdModel.getId());
                newChart.setChartName(chart.getChartName() + " - 副本");
                chartAnalysisModelMapper.insert(newChart);
                
                // 复制图表系列
                List<ChartSeries> seriesList = chartSeriesMapper.selectByChartId(chart.getId());
                for (ChartSeries series : seriesList) {
                    ChartSeries newSeries = new ChartSeries();
                    BeanUtils.copyProperties(series, newSeries, "id", "createdTime", "updatedTime");
                    newSeries.setChartId(newChart.getId());
                    chartSeriesMapper.insert(newSeries);
                }
            }
        }
        
        log.info("财务模型克隆成功，新模型ID: {}, 包含变量: {}, 包含图表: {}", 
                createdModel.getId(), includeVariables, includeVariables);
        return createdModel;
    }

    @Override
    public Page<FinancialModel> pageModels(Page<FinancialModel> page, String category, String keyword, 
                                          Boolean isActive, Boolean isTemplate, String tenantId) {
        
        log.info("分页查询财务模型: category={}, keyword={}, isActive={}, isTemplate={}, tenantId={}", 
                 category, keyword, isActive, isTemplate, tenantId);
        
        return financialModelMapper.selectPageModels(page, category, keyword, isActive, isTemplate, tenantId);
    }

    @Override
    public PageResult<FinancialModel> pageModels(Integer page, Integer size, String category, String keyword, 
                                                Boolean isActive, Boolean isTemplate, String tenantId) {
        
        log.info("分页查询财务模型(PageResult): page={}, size={}, category={}, keyword={}, isActive={}, isTemplate={}, tenantId={}", 
                 page, size, category, keyword, isActive, isTemplate, tenantId);
        
        Page<FinancialModel> pageParam = new Page<>(page, size);
        Page<FinancialModel> result = financialModelMapper.selectPageModels(pageParam, category, keyword, isActive, isTemplate, tenantId);
        return PageResultUtil.buildPageResult(result);
    }

    @Override
    public FinancialModel getByModelCode(String modelCode, String tenantId) {
        if (!StringUtils.hasText(modelCode)) {
            return null;
        }
        
        return financialModelMapper.selectByModelCode(modelCode, tenantId);
    }

    @Override
    public Map<String, Object> getModelDetail(Long modelId) {
        log.info("获取模型详情: {}", modelId);
        
        FinancialModel model = getById(modelId);
        if (model == null) {
            throw new RuntimeException("财务模型不存在: " + modelId);
        }
        
        // 获取模型变量
        List<ModelVariable> variables = modelVariableMapper.selectByModelId(modelId);
        
        // 获取图表配置
        List<ChartAnalysisModel> charts = chartAnalysisModelMapper.selectByModelId(modelId);
        
        // 获取图表系列数据
        List<Map<String, Object>> chartsWithSeries = new ArrayList<>();
        for (ChartAnalysisModel chart : charts) {
            List<ChartSeries> series = chartSeriesMapper.selectByChartId(chart.getId());
            
            Map<String, Object> chartWithSeries = new HashMap<>();
            chartWithSeries.put("chart", chart);
            chartWithSeries.put("series", series);
            chartsWithSeries.add(chartWithSeries);
        }
        
        // 获取统计信息
        Map<String, Object> statistics = getModelStatistics(modelId);
        
        Map<String, Object> detail = new HashMap<>();
        detail.put("model", model);
        detail.put("variables", variables);
        detail.put("charts", chartsWithSeries);
        detail.put("statistics", statistics);
        
        return detail;
    }

    @Override
    public Map<String, Object> getModelStatistics(Long modelId) {
        return financialModelMapper.selectModelStatistics(modelId);
    }

    @Override
    public List<Map<String, Object>> getCategorySummary(String tenantId) {
        return financialModelMapper.selectCategorySummary(tenantId);
    }

    @Override
    public List<FinancialModel> getRecentlyUsedModels(String tenantId, int limit) {
        return financialModelMapper.selectRecentlyUsedModels(tenantId, limit);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteModel(Long modelId) {
        log.info("删除财务模型: {}", modelId);
        
        // 检查模型是否存在
        FinancialModel model = getById(modelId);
        if (model == null) {
            log.warn("财务模型不存在: {}", modelId);
            return false;
        }
        
        try {
            // 1. 删除模型变量（级联删除依赖关系）
            log.info("删除模型变量: modelId={}", modelId);
            int deletedVariables = modelVariableMapper.deleteByModelId(modelId);
            log.info("删除变量数量: {}", deletedVariables);
            
            // 2. 删除图表配置和系列数据
            log.info("删除图表配置: modelId={}", modelId);
            List<ChartAnalysisModel> charts = chartAnalysisModelMapper.selectByModelId(modelId);
            int deletedCharts = 0;
            int deletedSeries = 0;
            
            if (!charts.isEmpty()) {
                // 删除每个图表的相关系列
                for (ChartAnalysisModel chart : charts) {
                    int seriesCount = chartSeriesMapper.deleteByChartId(chart.getId());
                    deletedSeries += seriesCount;
                    log.info("删除图表[{}]的系列数量: {}", chart.getId(), seriesCount);
                }
                
                // 删除图表配置
                deletedCharts = chartAnalysisModelMapper.deleteByModelId(modelId);
                log.info("删除图表数量: {}", deletedCharts);
            }
            
            // 3. 删除模型本身
            log.info("删除财务模型: modelId={}", modelId);
            boolean deleted = removeById(modelId);
            
            if (deleted) {
                log.info("财务模型删除成功: modelId={}, 删除变量: {}, 删除图表: {}, 删除系列: {}", 
                        modelId, deletedVariables, deletedCharts, deletedSeries);
            } else {
                log.error("财务模型删除失败: modelId={}", modelId);
            }
            
            return deleted;
            
        } catch (Exception e) {
            log.error("删除财务模型时发生错误: modelId={}, error={}", modelId, e.getMessage(), e);
            throw new RuntimeException("删除财务模型失败: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean toggleModelStatus(Long modelId, boolean isActive) {
        log.info("切换模型状态: modelId={}, isActive={}", modelId, isActive);
        
        FinancialModel model = new FinancialModel();
        model.setId(modelId);
        model.setIsActive(isActive);
        // 更新时间由MyBatis自动填充
        
        return updateById(model);
    }

    @Override
    public Map<String, Object> validateModel(Long modelId) {
        log.info("验证模型完整性: {}", modelId);
        
        Map<String, Object> result = new HashMap<>();
        
        FinancialModel model = getById(modelId);
        if (model == null) {
            result.put("valid", false);
            result.put("message", "模型不存在");
            return result;
        }
        
        // 检查基本配置
        boolean valid = true;
        StringBuilder message = new StringBuilder();
        
        if (!StringUtils.hasText(model.getModelCode())) {
            valid = false;
            message.append("缺少模型编码; ");
        }
        
        if (!StringUtils.hasText(model.getModelName())) {
            valid = false;
            message.append("缺少模型名称; ");
        }
        
        // 检查变量配置
        List<ModelVariable> variables = modelVariableMapper.selectByModelId(modelId);
        if (variables.isEmpty()) {
            message.append("未配置变量; ");
        } else {
            long inputVarCount = variables.stream().filter(v -> "INPUT".equals(v.getVariableType())).count();
            long calcVarCount = variables.stream().filter(v -> "CALC".equals(v.getVariableType())).count();
            
            if (inputVarCount == 0) {
                message.append("缺少输入变量; ");
            }
            if (calcVarCount == 0) {
                message.append("缺少计算变量; ");
            }
        }
        
        result.put("valid", valid);
        result.put("message", message.toString());
        result.put("variableCount", variables.size());
        
        return result;
    }

    @Override
    public String exportModelConfig(Long modelId) {
        log.info("导出模型配置: {}", modelId);
        
        try {
            Map<String, Object> modelDetail = getModelDetail(modelId);
            return objectMapper.writeValueAsString(modelDetail);
        } catch (JsonProcessingException e) {
            log.error("导出模型配置失败", e);
            throw new RuntimeException("导出失败: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public FinancialModel importModelConfig(String configJson, String tenantId) {
        log.info("导入模型配置，tenantId: {}", tenantId);
        
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> config = objectMapper.readValue(configJson, Map.class);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> modelData = (Map<String, Object>) config.get("model");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> variablesData = (List<Map<String, Object>>) config.get("variables");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> chartsData = (List<Map<String, Object>>) config.get("charts");
            
            // 创建模型
            FinancialModel model = objectMapper.convertValue(modelData, FinancialModel.class);
            model.setId(null);
            model.setTenantId(tenantId);
            model.setModelName(model.getModelName() + "_导入");
            
            FinancialModel createdModel = createModel(model);
            
            // 导入变量
            if (variablesData != null) {
                for (Map<String, Object> variableData : variablesData) {
                    ModelVariable variable = objectMapper.convertValue(variableData, ModelVariable.class);
                    variable.setId(null);
                    variable.setModelId(createdModel.getId());
                    modelVariableMapper.insert(variable);
                }
            }
            
            // 导入图表配置和系列数据
            if (chartsData != null) {
                for (Map<String, Object> chartData : chartsData) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> chartModelData = (Map<String, Object>) chartData.get("chart");
                    @SuppressWarnings("unchecked")
                    List<Map<String, Object>> seriesData = (List<Map<String, Object>>) chartData.get("series");
                    
                    // 创建图表配置
                    ChartAnalysisModel chartModel = objectMapper.convertValue(chartModelData, ChartAnalysisModel.class);
                    chartModel.setId(null);
                    chartModel.setModelId(createdModel.getId());
                    chartModel.setChartName(chartModel.getChartName() + "_导入");
                    chartAnalysisModelMapper.insert(chartModel);
                    
                    // 导入图表系列
                    if (seriesData != null) {
                        for (Map<String, Object> seriesItem : seriesData) {
                            ChartSeries series = objectMapper.convertValue(seriesItem, ChartSeries.class);
                            series.setId(null);
                            series.setChartId(chartModel.getId());
                            chartSeriesMapper.insert(series);
                        }
                    }
                }
            }
            
            log.info("模型配置导入完成，模型ID: {}", createdModel.getId());
            return createdModel;
            
        } catch (Exception e) {
            log.error("导入模型配置失败", e);
            throw new RuntimeException("导入失败: " + e.getMessage(), e);
        }
    }

    @Override
    public List<FinancialModel> getBreakevenModels() {
        // 获取盈亏平衡分析相关的模型（根据分类或特定标识）
        return financialModelMapper.selectList(
            Wrappers.<FinancialModel>lambdaQuery()
                .eq(FinancialModel::getIsActive, true)
                .and(wrapper -> wrapper
                    .eq(FinancialModel::getModelCategory, "breakeven_analysis")
                    .or()
                    .like(FinancialModel::getModelName, "盈亏平衡")
                    .or()
                    .like(FinancialModel::getModelCode, "BREAKEVEN")
                )
                .orderByDesc(FinancialModel::getUpdatedAt)
        );
    }
} 