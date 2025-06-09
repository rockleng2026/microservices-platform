package com.central.organization.controller;

import com.central.organization.service.EmployeeService;
import com.central.organization.model.Employee;
import com.central.organization.dto.EmployeeDetailDTO;
import com.central.organization.dto.EmployeeSearchDTO;
import com.central.common.annotation.LoginUser;
import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.common.model.SysUser;
import com.central.organization.dto.EmployeeStatisticsDTO;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 员工管理控制器
 * 
 * @author Portal Team
 * @since 2024-01-01
 */
@Slf4j
@RestController
@RequestMapping("/api/organization/employees")
@Tag(name = "员工管理", description = "员工信息的增删改查、生命周期管理等功能")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    /**
     * 分页查询员工
     */
    @GetMapping("/page")
    @Operation(summary = "分页查询员工", description = "支持多条件搜索的员工分页查询")
    @PreAuthorize("hasAuthority('organization:emp:view')")
    public Result<PageResult<Employee>> getEmployeePage(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long positionId,
            @RequestParam(required = false) Integer employmentStatus,
            @RequestParam(required = false) Integer employmentType,
            @RequestParam(required = false) String entryDateStart,
            @RequestParam(required = false) String entryDateEnd,
            @LoginUser SysUser user) {
        
        try {
            EmployeeSearchDTO searchDTO = new EmployeeSearchDTO()
                .setKeyword(keyword)
                .setDepartmentId(departmentId)
                .setPositionId(positionId)
                .setEmploymentStatus(employmentStatus)
                .setEmploymentType(employmentType)
                .setEntryDateStart(entryDateStart)
                .setEntryDateEnd(entryDateEnd);
                
            PageResult<Employee> result = employeeService.getEmployeePage(pageNum, pageSize, searchDTO, user.getTenantId());
            return Result.success(result);
        } catch (Exception e) {
            log.error("分页查询员工失败", e);
            return Result.failed("查询失败：" + e.getMessage());
        }
    }

    /**
     * 获取员工详情
     */
    @GetMapping("/{id}/detail")
    @Operation(summary = "获取员工详情", description = "获取员工完整信息，包括基础信息、部门岗位、扩展数据等")
    @PreAuthorize("hasAuthority('organization:emp:view')")
    public Result<EmployeeDetailDTO> getEmployeeDetail(@PathVariable Long id, @LoginUser SysUser user) {
        try {
            EmployeeDetailDTO detail = employeeService.getEmployeeDetailById(id, user.getTenantId());
            if (detail == null) {
                return Result.failed("员工不存在");
            }
            return Result.success(detail);
        } catch (Exception e) {
            log.error("获取员工详情失败: {}", id, e);
            return Result.failed("获取详情失败：" + e.getMessage());
        }
    }

    /**
     * 保存员工
     */
    @PostMapping("/save")
    @Operation(summary = "保存员工", description = "新增或更新员工信息")
    @PreAuthorize("hasAuthority('organization:emp:add') or hasAuthority('organization:emp:edit')")
    public Result<Employee> saveEmployee(@RequestBody @Valid Employee employee, @LoginUser SysUser user) {
        try {
            // 设置租户ID
            employee.setTenantId(user.getTenantId());
            
            // 设置创建/更新人
            if (employee.getId() == null) {
                employee.setCreatedBy(user.getId());
            } else {
                employee.setUpdatedBy(user.getId());
            }
            
            return employeeService.saveEmployee(employee);
        } catch (Exception e) {
            log.error("保存员工失败", e);
            return Result.failed("保存失败：" + e.getMessage());
        }
    }

    /**
     * 员工入职
     */
    @PostMapping("/entry")
    @Operation(summary = "员工入职", description = "办理员工入职手续，自动生成员工编号")
    @PreAuthorize("hasAuthority('organization:emp:entry')")
    public Result<Employee> employeeEntry(@RequestBody @Valid Employee employee, @LoginUser SysUser user) {
        try {
            employee.setTenantId(user.getTenantId());
            employee.setCreatedBy(user.getId());
            return employeeService.employeeEntry(employee);
        } catch (Exception e) {
            log.error("员工入职失败", e);
            return Result.failed("入职失败：" + e.getMessage());
        }
    }

    /**
     * 员工调部门
     */
    @PostMapping("/{id}/transfer")
    @Operation(summary = "员工调部门", description = "调整员工部门和岗位")
    @PreAuthorize("hasAuthority('organization:emp:transfer')")
    public Result<Void> transferEmployee(
            @PathVariable Long id,
            @RequestParam Long newDepartmentId,
            @RequestParam Long newPositionId,
            @RequestParam String effectiveDate,
            @RequestParam(required = false) String reason,
            @LoginUser SysUser user) {
        
        try {
            return employeeService.transferEmployee(id, newDepartmentId, newPositionId, effectiveDate, user.getTenantId());
        } catch (Exception e) {
            log.error("员工调部门失败: {}", id, e);
            return Result.failed("调部门失败：" + e.getMessage());
        }
    }

    /**
     * 员工离职
     */
    @PostMapping("/{id}/leave")
    @Operation(summary = "员工离职", description = "办理员工离职手续")
    @PreAuthorize("hasAuthority('organization:emp:leave')")
    public Result<Void> employeeLeave(
            @PathVariable Long id,
            @RequestParam String leaveDate,
            @RequestParam String leaveReason,
            @LoginUser SysUser user) {
        
        try {
            return employeeService.employeeLeave(id, leaveDate, leaveReason, user.getTenantId());
        } catch (Exception e) {
            log.error("员工离职失败: {}", id, e);
            return Result.failed("离职失败：" + e.getMessage());
        }
    }

    /**
     * 员工试用期转正
     */
    @PostMapping("/{id}/conversion")
    @Operation(summary = "员工转正", description = "试用期员工转正")
    @PreAuthorize("hasAuthority('organization:emp:conversion')")
    public Result<Void> employeeConversion(
            @PathVariable Long id,
            @RequestParam String conversionDate,
            @LoginUser SysUser user) {
        
        try {
            return employeeService.employeeConversion(id, conversionDate, user.getTenantId());
        } catch (Exception e) {
            log.error("员工转正失败: {}", id, e);
            return Result.failed("转正失败：" + e.getMessage());
        }
    }

    /**
     * 删除员工
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "删除员工", description = "删除员工信息（软删除）")
    @PreAuthorize("hasAuthority('organization:emp:delete')")
    public Result<Void> deleteEmployee(@PathVariable Long id, @LoginUser SysUser user) {
        try {
            return employeeService.deleteEmployee(id, user.getTenantId());
        } catch (Exception e) {
            log.error("删除员工失败: {}", id, e);
            return Result.failed("删除失败：" + e.getMessage());
        }
    }

    /**
     * 批量删除员工
     */
    @DeleteMapping("/batch")
    @Operation(summary = "批量删除员工", description = "批量删除员工信息")
    @PreAuthorize("hasAuthority('organization:emp:delete')")
    public Result<Void> batchDeleteEmployees(@RequestBody List<Long> ids, @LoginUser SysUser user) {
        try {
            return employeeService.batchDeleteEmployees(ids, user.getTenantId());
        } catch (Exception e) {
            log.error("批量删除员工失败", e);
            return Result.failed("批量删除失败：" + e.getMessage());
        }
    }

    /**
     * 根据部门获取员工列表
     */
    @GetMapping("/department/{departmentId}")
    @Operation(summary = "部门员工列表", description = "获取指定部门的员工列表")
    @PreAuthorize("hasAuthority('organization:emp:view')")
    public Result<List<Employee>> getEmployeesByDepartment(
            @PathVariable Long departmentId,
            @RequestParam(defaultValue = "false") boolean includeSubDepts,
            @LoginUser SysUser user) {
        
        try {
            List<Employee> employees = employeeService.getEmployeesByDepartment(departmentId, includeSubDepts, user.getTenantId());
            return Result.success(employees);
        } catch (Exception e) {
            log.error("获取部门员工失败: {}", departmentId, e);
            return Result.failed("获取员工列表失败：" + e.getMessage());
        }
    }

    /**
     * 检查员工编号是否存在
     */
    @GetMapping("/check-empno")
    @Operation(summary = "检查员工编号", description = "检查员工编号是否已存在")
    @PreAuthorize("hasAuthority('organization:emp:view')")
    public Result<Boolean> checkEmpNoExists(
            @RequestParam String empNo,
            @RequestParam(required = false) Long excludeId,
            @LoginUser SysUser user) {
        
        try {
            boolean exists = employeeService.checkEmpNoExists(empNo, excludeId, user.getTenantId());
            return Result.success(exists);
        } catch (Exception e) {
            log.error("检查员工编号失败: {}", empNo, e);
            return Result.failed("检查失败：" + e.getMessage());
        }
    }

    /**
     * 生成员工编号
     */
    @GetMapping("/generate-empno")
    @Operation(summary = "生成员工编号", description = "根据部门自动生成员工编号")
    @PreAuthorize("hasAuthority('organization:emp:add')")
    public Result<String> generateEmpNo(@RequestParam Long departmentId, @LoginUser SysUser user) {
        try {
            String empNo = employeeService.generateEmpNo(departmentId, user.getTenantId());
            return Result.success(empNo);
        } catch (Exception e) {
            log.error("生成员工编号失败: {}", departmentId, e);
            return Result.failed("生成编号失败：" + e.getMessage());
        }
    }

    /**
     * 获取员工统计信息
     */
    @GetMapping("/statistics")
    @Operation(summary = "员工统计", description = "获取员工统计信息")
    @PreAuthorize("hasAuthority('organization:emp:statistics')")
    public Result<Map<String, Object>> getEmployeeStatistics(
            @RequestParam(required = false) Long departmentId,
            @LoginUser SysUser user) {
        
        try {
            Map<String, Object> statistics = employeeService.getEmployeeStatistics(departmentId, user.getTenantId());
            return Result.success(statistics);
        } catch (Exception e) {
            log.error("获取员工统计失败", e);
            return Result.failed("获取统计失败：" + e.getMessage());
        }
    }

    /**
     * 更新员工头像
     */
    @PostMapping("/{id}/avatar")
    @Operation(summary = "更新头像", description = "更新员工头像")
    @PreAuthorize("hasAuthority('organization:emp:edit')")
    public Result<Void> updateEmployeeAvatar(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @LoginUser SysUser user) {
        
        try {
            // TODO: 上传文件到文件服务，获取URL
            String avatarUrl = ""; // 上传后返回的URL
            return employeeService.updateEmployeeAvatar(id, avatarUrl, user.getTenantId());
        } catch (Exception e) {
            log.error("更新员工头像失败: {}", id, e);
            return Result.failed("更新头像失败：" + e.getMessage());
        }
    }

    /**
     * 我的团队
     */
    @GetMapping("/my-team")
    @Operation(summary = "我的团队", description = "获取当前用户管理的团队成员")
    @PreAuthorize("hasAuthority('organization:emp:team')")
    public Result<List<Employee>> getMyTeam(@LoginUser SysUser user) {
        try {
            // TODO: 根据user获取对应的员工ID
            Long managerId = user.getId();
            List<Employee> team = employeeService.getMyTeam(managerId, user.getTenantId());
            return Result.success(team);
        } catch (Exception e) {
            log.error("获取我的团队失败", e);
            return Result.failed("获取团队失败：" + e.getMessage());
        }
    }

    /**
     * 组织架构图
     */
    @GetMapping("/org-chart")
    @Operation(summary = "组织架构图", description = "获取组织架构图数据")
    @PreAuthorize("hasAuthority('organization:emp:view')")
    public Result<Map<String, Object>> getOrganizationChart(
            @RequestParam(required = false) Long rootDepartmentId,
            @LoginUser SysUser user) {
        
        try {
            Map<String, Object> chartData = employeeService.getOrganizationChart(rootDepartmentId, user.getTenantId());
            return Result.success(chartData);
        } catch (Exception e) {
            log.error("获取组织架构图失败", e);
            return Result.failed("获取架构图失败：" + e.getMessage());
        }
    }

    /**
     * 导入员工
     */
    @PostMapping("/import")
    @Operation(summary = "导入员工", description = "批量导入员工数据")
    @PreAuthorize("hasAuthority('organization:emp:import')")
    public Result<Map<String, Object>> importEmployees(
            @RequestParam("file") MultipartFile file,
            @LoginUser SysUser user) {
        
        try {
            // TODO: 解析Excel文件，转换为Employee列表
            List<Employee> employees = null;
            return employeeService.importEmployees(employees, user.getTenantId());
        } catch (Exception e) {
            log.error("导入员工失败", e);
            return Result.failed("导入失败：" + e.getMessage());
        }
    }

    /**
     * 导出员工
     */
    @PostMapping("/export")
    @Operation(summary = "导出员工", description = "导出员工数据到Excel")
    @PreAuthorize("hasAuthority('organization:emp:export')")
    public Result<String> exportEmployees(@RequestBody EmployeeSearchDTO searchDTO, @LoginUser SysUser user) {
        try {
            List<Employee> employees = employeeService.exportEmployees(searchDTO, user.getTenantId());
            // TODO: 生成Excel文件，返回下载链接
            String downloadUrl = "";
            return Result.success(downloadUrl);
        } catch (Exception e) {
            log.error("导出员工失败", e);
            return Result.failed("导出失败：" + e.getMessage());
        }
    }
} 