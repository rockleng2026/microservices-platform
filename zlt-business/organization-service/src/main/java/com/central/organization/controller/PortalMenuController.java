package com.central.organization.controller;

import com.central.common.annotation.LoginUser;
import com.central.common.context.LoginUserContextHolder;
import com.central.common.model.Result;
import com.central.common.model.SysUser;
import com.central.organization.service.MenuPermissionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Portal菜单权限控制器
 * 
 * @author zlt
 */
@Slf4j
@RestController
@RequestMapping("/api/menus")
@Tag(name = "Portal菜单权限管理", description = "Portal菜单权限管理相关API")
public class PortalMenuController {

    @Autowired
    private MenuPermissionService menuPermissionService;

    /**
     * 获取当前用户的权限菜单-逻辑是按岗位查询，positionId可选参数，传入了就查询指定用户岗位的ID，没传就查询该用户下默认岗位的id
     */
    @Operation(summary = "获取当前用户权限菜单", description = "根据用户岗位获取对应的菜单权限列表")
    @GetMapping("/current")
    public Result<List<Map<String, Object>>> getCurrentUserPositionMenus(@LoginUser SysUser currentUser, Long positionId) {
        log.info("获取用户权限菜单，用户ID: {}", currentUser.getId());
        try {

            List<Map<String, Object>> menus = menuPermissionService.getCurrentUserPositionMenus(LoginUserContextHolder.getUser().getId(), positionId);
            return Result.succeed(menus, "获取菜单权限成功");
        } catch (Exception e) {
            log.error("获取用户权限菜单失败，用户ID: {}", currentUser.getId(), e);
            return Result.failed("获取菜单权限失败: " + e.getMessage());
        }
    }

    /**
     * 获取系统菜单树形结构（用于权限配置）
     */
    @Operation(summary = "获取系统菜单树", description = "获取系统完整菜单树结构，用于权限配置")
    @GetMapping("/tree")
    public Result<List<Map<String, Object>>> getMenuTree(@LoginUser SysUser currentUser) {
        log.info("获取系统菜单树，操作用户ID: {}", currentUser.getId());
        try {
            List<Map<String, Object>> menuTree = menuPermissionService.getSystemMenuTree();
            return Result.succeed(menuTree, "获取菜单树成功");
        } catch (Exception e) {
            log.error("获取系统菜单树失败", e);
            return Result.failed("获取菜单树失败: " + e.getMessage());
        }
    }
} 