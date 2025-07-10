package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.soo.model.entity.ChartAnalysisModel;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 图表分析模型配置Mapper
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Mapper
public interface ChartAnalysisModelMapper extends BaseMapper<ChartAnalysisModel> {

    /**
     * 分页查询图表分析模型列表（含关联信息）
     * 
     * @param page 分页对象
     * @param modelId 财务模型ID
     * @param chartName 图表名称（模糊匹配）
     * @param chartType 图表类型
     * @return 图表分析模型分页列表
     */
    IPage<ChartAnalysisModel> selectChartModelPageWithDetails(
            Page<ChartAnalysisModel> page,
            @Param("modelId") Long modelId,
            @Param("chartName") String chartName,
            @Param("chartType") String chartType
    );

    /**
     * 根据财务模型ID查询所有图表配置
     * 
     * @param modelId 财务模型ID
     * @return 图表配置列表
     */
    List<ChartAnalysisModel> selectByModelId(@Param("modelId") Long modelId);

    /**
     * 查询图表配置详情（包含系列信息）
     * 
     * @param chartId 图表ID
     * @return 图表配置详情
     */
    ChartAnalysisModel selectChartWithSeries(@Param("chartId") Long chartId);

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
     * 根据字段标识查询使用该字段的图表
     * 
     * @param fieldName 字段标识
     * @return 图表列表
     */
    List<ChartAnalysisModel> selectChartsByField(@Param("fieldName") String fieldName);

    /**
     * 批量更新图表的模拟步数
     * 
     * @param chartIds 图表ID列表
     * @param simulationSteps 新的模拟步数
     * @return 更新的行数
     */
    int batchUpdateSimulationSteps(
            @Param("chartIds") List<Long> chartIds,
            @Param("simulationSteps") Integer simulationSteps
    );

    /**
     * 删除指定财务模型下的所有图表配置
     * 
     * @param modelId 财务模型ID
     * @return 删除的行数
     */
    int deleteByModelId(@Param("modelId") Long modelId);

    /**
     * 查询图表配置的使用历史统计
     * 
     * @param chartId 图表ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @return 使用统计信息
     */
    Map<String, Object> selectChartUsageStats(
            @Param("chartId") Long chartId,
            @Param("startDate") String startDate,
            @Param("endDate") String endDate
    );
} 