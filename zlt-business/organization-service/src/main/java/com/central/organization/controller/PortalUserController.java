package com.central.organization.controller;

import com.central.common.annotation.LoginUser;
import com.central.common.model.Result;
import com.central.common.model.SysUser;
import com.central.organization.service.PortalUserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import java.util.Map;

/**
 * Portal用户控制器
 * 
 * @author zlt
 */
@Slf4j
@RestController
@RequestMapping("/users")
@Api(tags = "Portal用户管理")
public class PortalUserController {

    @Autowired
    private PortalUserService portalUserService;

    /**
     * 根据用户名查询用户信息（用于登录认证，无需token）
     */
    @ApiOperation(value = "根据用户名查询用户")
    @GetMapping("/users-anon/login")
    public SysUser findByUsername(@RequestParam("username") String username) {
        log.info("根据用户名查询用户: {}", username);
        return portalUserService.findByUsername(username);
    }

    /**
     * 根据手机号查询用户信息（无需token）
     */
    @ApiOperation(value = "根据手机号查询用户")
    @GetMapping("/users-anon/mobile")
    public SysUser findByMobile(@RequestParam("mobile") String mobile) {
        log.info("根据手机号查询用户: {}", mobile);
        return portalUserService.findByMobile(mobile);
    }

    /**
     * 根据用户ID查询用户信息（无需token）
     */
    @ApiOperation(value = "根据用户ID查询用户")
    @GetMapping("/users-anon/id/{userId}")
    public SysUser findByUserId(@PathVariable("userId") Long userId) {
        log.info("根据用户ID查询用户: {}", userId);
        return portalUserService.findByUserId(userId);
    }

    /**
     * 获取当前登录用户信息（包含员工、部门、岗位信息）
     */
    @ApiOperation(value = "获取当前用户信息")
    @GetMapping("/current")
    public Result<Map<String, Object>> getCurrentUser(@ApiIgnore @LoginUser SysUser currentUser) {
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
    @ApiOperation(value = "切换用户岗位")
    @PostMapping("/switch-position")
    public Result<Map<String, Object>> switchPosition(
            @ApiIgnore @LoginUser SysUser currentUser,
            @RequestParam("positionId") Long positionId) {
        log.info("用户 {} 切换到岗位: {}", currentUser.getId(), positionId);
        try {
            Map<String, Object> result = portalUserService.switchUserPosition(currentUser.getId(), positionId);
            return Result.succeed(result, "岗位切换成功");
        } catch (Exception e) {
            log.error("岗位切换失败，用户ID: {}, 岗位ID: {}", currentUser.getId(), positionId, e);
            return Result.failed("岗位切换失败: " + e.getMessage());
        }
    }
} 