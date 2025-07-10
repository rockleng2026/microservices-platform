package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.soo.model.entity.ChartSimulation;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 图表模拟结果存储Mapper
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Mapper
public interface ChartSimulationMapper extends BaseMapper<ChartSimulation> {

    /**
     * 根据运行ID查询模拟结果
     * 
     * @param runId 运行ID
     * @return 模拟结果列表
     */
    List<ChartSimulation> selectByRunId(@Param("runId") Long runId);

    /**
     * 根据图表ID查询模拟结果
     * 
     * @param chartId 图表ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 模拟结果列表
     */
    List<ChartSimulation> selectByChartId(
            @Param("chartId") Long chartId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    /**
     * 根据系列ID查询模拟结果
     * 
     * @param seriesId 系列ID
     * @param limit 限制数量
     * @return 模拟结果列表
     */
    List<ChartSimulation> selectBySeriesId(
            @Param("seriesId") Long seriesId,
            @Param("limit") Integer limit
    );

    /**
     * 分页查询模拟结果（含关联信息）
     * 
     * @param page 分页对象
     * @param runId 运行ID
     * @param chartId 图表ID
     * @param seriesId 系列ID
     * @return 模拟结果分页列表
     */
    IPage<ChartSimulation> selectSimulationPageWithDetails(
            Page<ChartSimulation> page,
            @Param("runId") Long runId,
            @Param("chartId") Long chartId,
            @Param("seriesId") Long seriesId
    );

    /**
     * 查询模拟结果详情（包含图表和系列信息）
     * 
     * @param simulationId 模拟结果ID
     * @return 模拟结果详情
     */
    ChartSimulation selectSimulationWithDetails(@Param("simulationId") Long simulationId);

    /**
     * 批量插入模拟结果
     * 
     * @param simulations 模拟结果列表
     * @return 插入的行数
     */
    int batchInsert(@Param("simulations") List<ChartSimulation> simulations);

    /**
     * 删除指定运行ID的所有模拟结果
     * 
     * @param runId 运行ID
     * @return 删除的行数
     */
    int deleteByRunId(@Param("runId") Long runId);

    /**
     * 删除指定图表的所有模拟结果
     * 
     * @param chartId 图表ID
     * @return 删除的行数
     */
    int deleteByChartId(@Param("chartId") Long chartId);

    /**
     * 删除指定系列的所有模拟结果
     * 
     * @param seriesId 系列ID
     * @return 删除的行数
     */
    int deleteBySeriesId(@Param("seriesId") Long seriesId);

    /**
     * 清理过期的模拟结果
     * 
     * @param beforeTime 清理此时间之前的数据
     * @return 清理的行数
     */
    int cleanupExpiredResults(@Param("beforeTime") LocalDateTime beforeTime);

    /**
     * 查询图表模拟结果统计
     * 
     * @param chartId 图表ID
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 统计信息
     */
    Map<String, Object> selectSimulationStats(
            @Param("chartId") Long chartId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );

    /**
     * 查询图表数据点分布
     * 
     * @param chartId 图表ID
     * @param seriesId 系列ID（可选）
     * @return 数据点分布
     */
    List<Map<String, Object>> selectDataPointDistribution(
            @Param("chartId") Long chartId,
            @Param("seriesId") Long seriesId
    );

    /**
     * 查询Y值的统计信息
     * 
     * @param chartId 图表ID
     * @param seriesId 系列ID
     * @return 统计信息（最大值、最小值、平均值等）
     */
    Map<String, Object> selectYValueStats(
            @Param("chartId") Long chartId,
            @Param("seriesId") Long seriesId
    );

    /**
     * 查询指定X值范围内的模拟结果
     * 
     * @param chartId 图表ID
     * @param minXValue 最小X值
     * @param maxXValue 最大X值
     * @return 模拟结果列表
     */
    List<ChartSimulation> selectByXValueRange(
            @Param("chartId") Long chartId,
            @Param("minXValue") BigDecimal minXValue,
            @Param("maxXValue") BigDecimal maxXValue
    );

    /**
     * 查询运行的模拟结果数量
     * 
     * @param runId 运行ID
     * @return 结果数量
     */
    Integer countByRunId(@Param("runId") Long runId);

    /**
     * 查询图表最近的模拟结果
     * 
     * @param chartId 图表ID
     * @param limit 限制数量
     * @return 最近的模拟结果
     */
    List<ChartSimulation> selectRecentResults(
            @Param("chartId") Long chartId,
            @Param("limit") Integer limit
    );
} 