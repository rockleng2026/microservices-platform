package com.central.system.controller;

import com.central.common.model.Result;
import com.central.system.model.SysMenu;
import com.central.system.model.dto.SysMenuTreeDTO;
import com.central.system.service.SysMenuService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

/**
 * 系统菜单管理控制器
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/menu")
@Tag(name = "系统菜单管理", description = "菜单的增删改查、权限配置等功能")
public class SysMenuController {

    @Autowired
    private SysMenuService sysMenuService;

    /**
     * 获取菜单树形结构
     */
    @GetMapping("/tree")
    @Operation(summary = "获取菜单树形结构", description = "获取系统菜单的树形结构数据")
    public Result<List<SysMenuTreeDTO>> getMenuTree(
            @Parameter(description = "父菜单ID，为空则获取全部") 
            @RequestParam(required = false) Long parentId) {
        try {
            List<SysMenuTreeDTO> tree = sysMenuService.getMenuTree(parentId);
            return Result.succeed(tree, "菜单树获取成功");
        } catch (Exception e) {
            log.error("获取菜单树失败", e);
            return Result.failed("获取菜单树失败: " + e.getMessage());
        }
    }

    /**
     * 根据ID获取菜单详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取菜单详情", description = "根据菜单ID获取菜单详细信息")
    public Result<SysMenu> getMenuById(
            @Parameter(description = "菜单ID") 
            @PathVariable Long id) {
        try {
            SysMenu menu = sysMenuService.getById(id);
            if (menu == null) {
                return Result.failed("菜单不存在");
            }
            return Result.succeed(menu, "菜单详情获取成功");
        } catch (Exception e) {
            log.error("获取菜单详情失败，ID: {}", id, e);
            return Result.failed("获取菜单详情失败: " + e.getMessage());
        }
    }

    /**
     * 保存菜单
     */
    @PostMapping("/save")
    @Operation(summary = "保存菜单", description = "新增或更新菜单信息")
    public Result<String> saveMenu(@Valid @RequestBody SysMenu menu) {
        try {
            boolean success;
            if (menu.getId() == null) {
                success = sysMenuService.saveMenu(menu);
            } else {
                success = sysMenuService.updateMenu(menu);
            }
            
            if (success) {
                return Result.succeed("菜单保存成功");
            } else {
                return Result.failed("菜单保存失败");
            }
        } catch (Exception e) {
            log.error("保存菜单失败", e);
            return Result.failed("保存菜单失败: " + e.getMessage());
        }
    }

    /**
     * 删除菜单
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除菜单", description = "根据菜单ID删除菜单")
    public Result<String> deleteMenu(
            @Parameter(description = "菜单ID") 
            @PathVariable Long id) {
        try {
            // 检查是否可以删除
            if (!sysMenuService.canDelete(id)) {
                return Result.failed("该菜单下存在子菜单或功能点，无法删除");
            }
            
            boolean success = sysMenuService.deleteMenu(id);
            if (success) {
                return Result.succeed("菜单删除成功");
            } else {
                return Result.failed("菜单删除失败");
            }
        } catch (Exception e) {
            log.error("删除菜单失败，ID: {}", id, e);
            return Result.failed("删除菜单失败: " + e.getMessage());
        }
    }

    /**
     * 批量更新菜单状态
     */
    @PostMapping("/batch-status")
    @Operation(summary = "批量更新菜单状态", description = "批量启用或禁用菜单")
    public Result<String> batchUpdateStatus(
            @Parameter(description = "菜单ID列表") 
            @RequestParam List<Long> menuIds,
            @Parameter(description = "状态：1启用，0禁用") 
            @RequestParam Integer status) {
        try {
            boolean success = sysMenuService.batchUpdateStatus(menuIds, status);
            if (success) {
                String statusText = status == 1 ? "启用" : "禁用";
                return Result.succeed("菜单" + statusText + "成功");
            } else {
                return Result.failed("菜单状态更新失败");
            }
        } catch (Exception e) {
            log.error("批量更新菜单状态失败", e);
            return Result.failed("菜单状态更新失败: " + e.getMessage());
        }
    }

    /**
     * 获取用户菜单权限
     */
    @GetMapping("/user/{userId}")
    @Operation(summary = "获取用户菜单权限", description = "根据用户ID获取用户可访问的菜单")
    public Result<List<SysMenu>> getUserMenus(
            @Parameter(description = "用户ID") 
            @PathVariable Long userId) {
        try {
            List<SysMenu> menus = sysMenuService.getUserMenus(userId);
            return Result.succeed(menus, "用户菜单获取成功");
        } catch (Exception e) {
            log.error("获取用户菜单失败，用户ID: {}", userId, e);
            return Result.failed("获取用户菜单失败: " + e.getMessage());
        }
    }

    /**
     * 获取角色菜单权限
     */
    @GetMapping("/role/{roleId}")
    @Operation(summary = "获取角色菜单权限", description = "根据角色ID获取角色可访问的菜单")
    public Result<List<SysMenu>> getRoleMenus(
            @Parameter(description = "角色ID") 
            @PathVariable Long roleId) {
        try {
            List<SysMenu> menus = sysMenuService.getRoleMenus(roleId);
            return Result.succeed(menus, "角色菜单获取成功");
        } catch (Exception e) {
            log.error("获取角色菜单失败，角色ID: {}", roleId, e);
            return Result.failed("获取角色菜单失败: " + e.getMessage());
        }
    }
} 