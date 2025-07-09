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
     *
     * @param analysisId 分析ID
     * @param tenantId 租户ID
     * @return 敏感性分析结果列表
     */
    List<BreakevenSensitivity> selectByAnalysisId(@Param("analysisId") String analysisId, @Param("tenantId") Long tenantId);

    /**
     * 批量插入敏感性分析结果
     *
     * @param sensitivities 敏感性分析结果列表
     * @return 插入记录数
     */
    int batchInsert(@Param("sensitivities") List<BreakevenSensitivity> sensitivities);

    /**
     * 删除分析相关的所有敏感性数据
     *
     * @param analysisId 分析ID
     * @param tenantId 租户ID
     * @return 删除记录数
     */
    int deleteByAnalysisId(@Param("analysisId") String analysisId, @Param("tenantId") Long tenantId);

    /**
     * 获取参数敏感性排名
     *
     * @param analysisId 分析ID
     * @param tenantId 租户ID
     * @return 敏感性排名
     */
    List<BreakevenSensitivity> selectSensitivityRanking(@Param("analysisId") String analysisId, @Param("tenantId") Long tenantId);

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
                                          @Param("tenantId") Long tenantId);
} 