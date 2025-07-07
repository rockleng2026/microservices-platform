package com.central.soo.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.soo.model.SocialSecurityBase;
import com.central.soo.model.dto.SocialSecurityBaseQueryDTO;
import com.central.soo.service.ISocialSecurityBaseService;
import com.central.soo.utils.PageResultUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * 社保公积金基数配置管理
 *
 * @author Portal Team
 * @since 2024-12-19
 */
@RestController
@RequestMapping("/api/soo/social-security-base")
@Tag(name = "社保公积金基数配置管理")
public class SocialSecurityBaseController {

    @Autowired
    private ISocialSecurityBaseService socialSecurityBaseService;

    @GetMapping("/page")
    @Operation(summary = "分页查询社保公积金基数配置")
    public PageResult<SocialSecurityBase> pageSocialSecurityBase(SocialSecurityBaseQueryDTO query) {
        try {
            IPage<SocialSecurityBase> page = socialSecurityBaseService.pageSocialSecurityBase(query);
            return PageResultUtil.buildPageResult(page);
        } catch (Exception e) {
            PageResult<SocialSecurityBase> errorResult = new PageResult<>();
            errorResult.setResp_code(1);
            return errorResult;
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "根据ID获取社保公积金基数配置")
    public Result<SocialSecurityBase> getSocialSecurityBaseById(@PathVariable Long id) {
        try {
            SocialSecurityBase config = socialSecurityBaseService.getById(id);
            if (config == null) {
                return Result.failed("配置不存在");
            }
            return Result.succeed(config);
        } catch (Exception e) {
            return Result.failed("获取配置详情失败: " + e.getMessage());
        }
    }

    @PostMapping
    @Operation(summary = "新增社保公积金基数配置")
    public Result<?> addSocialSecurityBase(@Valid @RequestBody SocialSecurityBase config) {
        try {
            // 校验唯一性
            boolean unique = socialSecurityBaseService.checkUnique(config.getRegion(), config.getYear(), null);
            if (!unique) {
                return Result.failed("该地区该年度已存在配置");
            }

            boolean saved = socialSecurityBaseService.save(config);
            return saved ? Result.succeed("新增成功") : Result.failed("新增失败");
        } catch (Exception e) {
            return Result.failed("新增社保公积金基数配置失败: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新社保公积金基数配置")
    public Result<?> updateSocialSecurityBase(@PathVariable Long id, @Valid @RequestBody SocialSecurityBase config) {
        try {
            config.setId(id);
            
            // 校验唯一性
            boolean unique = socialSecurityBaseService.checkUnique(config.getRegion(), config.getYear(), id);
            if (!unique) {
                return Result.failed("该地区该年度已存在配置");
            }

            boolean updated = socialSecurityBaseService.updateById(config);
            return updated ? Result.succeed("更新成功") : Result.failed("更新失败");
        } catch (Exception e) {
            return Result.failed("更新社保公积金基数配置失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除社保公积金基数配置")
    public Result<?> deleteSocialSecurityBase(@PathVariable Long id) {
        try {
            boolean deleted = socialSecurityBaseService.removeById(id);
            return deleted ? Result.succeed("删除成功") : Result.failed("删除失败");
        } catch (Exception e) {
            return Result.failed("删除社保公积金基数配置失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/batch")
    @Operation(summary = "批量删除社保公积金基数配置")
    public Result<?> batchDeleteSocialSecurityBase(@RequestBody List<Long> ids) {
        try {
            boolean deleted = socialSecurityBaseService.removeByIds(ids);
            return deleted ? Result.succeed("批量删除成功") : Result.failed("批量删除失败");
        } catch (Exception e) {
            return Result.failed("批量删除社保公积金基数配置失败: " + e.getMessage());
        }
    }

    @GetMapping("/regions")
    @Operation(summary = "获取地区列表")
    public Result<List<Map<String, Object>>> getRegionList() {
        try {
            List<Map<String, Object>> regions = socialSecurityBaseService.getRegionList();
            return Result.succeed(regions);
        } catch (Exception e) {
            return Result.failed("获取地区列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/years")
    @Operation(summary = "获取年度列表")
    public Result<List<Integer>> getYearList() {
        try {
            List<Integer> years = socialSecurityBaseService.getYearList();
            return Result.succeed(years);
        } catch (Exception e) {
            return Result.failed("获取年度列表失败: " + e.getMessage());
        }
    }

    @PostMapping("/copy-from-previous-year")
    @Operation(summary = "从上一年度复制配置")
    public Result<?> copyFromPreviousYear(
            @RequestParam Integer sourceYear,
            @RequestParam Integer targetYear,
            @RequestParam(required = false) List<String> regions) {
        try {
            int count = socialSecurityBaseService.copyFromPreviousYear(sourceYear, targetYear, regions);
            if (count > 0) {
                return Result.succeed("成功复制 " + count + " 条配置");
            } else {
                return Result.failed("未找到可复制的配置或目标年度已存在配置");
            }
        } catch (Exception e) {
            return Result.failed("复制配置失败: " + e.getMessage());
        }
    }

    @GetMapping("/by-region-year")
    @Operation(summary = "根据地区和年度获取配置")
    public Result<SocialSecurityBase> getByRegionAndYear(
            @RequestParam String region,
            @RequestParam Integer year) {
        try {
            SocialSecurityBase config = socialSecurityBaseService.getByRegionAndYear(region, year);
            if (config == null) {
                return Result.failed("未找到对应的配置");
            }
            return Result.succeed(config);
        } catch (Exception e) {
            return Result.failed("获取配置失败: " + e.getMessage());
        }
    }
} 