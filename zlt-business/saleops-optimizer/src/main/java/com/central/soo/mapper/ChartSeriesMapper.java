package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.soo.model.entity.ChartSeries;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 图表指标系列配置 Mapper
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Mapper
public interface ChartSeriesMapper extends BaseMapper<ChartSeries> {

    /**
     * 根据图表ID查询系列列表
     */
    @Select("SELECT * FROM soo_chart_series WHERE chart_id = #{chartId} ORDER BY sort_order ASC, id ASC")
    List<ChartSeries> selectByChartId(@Param("chartId") Long chartId);

    /**
     * 根据图表ID删除系列
     */
    @Delete("DELETE FROM soo_chart_series WHERE chart_id = #{chartId}")
    int deleteByChartId(@Param("chartId") Long chartId);

    /**
     * 批量删除
     * @param chartIds
     * @return iNt
     */
    int deleteByChartIds(@Param("chartIds") List<Long> chartIds);
    /**
     * 批量插入系列
     */
    int batchInsert(@Param("seriesList") List<ChartSeries> seriesList);
} 