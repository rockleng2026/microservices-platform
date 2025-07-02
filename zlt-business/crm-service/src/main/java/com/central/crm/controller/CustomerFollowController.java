package com.central.crm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.common.model.Result;
import com.central.crm.model.CustomerFollow;
import com.central.crm.service.CustomerFollowService;
import com.central.crm.model.vo.CustomerFollowQueryVO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 客户跟进Controller
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/api/customer-follow")
@Tag(name = "客户跟进管理", description = "客户跟进相关接口")
@Validated
public class CustomerFollowController {

    @Autowired
    private CustomerFollowService customerFollowService;

    /**
     * 分页查询跟进记录列表
     */
    @PostMapping("/page")
    @Operation(summary = "分页查询跟进记录列表")
    public Result<IPage<CustomerFollow>> getFollowPage(@RequestBody CustomerFollowQueryVO vo) {
        try {
            Page<CustomerFollow> pageParam = new Page<>(vo.getPage(), vo.getSize());
            Map<String, Object> params = new HashMap<>();
            if (vo.getCustomerId() != null) params.put("customerId", vo.getCustomerId());
            if (vo.getEmployeeId() != null) params.put("employeeId", vo.getEmployeeId());
            if (vo.getFollowType() != null) params.put("followType", vo.getFollowType());
            if (vo.getStage() != null) params.put("stage", vo.getStage());
            if (vo.getStartDate() != null) params.put("startDate", vo.getStartDate());
            if (vo.getEndDate() != null) params.put("endDate", vo.getEndDate());
            IPage<CustomerFollow> pageResult = customerFollowService.selectFollowPage(pageParam, params);
            return Result.succeed(pageResult);
        } catch (Exception e) {
            log.error("分页查询跟进记录失败", e);
            return Result.failed("分页查询跟进记录失败: " + e.getMessage());
        }
    }

    /**
     * 根据ID查询跟进记录详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "根据ID查询跟进记录详情")
    public Result<CustomerFollow> getFollowById(@PathVariable Long id) {
        try {
            CustomerFollow follow = customerFollowService.getById(id);
            return Result.succeed(follow);
        } catch (Exception e) {
            log.error("查询跟进记录详情失败", e);
            return Result.failed("查询跟进记录详情失败: " + e.getMessage());
        }
    }

    /**
     * 创建跟进记录
     */
    @PostMapping
    @Operation(summary = "创建跟进记录")
    public Result<String> createFollow(@Valid @RequestBody CustomerFollow follow) {
        try {
            boolean success = customerFollowService.createFollow(follow);
            return success ? Result.succeed("创建成功") : Result.failed("创建失败");
        } catch (Exception e) {
            log.error("创建跟进记录失败", e);
            return Result.failed("创建跟进记录失败: " + e.getMessage());
        }
    }

    /**
     * 更新跟进记录
     */
    @PutMapping
    @Operation(summary = "更新跟进记录")
    public Result<String> updateFollow(@Valid @RequestBody CustomerFollow follow) {
        try {
            boolean success = customerFollowService.updateFollow(follow);
            return success ? Result.succeed("更新成功") : Result.failed("更新失败");
        } catch (Exception e) {
            log.error("更新跟进记录失败", e);
            return Result.failed("更新跟进记录失败: " + e.getMessage());
        }
    }

    /**
     * 删除跟进记录
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除跟进记录")
    public Result<String> deleteFollow(@PathVariable Long id) {
        try {
            boolean success = customerFollowService.deleteFollow(id);
            return success ? Result.succeed("删除成功") : Result.failed("删除失败");
        } catch (Exception e) {
            log.error("删除跟进记录失败", e);
            return Result.failed("删除跟进记录失败: " + e.getMessage());
        }
    }

    /**
     * 根据客户ID查询跟进记录
     */
    @GetMapping("/customer/{customerId}")
    @Operation(summary = "根据客户ID查询跟进记录")
    public Result<List<CustomerFollow>> getByCustomerId(@PathVariable Long customerId) {
        try {
            List<CustomerFollow> follows = customerFollowService.getByCustomerId(customerId);
            return Result.succeed(follows);
        } catch (Exception e) {
            log.error("查询客户跟进记录失败", e);
            return Result.failed("查询客户跟进记录失败: " + e.getMessage());
        }
    }

