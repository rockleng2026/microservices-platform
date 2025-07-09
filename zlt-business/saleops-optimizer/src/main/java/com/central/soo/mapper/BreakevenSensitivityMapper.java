package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.soo.model.entity.BreakevenSensitivity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 盈亏平衡敏感性分析Mapper接口
 */
@Mapper
public interface BreakevenSensitivityMapper extends BaseMapper<BreakevenSensitivity> {

    /**
     * 根据分析ID查询敏感性分析结果
     * @param analysisId 分析ID
     * @param tenantId 租户ID
     * @return 敏感性分析结果列表
     */
    List<BreakevenSensitivity> selectByAnalysisId(@Param("analysisId") String analysisId, @Param("tenantId") String tenantId);

    /**
     * 根据ID和租户ID查询敏感性分析详情
     * @param id 主键ID
     * @param tenantId 租户ID
     * @return 敏感性分析详情
     */
    BreakevenSensitivity selectByIdAndTenant(@Param("id") Long id, @Param("tenantId") String tenantId);

    /**
     * 删除分析下的所有敏感性数据
     * @param analysisId 分析ID
     * @param tenantId 租户ID
     * @return 删除记录数
     */
    int deleteByAnalysisId(@Param("analysisId") String analysisId, @Param("tenantId") String tenantId);

    /**
     * 获取敏感性排名
     * @param analysisId 分析ID
     * @param tenantId 租户ID
     * @return 敏感性排名列表
     */
    List<BreakevenSensitivity> selectSensitivityRanking(@Param("analysisId") String analysisId, @Param("tenantId") String tenantId);

    /**
     * 批量插入敏感性分析结果
     * @param sensitivities 敏感性分析结果列表
     * @return 插入记录数
     */
    int batchInsert(@Param("sensitivities") List<BreakevenSensitivity> sensitivities);

    /**
     * 批量更新计算状态
     * @param analysisId 分析ID
     * @param status 计算状态
     * @param tenantId 租户ID
     * @return 更新记录数
     */
    int batchUpdateCalculationStatus(@Param("analysisId") String analysisId, 
                                   @Param("status") String status,
                                   @Param("tenantId") String tenantId);

    /**
     * 根据参数名称查询敏感性分析
     *
     * @param analysisId 分析ID
     * @param parameterName 参数名称
     * @param tenantId 租户ID
     * @return 敏感性分析结果
     */
    BreakevenSensitivity selectByParameter(@Param("analysisId") String analysisId, 
                                          @Param("parameterName") String parameterName, 
                                          @Param("tenantId") String tenantId);
}