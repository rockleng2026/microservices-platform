package com.central.system.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.system.model.SysUser;
import com.central.system.service.SysUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * 系统用户管理控制器
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/user")
@Tag(name = "系统用户管理", description = "用户的增删改查、状态管理等功能")
public class SysUserController {

    @Autowired
    private SysUserService sysUserService;

    /**
     * 分页查询用户列表
     */
    @GetMapping("/page")
    @Operation(summary = "分页查询用户列表", description = "根据条件分页查询用户信息")
    public Result<PageResult<SysUser>> getUserPage(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer current,
            @Parameter(description = "每页大小") @RequestParam(defaultValue = "20") Integer size,
            @Parameter(description = "用户名") @RequestParam(required = false) String username,
            @Parameter(description = "员工姓名") @RequestParam(required = false) String employeeName,
            @Parameter(description = "部门ID") @RequestParam(required = false) Long departmentId,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status) {
        try {
            Page<SysUser> page = new Page<>(current, size);
            Page<SysUser> result = sysUserService.getUserPage(page, username, employeeName, departmentId, status);
            
            PageResult<SysUser> pageResult = PageResult.<SysUser>builder()
                    .data(result.getRecords())
                    .count(result.getTotal())
                    .code(0)
                    .build();
                    
            return Result.succeed(pageResult, "用户列表获取成功");
        } catch (Exception e) {
            log.error("分页查询用户失败", e);
            return Result.failed("分页查询用户失败: " + e.getMessage());
        }
    }

    /**
     * 根据ID获取用户详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取用户详情", description = "根据用户ID获取用户详细信息")
    public Result<SysUser> getUserById(
            @Parameter(description = "用户ID") 
            @PathVariable Long id) {
        try {
            SysUser user = sysUserService.getById(id);
            if (user == null) {
                return Result.failed("用户不存在");
            }
            return Result.succeed(user, "用户详情获取成功");
        } catch (Exception e) {
            log.error("获取用户详情失败，ID: {}", id, e);
            return Result.failed("获取用户详情失败: " + e.getMessage());
        }
    }

    /**
     * 保存用户
     */
    @PostMapping("/save")
    @Operation(summary = "保存用户", description = "新增或更新用户信息")
    public Result<String> saveUser(@Valid @RequestBody SysUser user) {
        try {
            boolean success;
            if (user.getId() == null) {
                success = sysUserService.saveUser(user);
            } else {
                success = sysUserService.updateUser(user);
            }
            
            if (success) {
                return Result.succeed("用户保存成功");
            } else {
                return Result.failed("用户保存失败");
            }
        } catch (Exception e) {
            log.error("保存用户失败", e);
            return Result.failed("保存用户失败: " + e.getMessage());
        }
    }

    /**
     * 删除用户
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除用户", description = "根据用户ID删除用户")
    public Result<String> deleteUser(
            @Parameter(description = "用户ID") 
            @PathVariable Long id) {
        try {
            boolean success = sysUserService.removeById(id);
            if (success) {
                return Result.succeed("用户删除成功");
            } else {
                return Result.failed("用户删除失败");
            }
        } catch (Exception e) {
            log.error("删除用户失败，ID: {}", id, e);
            return Result.failed("删除用户失败: " + e.getMessage());
        }
    }

    /**
     * 批量更新用户状态
     */
    @PostMapping("/batch-status")
    @Operation(summary = "批量更新用户状态", description = "批量启用或禁用用户")
    public Result<String> batchUpdateStatus(
            @Parameter(description = "用户ID列表") 
            @RequestParam List<Long> userIds,
            @Parameter(description = "状态：1启用，0禁用") 
            @RequestParam Integer status) {
        try {
            boolean success = sysUserService.batchUpdateStatus(userIds, status);
            if (success) {
                String statusText = status == 1 ? "启用" : "禁用";
                return Result.succeed("用户" + statusText + "成功");
            } else {
                return Result.failed("用户状态更新失败");
            }
        } catch (Exception e) {
            log.error("批量更新用户状态失败", e);
            return Result.failed("用户状态更新失败: " + e.getMessage());
        }
    }

    /**
     * 重置用户密码
     */
    @PostMapping("/reset-password/{id}")
    @Operation(summary = "重置用户密码", description = "重置指定用户的密码")
    public Result<String> resetPassword(
            @Parameter(description = "用户ID") 
            @PathVariable Long id,
            @Parameter(description = "新密码") 
            @RequestParam(required = false) String newPassword) {
        try {
            boolean success = sysUserService.resetPassword(id, newPassword);
            if (success) {
                return Result.succeed("密码重置成功");
            } else {
                return Result.failed("密码重置失败");
            }
        } catch (Exception e) {
            log.error("重置用户密码失败，ID: {}", id, e);
            return Result.failed("密码重置失败: " + e.getMessage());
        }
    }

    /**
     * 根据用户名查询用户
     */
    @GetMapping("/username/{username}")
    @Operation(summary = "根据用户名查询用户", description = "通过用户名获取用户信息")
    public Result<SysUser> getUserByUsername(
            @Parameter(description = "用户名") 
            @PathVariable String username) {
        try {
            SysUser user = sysUserService.getUserByUsername(username);
            if (user == null) {
                return Result.failed("用户不存在");
            }
            return Result.succeed(user, "用户信息获取成功");
        } catch (Exception e) {
            log.error("根据用户名查询用户失败，用户名: {}", username, e);
            return Result.failed("查询用户失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户统计信息
     */
    @GetMapping("/statistics")
    @Operation(summary = "获取用户统计信息", description = "获取用户数量统计数据")
    public Result<Object> getUserStatistics() {
        try {
            // 统计各种状态的用户数量
            LambdaQueryWrapper<SysUser> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(SysUser::getIsDel, 0);
            
            long totalCount = sysUserService.count(wrapper);
            
            wrapper.clear();
            wrapper.eq(SysUser::getIsDel, 0).eq(SysUser::getEnabled, 1);
            long enabledCount = sysUserService.count(wrapper);
            
            wrapper.clear();
            wrapper.eq(SysUser::getIsDel, 0).eq(SysUser::getEnabled, 0);
            long disabledCount = sysUserService.count(wrapper);
            
            return Result.succeed(
                new Object() {
                    public final long total = totalCount;
                    public final long enabled = enabledCount;
                    public final long disabled = disabledCount;
                }, 
                "统计信息获取成功"
            );
        } catch (Exception e) {
            log.error("获取用户统计信息失败", e);
            return Result.failed("获取统计信息失败: " + e.getMessage());
        }
    }
} 