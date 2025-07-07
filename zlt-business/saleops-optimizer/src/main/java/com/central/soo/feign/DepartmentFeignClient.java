package com.central.soo.feign;

import com.central.common.constant.ServiceNameConstants;
import com.central.common.model.Result;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

/**
 * 部门服务Feign客户端
 *
 * @author Portal Team
 * @since 2024-12-19
 */
@FeignClient(name = ServiceNameConstants.ORGANIZATION_SERVICE, dismiss404 = true)
public interface DepartmentFeignClient {

    /**
     * 获取子部门树
     *
     * @param parentId 父部门ID
     * @param includeDisabled 是否包含禁用的部门
     * @return 子部门树形结构
     */
    @GetMapping("/api/organization/departments/{parentId}/children")
    Result<List<Map<String, Object>>> getChildDepartmentTree(
            @PathVariable("parentId") Long parentId,
            @RequestParam(value = "includeDisabled", defaultValue = "false") Boolean includeDisabled);

    /**
     * 获取部门详情
     *
     * @param id 部门ID
     * @return 部门详情
     */
    @GetMapping("/api/organization/departments/{id}")
    Result<Map<String, Object>> getDepartmentById(@PathVariable("id") Long id);

    /**
     * 获取部门树
     *
     * @return 部门树结构
     */
    @GetMapping("/api/organization/departments/tree")
    Result<List<Map<String, Object>>> getDepartmentTree();
} 