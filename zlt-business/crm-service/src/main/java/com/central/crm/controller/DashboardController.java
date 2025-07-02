package com.central.crm.controller;

import com.central.common.model.Result;
import com.central.crm.service.DashboardService;
import com.central.crm.model.vo.DashboardQueryVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * CRM工作台Controller
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "CRM工作台", description = "CRM工作台数据统计相关接口")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    /**
     * 获取工作台概览数据
     */
    @PostMapping("/overview")
    @Operation(summary = "获取工作台概览数据")
    public Result<Map<String, Object>> getDashboardOverview(@RequestBody DashboardQueryVO vo) {
        try {
            Map<String, Object> params = new HashMap<>();
            if (vo.getStartDate() != null) params.put("startDate", vo.getStartDate());
            if (vo.getEndDate() != null) params.put("endDate", vo.getEndDate());
            if (vo.getOwnerEmployeeId() != null) params.put("ownerEmployeeId", vo.getOwnerEmployeeId());
            
            Map<String, Object> overview = dashboardService.getDashboardOverview(params);
            return Result.succeed(overview);
        } catch (Exception e) {
            log.error("获取工作台概览数据失败", e);
            return Result.failed("获取工作台概览数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取客户统计数据
     */
    @PostMapping("/customer-stats")
    @Operation(summary = "获取客户统计数据")
    public Result<Map<String, Object>> getCustomerStats(@RequestBody DashboardQueryVO vo) {
        try {
            Map<String, Object> params = new HashMap<>();
            if (vo.getStartDate() != null) params.put("startDate", vo.getStartDate());
            if (vo.getEndDate() != null) params.put("endDate", vo.getEndDate());
            if (vo.getOwnerEmployeeId() != null) params.put("ownerEmployeeId", vo.getOwnerEmployeeId());
            
            Map<String, Object> stats = dashboardService.getCustomerStats(params);
            return Result.succeed(stats);
        } catch (Exception e) {
            log.error("获取客户统计数据失败", e);
            return Result.failed("获取客户统计数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取商机统计数据
     */
    @PostMapping("/opportunity-stats")
    @Operation(summary = "获取商机统计数据")
    public Result<Map<String, Object>> getOpportunityStats(@RequestBody DashboardQueryVO vo) {
        try {
            Map<String, Object> params = new HashMap<>();
            if (vo.getStartDate() != null) params.put("startDate", vo.getStartDate());
            if (vo.getEndDate() != null) params.put("endDate", vo.getEndDate());
            if (vo.getOwnerEmployeeId() != null) params.put("ownerEmployeeId", vo.getOwnerEmployeeId());
            
            Map<String, Object> stats = dashboardService.getOpportunityStats(params);
            return Result.succeed(stats);
        } catch (Exception e) {
            log.error("获取商机统计数据失败", e);
            return Result.failed("获取商机统计数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取销售统计数据
     */
    @PostMapping("/sales-stats")
    @Operation(summary = "获取销售统计数据")
    public Result<Map<String, Object>> getSalesStats(@RequestBody DashboardQueryVO vo) {
        try {
            Map<String, Object> params = new HashMap<>();
            if (vo.getStartDate() != null) params.put("startDate", vo.getStartDate());
            if (vo.getEndDate() != null) params.put("endDate", vo.getEndDate());
            if (vo.getOwnerEmployeeId() != null) params.put("ownerEmployeeId", vo.getOwnerEmployeeId());
            
            Map<String, Object> stats = dashboardService.getSalesStats(params);
            return Result.succeed(stats);
        } catch (Exception e) {
            log.error("获取销售统计数据失败", e);
            return Result.failed("获取销售统计数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取业绩排行榜
     */
    @PostMapping("/performance-ranking")
    @Operation(summary = "获取业绩排行榜")
    public Result<List<Map<String, Object>>> getPerformanceRanking(@RequestBody DashboardQueryVO vo) {
        try {
            Map<String, Object> params = new HashMap<>();
            if (vo.getStartDate() != null) params.put("startDate", vo.getStartDate());
            if (vo.getEndDate() != null) params.put("endDate", vo.getEndDate());
            params.put("limit", vo.getLimit());
            
            List<Map<String, Object>> ranking = dashboardService.getPerformanceRanking(params);
            return Result.succeed(ranking);
        } catch (Exception e) {
            log.error("获取业绩排行榜失败", e);
            return Result.failed("获取业绩排行榜失败: " + e.getMessage());
        }
    }

    /**
     * 获取销售趋势数据
     */
    @PostMapping("/sales-trend")
    @Operation(summary = "获取销售趋势数据")
    public Result<List<Map<String, Object>>> getSalesTrend(@RequestBody DashboardQueryVO vo) {
        try {
            Map<String, Object> params = new HashMap<>();
            if (vo.getStartDate() != null) params.put("startDate", vo.getStartDate());
            if (vo.getEndDate() != null) params.put("endDate", vo.getEndDate());
            params.put("granularity", vo.getGranularity());
            
            List<Map<String, Object>> trend = dashboardService.getSalesTrend(params);
            return Result.succeed(trend);
        } catch (Exception e) {
            log.error("获取销售趋势数据失败", e);
            return Result.failed("获取销售趋势数据失败: " + e.getMessage());
        }
    }

    /**
     * 获取客户来源分析
     */
    @PostMapping("/customer-source-analysis")
    @Operation(summary = "获取客户来源分析")
    public Result<List<Map<String, Object>>> getCustomerSourceAnalysis(@RequestBody DashboardQueryVO vo) {
        try {
            List<Map<String, Object>> analysis = dashboardService.getCustomerSourceAnalysis(new HashMap<>());
            return Result.succeed(analysis);
        } catch (Exception e) {
            log.error("获取客户来源分析失败", e);
            return Result.failed("获取客户来源分析失败: " + e.getMessage());
        }
    }

    /**
     * 获取商机漏斗分析
     */
    @PostMapping("/funnel-analysis")
    @Operation(summary = "获取商机漏斗分析")
    public Result<List<Map<String, Object>>> getFunnelAnalysis(@RequestBody DashboardQueryVO vo) {
        try {
            Map<String, Object> params = new HashMap<>();
            if (vo.getStartDate() != null) params.put("startDate", vo.getStartDate());
            if (vo.getEndDate() != null) params.put("endDate", vo.getEndDate());
            if (vo.getOwnerEmployeeId() != null) params.put("ownerEmployeeId", vo.getOwnerEmployeeId());
            
            List<Map<String, Object>> funnel = dashboardService.getOpportunityFunnelAnalysis(params);
            return Result.succeed(funnel);
        } catch (Exception e) {
            log.error("获取商机漏斗分析失败", e);
            return Result.failed("获取商机漏斗分析失败: " + e.getMessage());
        }
    }

    /**
     * 获取待办任务统计
     */
    @PostMapping("/todo-stats")
    @Operation(summary = "获取待办任务统计")
    public Result<Map<String, Object>> getTodoStats(@RequestBody DashboardQueryVO vo) {
        try {
            Map<String, Object> params = new HashMap<>();
            if (vo.getOwnerEmployeeId() != null) params.put("ownerEmployeeId", vo.getOwnerEmployeeId());
            
            Map<String, Object> stats = dashboardService.getTodoStats(params);
            return Result.succeed(stats);
        } catch (Exception e) {
            log.error("获取待办任务统计失败", e);
            return Result.failed("获取待办任务统计失败: " + e.getMessage());
        }
    }

    /**
     * 获取最近跟进记录
     */
    @PostMapping("/recent-follows")
    @Operation(summary = "获取最近跟进记录")
    public Result<List<Map<String, Object>>> getRecentFollows(@RequestBody DashboardQueryVO vo) {
        try {
            Map<String, Object> params = new HashMap<>();
            params.put("limit", vo.getLimit());
            
            List<Map<String, Object>> follows = dashboardService.getRecentFollows(params);
            return Result.succeed(follows);
        } catch (Exception e) {
            log.error("获取最近跟进记录失败", e);
            return Result.failed("获取最近跟进记录失败: " + e.getMessage());
        }
    }
}