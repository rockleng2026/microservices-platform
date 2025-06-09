package com.central.organization.service;

import com.central.organization.model.Department;
import com.central.organization.dto.DepartmentTreeDTO;
import com.central.organization.dto.DepartmentStatisticsDTO;
import com.central.common.model.PageResult;
import com.central.common.model.Result;

import java.util.List;
import java.util.Map;

/**
 * 部门管理服务接口
 * 
 * @author Portal Team
 * @since 2024-01-01
 */
public interface DepartmentService {

    /**
     * 获取部门树形结构
     * 
     * @param tenantId 租户ID
     * @param includeDisabled 是否包含禁用部门
     * @return 部门树
     */
    List<DepartmentTreeDTO> getDepartmentTree(String tenantId, boolean includeDisabled);

    /**
     * 根据父部门ID获取子部门列表
     * 
     * @param parentId 父部门ID
     * @param tenantId 租户ID
     * @return 子部门列表
     */
    List<Department> getChildDepartments(Long parentId, String tenantId);

    /**
     * 分页查询部门
     * 
     * @param pageNum 页码
     * @param pageSize 页大小
     * @param keyword 搜索关键词
     * @param parentId 父部门ID
     * @param tenantId 租户ID
     * @return 分页结果
     */
    PageResult<Department> getDepartmentPage(int pageNum, int pageSize, String keyword, Long parentId, String tenantId);

    /**
     * 根据ID获取部门详情
     * 
     * @param id 部门ID
     * @param tenantId 租户ID
     * @return 部门信息
     */
    Department getDepartmentById(Long id, String tenantId);

    /**
     * 保存部门（新增或更新）
     * 
     * @param department 部门信息
     * @return 操作结果
     */
    Result<Department> saveDepartment(Department department);

    /**
     * 删除部门
     * 
     * @param id 部门ID
     * @param tenantId 租户ID
     * @return 操作结果
     */
    Result<Void> deleteDepartment(Long id, String tenantId);

    /**
     * 批量删除部门
     * 
     * @param ids 部门ID列表
     * @param tenantId 租户ID
     * @return 操作结果
     */
    Result<Void> batchDeleteDepartments(List<Long> ids, String tenantId);

    /**
     * 移动部门（调整部门父子关系）
     * 
     * @param departmentId 部门ID
     * @param newParentId 新父部门ID
     * @param tenantId 租户ID
     * @return 操作结果
     */
    Result<Void> moveDepartment(Long departmentId, Long newParentId, String tenantId);

    /**
     * 获取部门统计信息
     * 
     * @param departmentId 部门ID
     * @param tenantId 租户ID
     * @return 统计信息
     */
    DepartmentStatisticsDTO getDepartmentStatistics(Long departmentId, String tenantId);

    /**
     * 获取部门路径（从根部门到当前部门）
     * 
     * @param departmentId 部门ID
     * @param tenantId 租户ID
     * @return 部门路径
     */
    List<Department> getDepartmentPath(Long departmentId, String tenantId);

    /**
     * 导入部门数据
     * 
     * @param departments 部门数据列表
     * @param tenantId 租户ID
     * @return 导入结果
     */
    Result<Map<String, Object>> importDepartments(List<Department> departments, String tenantId);

    /**
     * 导出部门数据
     * 
     * @param tenantId 租户ID
     * @return 部门数据
     */
    List<Department> exportDepartments(String tenantId);

    /**
     * 检查部门编码是否存在
     * 
     * @param depNo 部门编码
     * @param excludeId 排除的部门ID
     * @param tenantId 租户ID
     * @return 是否存在
     */
    boolean checkDepNoExists(String depNo, Long excludeId, String tenantId);

    /**
     * 根据部门编码获取部门
     * 
     * @param depNo 部门编码
     * @param tenantId 租户ID
     * @return 部门信息
     */
    Department getDepartmentByDepNo(String depNo, String tenantId);

    /**
     * 获取用户有权限的部门列表
     * 
     * @param userId 用户ID
     * @param tenantId 租户ID
     * @return 部门列表
     */
    List<Department> getUserAuthorizedDepartments(Long userId, String tenantId);

    /**
     * 启用/禁用部门
     * 
     * @param departmentId 部门ID
     * @param enabled 是否启用
     * @param tenantId 租户ID
     * @return 操作结果
     */
    Result<Void> toggleDepartmentStatus(Long departmentId, boolean enabled, String tenantId);
} 