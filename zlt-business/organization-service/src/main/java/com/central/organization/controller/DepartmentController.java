package com.central.organization.controller;

import com.central.common.model.Result;
import com.central.organization.model.Department;
import com.central.organization.model.dto.DepartmentQueryDTO;
import com.central.organization.model.dto.DepartmentSaveDTO;
import com.central.organization.model.vo.DepartmentTreeVO;
import com.central.organization.service.IDepartmentService;
import com.central.organization.utils.IdUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * 部门管理Controller
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/api/organization/departments")
@Tag(name = "部门管理", description = "部门管理相关API")
@Validated
public class DepartmentController {
    
    @Autowired
    private IDepartmentService departmentService;
    
    @Operation(summary = "获取部门树形结构", description = "获取完整的部门树形结构")
    @GetMapping("/tree")
    public Result<List<DepartmentTreeVO>> getDepartmentTree(DepartmentQueryDTO query) {
        try {
            List<DepartmentTreeVO> tree = departmentService.getDepartmentTree(query);
            return Result.succeed(tree);
        } catch (Exception e) {
            log.error("获取部门树失败", e);
            return Result.failed("获取部门树失败：" + e.getMessage());
        }
    }
    
    @Operation(summary = "获取子部门树", description = "根据父部门ID获取子部门树形结构")
    @GetMapping("/{parentId}/children")
    public Result<List<DepartmentTreeVO>> getChildDepartmentTree(
            @Parameter(description = "父部门ID") @PathVariable String parentId,
            @Parameter(description = "是否包含禁用的部门") @RequestParam(defaultValue = "false") Boolean includeDisabled) {
        try {
            Long parentIdLong = IdUtils.toIdLong(parentId);
            List<DepartmentTreeVO> children = departmentService.getChildDepartmentTree(parentIdLong, includeDisabled);
            return Result.succeed(children);
        } catch (Exception e) {
            log.error("获取子部门树失败", e);
            return Result.failed("获取子部门树失败：" + e.getMessage());
        }
    }
    
    @Operation(summary = "保存部门", description = "新增或修改部门信息")
    @PostMapping("/save")
    public Result<Department> saveDepartment(@Valid @RequestBody DepartmentSaveDTO saveDTO) {
        try {
            // 记录请求信息
            log.info("接收到部门保存请求 - 操作类型: {}, ID: {}, 部门名称: {}, 部门编号: {}", 
                     saveDTO.getOperationType(), saveDTO.getId(), saveDTO.getName(), saveDTO.getDepNo());
            
            // 处理ID转换
            if (saveDTO.getId() != null) {
                saveDTO.setId(IdUtils.toIdLong(IdUtils.toIdString(saveDTO.getId())));
            }
            if (saveDTO.getParentId() != null) {
                saveDTO.setParentId(IdUtils.toIdLong(IdUtils.toIdString(saveDTO.getParentId())));
            }
            if (saveDTO.getDirectorId() != null) {
                saveDTO.setDirectorId(IdUtils.toIdLong(IdUtils.toIdString(saveDTO.getDirectorId())));
            }
            
            Department department = departmentService.saveDepartment(saveDTO);
            
            log.info("部门保存成功 - ID: {}, 名称: {}", department.getId(), department.getName());
            return Result.succeed(department);
        } catch (Exception e) {
            log.error("保存部门失败 - 操作类型: {}, ID: {}, 错误: {}", 
                      saveDTO.getOperationType(), saveDTO.getId(), e.getMessage(), e);
            return Result.failed("保存部门失败：" + e.getMessage());
        }
    }
    
    @Operation(summary = "获取部门详情", description = "根据ID获取部门详细信息")
    @GetMapping("/{id}")
    public Result<Department> getDepartmentById(
            @Parameter(description = "部门ID") @PathVariable String id) {
        try {
            Long idLong = IdUtils.toIdLong(id);
            Department department = departmentService.getDepartmentById(idLong);
            if (department == null) {
                return Result.failed("部门不存在");
            }
            return Result.succeed(department);
        } catch (Exception e) {
            log.error("获取部门详情失败", e);
            return Result.failed("获取部门详情失败：" + e.getMessage());
        }
    }
    
    @Operation(summary = "删除部门", description = "软删除指定部门")
    @DeleteMapping("/{id}")
    public Result<Boolean> deleteDepartment(
            @Parameter(description = "部门ID") @PathVariable String id) {
        try {
            Long idLong = IdUtils.toIdLong(id);
            Boolean success = departmentService.deleteDepartment(idLong);
            return Result.succeed(success);
        } catch (Exception e) {
            log.error("删除部门失败", e);
            return Result.failed("删除部门失败：" + e.getMessage());
        }
    }
    
