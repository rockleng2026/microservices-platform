package com.central.soo.controller;

import com.central.common.model.Result;
import com.central.soo.model.JobLevelSalary;
import com.central.soo.service.IJobLevelSalaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.time.LocalDate;
import java.util.List;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.central.common.model.PageResult;
import com.central.soo.utils.PageResultUtil;

@RestController
@RequestMapping("/api/soo/job-level-salary")
@Tag(name = "职级薪资标准管理")
public class JobLevelSalaryController {

    @Autowired
    private IJobLevelSalaryService jobLevelSalaryService;

    @GetMapping
    @Operation(summary = "获取职级薪资标准列表")
    public Result<List<JobLevelSalary>> list() {
        List<JobLevelSalary> list = jobLevelSalaryService.list();
        return Result.succeed(list);
    }

    @PostMapping
    @Operation(summary = "新增职级薪资标准")
    public Result<?> add(@RequestBody JobLevelSalary config) {
        if (config.getPositionId() != null) {
            QueryWrapper<JobLevelSalary> qw = new QueryWrapper<>();
            qw.eq("position_id", config.getPositionId());
            qw.eq("tenant_id", config.getTenantId());
            qw.eq("delflag", 0);
            if (this.jobLevelSalaryService.count(qw) > 0) {
                return Result.failed("同一岗位已存在配置");
            }
        } else {
            boolean unique = jobLevelSalaryService.checkUnique(config.getDepartmentId(), config.getJobLevelCode(), config.getEffectiveDate(), null);
            if (!unique) return Result.failed("同一部门、职级、生效日已存在配置");
        }
        boolean saved = jobLevelSalaryService.save(config);
        return saved ? Result.succeed(null) : Result.failed(null);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新职级薪资标准")
    public Result<?> update(@PathVariable Long id, @RequestBody JobLevelSalary config) {
        if (config.getPositionId() != null) {
            QueryWrapper<JobLevelSalary> qw = new QueryWrapper<>();
            qw.eq("position_id", config.getPositionId());
            qw.eq("tenant_id", config.getTenantId());
            qw.eq("delflag", 0);
            qw.ne("id", id);
            if (this.jobLevelSalaryService.count(qw) > 0) {
                return Result.failed("同一岗位已存在配置");
            }
        } else {
            boolean unique = jobLevelSalaryService.checkUnique(config.getDepartmentId(), config.getJobLevelCode(), config.getEffectiveDate(), id);
            if (!unique) return Result.failed("同一部门、职级、生效日已存在配置");
        }
        config.setId(id);
        boolean updated = jobLevelSalaryService.updateById(config);
        return updated ? Result.succeed(null) : Result.failed(null);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除职级薪资标准")
    public Result<?> delete(@PathVariable Long id) {
        boolean removed = jobLevelSalaryService.removeById(id);
        return removed ? Result.succeed(null) : Result.failed(null);
    }

    @GetMapping("/page")
    @Operation(summary = "分页条件查询职级薪资标准")
    public PageResult<JobLevelSalary> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String jobLevelCode,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        Page<JobLevelSalary> page = new Page<>(pageNum, pageSize);
        IPage<JobLevelSalary> result = jobLevelSalaryService.pageQuery(page, departmentId, jobLevelCode, status, startDate, endDate);
        return PageResultUtil.buildPageResult(result);
    }

    @GetMapping("/history")
    @Operation(summary = "查询职级历史薪资标准")
    public Result<List<JobLevelSalary>> history(@RequestParam String jobLevelCode, @RequestParam(required = false) Long departmentId) {
        return Result.succeed(jobLevelSalaryService.getHistoryByJobLevel(jobLevelCode, departmentId));
    }

    @PostMapping("/check-unique")
    @Operation(summary = "校验唯一性")
    public Result<Boolean> checkUnique(@RequestParam Long departmentId,
                                       @RequestParam String jobLevelCode,
                                       @RequestParam LocalDate effectiveDate,
                                       @RequestParam(required = false) Long excludeId) {
        boolean valid = jobLevelSalaryService.checkUnique(departmentId, jobLevelCode, effectiveDate, excludeId);
        return Result.succeed(valid);
    }

    @PostMapping("/restore/{id}")
    @Operation(summary = "恢复已删除的职级薪资标准")
    public Result<?> restore(@PathVariable Long id) {
        boolean ok = jobLevelSalaryService.restore(id);
        return ok ? Result.succeed(null) : Result.failed(null);
    }
} 