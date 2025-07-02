package com.central.crm.controller;

import com.central.common.model.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

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
@RequestMapping("/api/employee")
@Tag(name = "CRM员工管理", description = "CRM员工相关接口")
public class EmployeeController {

    @Autowired
    private RestTemplate restTemplate;

    /**
     * 获取员工列表(用于选择负责人)
     */
    @GetMapping("/list")
    @Operation(summary = "获取员工列表")
    public Result<List<Map<String, Object>>> getEmployeeList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "100") Integer size,
            @RequestParam(required = false) String search) {
        
        try {
            // 调用组织架构服务获取员工列表
            String url = "http://organization-service/api/organization/employee/page" +
                    "?pageNum=" + page +
                    "&pageSize=" + size +
                    "&status=ACTIVE";
            
            if (search != null && !search.trim().isEmpty()) {
                url += "&name=" + search.trim();
            }
            
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && Boolean.TRUE.equals(response.get("success"))) {
                Map<String, Object> data = (Map<String, Object>) response.get("data");
                List<Map<String, Object>> employees = (List<Map<String, Object>>) data.get("content");
                
                // 简化员工信息，只返回必要字段
                List<Map<String, Object>> simplifiedEmployees = employees.stream()
                    .map(emp -> {
                        Map<String, Object> simple = new HashMap<>();
                        simple.put("id", emp.get("id"));
                        simple.put("employeeId", emp.get("id")); // 兼容字段
                        simple.put("name", emp.get("name"));
                        simple.put("empNo", emp.get("empNo"));
                        simple.put("departmentName", emp.get("departmentName"));
                        simple.put("positionName", emp.get("positionName"));
                        return simple;
                    })
                    .toList();
                
                return Result.succeed(simplifiedEmployees);
            } else {
                return Result.failed("获取员工列表失败");
            }
            
        } catch (Exception e) {
            log.error("获取员工列表失败", e);
            return Result.failed("获取员工列表失败: " + e.getMessage());
        }
    }

    /**
     * 根据部门获取员工列表
     */
    @GetMapping("/department/{departmentId}")
    @Operation(summary = "根据部门获取员工列表")
    public Result<List<Map<String, Object>>> getEmployeesByDepartment(@PathVariable Long departmentId) {
        try {
            String url = "http://organization-service/api/organization/employee/department/" + departmentId;
            
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && Boolean.TRUE.equals(response.get("success"))) {
                List<Map<String, Object>> employees = (List<Map<String, Object>>) response.get("data");
                
                // 简化员工信息
                List<Map<String, Object>> simplifiedEmployees = employees.stream()
                    .map(emp -> {
                        Map<String, Object> simple = new HashMap<>();
                        simple.put("id", emp.get("id"));
                        simple.put("employeeId", emp.get("id"));
                        simple.put("name", emp.get("name"));
                        simple.put("empNo", emp.get("empNo"));
                        simple.put("departmentName", emp.get("departmentName"));
                        simple.put("positionName", emp.get("positionName"));
                        return simple;
                    })
                    .toList();
                
                return Result.succeed(simplifiedEmployees);
            } else {
                return Result.failed("获取部门员工列表失败");
            }
            
        } catch (Exception e) {
            log.error("获取部门员工列表失败", e);
            return Result.failed("获取部门员工列表失败: " + e.getMessage());
        }
    }
} 