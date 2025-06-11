package com.central.organization.controller;

import com.central.common.annotation.LoginUser;
import com.central.common.model.Result;
import com.central.common.model.SysUser;
import com.central.organization.model.UserPersonalConfig;
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
    public Result<Map<String, Object>> getCurrentUser(@LoginUser SysUser currentUser) {
        log.info("获取当前用户信息，用户ID: {}", currentUser.getId());
        try {
            Map<String, Object> userInfo = portalUserService.getCurrentUserInfo(currentUser.getId());
            return Result.succeed(userInfo, "获取用户信息成功");
        } catch (Exception e) {
            log.error("获取当前用户信息失败，用户ID: {}", currentUser.getId(), e);
            return Result.failed("获取用户信息失败: " + e.getMessage());
        }
    }

    /**
     * 切换用户岗位
     */
    @Operation(summary = "切换用户岗位", description = "切换当前用户的工作岗位")
    @PostMapping("/switch-position")
    public Result<Map<String, Object>> switchPosition(
            @LoginUser SysUser currentUser,
            @Parameter(description = "目标岗位ID") @RequestParam("positionId") Long positionId) {
        log.info("用户 {} 切换到岗位: {}", currentUser.getId(), positionId);
        try {
            Map<String, Object> result = portalUserService.switchUserPosition(currentUser.getId(), positionId);
            if ((Boolean) result.get("success")) {
                return Result.succeed(result, (String) result.get("message"));
            } else {
                return Result.failed((String) result.get("message"));
            }
        } catch (Exception e) {
            log.error("岗位切换失败，用户ID: {}, 岗位ID: {}", currentUser.getId(), positionId, e);
            return Result.failed("岗位切换失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户的所有岗位信息
     */
    @Operation(summary = "获取用户岗位列表", description = "获取当前用户的所有岗位信息")
    @GetMapping("/positions")
    public Result<List<Map<String, Object>>> getUserPositions(@LoginUser SysUser currentUser) {
        log.info("获取用户岗位列表，用户ID: {}", currentUser.getId());
        try {
            List<Map<String, Object>> positions = portalUserService.getUserPositions(currentUser.getId());
            return Result.succeed(positions, "获取岗位列表成功");
        } catch (Exception e) {
            log.error("获取用户岗位列表失败，用户ID: {}", currentUser.getId(), e);
            return Result.failed("获取岗位列表失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户当前岗位的菜单权限
     */
    @Operation(summary = "获取用户菜单权限", description = "获取当前用户当前岗位的菜单权限树")
    @GetMapping("/menus")
    public Result<List<Map<String, Object>>> getCurrentUserMenus(@LoginUser SysUser currentUser) {
        log.info("获取用户菜单权限，用户ID: {}", currentUser.getId());
        try {
            List<Map<String, Object>> menus = portalUserService.getCurrentUserMenus(currentUser.getId());
            return Result.succeed(menus, "获取菜单权限成功");
        } catch (Exception e) {
            log.error("获取用户菜单权限失败，用户ID: {}", currentUser.getId(), e);
            return Result.failed("获取菜单权限失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户个性化配置
     */
    @Operation(summary = "获取用户个性化配置", description = "获取当前用户的个性化配置信息")
    @GetMapping("/personal-config")
    public Result<UserPersonalConfig> getUserPersonalConfig(@LoginUser SysUser currentUser) {
        log.info("获取用户个性化配置，用户ID: {}", currentUser.getId());
        try {
            UserPersonalConfig config = portalUserService.getUserPersonalConfig(currentUser.getId());
            return Result.succeed(config, "获取个性化配置成功");
        } catch (Exception e) {
            log.error("获取用户个性化配置失败，用户ID: {}", currentUser.getId(), e);
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
        log.info("保存用户个性化配置，用户ID: {}", currentUser.getId());
        try {
            // 确保配置属于当前用户
            config.setUserId(currentUser.getId());
            config.setUpdatedBy(currentUser.getId());
            
            boolean success = portalUserService.saveUserPersonalConfig(config);
            if (success) {
                return Result.succeed("个性化配置保存成功");
            } else {
                return Result.failed("个性化配置保存失败");
            }
        } catch (Exception e) {
            log.error("保存用户个性化配置失败，用户ID: {}", currentUser.getId(), e);
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
        log.info("更新用户默认岗位，用户ID: {}, 岗位ID: {}", currentUser.getId(), positionId);
        try {
            boolean success = portalUserService.updateDefaultPosition(currentUser.getId(), positionId);
            if (success) {
                return Result.succeed("默认岗位更新成功");
            } else {
                return Result.failed("默认岗位更新失败");
            }
        } catch (Exception e) {
            log.error("更新用户默认岗位失败，用户ID: {}, 岗位ID: {}", currentUser.getId(), positionId, e);
            return Result.failed("默认岗位更新失败: " + e.getMessage());
        }
    }
} 