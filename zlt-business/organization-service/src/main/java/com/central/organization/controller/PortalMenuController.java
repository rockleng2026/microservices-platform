package com.central.organization.controller;

import com.central.common.annotation.LoginUser;
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
@RequestMapping("/menus")
@Tag(name = "Portal菜单权限管理", description = "Portal菜单权限管理相关API")
public class PortalMenuController {

    @Autowired
    private MenuPermissionService menuPermissionService;

    /**
     * 获取当前用户的权限菜单
     */
    @Operation(summary = "获取当前用户权限菜单", description = "根据用户岗位获取对应的菜单权限列表")
    @GetMapping("/current")
    public Result<List<Map<String, Object>>> getCurrentUserMenus(@LoginUser SysUser currentUser) {
        log.info("获取用户权限菜单，用户ID: {}", currentUser.getId());
        try {
            List<Map<String, Object>> menus = menuPermissionService.getCurrentUserMenus(currentUser.getId());
            return Result.succeed(menus, "获取菜单权限成功");
        } catch (Exception e) {
            log.error("获取用户权限菜单失败，用户ID: {}", currentUser.getId(), e);
            return Result.failed("获取菜单权限失败: " + e.getMessage());
        }
    }
} 