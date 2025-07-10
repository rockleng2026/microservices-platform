package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.soo.model.entity.ChartSeries;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 图表指标系列配置Mapper
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Mapper
public interface ChartSeriesMapper extends BaseMapper<ChartSeries> {

    /**
     * 根据图表ID查询所有系列配置
     * 
     * @param chartId 图表ID
     * @return 系列配置列表
     */
    List<ChartSeries> selectByChartId(@Param("chartId") Long chartId);

    /**
     * 根据图表ID和系列类型查询系列配置
     * 
     * @param chartId 图表ID
     * @param seriesType 系列类型 (fixed/variable)
     * @return 系列配置列表
     */
    List<ChartSeries> selectByChartIdAndType(
            @Param("chartId") Long chartId,
            @Param("seriesType") String seriesType
    );

    /**
     * 根据字段标识查询所有相关系列
     * 
     * @param fieldName 字段标识
     * @return 系列配置列表
     */
    List<ChartSeries> selectByField(@Param("fieldName") String fieldName);

    /**
     * 查询图表系列配置（包含图表信息）
     * 
     * @param seriesId 系列ID
     * @return 系列配置详情
     */
    ChartSeries selectSeriesWithChart(@Param("seriesId") Long seriesId);

    /**
     * 批量更新系列颜色
     * 
     * @param seriesIds 系列ID列表
     * @param colors 对应颜色列表
     * @return 更新的行数
     */
    int batchUpdateColors(
            @Param("seriesIds") List<Long> seriesIds,
            @Param("colors") List<String> colors
    );

    /**
     * 批量更新系列排序
     * 
     * @param seriesOrderMaps 系列ID和排序映射
     * @return 更新的行数
     */
    int batchUpdateSortOrder(@Param("seriesOrderMaps") List<Map<String, Object>> seriesOrderMaps);

    /**
     * 删除指定图表下的所有系列配置
     * 
     * @param chartId 图表ID
     * @return 删除的行数
     */
    int deleteByChartId(@Param("chartId") Long chartId);

    /**
     * 根据图表ID列表批量删除系列配置
     * 
     * @param chartIds 图表ID列表
     * @return 删除的行数
     */
    int deleteByChartIds(@Param("chartIds") List<Long> chartIds);

    /**
     * 查询图表系列的统计信息
     * 
     * @param chartId 图表ID
     * @return 统计信息
     */
    Map<String, Object> selectSeriesStats(@Param("chartId") Long chartId);

    /**
     * 复制系列配置到新图表
     * 
     * @param sourceChartId 源图表ID
     * @param targetChartId 目标图表ID
     * @return 复制的行数
     */
    int copySeriesConfig(
            @Param("sourceChartId") Long sourceChartId,
            @Param("targetChartId") Long targetChartId
    );

    /**
     * 查询系列类型分布统计
     * 
     * @return 类型分布统计
     */
    List<Map<String, Object>> countSeriesByType();

    /**
     * 获取图表下一个系列的排序号
     * 
     * @param chartId 图表ID
     * @return 下一个排序号
     */
    Integer getNextSortOrder(@Param("chartId") Long chartId);
} 