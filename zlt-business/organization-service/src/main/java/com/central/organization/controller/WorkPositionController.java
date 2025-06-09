package com.central.organization.controller;

import com.central.organization.service.WorkPositionService;
import com.central.organization.model.WorkPosition;
import com.central.organization.dto.WorkPositionDetailDTO;
import com.central.common.annotation.LoginUser;
import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.common.model.SysUser;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * 岗位管理控制器
 * 
 * @author Portal Team
 * @since 2024-01-01
 */
@Slf4j
@RestController
@RequestMapping("/api/organization/work-positions")
@Tag(name = "岗位管理", description = "岗位信息的增删改查、权限配置等功能")
public class WorkPositionController {

    @Autowired
    private WorkPositionService workPositionService;

    /**
     * 分页查询岗位
     */
    @GetMapping("/page")
    @Operation(summary = "分页查询岗位", description = "支持按部门、关键词搜索的岗位分页查询")
    @PreAuthorize("hasAuthority('organization:position:view')")
    public Result<PageResult<WorkPosition>> getWorkPositionPage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long departmentId,
            @LoginUser SysUser user) {
        
        try {
            PageResult<WorkPosition> result = workPositionService.getWorkPositionPage(
                pageNum, pageSize, keyword, departmentId, user.getTenantId());
            return Result.success(result);
        } catch (Exception e) {
            log.error("分页查询岗位失败", e);
            return Result.failed("查询失败：" + e.getMessage());
        }
    }

    /**
     * 获取岗位详情
     */
    @GetMapping("/{id}/detail")
    @Operation(summary = "获取岗位详情", description = "获取岗位完整信息，包括权限配置、员工统计等")
    @PreAuthorize("hasAuthority('organization:position:view')")
    public Result<WorkPositionDetailDTO> getWorkPositionDetail(@PathVariable Long id, @LoginUser SysUser user) {
        try {
            WorkPositionDetailDTO detail = workPositionService.getWorkPositionDetailById(id, user.getTenantId());
            if (detail == null) {
                return Result.failed("岗位不存在");
            }
            return Result.success(detail);
        } catch (Exception e) {
            log.error("获取岗位详情失败: {}", id, e);
            return Result.failed("获取详情失败：" + e.getMessage());
        }
    }

    /**
     * 保存岗位
     */
    @PostMapping("/save")
    @Operation(summary = "保存岗位", description = "新增或更新岗位信息")
    @PreAuthorize("hasAuthority('organization:position:add') or hasAuthority('organization:position:edit')")
    public Result<WorkPosition> saveWorkPosition(@RequestBody @Valid WorkPosition workPosition, @LoginUser SysUser user) {
        try {
            // 设置租户ID
            workPosition.setTenantId(user.getTenantId());
            
            // 设置创建/更新人
            if (workPosition.getId() == null) {
                workPosition.setCreatedBy(user.getId());
            } else {
                workPosition.setUpdatedBy(user.getId());
            }
            
            return workPositionService.saveWorkPosition(workPosition);
        } catch (Exception e) {
            log.error("保存岗位失败", e);
            return Result.failed("保存失败：" + e.getMessage());
        }
    }

    /**
     * 删除岗位
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除岗位", description = "删除岗位信息（软删除）")
    @PreAuthorize("hasAuthority('organization:position:delete')")
    public Result<Void> deleteWorkPosition(@PathVariable Long id, @LoginUser SysUser user) {
        try {
            return workPositionService.deleteWorkPosition(id, user.getTenantId());
        } catch (Exception e) {
            log.error("删除岗位失败: {}", id, e);
            return Result.failed("删除失败：" + e.getMessage());
        }
    }

    /**
     * 批量删除岗位
     */
    @DeleteMapping("/batch")
    @Operation(summary = "批量删除岗位", description = "批量删除岗位信息")
    @PreAuthorize("hasAuthority('organization:position:delete')")
    public Result<Void> batchDeleteWorkPositions(@RequestBody List<Long> ids, @LoginUser SysUser user) {
        try {
            return workPositionService.batchDeleteWorkPositions(ids, user.getTenantId());
        } catch (Exception e) {
            log.error("批量删除岗位失败", e);
            return Result.failed("批量删除失败：" + e.getMessage());
        }
    }

    /**
     * 根据部门获取岗位列表
     */
    @GetMapping("/department/{departmentId}")
    @Operation(summary = "部门岗位列表", description = "获取指定部门的岗位列表")
    @PreAuthorize("hasAuthority('organization:position:view')")
    public Result<List<WorkPosition>> getWorkPositionsByDepartment(@PathVariable Long departmentId, @LoginUser SysUser user) {
        try {
            List<WorkPosition> positions = workPositionService.getWorkPositionsByDepartment(departmentId, user.getTenantId());
            return Result.success(positions);
        } catch (Exception e) {
            log.error("获取部门岗位失败: {}", departmentId, e);
            return Result.failed("获取岗位列表失败：" + e.getMessage());
        }
    }

    /**
     * 获取所有启用的岗位
     */
    @GetMapping("/enabled")
    @Operation(summary = "启用岗位列表", description = "获取所有启用状态的岗位")
    @PreAuthorize("hasAuthority('organization:position:view')")
    public Result<List<WorkPosition>> getAllEnabledWorkPositions(@LoginUser SysUser user) {
        try {
            List<WorkPosition> positions = workPositionService.getAllEnabledWorkPositions(user.getTenantId());
            return Result.success(positions);
        } catch (Exception e) {
            log.error("获取启用岗位失败", e);
            return Result.failed("获取岗位列表失败：" + e.getMessage());
        }
    }

    /**
     * 检查岗位名称是否存在
     */
    @GetMapping("/check-name")
    @Operation(summary = "检查岗位名称", description = "检查岗位名称在部门内是否已存在")
    @PreAuthorize("hasAuthority('organization:position:view')")
    public Result<Boolean> checkNameExists(
            @RequestParam String name,
            @RequestParam Long departmentId,
            @RequestParam(required = false) Long excludeId,
            @LoginUser SysUser user) {
        
        try {
            boolean exists = workPositionService.checkNameExists(name, departmentId, excludeId, user.getTenantId());
            return Result.success(exists);
        } catch (Exception e) {
            log.error("检查岗位名称失败: {}", name, e);
            return Result.failed("检查失败：" + e.getMessage());
        }
    }

    /**
     * 复制岗位
     */
    @PostMapping("/{sourceId}/copy")
    @Operation(summary = "复制岗位", description = "复制现有岗位到指定部门")
    @PreAuthorize("hasAuthority('organization:position:add')")
    public Result<WorkPosition> copyWorkPosition(
            @PathVariable Long sourceId,
            @RequestParam Long targetDepartmentId,
            @RequestParam String newName,
            @LoginUser SysUser user) {
        
        try {
            return workPositionService.copyWorkPosition(sourceId, targetDepartmentId, newName, user.getTenantId());
        } catch (Exception e) {
            log.error("复制岗位失败: {}", sourceId, e);
            return Result.failed("复制失败：" + e.getMessage());
        }
    }

    /**
     * 获取岗位统计信息
     */
    @GetMapping("/statistics")
    @Operation(summary = "岗位统计", description = "获取岗位统计信息")
    @PreAuthorize("hasAuthority('organization:position:statistics')")
    public Result<Map<String, Object>> getWorkPositionStatistics(
            @RequestParam(required = false) Long departmentId,
            @LoginUser SysUser user) {
        
        try {
            Map<String, Object> statistics = workPositionService.getWorkPositionStatistics(departmentId, user.getTenantId());
            return Result.success(statistics);
        } catch (Exception e) {
            log.error("获取岗位统计失败", e);
            return Result.failed("获取统计失败：" + e.getMessage());
        }
    }

    /**
     * 启用/禁用岗位
     */
    @PostMapping("/{id}/toggle-status")
    @Operation(summary = "启用/禁用岗位", description = "切换岗位启用状态")
    @PreAuthorize("hasAuthority('organization:position:edit')")
    public Result<Void> toggleWorkPositionStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled,
            @LoginUser SysUser user) {
        
        try {
            return workPositionService.toggleWorkPositionStatus(id, enabled, user.getTenantId());
        } catch (Exception e) {
            log.error("切换岗位状态失败: {}", id, e);
            return Result.failed("操作失败：" + e.getMessage());
        }
    }

    /**
     * 获取岗位权限配置
     */
    @GetMapping("/{id}/permissions")
    @Operation(summary = "获取岗位权限", description = "获取岗位的权限配置信息")
    @PreAuthorize("hasAuthority('organization:position:permission')")
    public Result<Map<String, Object>> getWorkPositionPermissions(@PathVariable Long id, @LoginUser SysUser user) {
        try {
            Map<String, Object> permissions = workPositionService.getWorkPositionPermissions(id, user.getTenantId());
            return Result.success(permissions);
        } catch (Exception e) {
            log.error("获取岗位权限失败: {}", id, e);
            return Result.failed("获取权限失败：" + e.getMessage());
        }
    }

    /**
     * 保存岗位权限配置
     */
    @PostMapping("/{id}/permissions")
    @Operation(summary = "保存岗位权限", description = "保存岗位的权限配置")
    @PreAuthorize("hasAuthority('organization:position:permission')")
    public Result<Void> saveWorkPositionPermissions(
            @PathVariable Long id,
            @RequestBody Map<String, Object> permissions,
            @LoginUser SysUser user) {
        
        try {
            return workPositionService.saveWorkPositionPermissions(id, permissions, user.getTenantId());
        } catch (Exception e) {
            log.error("保存岗位权限失败: {}", id, e);
            return Result.failed("保存权限失败：" + e.getMessage());
        }
    }

    /**
     * 获取主管岗位列表
     */
    @GetMapping("/managers")
    @Operation(summary = "主管岗位列表", description = "获取主管类型的岗位列表")
    @PreAuthorize("hasAuthority('organization:position:view')")
    public Result<List<WorkPosition>> getManagerPositions(
            @RequestParam(required = false) Long departmentId,
            @LoginUser SysUser user) {
        
        try {
            List<WorkPosition> positions = workPositionService.getManagerPositions(departmentId, user.getTenantId());
            return Result.success(positions);
        } catch (Exception e) {
            log.error("获取主管岗位失败", e);
            return Result.failed("获取岗位列表失败：" + e.getMessage());
        }
    }

    /**
     * 根据员工获取岗位列表
     */
    @GetMapping("/employee/{employeeId}")
    @Operation(summary = "员工岗位列表", description = "获取员工任职的岗位列表（支持多岗位）")
    @PreAuthorize("hasAuthority('organization:position:view')")
    public Result<List<WorkPosition>> getWorkPositionsByEmployee(@PathVariable Long employeeId, @LoginUser SysUser user) {
        try {
            List<WorkPosition> positions = workPositionService.getWorkPositionsByEmployee(employeeId, user.getTenantId());
            return Result.success(positions);
        } catch (Exception e) {
            log.error("获取员工岗位失败: {}", employeeId, e);
            return Result.failed("获取岗位列表失败：" + e.getMessage());
        }
    }

    /**
     * 导入岗位数据
     */
    @PostMapping("/import")
    @Operation(summary = "导入岗位", description = "批量导入岗位数据")
    @PreAuthorize("hasAuthority('organization:position:import')")
    public Result<Map<String, Object>> importWorkPositions(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @LoginUser SysUser user) {
        
        try {
            // TODO: 解析Excel文件，转换为WorkPosition列表
            List<WorkPosition> workPositions = null;
            return workPositionService.importWorkPositions(workPositions, user.getTenantId());
        } catch (Exception e) {
            log.error("导入岗位失败", e);
            return Result.failed("导入失败：" + e.getMessage());
        }
    }

    /**
     * 导出岗位数据
     */
    @PostMapping("/export")
    @Operation(summary = "导出岗位", description = "导出岗位数据到Excel")
    @PreAuthorize("hasAuthority('organization:position:export')")
    public Result<String> exportWorkPositions(
            @RequestParam(required = false) Long departmentId,
            @LoginUser SysUser user) {
        
        try {
            List<WorkPosition> workPositions = workPositionService.exportWorkPositions(departmentId, user.getTenantId());
            // TODO: 生成Excel文件，返回下载链接
            String downloadUrl = "";
            return Result.success(downloadUrl);
        } catch (Exception e) {
            log.error("导出岗位失败", e);
            return Result.failed("导出失败：" + e.getMessage());
        }
    }

    /**
     * 获取岗位层级结构
     */
    @GetMapping("/hierarchy")
    @Operation(summary = "岗位层级结构", description = "获取部门内岗位的层级结构")
    @PreAuthorize("hasAuthority('organization:position:view')")
    public Result<List<Map<String, Object>>> getWorkPositionHierarchy(
            @RequestParam Long departmentId,
            @LoginUser SysUser user) {
        
        try {
            List<Map<String, Object>> hierarchy = workPositionService.getWorkPositionHierarchy(departmentId, user.getTenantId());
            return Result.success(hierarchy);
        } catch (Exception e) {
            log.error("获取岗位层级失败: {}", departmentId, e);
            return Result.failed("获取层级结构失败：" + e.getMessage());
        }
    }
} 