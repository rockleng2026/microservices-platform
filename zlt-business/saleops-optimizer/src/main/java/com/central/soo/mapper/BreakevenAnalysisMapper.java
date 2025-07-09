package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.soo.model.dto.BreakevenQueryDTO;
import com.central.soo.model.entity.BreakevenAnalysis;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 盈亏平衡分析Mapper接口
 */
@Mapper
public interface BreakevenAnalysisMapper extends BaseMapper<BreakevenAnalysis> {

    /**
     * 分页查询盈亏平衡分析列表
     *
     * @param page 分页参数
     * @param queryDTO 查询条件
     * @return 分页结果
     */
    IPage<BreakevenAnalysis> selectAnalysisList(Page<BreakevenAnalysis> page, @Param("query") BreakevenQueryDTO queryDTO);

    /**
     * 根据分析ID查询
     *
     * @param analysisId 分析ID
     * @param tenantId 租户ID
     * @return 分析记录
     */
    BreakevenAnalysis selectByAnalysisId(@Param("analysisId") String analysisId, @Param("tenantId") Long tenantId);

    /**
     * 查询指定租户的所有分析记录
     *
     * @param tenantId 租户ID
     * @param status 状态过滤
     * @return 分析记录列表
     */
    List<BreakevenAnalysis> selectByTenantId(@Param("tenantId") Long tenantId, @Param("status") String status);

    /**
     * 查询需要自动重算的分析记录
     *
     * @return 需要重算的记录列表
     */
    List<BreakevenAnalysis> selectForAutoRecalculation();

    /**
     * 批量更新状态
     *
     * @param analysisIds 分析ID列表
     * @param status 新状态
     * @param tenantId 租户ID
     * @return 更新记录数
     */
    int batchUpdateStatus(@Param("analysisIds") List<String> analysisIds, 
                         @Param("status") String status, 
                         @Param("tenantId") Long tenantId);

    /**
     * 统计分析记录数量
     *
     * @param queryDTO 查询条件
     * @return 记录数量
     */
    Long countAnalysis(@Param("query") BreakevenQueryDTO queryDTO);

    /**
     * 查询最近的分析记录
     *
     * @param tenantId 租户ID
     * @param limit 限制数量
     * @return 最近的分析记录
     */
    List<BreakevenAnalysis> selectRecentAnalysis(@Param("tenantId") Long tenantId, @Param("limit") Integer limit);

    /**
     * 根据创建人查询分析记录
     *
     * @param creatorId 创建人ID
     * @param tenantId 租户ID
     * @return 分析记录列表
     */
    List<BreakevenAnalysis> selectByCreator(@Param("creatorId") Long creatorId, @Param("tenantId") Long tenantId);

    /**
     * 删除过期的分析记录
     *
     * @param days 过期天数
     * @param tenantId 租户ID
     * @return 删除记录数
     */
    int deleteExpiredAnalysis(@Param("days") Integer days, @Param("tenantId") Long tenantId);

    /**
     * 查询分析记录统计信息
     *
     * @param tenantId 租户ID
     * @param analysisPeriod 分析期间
     * @return 统计信息Map
     */
    List<java.util.Map<String, Object>> selectAnalysisStatistics(@Param("tenantId") Long tenantId, 
                                                                 @Param("analysisPeriod") String analysisPeriod);
} 