package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.soo.model.entity.FinancialModel;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 财务模型Mapper接口
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Mapper
public interface FinancialModelMapper extends BaseMapper<FinancialModel> {

    /**
     * 根据模型编码查询模型
     * 
     * @param modelCode 模型编码
     * @param tenantId 租户ID
     * @return 财务模型
     */
    @Select("SELECT * FROM soo_financial_model WHERE model_code = #{modelCode} AND tenant_id = #{tenantId} AND is_active = 1")
    FinancialModel selectByModelCode(@Param("modelCode") String modelCode, @Param("tenantId") String tenantId);

    /**
     * 查询模型统计信息
     * 
     * @param modelId 模型ID
     * @return 统计信息
     */
    @Select("SELECT " +
            "COUNT(ci.id) as total_calculations, " +
            "AVG(ci.calculation_duration) as avg_duration, " +
            "SUM(CASE WHEN ci.calculation_status = 'COMPLETED' THEN 1 ELSE 0 END) / COUNT(ci.id) as success_rate " +
            "FROM soo_financial_model fm " +
            "LEFT JOIN soo_calculation_instance ci ON fm.id = ci.model_id " +
            "WHERE fm.id = #{modelId}")
    Map<String, Object> selectModelStatistics(@Param("modelId") Long modelId);

    /**
     * 查询模型分类汇总
     * 
     * @param tenantId 租户ID
     * @return 分类汇总列表
     */
    @Select("SELECT model_category, COUNT(*) as model_count " +
            "FROM soo_financial_model " +
            "WHERE tenant_id = #{tenantId} AND is_active = 1 " +
            "GROUP BY model_category")
    List<Map<String, Object>> selectCategorySummary(@Param("tenantId") String tenantId);

    /**
     * 查询最近使用的模型
     * 
     * @param tenantId 租户ID
     * @param limit 限制数量
     * @return 最近使用的模型列表
     */
    @Select("SELECT fm.*, MAX(ci.last_executed_time) as last_used_time " +
            "FROM soo_financial_model fm " +
            "LEFT JOIN soo_calculation_instance ci ON fm.id = ci.model_id " +
            "WHERE fm.tenant_id = #{tenantId} AND fm.is_active = 1 " +
            "GROUP BY fm.id " +
            "ORDER BY last_used_time DESC NULLS LAST " +
            "LIMIT #{limit}")
    List<FinancialModel> selectRecentlyUsedModels(@Param("tenantId") String tenantId, @Param("limit") int limit);
} 