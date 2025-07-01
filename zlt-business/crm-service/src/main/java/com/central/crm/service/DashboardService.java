package com.central.crm.service;

import java.util.List;
import java.util.Map;

/**
 * CRM工作台统计Service接口
 *
 * @author Central Team
 * @since 2024-12-19
 */
public interface DashboardService {

    /**
     * 获取工作台统计概览数据
     */
    Map<String, Object> getDashboardOverview(Map<String, Object> params);

    /**
     * 获取客户统计数据
     */
    Map<String, Object> getCustomerStats(Map<String, Object> params);

    /**
     * 获取商机统计数据
     */
    Map<String, Object> getOpportunityStats(Map<String, Object> params);

    /**
     * 获取销售统计数据
     */
    Map<String, Object> getSalesStats(Map<String, Object> params);

    /**
     * 获取业绩排行榜
     */
    List<Map<String, Object>> getPerformanceRanking(Map<String, Object> params);

    /**
     * 获取销售趋势数据
     */
    List<Map<String, Object>> getSalesTrend(Map<String, Object> params);

    /**
     * 获取客户来源分析
     */
    List<Map<String, Object>> getCustomerSourceAnalysis(Map<String, Object> params);

    /**
     * 获取商机漏斗分析
     */
    List<Map<String, Object>> getOpportunityFunnelAnalysis(Map<String, Object> params);

    /**
     * 获取待办任务统计
     */
    Map<String, Object> getTodoStats(Map<String, Object> params);

    /**
     * 获取最近跟进记录
     */
    List<Map<String, Object>> getRecentFollows(Map<String, Object> params);
}