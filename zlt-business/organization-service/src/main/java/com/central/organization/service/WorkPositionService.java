package com.central.organization.service;

import com.central.organization.model.WorkPosition;
import com.central.organization.dto.WorkPositionDetailDTO;
import com.central.common.model.PageResult;
import com.central.common.model.Result;

import java.util.List;
import java.util.Map;

/**
 * 岗位管理服务接口
 * 
 * @author Portal Team
 * @since 2024-01-01
 */
public interface WorkPositionService {

    /**
     * 分页查询岗位
     * 
     * @param pageNum 页码
     * @param pageSize 页大小
     * @param keyword 搜索关键词
     * @param departmentId 部门ID
     * @param tenantId 租户ID
     * @return 分页结果
     */
    PageResult<WorkPosition> getWorkPositionPage(int pageNum, int pageSize, String keyword, Long departmentId, String tenantId);

    /**
     * 根据ID获取岗位详情
     * 
     * @param id 岗位ID
     * @param tenantId 租户ID
     * @return 岗位详情
     */
    WorkPositionDetailDTO getWorkPositionDetailById(Long id, String tenantId);

    /**
     * 保存岗位（新增或更新）
     * 
     * @param workPosition 岗位信息
     * @return 操作结果
     */
    Result<WorkPosition> saveWorkPosition(WorkPosition workPosition);

    /**
     * 删除岗位
     * 
     * @param id 岗位ID
     * @param tenantId 租户ID
     * @return 操作结果
     */
    Result<Void> deleteWorkPosition(Long id, String tenantId);

    /**
     * 批量删除岗位
     * 
     * @param ids 岗位ID列表
     * @param tenantId 租户ID
     * @return 操作结果
     */
    Result<Void> batchDeleteWorkPositions(List<Long> ids, String tenantId);

    /**
     * 根据部门ID获取岗位列表
     * 
     * @param departmentId 部门ID
     * @param tenantId 租户ID
     * @return 岗位列表
     */
    List<WorkPosition> getWorkPositionsByDepartment(Long departmentId, String tenantId);

    /**
     * 获取所有启用的岗位
     * 
     * @param tenantId 租户ID
     * @return 岗位列表
     */
    List<WorkPosition> getAllEnabledWorkPositions(String tenantId);

    /**
     * 检查岗位名称是否存在
     * 
     * @param name 岗位名称
     * @param departmentId 部门ID
     * @param excludeId 排除的岗位ID
     * @param tenantId 租户ID
     * @return 是否存在
     */
    boolean checkNameExists(String name, Long departmentId, Long excludeId, String tenantId);

    /**
     * 复制岗位
     * 
     * @param sourceId 源岗位ID
     * @param targetDepartmentId 目标部门ID
     * @param newName 新岗位名称
     * @param tenantId 租户ID
     * @return 操作结果
     */
    Result<WorkPosition> copyWorkPosition(Long sourceId, Long targetDepartmentId, String newName, String tenantId);

    /**
     * 获取岗位统计信息
     * 
     * @param departmentId 部门ID（可选）
     * @param tenantId 租户ID
     * @return 统计信息
     */
    Map<String, Object> getWorkPositionStatistics(Long departmentId, String tenantId);

    /**
     * 启用/禁用岗位
     * 
     * @param positionId 岗位ID
     * @param enabled 是否启用
     * @param tenantId 租户ID
     * @return 操作结果
     */
    Result<Void> toggleWorkPositionStatus(Long positionId, boolean enabled, String tenantId);

    /**
     * 获取岗位权限配置
     * 
     * @param positionId 岗位ID
     * @param tenantId 租户ID
     * @return 权限配置
     */
    Map<String, Object> getWorkPositionPermissions(Long positionId, String tenantId);

    /**
     * 保存岗位权限配置
     * 
     * @param positionId 岗位ID
     * @param permissions 权限配置
     * @param tenantId 租户ID
     * @return 操作结果
     */
    Result<Void> saveWorkPositionPermissions(Long positionId, Map<String, Object> permissions, String tenantId);

    /**
     * 获取主管岗位列表
     * 
     * @param departmentId 部门ID（可选）
     * @param tenantId 租户ID
     * @return 主管岗位列表
     */
    List<WorkPosition> getManagerPositions(Long departmentId, String tenantId);

    /**
     * 根据员工ID获取岗位列表（支持多岗位）
     * 
     * @param employeeId 员工ID
     * @param tenantId 租户ID
     * @return 岗位列表
     */
    List<WorkPosition> getWorkPositionsByEmployee(Long employeeId, String tenantId);

    /**
     * 导入岗位数据
     * 
     * @param workPositions 岗位数据列表
     * @param tenantId 租户ID
     * @return 导入结果
     */
    Result<Map<String, Object>> importWorkPositions(List<WorkPosition> workPositions, String tenantId);

    /**
     * 导出岗位数据
     * 
     * @param departmentId 部门ID（可选）
     * @param tenantId 租户ID
     * @return 岗位数据
     */
    List<WorkPosition> exportWorkPositions(Long departmentId, String tenantId);

    /**
     * 获取岗位层级结构
     * 
     * @param departmentId 部门ID
     * @param tenantId 租户ID
     * @return 岗位层级数据
     */
    List<Map<String, Object>> getWorkPositionHierarchy(Long departmentId, String tenantId);
} 