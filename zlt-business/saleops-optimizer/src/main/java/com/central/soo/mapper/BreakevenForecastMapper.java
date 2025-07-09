package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.soo.model.entity.BreakevenForecast;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 盈亏平衡预测分析Mapper接口
 */
@Mapper
public interface BreakevenForecastMapper extends BaseMapper<BreakevenForecast> {

    /**
     * 根据分析ID查询预测结果
     *
     * @param analysisId 分析ID
     * @param tenantId 租户ID
     * @return 预测结果
     */
    BreakevenForecast selectByAnalysisId(@Param("analysisId") String analysisId, @Param("tenantId") Long tenantId);

    /**
     * 根据预测ID查询
     *
     * @param forecastId 预测ID
     * @param tenantId 租户ID
     * @return 预测结果
     */
    BreakevenForecast selectByForecastId(@Param("forecastId") String forecastId, @Param("tenantId") Long tenantId);

    /**
     * 删除分析相关的预测数据
     *
     * @param analysisId 分析ID
     * @param tenantId 租户ID
     * @return 删除记录数
     */
    int deleteByAnalysisId(@Param("analysisId") String analysisId, @Param("tenantId") Long tenantId);

    /**
     * 查询需要更新的预测记录
     *
     * @return 需要更新的预测记录列表
     */
    List<BreakevenForecast> selectForUpdate();

    /**
     * 更新预测状态
     *
     * @param forecastId 预测ID
     * @param status 新状态
     * @param tenantId 租户ID
     * @return 更新记录数
     */
    int updateStatus(@Param("forecastId") String forecastId, @Param("status") String status, @Param("tenantId") Long tenantId);
} 