    /**
     * 查询待跟进客户列表
     */
    @PostMapping("/pending")
    @Operation(summary = "查询待跟进客户列表")
    public Result<List<Map<String, Object>>> getPendingFollowList(@RequestBody CustomerFollowQueryVO vo) {
        try {
            Map<String, Object> params = new HashMap<>();
            if (vo.getEmployeeId() != null) params.put("employeeId", vo.getEmployeeId());
            params.put("days", vo.getDays() != null ? vo.getDays() : 30);
            List<Map<String, Object>> pendingList = customerFollowService.getPendingFollowList(params);
            return Result.succeed(pendingList);
        } catch (Exception e) {
            log.error("查询待跟进客户列表失败", e);
            return Result.failed("查询待跟进客户列表失败: " + e.getMessage());
        }
    }

    /**
     * 查询跟进统计信息
     */
    @PostMapping("/statistics")
    @Operation(summary = "查询跟进统计信息")
    public Result<Map<String, Object>> getFollowStatistics(@RequestBody CustomerFollowQueryVO vo) {
        try {
            Map<String, Object> params = new HashMap<>();
            if (vo.getEmployeeId() != null) params.put("employeeId", vo.getEmployeeId());
            if (vo.getStartDate() != null) params.put("startDate", vo.getStartDate());
            if (vo.getEndDate() != null) params.put("endDate", vo.getEndDate());
            Map<String, Object> statistics = customerFollowService.getFollowStatistics(params);
            return Result.succeed(statistics);
        } catch (Exception e) {
            log.error("查询跟进统计信息失败", e);
            return Result.failed("查询跟进统计信息失败: " + e.getMessage());
        }
    }

    /**
     * 查询最近跟进记录
     */
    @PostMapping("/recent")
    @Operation(summary = "查询最近跟进记录")
    public Result<List<CustomerFollow>> getRecentFollows(@RequestBody CustomerFollowQueryVO vo) {
        try {
            Map<String, Object> params = new HashMap<>();
            if (vo.getEmployeeId() != null) params.put("employeeId", vo.getEmployeeId());
            params.put("limit", vo.getLimit() != null ? vo.getLimit() : 10);
            List<CustomerFollow> recentFollows = customerFollowService.getRecentFollows(params);
            return Result.succeed(recentFollows);
        } catch (Exception e) {
            log.error("查询最近跟进记录失败", e);
            return Result.failed("查询最近跟进记录失败: " + e.getMessage());
        }
    }

    /**
     * 批量创建跟进记录
     */
    @PostMapping("/batch")
    @Operation(summary = "批量创建跟进记录")
    public Result<Map<String, Object>> batchCreateFollows(@Valid @RequestBody List<CustomerFollow> follows) {
        try {
            Map<String, Object> result = customerFollowService.batchCreateFollows(follows);
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("批量创建跟进记录失败", e);
            return Result.failed("批量创建跟进记录失败: " + e.getMessage());
        }
    }

    /**
     * 导出跟进记录数据
     */
    @PostMapping("/export")
    @Operation(summary = "导出跟进记录数据")
    public Result<List<CustomerFollow>> exportFollows(@RequestBody Map<String, Object> params) {
        try {
            List<CustomerFollow> follows = customerFollowService.exportFollows(params);
            return Result.succeed(follows);
        } catch (Exception e) {
            log.error("导出跟进记录数据失败", e);
            return Result.failed("导出跟进记录数据失败: " + e.getMessage());
        }
    }

    /**
     * 设置跟进提醒
     */
    @PutMapping("/{id}/reminder")
    @Operation(summary = "设置跟进提醒")
    public Result<String> setFollowReminder(
            @PathVariable Long id,
            @RequestParam String reminderTime,
            @RequestParam String reminderContent) {
        
        try {
            boolean success = customerFollowService.setFollowReminder(id, reminderTime, reminderContent);
            return success ? Result.succeed("设置成功") : Result.failed("设置失败");
        } catch (Exception e) {
            log.error("设置跟进提醒失败", e);
            return Result.failed("设置跟进提醒失败: " + e.getMessage());
        }
    }

    /**
     * 获取我的跟进任务
     */
    @GetMapping("/my-tasks")
    @Operation(summary = "获取我的跟进任务")
    public Result<List<Map<String, Object>>> getMyFollowTasks(@RequestParam Long employeeId) {
        try {
            List<Map<String, Object>> tasks = customerFollowService.getMyFollowTasks(employeeId);
            return Result.succeed(tasks);
        } catch (Exception e) {
            log.error("获取我的跟进任务失败", e);
            return Result.failed("获取我的跟进任务失败: " + e.getMessage());
        }
    }
}