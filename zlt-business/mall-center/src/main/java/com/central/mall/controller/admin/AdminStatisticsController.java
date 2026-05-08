package com.central.mall.controller.admin;

import com.central.common.model.Result;
import com.central.mall.model.dto.StatisticsDTO;
import com.central.mall.service.IAdminStatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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
}
