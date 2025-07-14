package com.central.organization.controller;

import com.central.common.annotation.LoginUser;
import com.central.common.model.Result;
import com.central.common.model.SysUser;
import com.central.organization.model.MenuPermission;
import com.central.organization.model.PortalUser;
import com.central.organization.model.UserPersonalConfig;
import com.central.organization.model.Workposition;
import com.central.organization.model.vo.AccountUserVO;
import com.central.organization.service.PortalUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;
import com.central.common.model.PageResult;

/**
 * Portal用户控制器
 * 
 * @author zlt
 */
@Slf4j
@RestController
@RequestMapping("/users")
@Tag(name = "Portal用户管理", description = "Portal用户管理相关API")
public class PortalUserController {

    @Autowired
    private PortalUserService portalUserService;
    
    /**
     * 获取当前用户ID的辅助方法
     */
    private Long getUserId(SysUser currentUser) {
        Long userId = null;
        if (currentUser != null && currentUser.getId() != null) {
            userId = currentUser.getId();
        } else {
            // 尝试从安全上下文获取用户ID
            try {
                com.central.common.model.LoginAppUser loginAppUser = com.central.common.utils.LoginUserUtils.getCurrentUser(false);
                if (loginAppUser != null) {
                    userId = loginAppUser.getId();
                } else {
                    // 尝试从当前上下文获取SysUser
                    SysUser sysUser = com.central.common.utils.LoginUserUtils.getCurrentSysUser();
                    if (sysUser != null) {
                        userId = sysUser.getId();
                    }
                }
            } catch (Exception e) {
                log.warn("从上下文获取用户信息失败", e);
            }
        }
        return userId;
    }

    /**
     * 根据用户名查询用户信息（用于登录认证，无需token）
     */
    @Operation(summary = "根据用户名查询用户", description = "用于Portal用户登录认证，无需token")
    @GetMapping("/users-anon/login")
    public SysUser findByUsername(@Parameter(description = "用户名") @RequestParam("username") String username) {
        log.info("根据用户名查询用户: {}", username);
        return portalUserService.findByUsername(username);
    }

    /**
     * 根据手机号查询用户信息（无需token）
     */
    @Operation(summary = "根据手机号查询用户", description = "根据手机号查询Portal用户信息，无需token")
    @GetMapping("/users-anon/mobile")
    public SysUser findByMobile(@Parameter(description = "手机号") @RequestParam("mobile") String mobile) {
        log.info("根据手机号查询用户: {}", mobile);
        return portalUserService.findByMobile(mobile);
    }

    /**
     * 根据用户ID查询用户信息（无需token）
     */
    @Operation(summary = "根据用户ID查询用户", description = "根据用户ID查询Portal用户信息，无需token")
    @GetMapping("/users-anon/id/{userId}")
    public SysUser findByUserId(@Parameter(description = "用户ID") @PathVariable("userId") Long userId) {
        log.info("根据用户ID查询用户: {}", userId);
        return portalUserService.findByUserId(userId);
    }

    /**
     * 获取当前登录用户信息（包含员工、部门、岗位、权限、个性化配置等）
     */
    @Operation(summary = "获取当前用户信息", description = "获取当前登录用户的详细信息，包括员工、部门、岗位、权限、个性化配置等")
    @GetMapping("/current")
    public Result<PortalUser> getCurrentUser(@LoginUser SysUser currentUser) {
        Long userId = getUserId(currentUser);
        if (userId == null) {
            return Result.failed("用户未登录或登录信息已过期");
        }
        
        log.info("获取当前用户信息，用户ID: {}", userId);
        
        try {
            PortalUser userInfo = portalUserService.getCurrentUserInfo(userId);
            return Result.succeed(userInfo, "获取用户信息成功");
        } catch (Exception e) {
            log.error("获取当前用户信息失败，用户ID: {}", userId, e);
            return Result.failed("获取用户信息失败: " + e.getMessage());
        }
    }

