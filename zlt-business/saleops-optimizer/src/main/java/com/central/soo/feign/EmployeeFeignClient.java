package com.central.soo.feign;

import com.central.common.constant.ServiceNameConstants;
import com.central.common.model.Result;
import com.central.common.model.PageResult;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 员工服务Feign客户端
 *
 * @author Portal Team
 * @since 2024-12-19
 */
@FeignClient(name = ServiceNameConstants.ORGANIZATION_SERVICE, dismiss404 = true)
public interface EmployeeFeignClient {

    /**
     * 分页查询员工列表
     *
     * @param pageNum  页码
     * @param pageSize 页大小
     * @param name     员工姓名
     * @param empNo    员工编号
     * @param departmentId 部门ID
     * @param status   员工状态
     * @return 员工分页列表
     */
    @GetMapping("/api/organization/employee/page")
    Result<PageResult<Map<String, Object>>> getEmployeePage(
            @RequestParam(value = "page", defaultValue = "1") Integer pageNum,
            @RequestParam(value = "size", defaultValue = "20") Integer pageSize,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "empNo", required = false) String empNo,
            @RequestParam(value = "departmentId", required = false) Long departmentId,
            @RequestParam(value = "status", required = false) Integer status);
    /**
     * 根据部门ID查询员工列表
     *
     * @param departmentId 部门ID
     * @param includeSubDept 是否包含子部门
     * @return 员工列表
     */
    @GetMapping("/api/organization/employee/department/{departmentId}")
    Result<List<Map<String, Object>>> getEmployeesByDepartment(
            @PathVariable("departmentId") Long departmentId,
            @RequestParam(value = "includeSubDept", defaultValue = "false") Boolean includeSubDept);

    /**
     * 根据员工ID查询员工详情
     *
     * @param employeeId 员工ID
     * @return 员工详情
     */
    @GetMapping("/api/organization/employee/{employeeId}")
    Result<Map<String, Object>> getEmployeeById(@PathVariable("employeeId") Long employeeId);
    
    /**
     * 批量查询员工详情
     *
     * @param employeeIds 员工ID列表
     * @return 员工详情列表
     */
    @PostMapping("/api/organization/employee/batch-detail")
    Result<List<Map<String, Object>>> getEmployeeBatchDetail(@RequestBody List<Long> employeeIds);

    /**
     * 获取部门树
     *
     * @return 部门树结构
     */
    @GetMapping("/api/organization/departments/tree")
    Result<List<Map<String, Object>>> getDepartmentTree();
} 