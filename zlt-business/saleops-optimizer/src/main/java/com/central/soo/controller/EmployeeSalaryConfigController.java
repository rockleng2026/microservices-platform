package com.central.soo.controller;

import com.central.common.model.Result;
import com.central.soo.model.EmployeeSalaryConfig;
import com.central.soo.service.IEmployeeSalaryConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/soo/employee-salary-config")
@Tag(name = "员工薪酬配置管理")
public class EmployeeSalaryConfigController {

    @Autowired
    private IEmployeeSalaryConfigService employeeSalaryConfigService;

    @GetMapping
    @Operation(summary = "获取员工薪酬配置列表")
    public Result<List<EmployeeSalaryConfig>> list() {
        List<EmployeeSalaryConfig> list = employeeSalaryConfigService.list();
        return Result.succeed(list);
    }

    @PostMapping
    @Operation(summary = "新增员工薪酬配置")
    public Result<?> add(@RequestBody EmployeeSalaryConfig config) {
        boolean unique = employeeSalaryConfigService.checkUnique(config.getEmployeeId(), config.getEffectiveDate(), null);
        if (!unique) return Result.failed("同一员工、生效日已存在配置");
        boolean saved = employeeSalaryConfigService.save(config);
        return saved ? Result.succeed() : Result.failed();
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新员工薪酬配置")
    public Result<?> update(@PathVariable Long id, @RequestBody EmployeeSalaryConfig config) {
        boolean unique = employeeSalaryConfigService.checkUnique(config.getEmployeeId(), config.getEffectiveDate(), id);
        if (!unique) return Result.failed("同一员工、生效日已存在配置");
        config.setId(id);
        boolean updated = employeeSalaryConfigService.updateById(config);
        return updated ? Result.succeed() : Result.failed();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除员工薪酬配置")
    public Result<?> delete(@PathVariable Long id) {
        boolean removed = employeeSalaryConfigService.removeById(id);
        return removed ? Result.succeed() : Result.failed();
    }

    @GetMapping("/page")
    @Operation(summary = "分页条件查询员工薪酬配置")
    public Result<IPage<EmployeeSalaryConfig>> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String employeeName,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String jobLevelId,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        Page<EmployeeSalaryConfig> page = new Page<>(pageNum, pageSize);
        IPage<EmployeeSalaryConfig> result = employeeSalaryConfigService.pageQuery(page, employeeId, employeeName, departmentId, jobLevelId, status, startDate, endDate);
        return Result.succeed(result);
    }

    @GetMapping("/history/{employeeId}")
    @Operation(summary = "查询员工历史薪酬配置")
    public Result<List<EmployeeSalaryConfig>> history(@PathVariable Long employeeId) {
        return Result.succeed(employeeSalaryConfigService.getHistoryByEmployee(employeeId));
    }

    @PostMapping("/check-unique")
    @Operation(summary = "校验唯一性")
    public Result<Boolean> checkUnique(@RequestParam Long employeeId,
                                       @RequestParam LocalDate effectiveDate,
                                       @RequestParam(required = false) Long excludeId) {
        boolean valid = employeeSalaryConfigService.checkUnique(employeeId, effectiveDate, excludeId);
        return Result.succeed(valid);
    }

    @PostMapping("/restore/{id}")
    @Operation(summary = "恢复已删除的员工薪酬配置")
    public Result<?> restore(@PathVariable Long id) {
        boolean ok = employeeSalaryConfigService.restore(id);
        return ok ? Result.succeed() : Result.failed();
    }
} 