    /**
     * 切换用户岗位
     */
    @Operation(summary = "切换用户岗位", description = "切换当前用户的工作岗位")
    @PostMapping("/switch-position")
    public Result<PortalUser> switchPosition(
            @LoginUser SysUser currentUser,
            @Parameter(description = "目标岗位ID") @RequestParam("positionId") Long positionId) {
        Long userId = getUserId(currentUser);
        if (userId == null) {
            return Result.failed("用户未登录或登录信息已过期");
        }
        
        log.info("用户 {} 切换到岗位: {}", userId, positionId);
        try {
            PortalUser result = portalUserService.switchUserPosition(userId, positionId);
            return Result.succeed(result, "岗位切换成功");
        } catch (Exception e) {
            log.error("岗位切换失败，用户ID: {}, 岗位ID: {}", userId, positionId, e);
            return Result.failed("岗位切换失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户的所有岗位信息
     */
    @Operation(summary = "获取用户岗位列表", description = "获取当前用户的所有岗位信息")
    @GetMapping("/positions")
    public Result<List<Workposition>> getUserPositions(@LoginUser SysUser currentUser) {
        Long userId = getUserId(currentUser);
        if (userId == null) {
            return Result.failed("用户未登录或登录信息已过期");
        }
        
        log.info("获取用户岗位列表，用户ID: {}", userId);
        try {
            List<Workposition> positions = portalUserService.getUserPositions(userId);
            return Result.succeed(positions, "获取岗位列表成功");
        } catch (Exception e) {
            log.error("获取用户岗位列表失败，用户ID: {}", userId, e);
            return Result.failed("获取岗位列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户当前岗位的菜单权限
     */
    @Operation(summary = "获取用户菜单权限", description = "获取当前用户当前岗位的菜单权限树")
    @GetMapping("/menus")
    public Result<List<MenuPermission>> getCurrentUserMenus(@LoginUser SysUser currentUser) {
        Long userId = getUserId(currentUser);
        if (userId == null) {
            return Result.failed("用户未登录或登录信息已过期");
        }
        
        log.info("获取用户菜单权限，用户ID: {}", userId);
        try {
            List<MenuPermission> menus = portalUserService.getCurrentUserMenus(userId);
            return Result.succeed(menus, "获取菜单权限成功");
        } catch (Exception e) {
            log.error("获取用户菜单权限失败，用户ID: {}", userId, e);
            return Result.failed("获取菜单权限失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户个性化配置
     */
    @Operation(summary = "获取用户个性化配置", description = "获取当前用户的个性化配置信息")
    @GetMapping("/personal-config")
    public Result<UserPersonalConfig> getUserPersonalConfig(@LoginUser SysUser currentUser) {
        Long userId = getUserId(currentUser);
        if (userId == null) {
            return Result.failed("用户未登录或登录信息已过期");
        }
        
        log.info("获取用户个性化配置，用户ID: {}", userId);
        try {
            UserPersonalConfig config = portalUserService.getUserPersonalConfig(userId);
            return Result.succeed(config, "获取个性化配置成功");
        } catch (Exception e) {
            log.error("获取用户个性化配置失败，用户ID: {}", userId, e);
            return Result.failed("获取个性化配置失败: " + e.getMessage());
        }
    }

    /**
     * 保存用户个性化配置
     */
    @Operation(summary = "保存用户个性化配置", description = "保存当前用户的个性化配置信息")
    @PostMapping("/personal-config")
    public Result<String> saveUserPersonalConfig(
            @LoginUser SysUser currentUser,
            @Valid @RequestBody UserPersonalConfig config) {
        Long userId = getUserId(currentUser);
        if (userId == null) {
            return Result.failed("用户未登录或登录信息已过期");
        }
        
        log.info("保存用户个性化配置，用户ID: {}", userId);
        try {
            // 确保配置属于当前用户
            config.setUserId(userId);
            config.setUpdatedBy(userId);
            
            boolean success = portalUserService.saveUserPersonalConfig(config);
            if (success) {
                return Result.succeed("个性化配置保存成功");
            } else {
                return Result.failed("个性化配置保存失败");
            }
        } catch (Exception e) {
            log.error("保存用户个性化配置失败，用户ID: {}", userId, e);
            return Result.failed("个性化配置保存失败: " + e.getMessage());
        }
    }

    /**
     * 更新用户默认岗位
     */
    @Operation(summary = "更新用户默认岗位", description = "更新当前用户的默认岗位设置")
    @PostMapping("/default-position")
    public Result<String> updateDefaultPosition(
            @LoginUser SysUser currentUser,
            @Parameter(description = "默认岗位ID") @RequestParam("positionId") Long positionId) {
        Long userId = getUserId(currentUser);
        if (userId == null) {
            return Result.failed("用户未登录或登录信息已过期");
        }
        
        log.info("更新用户默认岗位，用户ID: {}, 岗位ID: {}", userId, positionId);
        try {
            boolean success = portalUserService.updateDefaultPosition(userId, positionId);
            if (success) {
                return Result.succeed("默认岗位更新成功");
            } else {
                return Result.failed("默认岗位更新失败");
            }
        } catch (Exception e) {
            log.error("更新用户默认岗位失败，用户ID: {}, 岗位ID: {}", userId, positionId, e);
            return Result.failed("默认岗位更新失败: " + e.getMessage());
        }
    }

    // ================== 账号管理接口 ==================

    /**
     * 账号分页查询
     */
    @Operation(summary = "账号分页查询", description = "分页查询当前租户下所有员工账号")
    @GetMapping("/account/page")
    public PageResult<AccountUserVO> pageAccount(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        PageResult<AccountUserVO> result = portalUserService.pageAccount(keyword, status, page, size);
        result.setResp_code(0);
        return result;
    }

    /**
     * 账号详情
     */
    @Operation(summary = "账号详情", description = "根据账号ID获取账号详细信息")
    @GetMapping("/account/{id}")
    public Result<PortalUser> getAccount(@PathVariable Long id) {
        return Result.succeed(portalUserService.getAccount(id));
    }

    /**
     * 开通账号
     */
    @Operation(summary = "开通账号", description = "为员工开通账号")
    @PostMapping("/account/create")
    public Result<Void> createAccount(@RequestBody @Valid PortalUser user) {
        portalUserService.createAccount(user);
        return Result.succeed("ok");
    }

    /**
     * 编辑账号
     */
    @Operation(summary = "编辑账号", description = "编辑账号基础信息")
    @PutMapping("/account/{id}")
    public Result<Void> updateAccount(@PathVariable Long id, @RequestBody PortalUser user) {
        user.setId(id);
        portalUserService.updateAccount(user);
        return Result.succeed("ok");
    }

    /**
     * 停用账号
     */
    @Operation(summary = "停用账号", description = "停用账号，账号不可登录")
    @PostMapping("/account/{id}/disable")
    public Result<Void> disableAccount(@PathVariable Long id) {
        portalUserService.disableAccount(id);
        return Result.succeed("ok");
    }

    /**
     * 启用账号
     */
    @Operation(summary = "启用账号", description = "启用账号，恢复登录")
    @PostMapping("/account/{id}/enable")
    public Result<Void> enableAccount(@PathVariable Long id) {
        portalUserService.enableAccount(id);
        return Result.succeed("ok");
    }

    /**
     * 注销账号
     */
    @Operation(summary = "注销账号", description = "注销账号，彻底禁用")
    @PostMapping("/account/{id}/cancel")
    public Result<Void> cancelAccount(@PathVariable Long id) {
        portalUserService.cancelAccount(id);
        return Result.succeed("ok");
    }

    /**
     * 批量注销账号
     */
    @Operation(summary = "批量注销账号", description = "批量注销账号，彻底禁用")
    @PostMapping("/account/batch-cancel")
    public Result<Void> batchCancelAccount(@RequestBody List<Long> ids) {
        portalUserService.batchCancelAccount(ids);
        return Result.succeed("ok");
    }

    /**
     * 重置密码
     */
    @Operation(summary = "重置密码", description = "管理员重置账号密码")
    @PostMapping("/account/{id}/reset-password")
    public Result<Void> resetPassword(@PathVariable Long id, @RequestParam String newPassword) {
        portalUserService.resetPassword(id, newPassword);
        return Result.succeed("ok");
    }

    /**
     * 本人修改密码
     */
    @Operation(summary = "修改密码", description = "用户本人修改密码")
    @PostMapping("/account/change-password")
    public Result<Void> changePassword(@LoginUser SysUser currentUser, @RequestParam String oldPassword, @RequestParam String newPassword) {
        Long userId = getUserId(currentUser);
        portalUserService.changePassword(userId, oldPassword, newPassword);
        return Result.succeed("ok");
    }
} 