    @Operation(summary = "批量删除部门", description = "批量软删除部门")
    @DeleteMapping("/batch")
    public Result<Boolean> batchDeleteDepartments(@RequestBody List<String> ids) {
        try {
            List<Long> idLongs = ids.stream()
                    .map(IdUtils::toIdLong)
                    .collect(java.util.stream.Collectors.toList());
            Boolean success = departmentService.batchDeleteDepartments(idLongs);
            return Result.succeed(success);
        } catch (Exception e) {
            log.error("批量删除部门失败", e);
            return Result.failed("批量删除部门失败：" + e.getMessage());
        }
    }
    
    @Operation(summary = "更新部门状态", description = "启用或禁用部门")
    @PutMapping("/{id}/status")
    public Result<Boolean> updateDepartmentStatus(
            @Parameter(description = "部门ID") @PathVariable String id,
            @Parameter(description = "状态(1启用,0禁用)") @RequestParam Integer status) {
        try {
            Long idLong = IdUtils.toIdLong(id);
            Boolean success = departmentService.updateDepartmentStatus(idLong, status);
            return Result.succeed(success);
        } catch (Exception e) {
            log.error("更新部门状态失败", e);
            return Result.failed("更新部门状态失败：" + e.getMessage());
        }
    }
    
    @Operation(summary = "移动部门", description = "修改部门的父部门")
    @PutMapping("/{id}/move")
    public Result<Boolean> moveDepartment(
            @Parameter(description = "部门ID") @PathVariable String id,
            @Parameter(description = "新的父部门ID") @RequestParam String newParentId) {
        try {
            Long idLong = IdUtils.toIdLong(id);
            Long newParentIdLong = IdUtils.toIdLong(newParentId);
            Boolean success = departmentService.moveDepartment(idLong, newParentIdLong);
            return Result.succeed(success);
        } catch (Exception e) {
            log.error("移动部门失败", e);
            return Result.failed("移动部门失败：" + e.getMessage());
        }
    }
    
    @Operation(summary = "复制部门结构", description = "复制部门及其子部门结构")
    @PostMapping("/{id}/copy")
    public Result<Boolean> copyDepartmentStructure(
            @Parameter(description = "源部门ID") @PathVariable String id,
            @Parameter(description = "目标父部门ID") @RequestParam String targetParentId) {
        try {
            Long idLong = IdUtils.toIdLong(id);
            Long targetParentIdLong = IdUtils.toIdLong(targetParentId);
            Boolean success = departmentService.copyDepartmentStructure(idLong, targetParentIdLong);
            return Result.succeed(success);
        } catch (Exception e) {
            log.error("复制部门结构失败", e);
            return Result.failed("复制部门结构失败：" + e.getMessage());
        }
    }
    
    @Operation(summary = "排序部门", description = "对同级部门进行排序")
    @PutMapping("/sort")
    public Result<Boolean> sortDepartments(@RequestBody List<String> departmentIds) {
        try {
            List<Long> idLongs = departmentIds.stream()
                    .map(IdUtils::toIdLong)
                    .collect(java.util.stream.Collectors.toList());
            Boolean success = departmentService.sortDepartments(idLongs);
            return Result.succeed(success);
        } catch (Exception e) {
            log.error("排序部门失败", e);
            return Result.failed("排序部门失败：" + e.getMessage());
        }
    }
    
    @Operation(summary = "检查部门编号", description = "检查部门编号是否已存在")
    @GetMapping("/check-depno")
    public Result<Boolean> checkDepNo(
            @Parameter(description = "部门编号") @RequestParam String depNo,
            @Parameter(description = "排除的部门ID") @RequestParam(required = false) String excludeId) {
        try {
            Long excludeIdLong = excludeId != null ? IdUtils.toIdLong(excludeId) : null;
            Boolean exists = departmentService.existsByDepNo(depNo, excludeIdLong);
            return Result.succeed(!exists); // 返回是否可用（即不存在）
        } catch (Exception e) {
            log.error("检查部门编号失败", e);
            return Result.failed("检查部门编号失败：" + e.getMessage());
        }
    }
    
