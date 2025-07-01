package com.central.crm.controller;

import com.central.common.model.Result;
import com.central.crm.service.DashboardService;
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
    @GetMapping("/overview")
    @Operation(summary = "获取工作台概览数据")
    public Result<Map<String, Object>> getDashboardOverview(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Long ownerEmployeeId) {
        
        try {
            Map<String, Object> params = new HashMap<>();
            if (startDate != null) params.put("startDate", startDate);
            if (endDate != null) params.put("endDate", endDate);
            if (ownerEmployeeId != null) params.put("ownerEmployeeId", ownerEmployeeId);
            
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
    @GetMapping("/customer-stats")
    @Operation(summary = "获取客户统计数据")
    public Result<Map<String, Object>> getCustomerStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Long ownerEmployeeId) {
        
        try {
            Map<String, Object> params = new HashMap<>();
            if (startDate != null) params.put("startDate", startDate);
            if (endDate != null) params.put("endDate", endDate);
            if (ownerEmployeeId != null) params.put("ownerEmployeeId", ownerEmployeeId);
            
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
    @GetMapping("/opportunity-stats")
    @Operation(summary = "获取商机统计数据")
    public Result<Map<String, Object>> getOpportunityStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Long ownerEmployeeId) {
        
        try {
            Map<String, Object> params = new HashMap<>();
            if (startDate != null) params.put("startDate", startDate);
            if (endDate != null) params.put("endDate", endDate);
            if (ownerEmployeeId != null) params.put("ownerEmployeeId", ownerEmployeeId);
            
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
    @GetMapping("/sales-stats")
    @Operation(summary = "获取销售统计数据")
    public Result<Map<String, Object>> getSalesStats(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Long ownerEmployeeId) {
        
        try {
            Map<String, Object> params = new HashMap<>();
            if (startDate != null) params.put("startDate", startDate);
            if (endDate != null) params.put("endDate", endDate);
            if (ownerEmployeeId != null) params.put("ownerEmployeeId", ownerEmployeeId);
            
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
    @GetMapping("/performance-ranking")
    @Operation(summary = "获取业绩排行榜")
    public Result<List<Map<String, Object>>> getPerformanceRanking(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "10") Integer limit) {
        
        try {
            Map<String, Object> params = new HashMap<>();
            if (startDate != null) params.put("startDate", startDate);
            if (endDate != null) params.put("endDate", endDate);
            params.put("limit", limit);
            
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
    @GetMapping("/sales-trend")
    @Operation(summary = "获取销售趋势数据")
    public Result<List<Map<String, Object>>> getSalesTrend(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "month") String granularity) {
        
        try {
            Map<String, Object> params = new HashMap<>();
            if (startDate != null) params.put("startDate", startDate);
            if (endDate != null) params.put("endDate", endDate);
            params.put("granularity", granularity);
            
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
    @GetMapping("/customer-source-analysis")
    @Operation(summary = "获取客户来源分析")
    public Result<List<Map<String, Object>>> getCustomerSourceAnalysis() {
        
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
    @GetMapping("/funnel-analysis")
    @Operation(summary = "获取商机漏斗分析")
    public Result<List<Map<String, Object>>> getFunnelAnalysis(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Long ownerEmployeeId) {
        
        try {
            Map<String, Object> params = new HashMap<>();
            if (startDate != null) params.put("startDate", startDate);
            if (endDate != null) params.put("endDate", endDate);
            if (ownerEmployeeId != null) params.put("ownerEmployeeId", ownerEmployeeId);
            
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
    @GetMapping("/todo-stats")
    @Operation(summary = "获取待办任务统计")
    public Result<Map<String, Object>> getTodoStats(
            @RequestParam(required = false) Long ownerEmployeeId) {
        
        try {
            Map<String, Object> params = new HashMap<>();
            if (ownerEmployeeId != null) params.put("ownerEmployeeId", ownerEmployeeId);
            
            Map<String, Object> todoStats = dashboardService.getTodoStats(params);
            return Result.succeed(todoStats);
        } catch (Exception e) {
            log.error("获取待办任务统计失败", e);
            return Result.failed("获取待办任务统计失败: " + e.getMessage());
        }
    }

    /**
     * 获取最近跟进记录
     */
    @GetMapping("/recent-follows")
    @Operation(summary = "获取最近跟进记录")
    public Result<List<Map<String, Object>>> getRecentFollows(
            @RequestParam(defaultValue = "10") Integer limit) {
        
        try {
            Map<String, Object> params = Map.of("limit", limit);
            List<Map<String, Object>> follows = dashboardService.getRecentFollows(params);
            return Result.succeed(follows);
        } catch (Exception e) {
            log.error("获取最近跟进记录失败", e);
            return Result.failed("获取最近跟进记录失败: " + e.getMessage());
        }
    }
}