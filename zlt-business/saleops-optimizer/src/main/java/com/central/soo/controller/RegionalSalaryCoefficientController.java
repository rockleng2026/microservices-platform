package com.central.soo.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.common.model.Result;
import com.central.common.model.PageResult;
import com.central.soo.model.dto.RegionalSalaryCoefficientQueryDTO;
import com.central.soo.model.entity.RegionalSalaryCoefficient;
import com.central.soo.service.IRegionalSalaryCoefficientService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;

/**
 * 地区工资系数控制器
 *
 * @author zlt
 * @date 2024-01-01
 */
@Slf4j
@Validated
@RestController
@RequestMapping("/api/soo/region-salary-factor")
public class RegionalSalaryCoefficientController {

    @Autowired
    private IRegionalSalaryCoefficientService regionalSalaryCoefficientService;

    @GetMapping("/page")
    public PageResult<RegionalSalaryCoefficient> page(@Valid RegionalSalaryCoefficientQueryDTO queryDTO) {
        return regionalSalaryCoefficientService.pageQuery(queryDTO);
    }

    @GetMapping("/{id}")
    public Result<RegionalSalaryCoefficient> getById(@PathVariable Long id) {
        try {
            RegionalSalaryCoefficient coefficient = regionalSalaryCoefficientService.getById(id);
            if (coefficient != null) {
                return Result.succeed(coefficient);
            } else {
                return Result.failed("记录不存在");
            }
        } catch (Exception e) {
            log.error("查询地区工资系数失败", e);
            return Result.failed("查询失败：" + e.getMessage());
        }
    }

    @PostMapping
    public Result<Void> save(@Valid @RequestBody RegionalSalaryCoefficient coefficient) {
        try {
            // 检查地区和日期是否重叠
            if (regionalSalaryCoefficientService.checkRegionDateOverlap(
                    coefficient.getRegion(), 
                    coefficient.getEffectiveDate(), 
                    coefficient.getExpireDate(), 
                    null)) {
                return Result.failed("该地区在指定日期范围内已存在配置");
            }
            
            boolean success = regionalSalaryCoefficientService.save(coefficient);
            if (success) {
                return Result.succeed("新增成功");
            } else {
                return Result.failed("新增失败");
            }
        } catch (Exception e) {
            log.error("新增地区工资系数失败", e);
            return Result.failed("新增失败：" + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public Result<Void> update(@PathVariable Long id, 
                              @Valid @RequestBody RegionalSalaryCoefficient coefficient) {
        try {
            // 检查记录是否存在
            RegionalSalaryCoefficient existing = regionalSalaryCoefficientService.getById(id);
            if (existing == null) {
                return Result.failed("记录不存在");
            }
            
            // 检查地区和日期是否重叠（排除当前记录）
            if (regionalSalaryCoefficientService.checkRegionDateOverlap(
                    coefficient.getRegion(), 
                    coefficient.getEffectiveDate(), 
                    coefficient.getExpireDate(), 
                    id)) {
                return Result.failed("该地区在指定日期范围内已存在其他配置");
            }
            
            coefficient.setId(id);
            boolean success = regionalSalaryCoefficientService.updateById(coefficient);
            if (success) {
                return Result.succeed("更新成功");
            } else {
                return Result.failed("更新失败");
            }
        } catch (Exception e) {
            log.error("更新地区工资系数失败", e);
            return Result.failed("更新失败：" + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        try {
            boolean success = regionalSalaryCoefficientService.removeById(id);
            if (success) {
                return Result.succeed("删除成功");
            } else {
                return Result.failed("删除失败");
            }
        } catch (Exception e) {
            log.error("删除地区工资系数失败", e);
            return Result.failed("删除失败：" + e.getMessage());
        }
    }

    @DeleteMapping("/batch")
    public Result<Void> batchDelete(@RequestBody List<Long> ids) {
        try {
            if (ids == null || ids.isEmpty()) {
                return Result.failed("ID列表不能为空");
            }
            
            boolean success = regionalSalaryCoefficientService.removeByIds(ids);
            if (success) {
                return Result.succeed("批量删除成功");
            } else {
                return Result.failed("批量删除失败");
            }
        } catch (Exception e) {
            log.error("批量删除地区工资系数失败", e);
            return Result.failed("批量删除失败：" + e.getMessage());
        }
    }

    @PutMapping("/batch-status")
    public Result<Void> batchUpdateStatus(@RequestParam List<Long> ids,
                                         @RequestParam Integer status) {
        return regionalSalaryCoefficientService.batchUpdateStatus(ids, status);
    }

    @GetMapping("/effective-coefficient")
    public Result<RegionalSalaryCoefficient> getEffectiveCoefficient(
            @RequestParam String region,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate targetDate) {
        try {
            RegionalSalaryCoefficient coefficient = regionalSalaryCoefficientService.getEffectiveCoefficient(region, targetDate);
            if (coefficient != null) {
                return Result.succeed(coefficient);
            } else {
                return Result.failed("未找到有效的工资系数配置");
            }
        } catch (Exception e) {
            log.error("获取有效工资系数失败", e);
            return Result.failed("查询失败：" + e.getMessage());
        }
    }

    @GetMapping("/active-regions")
    public Result<List<String>> getActiveRegions() {
        try {
            List<String> regions = regionalSalaryCoefficientService.getActiveRegions();
            return Result.succeed(regions);
        } catch (Exception e) {
            log.error("获取有效地区列表失败", e);
            return Result.failed("查询失败：" + e.getMessage());
        }
    }

    @PostMapping("/copy-to-new-region")
    public Result<Void> copyToNewRegion(
            @RequestParam Long sourceId,
            @RequestParam String targetRegion,
            @RequestParam String targetRegionCode,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate effectiveDate) {
        return regionalSalaryCoefficientService.copyToNewRegion(sourceId, targetRegion, targetRegionCode, effectiveDate);
    }
} 