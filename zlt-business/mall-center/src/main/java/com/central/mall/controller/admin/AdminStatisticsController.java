package com.central.mall.controller.admin;

import com.central.common.model.Result;
import com.central.mall.model.dto.SalesTrendDTO;
import com.central.mall.model.dto.StatisticsDTO;
import com.central.mall.model.dto.StockWarningDTO;
import com.central.mall.model.dto.UserAnalysisDTO;
import com.central.mall.service.IAdminStatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 管理员-统计卡片控制器
 * D-05: 统计数据准实时（Redis缓存，每5分钟刷新）
 */
@RestController
@RequestMapping("/api/mall/admin/statistics")
@RequiredArgsConstructor
@Tag(name = "管理员-统计卡片", description = "运营统计数据接口")
public class AdminStatisticsController {

    private final IAdminStatisticsService adminStatisticsService;

    /**
     * 获取今日统计
     */
    @GetMapping("/today")
    @Operation(summary = "获取今日统计")
    public Result<StatisticsDTO> getTodayStatistics() {
        return Result.succeed(adminStatisticsService.getTodayStatistics());
    }

    /**
     * 获取销售趋势统计
     * @param type 日期分组类型：day=按日, week=按周, month=按月
     * @param startDate 开始日期（格式：yyyy-MM-dd）
     * @param endDate 结束日期（格式：yyyy-MM-dd）
     */
    @GetMapping("/sales-trend")
    @Operation(summary = "获取销售趋势统计")
    public Result<List<SalesTrendDTO>> getSalesTrend(
            @RequestParam String type,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        return Result.succeed(adminStatisticsService.getSalesTrend(type, startDate, endDate));
    }

    /**
     * 获取库存预警列表
     * 返回 stock <= 预警阈值(默认10) 的SKU
     */
    @GetMapping("/stock-warning")
    @Operation(summary = "获取库存预警列表")
    public Result<List<StockWarningDTO>> getStockWarningList() {
        return Result.succeed(adminStatisticsService.getStockWarningList());
    }

    /**
     * 获取用户分析统计
     * 返回新增用户数和活跃用户数
     */
    @GetMapping("/user-analysis")
    @Operation(summary = "获取用户分析统计")
    public Result<UserAnalysisDTO> getUserAnalysis() {
        return Result.succeed(adminStatisticsService.getUserAnalysis());
    }
}
