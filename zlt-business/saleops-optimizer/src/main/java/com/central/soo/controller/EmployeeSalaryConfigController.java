package com.central.soo.controller;

import com.central.common.model.Result;
import com.central.common.model.PageResult;
import com.central.common.utils.PageResultUtil;
import com.central.soo.model.EmployeeSalaryConfig;
import com.central.soo.model.dto.EmployeeSalaryQueryDTO;
import com.central.soo.model.vo.EmployeeSalaryVO;
import com.central.soo.service.IEmployeeSalaryConfigService;
import com.central.soo.feign.EmployeeFeignClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/soo/employee-salary")
@Tag(name = "员工薪酬配置管理")
public class EmployeeSalaryConfigController {

    @Autowired
    private IEmployeeSalaryConfigService employeeSalaryConfigService;
    
    @Autowired
    private EmployeeFeignClient employeeFeignClient;

    @GetMapping("/page")
    @Operation(summary = "分页查询员工薪酬配置列表")
    public PageResult<EmployeeSalaryVO> pageEmployeeSalary(EmployeeSalaryQueryDTO query) {
        try {
            IPage<EmployeeSalaryVO> page = employeeSalaryConfigService.pageEmployeeSalary(query);
            return PageResultUtil.buildPageResult(page);
        } catch (Exception e) {
            PageResult<EmployeeSalaryVO> errorResult = new PageResult<>();
            errorResult.setResp_code(1);
            return errorResult;
        }
    }

    @GetMapping("/job-levels")
    @Operation(summary = "获取职级列表")
    public Result<List<Map<String, Object>>> getJobLevelList() {
        try {
            List<Map<String, Object>> jobLevels = employeeSalaryConfigService.getJobLevelList();
            return Result.succeed(jobLevels);
        } catch (Exception e) {
            return Result.failed("获取职级列表失败: " + e.getMessage());
        }
    }

    @GetMapping("/departments")
    @Operation(summary = "获取部门树")
    public Result<List<Map<String, Object>>> getDepartmentTree() {
        try {
            List<Map<String, Object>> departments = employeeSalaryConfigService.getDepartmentTree();
            return Result.succeed(departments);
        } catch (Exception e) {
            return Result.failed("获取部门树失败: " + e.getMessage());
        }
    }

    @GetMapping("/regions")
    @Operation(summary = "获取地区列表")
    public Result<List<Map<String, Object>>> getRegionList() {
        try {
            List<Map<String, Object>> regions = employeeSalaryConfigService.getRegionList();
            return Result.succeed(regions);
        } catch (Exception e) {
            return Result.failed("获取地区列表失败: " + e.getMessage());
        }
    }

