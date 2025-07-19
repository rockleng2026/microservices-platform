package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.soo.model.entity.ChartAnalysisModel;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

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
     */
    @Select("<script>"+
        "SELECT * FROM soo_chart_analysis_model" +
        "<where>" +
        "  <if test='modelId != null'> AND model_id = #{modelId}</if>" +
        "  <if test='chartName != null and chartName != \"\"'>AND chart_name LIKE CONCAT('%', #{chartName}, '%')</if>"+ // 已修复
        "  <if test='chartType != null and chartType != \"\"'>AND chart_type = #{chartType}</if>"+
        "</where>"+
        "ORDER BY id DESC"+
        "</script>")
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
    @Select("SELECT * FROM soo_chart_analysis_model WHERE model_id = #{modelId}")
    List<ChartAnalysisModel> selectByModelId(@Param("modelId") Long modelId);

    /**
     * 查询图表配置详情（包含系列信息）
     */
    @Select("SELECT * FROM soo_chart_analysis_model WHERE id = #{chartId}")
    ChartAnalysisModel selectChartWithSeries(@Param("chartId") Long chartId);

    /**
     * 统计各财务模型的图表数量
     */
    @Select("SELECT model_id, COUNT(*) AS chart_count FROM soo_chart_analysis_model GROUP BY model_id")
    List<Map<String, Object>> countChartsByModel();

    /**
     * 查询图表类型使用统计
     */
    @Select("SELECT chart_type, COUNT(*) AS type_count FROM soo_chart_analysis_model GROUP BY chart_type")
    List<Map<String, Object>> countChartsByType();

    /**
     * 根据字段标识查询使用该字段的图表
     */
    @Select("SELECT * FROM soo_chart_analysis_model WHERE x_axis_field = #{fieldName} OR y_axis_field = #{fieldName}")
    List<ChartAnalysisModel> selectChartsByField(@Param("fieldName") String fieldName);

    /**
     * 批量更新图表的模拟步数
     */
    // 需在XML实现或用@UpdateProvider（如需注解实现请补充）

    /**
     * 删除指定财务模型下的所有图表配置
     */
    @org.apache.ibatis.annotations.Delete("DELETE FROM soo_chart_analysis_model WHERE model_id = #{modelId}")
    int deleteByModelId(@Param("modelId") Long modelId);

    Map<String, Object> selectChartUsageStats(Long chartId, String startDate, String endDate);

    int batchUpdateSimulationSteps(List<Long> chartIds, Integer simulationSteps);

    /**
     * 查询图表配置的使用历史统计
     */
    // 需在XML实现或用@SelectProvider（如需注解实现请补充）
} 