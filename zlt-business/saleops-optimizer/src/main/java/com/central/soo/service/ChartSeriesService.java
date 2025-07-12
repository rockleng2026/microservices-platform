package com.central.soo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.soo.model.entity.ChartSeries;

import java.util.List;

/**
 * 图表指标系列配置服务接口
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
public interface ChartSeriesService extends IService<ChartSeries> {

    /**
     * 根据图表ID查询系列列表
     * 
     * @param chartId 图表ID
     * @return 系列列表
     */
    List<ChartSeries> getByChartId(Long chartId);

    /**
     * 保存图表系列配置
     * 
     * @param chartId 图表ID
     * @param seriesList 系列列表
     * @return 是否成功
     */
    boolean saveChartSeries(Long chartId, List<ChartSeries> seriesList);

    /**
     * 删除图表下的所有系列
     * 
     * @param chartId 图表ID
     * @return 是否成功
     */
    boolean deleteByChartId(Long chartId);

    /**
     * 复制系列配置到新图表
     * 
     * @param sourceChartId 源图表ID
     * @param targetChartId 目标图表ID
     * @return 是否成功
     */
    boolean copySeriesConfig(Long sourceChartId, Long targetChartId);
} 