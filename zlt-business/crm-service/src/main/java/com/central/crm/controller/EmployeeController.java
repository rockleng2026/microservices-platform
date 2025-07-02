package com.central.crm.controller;

import com.central.common.model.Result;
import com.central.crm.feign.EmployeeFeignService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * CRM员工Controller
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/api/organization/employee")
@Tag(name = "CRM员工管理", description = "CRM员工相关接口")
public class EmployeeController {

    @Autowired
    private EmployeeFeignService employeeFeignService;

    /**
     * 获取员工列表(用于选择负责人)
     * 
     * 暂时返回模拟数据，实际应该调用组织架构服务
     */
    @GetMapping("/list")
    @Operation(summary = "获取员工列表")
    public Result<List<Map<String, Object>>> getEmployeeList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "100") Integer size,
            @RequestParam(required = false) String search) {
        
        try {
            // TODO: 暂时返回模拟数据，需要配置好organization-service后再调用真实接口
            List<Map<String, Object>> mockEmployees = List.of(
                createMockEmployee(1L, "张三", "EMP001", "销售部", "销售经理"),
                createMockEmployee(2L, "李四", "EMP002", "市场部", "市场专员"),
                createMockEmployee(3L, "王五", "EMP003", "技术部", "技术经理"),
                createMockEmployee(4L, "赵六", "EMP004", "客服部", "客服主管"),
                createMockEmployee(5L, "孙七", "EMP005", "财务部", "财务专员")
            );
            
            // 如果有搜索条件，进行简单过滤
            if (search != null && !search.trim().isEmpty()) {
                String searchTerm = search.trim().toLowerCase();
                mockEmployees = mockEmployees.stream()
                    .filter(emp -> {
                        String name = (String) emp.get("name");
                        String empNo = (String) emp.get("empNo");
                        String dept = (String) emp.get("departmentName");
                        return (name != null && name.toLowerCase().contains(searchTerm)) ||
                               (empNo != null && empNo.toLowerCase().contains(searchTerm)) ||
                               (dept != null && dept.toLowerCase().contains(searchTerm));
                    })
                    .toList();
            }
            
            return Result.succeed(mockEmployees);
            
        } catch (Exception e) {
            log.error("获取员工列表失败", e);
            return Result.failed("获取员工列表失败: " + e.getMessage());
        }
    }
    
    private Map<String, Object> createMockEmployee(Long id, String name, String empNo, String dept, String position) {
        Map<String, Object> employee = new HashMap<>();
        employee.put("id", id);
        employee.put("employeeId", id);
        employee.put("name", name);
        employee.put("empNo", empNo);
        employee.put("departmentName", dept);
        employee.put("positionName", position);
        return employee;
    }

    /**
     * 根据部门获取员工列表
     */
    @GetMapping("/department/{departmentId}")
    @Operation(summary = "根据部门获取员工列表")
    public Result<List<Map<String, Object>>> getEmployeesByDepartment(@PathVariable Long departmentId) {
        try {
            // TODO: 暂时返回模拟数据
            List<Map<String, Object>> mockEmployees = List.of(
                createMockEmployee(1L, "张三", "EMP001", "销售部", "销售经理"),
                createMockEmployee(2L, "李四", "EMP002", "销售部", "销售专员")
            );
            
            return Result.succeed(mockEmployees);
            
        } catch (Exception e) {
            log.error("获取部门员工列表失败", e);
            return Result.failed("获取部门员工列表失败: " + e.getMessage());
        }
    }

    /**
     * 根据员工ID获取员工详情
     */
    @GetMapping("/{employeeId}")
    @Operation(summary = "根据员工ID获取员工详情")
    public Result<Map<String, Object>> getEmployeeById(@PathVariable Long employeeId) {
        try {
            // TODO: 暂时返回模拟数据
            Map<String, Object> mockEmployee = createMockEmployee(employeeId, "张三", "EMP001", "销售部", "销售经理");
            mockEmployee.put("mobile", "13800138000");
            mockEmployee.put("email", "zhangsan@example.com");
            
            return Result.succeed(mockEmployee);
            
        } catch (Exception e) {
            log.error("获取员工详情失败", e);
            return Result.failed("获取员工详情失败: " + e.getMessage());
        }
    }
} 