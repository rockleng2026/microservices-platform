package com.central.organization.controller;

import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.organization.model.dto.WorkpositionQueryDTO;
import com.central.organization.model.dto.WorkpositionSaveDTO;
import com.central.organization.model.vo.WorkpositionVO;
import com.central.organization.service.IWorkpositionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * 岗位管理Controller
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/api/workposition")
@Tag(name = "岗位管理", description = "岗位管理相关API")
public class WorkpositionController {

    @Autowired
    private IWorkpositionService workpositionService;

    @Operation(summary = "分页查询岗位列表", description = "分页查询岗位列表")
    @GetMapping("/page")
    public Result<PageResult<WorkpositionVO>> queryPage(WorkpositionQueryDTO queryDTO) {
        log.info("分页查询岗位列表，参数：{}", queryDTO);
        try {
            PageResult<WorkpositionVO> result = workpositionService.queryPage(queryDTO);
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("分页查询岗位列表失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "根据ID查询岗位详情", description = "根据ID查询岗位详情")
    @GetMapping("/{id}")
    public Result<WorkpositionVO> getById(@Parameter(description = "岗位ID") @PathVariable String id) {
        log.info("查询岗位详情，ID：{}", id);
        try {
            Long workpositionId = Long.parseLong(id);
            WorkpositionVO result = workpositionService.getDetailById(workpositionId);
            if (result == null) {
                return Result.failed("岗位不存在");
            }
            return Result.succeed(result);
        } catch (NumberFormatException e) {
            log.error("岗位ID格式错误：{}", id);
            return Result.failed("岗位ID格式错误");
        } catch (Exception e) {
            log.error("查询岗位详情失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "新增岗位", description = "新增岗位")
    @PostMapping
    public Result<String> create(@Parameter(description = "岗位信息") @Valid @RequestBody WorkpositionSaveDTO saveDTO) {
        log.info("新增岗位，参数：{}", saveDTO);
        try {
            boolean success = workpositionService.saveWorkposition(saveDTO);
            if (success) {
                return Result.succeed("新增岗位成功");
            } else {
                return Result.failed("新增岗位失败");
            }
        } catch (Exception e) {
            log.error("新增岗位失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "更新岗位", description = "更新岗位")
    @PutMapping("/{id}")
    public Result<String> update(@Parameter(description = "岗位ID") @PathVariable String id,
                               @Parameter(description = "岗位信息") @Valid @RequestBody WorkpositionSaveDTO saveDTO) {
        log.info("更新岗位，ID：{}，参数：{}", id, saveDTO);
        try {
            Long workpositionId = Long.parseLong(id);
            saveDTO.setId(workpositionId);
            boolean success = workpositionService.saveWorkposition(saveDTO);
            if (success) {
                return Result.succeed("更新岗位成功");
            } else {
                return Result.failed("更新岗位失败");
            }
        } catch (NumberFormatException e) {
            log.error("岗位ID格式错误：{}", id);
            return Result.failed("岗位ID格式错误");
        } catch (Exception e) {
            log.error("更新岗位失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "删除岗位", description = "删除岗位")
    @DeleteMapping("/{id}")
    public Result<String> delete(@Parameter(description = "岗位ID") @PathVariable String id) {
        log.info("删除岗位，ID：{}", id);
        try {
            Long workpositionId = Long.parseLong(id);
            boolean success = workpositionService.deleteById(workpositionId);
            if (success) {
                return Result.succeed("删除岗位成功");
            } else {
                return Result.failed("删除岗位失败");
            }
        } catch (NumberFormatException e) {
            log.error("岗位ID格式错误：{}", id);
            return Result.failed("岗位ID格式错误");
        } catch (Exception e) {
            log.error("删除岗位失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "批量删除岗位", description = "批量删除岗位")
    @DeleteMapping("/batch")
    public Result<String> batchDelete(@Parameter(description = "岗位ID列表") @RequestBody List<String> ids) {
        log.info("批量删除岗位，ID列表：{}", ids);
        try {
            List<Long> workpositionIds = ids.stream()
                    .map(Long::parseLong)
                    .toList();
            boolean success = workpositionService.batchDelete(workpositionIds);
            if (success) {
                return Result.succeed("批量删除岗位成功");
            } else {
                return Result.failed("批量删除岗位失败");
            }
        } catch (NumberFormatException e) {
            log.error("岗位ID格式错误：{}", ids);
            return Result.failed("岗位ID格式错误");
        } catch (Exception e) {
            log.error("批量删除岗位失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "更新岗位状态", description = "更新岗位状态")
    @PutMapping("/status")
    public Result<String> updateStatus(@Parameter(description = "参数") @RequestBody Map<String, Object> params) {
        log.info("更新岗位状态，参数：{}", params);
        try {
            @SuppressWarnings("unchecked")
            List<String> ids = (List<String>) params.get("ids");
            Integer status = (Integer) params.get("status");
            
            List<Long> workpositionIds = ids.stream()
                    .map(Long::parseLong)
                    .toList();
                    
            boolean success = workpositionService.updateStatus(workpositionIds, status);
            if (success) {
                return Result.succeed("更新岗位状态成功");
            } else {
                return Result.failed("更新岗位状态失败");
            }
        } catch (Exception e) {
            log.error("更新岗位状态失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "根据部门ID查询岗位列表", description = "根据部门ID查询岗位列表")
    @GetMapping("/department/{departmentId}")
    public Result<List<WorkpositionVO>> getByDepartmentId(@Parameter(description = "部门ID") @PathVariable String departmentId) {
        log.info("根据部门ID查询岗位列表，部门ID：{}", departmentId);
        try {
            Long deptId = Long.parseLong(departmentId);
            List<WorkpositionVO> result = workpositionService.getByDepartmentId(deptId);
            return Result.succeed(result);
        } catch (NumberFormatException e) {
            log.error("部门ID格式错误：{}", departmentId);
            return Result.failed("部门ID格式错误");
        } catch (Exception e) {
            log.error("根据部门ID查询岗位列表失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "根据员工ID查询岗位列表", description = "根据员工ID查询岗位列表")
    @GetMapping("/employee/{employeeId}")
    public Result<List<WorkpositionVO>> getByEmployeeId(@Parameter(description = "员工ID") @PathVariable String employeeId) {
        log.info("根据员工ID查询岗位列表，员工ID：{}", employeeId);
        try {
            Long empId = Long.parseLong(employeeId);
            List<WorkpositionVO> result = workpositionService.getByEmployeeId(empId);
            return Result.succeed(result);
        } catch (NumberFormatException e) {
            log.error("员工ID格式错误：{}", employeeId);
            return Result.failed("员工ID格式错误");
        } catch (Exception e) {
            log.error("根据员工ID查询岗位列表失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "根据用户ID查询岗位列表", description = "根据用户ID查询岗位列表")
    @GetMapping("/user/{userId}")
    public Result<List<WorkpositionVO>> getByUserId(@Parameter(description = "用户ID") @PathVariable String userId) {
        log.info("根据用户ID查询岗位列表，用户ID：{}", userId);
        try {
            Long uid = Long.parseLong(userId);
            List<WorkpositionVO> result = workpositionService.getByUserId(uid);
            return Result.succeed(result);
        } catch (NumberFormatException e) {
            log.error("用户ID格式错误：{}", userId);
            return Result.failed("用户ID格式错误");
        } catch (Exception e) {
            log.error("根据用户ID查询岗位列表失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "查询管理岗位列表", description = "查询管理岗位列表")
    @GetMapping("/manager")
    public Result<List<WorkpositionVO>> getManagerPositions() {
        log.info("查询管理岗位列表");
        try {
            List<WorkpositionVO> result = workpositionService.getManagerPositions();
            return Result.succeed(result);
        } catch (Exception e) {
            log.error("查询管理岗位列表失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "检查岗位名称是否存在", description = "检查岗位名称是否存在")
    @GetMapping("/check-name")
    public Result<Boolean> checkNameExists(@RequestParam String name,
                                         @RequestParam String departmentId,
                                         @RequestParam(required = false) String excludeId) {
        log.info("检查岗位名称是否存在，name：{}，departmentId：{}，excludeId：{}", name, departmentId, excludeId);
        try {
            Long deptId = Long.parseLong(departmentId);
            Long excludeIdLong = excludeId != null ? Long.parseLong(excludeId) : null;
            boolean exists = workpositionService.checkNameExists(name, deptId, excludeIdLong);
            return Result.succeed(exists);
        } catch (NumberFormatException e) {
            log.error("ID格式错误");
            return Result.failed("ID格式错误");
        } catch (Exception e) {
            log.error("检查岗位名称是否存在失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "复制岗位", description = "复制岗位")
    @PostMapping("/copy")
    public Result<String> copyWorkposition(@RequestBody Map<String, Object> params) {
        log.info("复制岗位，参数：{}", params);
        try {
            String sourceId = (String) params.get("sourceId");
            String targetDepartmentId = (String) params.get("targetDepartmentId");
            String newName = (String) params.get("newName");
            
            Long sourceIdLong = Long.parseLong(sourceId);
            Long targetDeptId = Long.parseLong(targetDepartmentId);
            
            boolean success = workpositionService.copyWorkposition(sourceIdLong, targetDeptId, newName);
            if (success) {
                return Result.succeed("复制岗位成功");
            } else {
                return Result.failed("复制岗位失败");
            }
        } catch (Exception e) {
            log.error("复制岗位失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "配置岗位权限", description = "配置岗位权限")
    @PostMapping("/{id}/permissions")
    public Result<String> configPermissions(@Parameter(description = "岗位ID") @PathVariable String id,
                                           @RequestBody Map<String, Object> params) {
        log.info("配置岗位权限，岗位ID：{}，参数：{}", id, params);
        try {
            Long positionId = Long.parseLong(id);
            String menuIds = (String) params.get("menuIds");
            String menuFuncIds = (String) params.get("menuFuncIds");
            
            boolean success = workpositionService.configPermissions(positionId, menuIds, menuFuncIds);
            if (success) {
                return Result.succeed("配置岗位权限成功");
            } else {
                return Result.failed("配置岗位权限失败");
            }
        } catch (NumberFormatException e) {
            log.error("岗位ID格式错误：{}", id);
            return Result.failed("岗位ID格式错误");
        } catch (Exception e) {
            log.error("配置岗位权限失败", e);
            return Result.failed(e.getMessage());
        }
    }

    @Operation(summary = "获取岗位权限配置", description = "获取岗位权限配置")
    @GetMapping("/{id}/permissions")
    public Result<WorkpositionVO> getPermissionConfig(@Parameter(description = "岗位ID") @PathVariable String id) {
        log.info("获取岗位权限配置，岗位ID：{}", id);
        try {
            Long positionId = Long.parseLong(id);
            WorkpositionVO result = workpositionService.getPermissionConfig(positionId);
            if (result == null) {
                return Result.failed("岗位不存在");
            }
            return Result.succeed(result);
        } catch (NumberFormatException e) {
            log.error("岗位ID格式错误：{}", id);
            return Result.failed("岗位ID格式错误");
        } catch (Exception e) {
            log.error("获取岗位权限配置失败", e);
            return Result.failed(e.getMessage());
        }
    }
} 