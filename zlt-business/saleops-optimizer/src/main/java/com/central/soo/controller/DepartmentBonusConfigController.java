package com.central.soo.controller;

import com.central.common.model.Result;
import com.central.soo.model.DepartmentBonusConfig;
import com.central.soo.service.IDepartmentBonusConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.time.LocalDate;
import java.math.BigDecimal;

import java.util.List;
import com.central.common.model.PageResult;
import com.central.soo.utils.PageResultUtil;

@RestController
@RequestMapping("/api/soo/department-bonus-config")
@Tag(name = "部门分红配置管理")
public class DepartmentBonusConfigController {

    @Autowired
    private IDepartmentBonusConfigService departmentBonusConfigService;

    @GetMapping
    @Operation(summary = "获取部门分红配置列表")
    public Result<List<DepartmentBonusConfig>> list() {
        List<DepartmentBonusConfig> list = departmentBonusConfigService.list();
        return Result.succeed(list);
    }

    @PostMapping
    @Operation(summary = "新增部门分红配置")
    public Result<?> add(@RequestBody DepartmentBonusConfig config) {
        boolean saved = departmentBonusConfigService.save(config);
        return saved ? Result.succeed(null) : Result.failed(null);
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新部门分红配置")
    public Result<?> update(@PathVariable Long id, @RequestBody DepartmentBonusConfig config) {
        config.setId(id);
        boolean updated = departmentBonusConfigService.updateById(config);
        return updated ? Result.succeed(null) : Result.failed(null);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除部门分红配置")
    public Result<?> delete(@PathVariable Long id) {
        boolean removed = departmentBonusConfigService.removeById(id);
        return removed ? Result.succeed(null) : Result.failed(null);
    }

    @GetMapping("/page")
    @Operation(summary = "分页条件查询部门分红配置")
    public PageResult<DepartmentBonusConfig> page(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String departmentName,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        Page<DepartmentBonusConfig> page = new Page<>(pageNum, pageSize);
        IPage<DepartmentBonusConfig> result = departmentBonusConfigService.pageQuery(page, departmentId, departmentName, status, startDate, endDate);
        return PageResultUtil.buildPageResult(result);
    }

    @GetMapping("/history/{departmentId}")
    @Operation(summary = "查询部门历史分红配置")
    public Result<List<DepartmentBonusConfig>> history(@PathVariable Long departmentId) {
        return Result.succeed(departmentBonusConfigService.getHistoryByDepartment(departmentId));
    }

    @PostMapping("/check-weight")
    @Operation(summary = "校验分红权重是否合法")
    public Result<Boolean> checkWeight(@RequestParam Long departmentId,
                                       @RequestParam LocalDate effectiveDate,
                                       @RequestParam BigDecimal bonusWeight,
                                       @RequestParam(required = false) Long excludeId) {
        boolean valid = departmentBonusConfigService.checkBonusWeightValid(departmentId, effectiveDate, bonusWeight, excludeId);
        return Result.succeed(valid);
    }

    @PostMapping("/restore/{id}")
    @Operation(summary = "恢复已删除的分红配置")
    public Result<?> restore(@PathVariable Long id) {
        boolean ok = departmentBonusConfigService.restore(id);
        return ok ? Result.succeed(null) : Result.failed(null);
    }
} 