    @PostMapping
    @Operation(summary = "新增员工薪酬配置")
    public Result<?> addEmployeeSalary(@RequestBody EmployeeSalaryConfig config) {
        try {
            // 校验唯一性
            boolean unique = employeeSalaryConfigService.checkUnique(config.getEmployeeId(), config.getEffectiveDate(), null);
            if (!unique) {
                return Result.failed("同一员工、生效日已存在配置");
            }

            // 通过employeeId查询员工信息获取positionId后进行工资范围校验
            Long positionId = getEmployeePositionId(config.getEmployeeId());
            if (positionId != null) {
                boolean inRange = employeeSalaryConfigService.validateSalaryRange(positionId, config.getBaseSalary());
                if (!inRange) {
                    return Result.failed("基础工资超出该岗位职级标准范围");
                }
            }

            boolean saved = employeeSalaryConfigService.saveEmployeeSalary(config);
            return saved ? Result.succeed("新增成功") : Result.failed("新增失败");
        } catch (Exception e) {
            return Result.failed("新增员工薪酬配置失败: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "更新员工薪酬配置")
    public Result<?> updateEmployeeSalary(@PathVariable Long id, @RequestBody EmployeeSalaryConfig config) {
        try {
            config.setId(id);
            
            // 校验唯一性
            boolean unique = employeeSalaryConfigService.checkUnique(config.getEmployeeId(), config.getEffectiveDate(), id);
            if (!unique) {
                return Result.failed("同一员工、生效日已存在配置");
            }

            // 通过employeeId查询员工信息获取positionId后进行工资范围校验
            Long positionId = getEmployeePositionId(config.getEmployeeId());
            if (positionId != null) {
                boolean inRange = employeeSalaryConfigService.validateSalaryRange(positionId, config.getBaseSalary());
                if (!inRange) {
                    return Result.failed("基础工资超出该岗位职级标准范围");
                }
            }

            boolean updated = employeeSalaryConfigService.updateEmployeeSalary(config);
            return updated ? Result.succeed("更新成功") : Result.failed("更新失败");
        } catch (Exception e) {
            return Result.failed("更新员工薪酬配置失败: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "删除员工薪酬配置")
    public Result<?> deleteEmployeeSalary(@PathVariable Long id) {
        try {
            boolean deleted = employeeSalaryConfigService.removeById(id);
            return deleted ? Result.succeed("删除成功") : Result.failed("删除失败");
        } catch (Exception e) {
            return Result.failed("删除员工薪酬配置失败: " + e.getMessage());
        }
    }

    @GetMapping("/history/{employeeId}")
    @Operation(summary = "查询员工薪酬历史")
    public Result<List<EmployeeSalaryConfig>> getEmployeeSalaryHistory(@PathVariable Long employeeId) {
        try {
            List<EmployeeSalaryConfig> history = employeeSalaryConfigService.getHistoryByEmployee(employeeId);
            return Result.succeed(history);
        } catch (Exception e) {
            return Result.failed("查询员工薪酬历史失败: " + e.getMessage());
        }
    }

    @PostMapping("/validate-salary-range")
    @Operation(summary = "校验工资范围")
    public Result<Boolean> validateSalaryRange(@RequestParam Long positionId, @RequestParam String baseSalary) {
        try {
            boolean inRange = employeeSalaryConfigService.validateSalaryRange(positionId, new java.math.BigDecimal(baseSalary));
            return Result.succeed(inRange);
        } catch (Exception e) {
            return Result.failed("校验工资范围失败: " + e.getMessage());
        }
    }

    // ==================== 保留原有接口 ====================

    @GetMapping
    @Operation(summary = "获取员工薪酬配置列表")
    public Result<List<EmployeeSalaryConfig>> list() {
        List<EmployeeSalaryConfig> list = employeeSalaryConfigService.list();
        return Result.succeed(list);
    }

    @PostMapping("/old")
    @Operation(summary = "新增员工薪酬配置(旧接口)")
    public Result<?> add(@RequestBody EmployeeSalaryConfig config) {
        boolean unique = employeeSalaryConfigService.checkUnique(config.getEmployeeId(), config.getEffectiveDate(), null);
        if (!unique) return Result.failed("同一员工、生效日已存在配置");
        boolean saved = employeeSalaryConfigService.save(config);
        return saved ? Result.succeed(null) : Result.failed(null);
    }

    @PutMapping("/old/{id}")
    @Operation(summary = "更新员工薪酬配置(旧接口)")
    public Result<?> update(@PathVariable Long id, @RequestBody EmployeeSalaryConfig config) {
        config.setId(id);
        boolean unique = employeeSalaryConfigService.checkUnique(config.getEmployeeId(), config.getEffectiveDate(), id);
        if (!unique) return Result.failed("同一员工、生效日已存在配置");
        boolean updated = employeeSalaryConfigService.updateById(config);
        return updated ? Result.succeed(null) : Result.failed(null);
    }

    @DeleteMapping("/old/{id}")
    @Operation(summary = "删除员工薪酬配置(旧接口)")
    public Result<?> delete(@PathVariable Long id) {
        boolean deleted = employeeSalaryConfigService.removeById(id);
        return deleted ? Result.succeed(null) : Result.failed(null);
    }
    
    /**
     * 通过员工ID获取岗位ID
     */
    private Long getEmployeePositionId(Long employeeId) {
        try {
            Result<Map<String, Object>> result = employeeFeignClient.getEmployeeById(employeeId);
            if (result != null && result.getDatas() != null) {
                Object positionId = result.getDatas().get("positionId");
                if (positionId instanceof Number) {
                    return ((Number) positionId).longValue();
                }
            }
        } catch (Exception e) {
            // 记录日志但不抛出异常
            e.printStackTrace();
        }
        return null;
    }
} 