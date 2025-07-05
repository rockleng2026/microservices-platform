package com.central.soo.controller;

import com.central.common.model.Result;
import com.central.soo.model.MonthlyPerformance;
import com.central.soo.service.IMonthlyPerformanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.util.List;
import com.central.common.model.PageResult;
import com.central.common.utils.PageResultUtil;

@RestController
@RequestMapping("/api/soo/monthly-performance")
@Tag(name = "月度绩效管理")
public class MonthlyPerformanceController {

    @Autowired
    private IMonthlyPerformanceService monthlyPerformanceService;

    @GetMapping
    @Operation(summary = "获取月度绩效列表")
    public Result<List<MonthlyPerformance>> list() {
        List<MonthlyPerformance> list = monthlyPerformanceService.list();
        return Result.succeed(list);
    }

    @PostMapping
    @Operation(summary = "新增月度绩效")
    public Result<?> add(@RequestBody MonthlyPerformance config) {
        boolean unique = monthlyPerformanceService.checkUnique(config.getEmployeeId(), config.getMonth(), null);
        if (!unique) return Result.failed("同一员工、同一月份已存在绩效记录");
        boolean saved = monthlyPerformanceService.save(config);
        return saved ? Result.succeed(null) : Result.failed(null);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新月度绩效")
    public Result<?> update(@PathVariable Long id, @RequestBody MonthlyPerformance config) {
        boolean unique = monthlyPerformanceService.checkUnique(config.getEmployeeId(), config.getMonth(), id);
        if (!unique) return Result.failed("同一员工、同一月份已存在绩效记录");
        config.setId(id);
        boolean updated = monthlyPerformanceService.updateById(config);
        return updated ? Result.succeed(null) : Result.failed(null);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除月度绩效")
    public Result<?> delete(@PathVariable Long id) {
        boolean removed = monthlyPerformanceService.removeById(id);
        return removed ? Result.succeed(null) : Result.failed(null);
    }

    @GetMapping("/page")
    @Operation(summary = "分页条件查询月度绩效")
    public PageResult<MonthlyPerformance> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String employeeName,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) Integer status) {
        Page<MonthlyPerformance> page = new Page<>(pageNum, pageSize);
        IPage<MonthlyPerformance> result = monthlyPerformanceService.pageQuery(page, employeeId, employeeName, departmentId, month, status);
        return PageResultUtil.buildPageResult(result);
    }

    @GetMapping("/history/{employeeId}")
    @Operation(summary = "查询员工历史绩效")
    public Result<List<MonthlyPerformance>> history(@PathVariable Long employeeId) {
        return Result.succeed(monthlyPerformanceService.getHistoryByEmployee(employeeId));
    }

    @PostMapping("/check-unique")
    @Operation(summary = "校验唯一性")
    public Result<Boolean> checkUnique(@RequestParam Long employeeId,
                                       @RequestParam String month,
                                       @RequestParam(required = false) Long excludeId) {
        boolean valid = monthlyPerformanceService.checkUnique(employeeId, month, excludeId);
        return Result.succeed(valid);
    }

    @PostMapping("/restore/{id}")
    @Operation(summary = "恢复已删除的月度绩效")
    public Result<?> restore(@PathVariable Long id) {
        boolean ok = monthlyPerformanceService.restore(id);
        return ok ? Result.succeed(null) : Result.failed(null);
    }
} 