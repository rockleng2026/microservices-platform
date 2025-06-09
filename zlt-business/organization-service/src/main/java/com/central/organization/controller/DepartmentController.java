package com.central.organization.controller;

import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.organization.dto.DepartmentStatisticsDTO;
import com.central.organization.dto.DepartmentTreeDTO;
import com.central.organization.model.Department;
import com.central.organization.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.util.List;

/**
 * 部门管理控制器
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/api/organization/departments")
@Tag(name = "部门管理", description = "部门管理相关接口")
@Validated
public class DepartmentController {

    @Autowired
    private DepartmentService departmentService;

    /**
     * 获取部门树形结构
     */
    @GetMapping("/tree")
    @Operation(summary = "获取部门树", description = "获取部门树形结构数据")
    @PreAuthorize("hasAuthority('organization:dept:view')")
    public Result<List<DepartmentTreeDTO>> getDepartmentTree(
            @Parameter(description = "父部门ID") @RequestParam(required = false) Integer parentId,
            @Parameter(description = "是否包含禁用部门") @RequestParam(defaultValue = "false") Boolean includeDisabled) {
        
        try {
            List<DepartmentTreeDTO> tree = departmentService.getDepartmentTree(parentId, includeDisabled);
            return Result.succeed(tree);
        } catch (Exception e) {
            log.error("获取部门树失败", e);
            return Result.failed("获取部门树失败：" + e.getMessage());
        }
    }

    /**
     * 分页查询部门
     */
    @GetMapping("/page")
    @Operation(summary = "分页查询部门", description = "分页查询部门列表")
    @PreAuthorize("hasAuthority('organization:dept:view')")
    public Result<PageResult<Department>> getDepartmentPage(
            @Parameter(description = "页码") @RequestParam(defaultValue = "1") Integer page,
            @Parameter(description = "页大小") @RequestParam(defaultValue = "20") Integer size,
            @Parameter(description = "关键词") @RequestParam(required = false) String keyword,
            @Parameter(description = "父部门ID") @RequestParam(required = false) Integer parentId,
            @Parameter(description = "部门等级") @RequestParam(required = false) Integer gradeId,
            @Parameter(description = "状态") @RequestParam(required = false) Integer status) {
        
        try {
            PageResult<Department> result = departmentService.getDepartmentPage(page, size, keyword, parentId, gradeId, status);
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("分页查询部门失败", e);
            return Result.failed("查询失败：" + e.getMessage());
        }
    }

    /**
     * 获取部门详情
     */
    @GetMapping("/{id}")
    @Operation(summary = "获取部门详情", description = "根据ID获取部门详细信息")
    @PreAuthorize("hasAuthority('organization:dept:view')")
    public Result<Department> getDepartmentDetail(
            @Parameter(description = "部门ID") @PathVariable Integer id) {
        
        try {
            Department department = departmentService.getDepartmentDetail(id);
            if (department == null) {
                return Result.failed("部门不存在");
            }
            return Result.succeed(department);
        } catch (Exception e) {
            log.error("获取部门详情失败，ID：{}", id, e);
            return Result.failed("获取部门详情失败：" + e.getMessage());
        }
    }

    /**
     * 创建部门
     */
    @PostMapping
    @Operation(summary = "创建部门", description = "新增部门信息")
    @PreAuthorize("hasAuthority('organization:dept:add')")
    public Result<Department> createDepartment(@Valid @RequestBody Department department) {
        try {
            return departmentService.createDepartment(department);
        } catch (Exception e) {
            log.error("创建部门失败", e);
            return Result.failed("创建部门失败：" + e.getMessage());
        }
    }

    /**
     * 更新部门
     */
    @PutMapping("/{id}")
    @Operation(summary = "更新部门", description = "更新部门信息")
    @PreAuthorize("hasAuthority('organization:dept:edit')")
    public Result<Department> updateDepartment(
            @Parameter(description = "部门ID") @PathVariable Integer id,
            @Valid @RequestBody Department department) {
        try {
            department.setId(id);
            return departmentService.updateDepartment(department);
        } catch (Exception e) {
            log.error("更新部门失败，ID：{}", id, e);
            return Result.failed("更新部门失败：" + e.getMessage());
        }
    }

    /**
     * 删除部门
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除部门", description = "软删除部门（包含子部门）")
    @PreAuthorize("hasAuthority('organization:dept:delete')")
    public Result<Void> deleteDepartment(@Parameter(description = "部门ID") @PathVariable Integer id) {
        try {
            return departmentService.deleteDepartment(id);
        } catch (Exception e) {
            log.error("删除部门失败，ID：{}", id, e);
            return Result.failed("删除部门失败：" + e.getMessage());
        }
    }

    /**
     * 批量删除部门
     */
    @DeleteMapping("/batch")
    @Operation(summary = "批量删除部门", description = "批量软删除部门")
    @PreAuthorize("hasAuthority('organization:dept:delete')")
    public Result<Void> deleteDepartments(@RequestBody List<Integer> ids) {
        try {
            return departmentService.deleteDepartments(ids);
        } catch (Exception e) {
            log.error("批量删除部门失败，IDs：{}", ids, e);
            return Result.failed("批量删除失败：" + e.getMessage());
        }
    }

    /**
     * 启用/禁用部门
     */
    @PutMapping("/{id}/status")
    @Operation(summary = "更新部门状态", description = "启用或禁用部门")
    @PreAuthorize("hasAuthority('organization:dept:edit')")
    public Result<Void> updateDepartmentStatus(
            @Parameter(description = "部门ID") @PathVariable Integer id,
            @Parameter(description = "状态") @RequestParam Integer status) {
        try {
            return departmentService.updateDepartmentStatus(id, status);
        } catch (Exception e) {
            log.error("更新部门状态失败，ID：{}，状态：{}", id, status, e);
            return Result.failed("更新状态失败：" + e.getMessage());
        }
    }

    /**
     * 移动部门
     */
    @PutMapping("/{id}/move")
    @Operation(summary = "移动部门", description = "移动部门到新的父部门下")
    @PreAuthorize("hasAuthority('organization:dept:edit')")
    public Result<Void> moveDepartment(
            @Parameter(description = "部门ID") @PathVariable Integer id,
            @Parameter(description = "新父部门ID") @RequestParam Integer newParentId) {
        try {
            return departmentService.moveDepartment(id, newParentId);
        } catch (Exception e) {
            log.error("移动部门失败，ID：{}，新父部门：{}", id, newParentId, e);
            return Result.failed("移动部门失败：" + e.getMessage());
        }
    }

    /**
     * 复制部门结构
     */
    @PostMapping("/{id}/copy")
    @Operation(summary = "复制部门结构", description = "复制部门结构到指定父部门下")
    @PreAuthorize("hasAuthority('organization:dept:add')")
    public Result<Department> copyDepartmentStructure(
            @Parameter(description = "源部门ID") @PathVariable Integer id,
            @Parameter(description = "目标父部门ID") @RequestParam Integer targetParentId,
            @Parameter(description = "是否包含员工") @RequestParam(defaultValue = "false") Boolean includeEmployees) {
        try {
            return departmentService.copyDepartmentStructure(id, targetParentId, includeEmployees);
        } catch (Exception e) {
            log.error("复制部门结构失败，源部门：{}，目标父部门：{}", id, targetParentId, e);
            return Result.failed("复制部门结构失败：" + e.getMessage());
        }
    }

    /**
     * 获取部门统计信息
     */
    @GetMapping("/{id}/statistics")
    @Operation(summary = "获取部门统计", description = "获取部门统计信息")
    @PreAuthorize("hasAuthority('organization:dept:view')")
    public Result<DepartmentStatisticsDTO> getDepartmentStatistics(@Parameter(description = "部门ID") @PathVariable Integer id) {
        try {
            DepartmentStatisticsDTO statistics = departmentService.getDepartmentStatistics(id);
            return Result.succeed(statistics);
        } catch (Exception e) {
            log.error("获取部门统计失败，ID：{}", id, e);
            return Result.failed("获取统计信息失败：" + e.getMessage());
        }
    }

    /**
     * 获取部门路径
     */
    @GetMapping("/{id}/path")
    @Operation(summary = "获取部门路径", description = "获取从根部门到当前部门的路径")
    @PreAuthorize("hasAuthority('organization:dept:view')")
    public Result<String> getDepartmentPath(@Parameter(description = "部门ID") @PathVariable Integer id) {
        try {
            String path = departmentService.getDepartmentPath(id);
            return Result.succeed(path);
        } catch (Exception e) {
            log.error("获取部门路径失败，ID：{}", id, e);
            return Result.failed("获取部门路径失败：" + e.getMessage());
        }
    }

    /**
     * 获取用户可管理的部门
     */
    @GetMapping("/manageable")
    @Operation(summary = "获取可管理部门", description = "获取当前用户可管理的部门列表")
    @PreAuthorize("hasAuthority('organization:dept:view')")
    public Result<List<Department>> getUserManageableDepartments() {
        try {
            // TODO: 从安全上下文获取当前用户ID
            Integer userId = 1;
            List<Department> departments = departmentService.getUserManageableDepartments(userId);
            return Result.succeed(departments);
        } catch (Exception e) {
            log.error("获取可管理部门失败", e);
            return Result.failed("获取可管理部门失败：" + e.getMessage());
        }
    }

    /**
     * 检查部门编号可用性
     */
    @GetMapping("/check-depno")
    @Operation(summary = "检查部门编号", description = "检查部门编号是否可用")
    @PreAuthorize("hasAuthority('organization:dept:view')")
    public Result<Boolean> checkDepartmentNoAvailable(
            @Parameter(description = "部门编号") @RequestParam String depNo,
            @Parameter(description = "排除的部门ID") @RequestParam(required = false) Integer excludeId) {
        try {
            Boolean available = departmentService.isDepartmentNoAvailable(depNo, excludeId);
            return Result.succeed(available);
        } catch (Exception e) {
            log.error("检查部门编号失败，编号：{}", depNo, e);
            return Result.failed("检查失败：" + e.getMessage());
        }
    }

    /**
     * 批量导入部门
     */
    @PostMapping("/import")
    @Operation(summary = "批量导入部门", description = "通过Excel文件批量导入部门")
    @PreAuthorize("hasAuthority('organization:dept:add')")
    public Result<String> importDepartments(@RequestParam("file") MultipartFile file) {
        try {
            return departmentService.importDepartments(file);
        } catch (Exception e) {
            log.error("导入部门失败", e);
            return Result.failed("导入失败：" + e.getMessage());
        }
    }

    /**
     * 导出部门数据
     */
    @GetMapping("/export")
    @Operation(summary = "导出部门数据", description = "导出部门数据到Excel文件")
    @PreAuthorize("hasAuthority('organization:dept:view')")
    public Result<String> exportDepartments(
            @Parameter(description = "父部门ID") @RequestParam(required = false) Integer parentId) {
        try {
            return departmentService.exportDepartments(parentId);
        } catch (Exception e) {
            log.error("导出部门数据失败", e);
            return Result.failed("导出失败：" + e.getMessage());
        }
    }

    /**
     * 验证部门层级
     */
    @GetMapping("/validate-level")
    @Operation(summary = "验证部门层级", description = "验证部门层级设置是否合规")
    @PreAuthorize("hasAuthority('organization:dept:view')")
    public Result<Boolean> validateDepartmentLevel(
            @Parameter(description = "父部门ID") @RequestParam(required = false) Integer parentId,
            @Parameter(description = "部门等级") @RequestParam Integer gradeId) {
        try {
            Boolean valid = departmentService.validateDepartmentLevel(parentId, gradeId);
            return Result.succeed(valid);
        } catch (Exception e) {
            log.error("验证部门层级失败，父部门：{}，等级：{}", parentId, gradeId, e);
            return Result.failed("验证失败：" + e.getMessage());
        }
    }
} 