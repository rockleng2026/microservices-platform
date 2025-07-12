package com.central.soo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.soo.mapper.ChartSeriesMapper;
import com.central.soo.model.entity.ChartSeries;
import com.central.soo.service.ChartSeriesService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 图表指标系列配置服务实现类
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Slf4j
@Service
public class ChartSeriesServiceImpl extends ServiceImpl<ChartSeriesMapper, ChartSeries> implements ChartSeriesService {

    @Autowired
    private ChartSeriesMapper chartSeriesMapper;

    @Override
    public List<ChartSeries> getByChartId(Long chartId) {
        return chartSeriesMapper.selectByChartId(chartId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean saveChartSeries(Long chartId, List<ChartSeries> seriesList) {
        // 先删除原有的系列配置
        chartSeriesMapper.deleteByChartId(chartId);
        
        if (seriesList != null && !seriesList.isEmpty()) {
            // 设置图表ID和排序
            for (int i = 0; i < seriesList.size(); i++) {
                ChartSeries series = seriesList.get(i);
                series.setChartId(chartId);
                if (series.getSortOrder() == null) {
                    series.setSortOrder(i + 1);
                }
            }
            
            // 批量插入新的系列配置
            chartSeriesMapper.batchInsert(seriesList);
        }
        
        return true;
    }

    @Override
    public boolean deleteByChartId(Long chartId) {
        try {
            chartSeriesMapper.deleteByChartId(chartId);
            return true;
        } catch (Exception e) {
            log.error("删除图表系列配置失败, chartId: {}, error: {}", chartId, e.getMessage(), e);
            return false;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean copySeriesConfig(Long sourceChartId, Long targetChartId) {
        List<ChartSeries> sourceSeriesList = getByChartId(sourceChartId);
        if (sourceSeriesList.isEmpty()) {
            return true;
        }
        
        // 复制系列配置，重置ID和图表ID
        List<ChartSeries> targetSeriesList = sourceSeriesList.stream()
                .map(series -> {
                    ChartSeries newSeries = new ChartSeries();
                    newSeries.setChartId(targetChartId);
                    newSeries.setSeriesName(series.getSeriesName());
                    newSeries.setSeriesField(series.getSeriesField());
                    newSeries.setSeriesType(series.getSeriesType());
                    newSeries.setSeriesValue(series.getSeriesValue());
                    newSeries.setColor(series.getColor());
                    newSeries.setSortOrder(series.getSortOrder());
                    return newSeries;
                })
                .collect(Collectors.toList());
        
        return saveChartSeries(targetChartId, targetSeriesList);
    }
} 