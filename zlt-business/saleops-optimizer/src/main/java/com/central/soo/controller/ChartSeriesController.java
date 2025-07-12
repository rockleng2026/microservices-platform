package com.central.soo.controller;

import com.central.common.model.Result;
import com.central.soo.model.entity.ChartSeries;
import com.central.soo.service.ChartSeriesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 图表指标系列配置控制器
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/api/soo/v2/chart-series")
@Tag(name = "图表指标系列配置管理", description = "图表指标系列配置相关接口")
public class ChartSeriesController {

    @Autowired
    private ChartSeriesService chartSeriesService;

    @GetMapping("/chart/{chartId}")
    @Operation(summary = "获取图表的系列配置列表")
    public Result<List<ChartSeries>> getByChartId(
            @Parameter(description = "图表ID") @PathVariable Long chartId) {
        try {
            List<ChartSeries> seriesList = chartSeriesService.getByChartId(chartId);
            return Result.succeed(seriesList);
        } catch (Exception e) {
            log.error("获取图表系列配置失败, chartId: {}, error: {}", chartId, e.getMessage(), e);
            return Result.failed("获取图表系列配置失败");
        }
    }

    @PostMapping("/chart/{chartId}")
    @Operation(summary = "保存图表的系列配置")
    public Result<String> saveChartSeries(
            @Parameter(description = "图表ID") @PathVariable Long chartId,
            @Parameter(description = "系列配置列表") @RequestBody List<ChartSeries> seriesList) {
        try {
            boolean success = chartSeriesService.saveChartSeries(chartId, seriesList);
            if (success) {
                return Result.succeed("保存成功");
            } else {
                return Result.failed("保存失败");
            }
        } catch (Exception e) {
            log.error("保存图表系列配置失败, chartId: {}, error: {}", chartId, e.getMessage(), e);
            return Result.failed("保存失败: " + e.getMessage());
        }
    }

    @PostMapping("/{id}")
    @Operation(summary = "新增或更新单个系列配置")
    public Result<ChartSeries> save(
            @Parameter(description = "系列ID") @PathVariable Long id,
            @Parameter(description = "系列配置") @RequestBody ChartSeries chartSeries) {
        try {
            chartSeries.setId(id);
            boolean success = chartSeriesService.saveOrUpdate(chartSeries);
            if (success) {
                return Result.succeed(chartSeries);
            } else {
                return Result.failed("保存失败");
            }
        } catch (Exception e) {
            log.error("保存系列配置失败, id: {}, error: {}", id, e.getMessage(), e);
            return Result.failed("保存失败: " + e.getMessage());
        }
    }

    @PostMapping
    @Operation(summary = "新增系列配置")
    public Result<ChartSeries> create(
            @Parameter(description = "系列配置") @RequestBody ChartSeries chartSeries) {
        try {
            boolean success = chartSeriesService.save(chartSeries);
            if (success) {
                return Result.succeed(chartSeries);
            } else {
                return Result.failed("新增失败");
            }
        } catch (Exception e) {
            log.error("新增系列配置失败, error: {}", e.getMessage(), e);
            return Result.failed("新增失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除系列配置")
    public Result<String> delete(
            @Parameter(description = "系列ID") @PathVariable Long id) {
        try {
            boolean success = chartSeriesService.removeById(id);
            if (success) {
                return Result.succeed("删除成功");
            } else {
                return Result.failed("删除失败");
            }
        } catch (Exception e) {
            log.error("删除系列配置失败, id: {}, error: {}", id, e.getMessage(), e);
            return Result.failed("删除失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/chart/{chartId}")
    @Operation(summary = "删除图表下的所有系列配置")
    public Result<String> deleteByChartId(
            @Parameter(description = "图表ID") @PathVariable Long chartId) {
        try {
            boolean success = chartSeriesService.deleteByChartId(chartId);
            if (success) {
                return Result.succeed("删除成功");
            } else {
                return Result.failed("删除失败");
            }
        } catch (Exception e) {
            log.error("删除图表系列配置失败, chartId: {}, error: {}", chartId, e.getMessage(), e);
            return Result.failed("删除失败: " + e.getMessage());
        }
    }

    @PostMapping("/copy/{sourceChartId}/{targetChartId}")
    @Operation(summary = "复制系列配置到新图表")
    public Result<String> copySeriesConfig(
            @Parameter(description = "源图表ID") @PathVariable Long sourceChartId,
            @Parameter(description = "目标图表ID") @PathVariable Long targetChartId) {
        try {
            boolean success = chartSeriesService.copySeriesConfig(sourceChartId, targetChartId);
            if (success) {
                return Result.succeed("复制成功");
            } else {
                return Result.failed("复制失败");
            }
        } catch (Exception e) {
            log.error("复制系列配置失败, sourceChartId: {}, targetChartId: {}, error: {}", 
                    sourceChartId, targetChartId, e.getMessage(), e);
            return Result.failed("复制失败: " + e.getMessage());
        }
    }
} 