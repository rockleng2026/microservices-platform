package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.soo.model.entity.BreakevenScenario;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 盈亏平衡场景Mapper接口
 */
@Mapper
public interface BreakevenScenarioMapper extends BaseMapper<BreakevenScenario> {

    /**
     * 根据分析ID查询场景列表
     *
     * @param analysisId 分析ID
     * @param tenantId 租户ID
     * @return 场景列表
     */
    List<BreakevenScenario> selectByAnalysisId(@Param("analysisId") String analysisId, @Param("tenantId") String tenantId);

    /**
     * 查询基准场景
     *
     * @param analysisId 分析ID
     * @param tenantId 租户ID
     * @return 基准场景
     */
    BreakevenScenario selectBaselineScenario(@Param("analysisId") String analysisId, @Param("tenantId") String tenantId);

    /**
     * 查询推荐场景列表
     *
     * @param analysisId 分析ID
     * @param tenantId 租户ID
     * @return 推荐场景列表
     */
    List<BreakevenScenario> selectRecommendedScenarios(@Param("analysisId") String analysisId, @Param("tenantId") String tenantId);

    /**
     * 批量插入场景
     *
     * @param scenarios 场景列表
     * @return 插入记录
     */
    int batchInsert(@Param("scenarios") List<BreakevenScenario> scenarios);

    /**
     * 删除分析相关的所有场
     *
     * @param analysisId 分析ID
     * @param tenantId 租户ID
     * @return 删除记录
     */
    int deleteByAnalysisId(@Param("analysisId") String analysisId, @Param("tenantId") String tenantId);

    /**
     * 更新场景排序
     *
     * @param scenarioId 场景ID
     * @param sortOrder 排序序号
     * @param tenantId 租户ID
     * @return 更新记录
     */
    int updateSortOrder(@Param("scenarioId") String scenarioId, @Param("sortOrder") Integer sortOrder, @Param("tenantId") String tenantId);
} 
