package com.central.crm.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.crm.model.Opportunity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 商机数据访问接口
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Mapper
public interface OpportunityMapper extends BaseMapper<Opportunity> {

    /**
     * 分页查询商机列表
     */
    IPage<Opportunity> selectOpportunityPage(Page<Opportunity> page, @Param("params") Map<String, Object> params);

    /**
     * 查询商机漏斗统计
     */
    List<Map<String, Object>> selectFunnelStatistics(@Param("params") Map<String, Object> params);

    /**
     * 查询商机成交统计
     */
    Map<String, Object> selectWinStatistics(@Param("params") Map<String, Object> params);

    /**
     * 根据客户ID查询商机列表
     */
    List<Opportunity> selectByCustomerId(@Param("customerId") Long customerId);

    /**
     * 查询商机趋势统计
     */
    List<Map<String, Object>> selectTrendStatistics(@Param("params") Map<String, Object> params);
}