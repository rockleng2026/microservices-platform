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
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/positions")
@Tag(name = "岗位管理", description = "岗位信息的增删改查、权限配置等功能")
public class WorkPositionController {

    @Autowired
    private WorkPositionService workPositionService;

    /**
     * 分页查询岗位列表
     */
    @GetMapping("/page")
    @Operation(summary = "分页查询岗位列表", description = "支持按部门、关键词搜索的岗位分页查询")
    @PreAuthorize("hasAuthority('organization:position:view')")
    public Result<PageResult<WorkPosition>> getWorkPositionPage(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer departmentId,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) Integer status) {
        
        try {
            PageResult<WorkPosition> result = workPositionService.getWorkPositionPage(
                page, size, keyword, departmentId, level, status);
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("查询岗位列表失败", e);
            return Result.failed("查询失败");
        }
    }

    /**
     * 获取岗位详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取岗位详情", description = "获取岗位完整信息，包括权限配置、员工统计等")
    @PreAuthorize("hasAuthority('organization:position:view')")
    public Result<WorkPositionDetailDTO> getWorkPositionDetail(
            @PathVariable Integer id) {
        
        try {
            WorkPositionDetailDTO detail = workPositionService.getWorkPositionDetail(id);
            if (detail != null) {
                return Result.succeed(detail);
            } else {
                return Result.failed("岗位不存在");
            }
        } catch (Exception e) {
            log.error("获取岗位详情失败", e);
            return Result.failed("获取失败");
        }
    }

    /**
     * 新增岗位
     */
    @PostMapping
    @Operation(summary = "新增岗位", description = "新增岗位信息")
    @PreAuthorize("hasAuthority('organization:position:add')")
    public Result<WorkPosition> createWorkPosition(@Valid @RequestBody WorkPosition workPosition) {
        return workPositionService.createWorkPosition(workPosition);
    }

    /**
     * 更新岗位
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新岗位", description = "更新岗位信息")
    @PreAuthorize("hasAuthority('organization:position:edit')")
    public Result<WorkPosition> updateWorkPosition(
            @PathVariable Integer id,
            @Valid @RequestBody WorkPosition workPosition) {
        
        workPosition.setId(id);
        return workPositionService.updateWorkPosition(workPosition);
    }

    /**
     * 删除岗位
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除岗位", description = "删除岗位信息（软删除）")
    @PreAuthorize("hasAuthority('organization:position:delete')")
    public Result<Void> deleteWorkPosition(@PathVariable Integer id) {
        return workPositionService.deleteWorkPosition(id);
    }

    /**
     * 批量删除岗位
     */
    @DeleteMapping("/batch")
    @Operation(summary = "批量删除岗位", description = "批量删除岗位信息")
    @PreAuthorize("hasAuthority('organization:position:delete')")
    public Result<Void> deleteWorkPositions(@RequestBody List<Integer> ids) {
        return workPositionService.deleteWorkPositions(ids);
    }

    /**
     * 更新岗位状态
     */
    @PutMapping("/{id}/status")
    @Operation(summary = "更新岗位状态", description = "切换岗位启用状态")
    @PreAuthorize("hasAuthority('organization:position:edit')")
    public Result<Void> updateWorkPositionStatus(
            @PathVariable Integer id,
            @RequestParam Integer status) {
        
        return workPositionService.updateWorkPositionStatus(id, status);
    }

    /**
     * 复制岗位
     */
    @PostMapping("/{id}/copy")
    @Operation(summary = "复制岗位", description = "复制现有岗位到指定部门")
    @PreAuthorize("hasAuthority('organization:position:add')")
    public Result<WorkPosition> copyWorkPosition(
            @PathVariable Integer id,
            @RequestParam Integer targetDepartmentId) {
        
        return workPositionService.copyWorkPosition(id, targetDepartmentId);
    }

    /**
     * 根据部门查询岗位
     */
    @GetMapping("/department/{departmentId}")
    @Operation(summary = "部门岗位列表", description = "获取指定部门的岗位列表")
    @PreAuthorize("hasAuthority('organization:position:view')")
    public Result<List<WorkPosition>> getWorkPositionsByDepartment(
            @PathVariable Integer departmentId,
            @RequestParam(defaultValue = "false") Boolean includeSubDepartments) {
        
        try {
            List<WorkPosition> positions = workPositionService.getWorkPositionsByDepartment(
                departmentId, includeSubDepartments);
            return Result.succeed(positions);
        } catch (Exception e) {
            log.error("查询部门岗位失败", e);
            return Result.failed("查询失败");
        }
    }

    /**
     * 查询可用岗位（用于下拉选择）
     */
    @GetMapping("/available")
    @Operation(summary = "启用岗位列表", description = "获取所有启用状态的岗位")
    @PreAuthorize("hasAuthority('organization:position:view')")
    public Result<List<WorkPosition>> getAvailableWorkPositions(
            @RequestParam(required = false) Integer departmentId) {
        
        try {
            List<WorkPosition> positions = workPositionService.getAvailableWorkPositions(departmentId);
            return Result.succeed(positions);
        } catch (Exception e) {
            log.error("查询可用岗位失败", e);
            return Result.failed("查询失败");
        }
    }

    /**
     * 验证岗位名称是否可用
     */
    @GetMapping("/check-name")
    @Operation(summary = "检查岗位名称", description = "检查岗位名称在部门内是否已存在")
    @PreAuthorize("hasAuthority('organization:position:view')")
    public Result<Boolean> checkPositionNameAvailable(
            @RequestParam String name,
            @RequestParam Integer departmentId,
            @RequestParam(required = false) Integer excludeId) {
        
        try {
            Boolean available = workPositionService.isPositionNameAvailable(name, departmentId, excludeId);
            return Result.succeed(available);
        } catch (Exception e) {
            log.error("验证岗位名称失败", e);
            return Result.failed("验证失败");
        }
    }

    /**
     * 验证岗位编号是否可用
     */
    @GetMapping("/check-code")
    @Operation(summary = "检查岗位编号", description = "检查岗位编号在系统内是否已存在")
    @PreAuthorize("hasAuthority('organization:position:view')")
    public Result<Boolean> checkPositionCodeAvailable(
            @RequestParam String positionCode,
            @RequestParam(required = false) Integer excludeId) {
        
        try {
            Boolean available = workPositionService.isPositionCodeAvailable(positionCode, excludeId);
            return Result.succeed(available);
        } catch (Exception e) {
            log.error("验证岗位编号失败", e);
            return Result.failed("验证失败");
        }
    }

    /**
     * 生成岗位编号
     */
    @GetMapping("/generate-code")
    @Operation(summary = "生成岗位编号", description = "生成新的岗位编号")
    @PreAuthorize("hasAuthority('organization:position:add')")
    public Result<String> generatePositionCode(@RequestParam Integer departmentId) {
        try {
            String positionCode = workPositionService.generatePositionCode(departmentId);
            return Result.succeed(positionCode);
        } catch (Exception e) {
            log.error("生成岗位编号失败", e);
            return Result.failed("生成失败");
        }
    }

    /**
     * 获取岗位统计信息
     */
    @GetMapping("/statistics")
    @Operation(summary = "岗位统计", description = "获取岗位统计信息")
    @PreAuthorize("hasAuthority('organization:position:statistics')")
    public Result<Map<String, Object>> getWorkPositionStatistics(
            @RequestParam(required = false) Integer departmentId,
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
     * 获取主管岗位列表
     */
    @GetMapping("/managers")
    @Operation(summary = "主管岗位列表", description = "获取主管类型的岗位列表")
    @PreAuthorize("hasAuthority('organization:position:view')")
    public Result<List<WorkPosition>> getManagerPositions(
            @RequestParam(required = false) Integer departmentId,
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
    public Result<List<WorkPosition>> getWorkPositionsByEmployee(@PathVariable Integer employeeId, @LoginUser SysUser user) {
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
            @RequestParam(required = false) Integer departmentId,
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
            @RequestParam Integer departmentId,
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