    @Operation(summary = "检查部门名称", description = "检查同级部门中名称是否已存在")
    @GetMapping("/check-name")
    public Result<Boolean> checkDepartmentName(
            @Parameter(description = "部门名称") @RequestParam String name,
            @Parameter(description = "父部门ID") @RequestParam String parentId,
            @Parameter(description = "排除的部门ID") @RequestParam(required = false) String excludeId) {
        try {
            Long parentIdLong = IdUtils.toIdLong(parentId);
            Long excludeIdLong = excludeId != null ? IdUtils.toIdLong(excludeId) : null;
            Boolean exists = departmentService.existsByNameAndParentId(name, parentIdLong, excludeIdLong);
            return Result.succeed(!exists); // 返回是否可用（即不存在）
        } catch (Exception e) {
            log.error("检查部门名称失败", e);
            return Result.failed("检查部门名称失败：" + e.getMessage());
        }
    }
    
    @Operation(summary = "获取部门路径", description = "获取从根部门到指定部门的完整路径")
    @GetMapping("/{id}/path")
    public Result<String> getDepartmentPath(
            @Parameter(description = "部门ID") @PathVariable String id) {
        try {
            Long idLong = IdUtils.toIdLong(id);
            String path = departmentService.getDepartmentPath(idLong);
            return Result.succeed(path);
        } catch (Exception e) {
            log.error("获取部门路径失败", e);
            return Result.failed("获取部门路径失败：" + e.getMessage());
        }
    }
    
    @Operation(summary = "获取部门员工数", description = "统计部门下的员工数量")
    @GetMapping("/{id}/employee-count")
    public Result<Integer> getEmployeeCount(
            @Parameter(description = "部门ID") @PathVariable String id,
            @Parameter(description = "是否包含子部门") @RequestParam(defaultValue = "false") Boolean includeChildren) {
        try {
            Long idLong = IdUtils.toIdLong(id);
            Integer count = departmentService.countEmployeesByDepartment(idLong, includeChildren);
            return Result.succeed(count);
        } catch (Exception e) {
            log.error("获取部门员工数失败", e);
            return Result.failed("获取部门员工数失败：" + e.getMessage());
        }
    }
    
    @Operation(summary = "获取部门层级", description = "获取部门在组织架构中的层级深度")
    @GetMapping("/{id}/level")
    public Result<Integer> getDepartmentLevel(
            @Parameter(description = "部门ID") @PathVariable String id) {
        try {
            Long idLong = IdUtils.toIdLong(id);
            Integer level = departmentService.getDepartmentLevel(idLong);
            return Result.succeed(level);
        } catch (Exception e) {
            log.error("获取部门层级失败", e);
            return Result.failed("获取部门层级失败：" + e.getMessage());
        }
    }
    
    @Operation(summary = "批量导入部门", description = "通过Excel文件批量导入部门数据")
    @PostMapping("/import")
    public Result<Map<String, Object>> importDepartments(
            @Parameter(description = "Excel文件") @RequestParam("file") MultipartFile file) {
        try {
            // TODO: 实现导入功能
            Map<String, Object> result = Map.of(
                    "success", true,
                    "message", "导入功能开发中",
                    "total", 0,
                    "successCount", 0,
                    "failCount", 0
            );
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("导入部门失败", e);
            return Result.failed("导入部门失败：" + e.getMessage());
        }
    }
    
    @Operation(summary = "导出部门数据", description = "导出部门数据到Excel文件")
    @GetMapping("/export")
    public Result<String> exportDepartments(DepartmentQueryDTO query) {
        try {
            // TODO: 实现导出功能
            return Result.succeed("导出功能开发中");
        } catch (Exception e) {
            log.error("导出部门失败", e);
            return Result.failed("导出部门失败：" + e.getMessage());
        }
    }
    
    @Operation(summary = "获取可管理的部门", description = "获取当前用户可管理的部门列表")
    @GetMapping("/manageable")
    public Result<List<DepartmentTreeVO>> getUserManageableDepartments() {
        try {
            // TODO: 根据用户权限返回可管理的部门
            DepartmentQueryDTO query = new DepartmentQueryDTO();
            List<DepartmentTreeVO> tree = departmentService.getDepartmentTree(query);
            return Result.succeed(tree);
        } catch (Exception e) {
            log.error("获取可管理部门失败", e);
            return Result.failed("获取可管理部门失败：" + e.getMessage());
        }
    }
    
    @Operation(summary = "验证部门级别", description = "验证部门级别设置是否合理")
    @GetMapping("/validate-level")
    public Result<Boolean> validateDepartmentLevel(
            @Parameter(description = "父部门ID") @RequestParam(required = false) String parentId,
            @Parameter(description = "部门等级") @RequestParam(required = false) Integer gradeId) {
        try {
            // TODO: 实现级别验证逻辑
            return Result.succeed(true);
        } catch (Exception e) {
            log.error("验证部门级别失败", e);
            return Result.failed("验证部门级别失败：" + e.getMessage());
        }
    }
} 