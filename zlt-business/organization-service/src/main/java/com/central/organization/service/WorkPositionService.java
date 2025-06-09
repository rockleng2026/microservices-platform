package com.central.organization.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.organization.dto.WorkPositionDetailDTO;
import com.central.organization.model.WorkPosition;

import java.util.List;
import java.util.Map;

/**
 * 岗位管理服务接口
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
public interface WorkPositionService extends IService<WorkPosition> {

    /**
     * 分页查询岗位
     * 
     * @param page 页码
     * @param size 页大小
     * @param keyword 关键词
     * @param departmentId 部门ID
     * @param isManager 是否主管岗位
     * @param status 状态
     * @return 分页结果
     */
    PageResult<WorkPositionDetailDTO> getWorkPositionPage(Integer page, Integer size, String keyword, 
                                                         Integer departmentId, Boolean isManager, Integer status);

    /**
     * 获取岗位详情
     * 
     * @param id 岗位ID
     * @return 岗位详情
     */
    WorkPositionDetailDTO getWorkPositionDetail(Integer id);

    /**
     * 创建岗位
     * 
     * @param workPosition 岗位信息
     * @return 创建结果
     */
    Result<WorkPosition> createWorkPosition(WorkPosition workPosition);

    /**
     * 更新岗位
     * 
     * @param workPosition 岗位信息
     * @return 更新结果
     */
    Result<WorkPosition> updateWorkPosition(WorkPosition workPosition);

    /**
     * 删除岗位（软删除）
     * 
     * @param id 岗位ID
     * @return 删除结果
     */
    Result<Void> deleteWorkPosition(Integer id);

    /**
     * 批量删除岗位
     * 
     * @param ids 岗位ID列表
     * @return 删除结果
     */
    Result<Void> deleteWorkPositions(List<Integer> ids);

    /**
     * 启用/禁用岗位
     * 
     * @param id 岗位ID
     * @param status 状态
     * @return 操作结果
     */
    Result<Void> updateWorkPositionStatus(Integer id, Integer status);

    /**
     * 获取部门岗位列表
     * 
     * @param departmentId 部门ID
     * @param includeDisabled 是否包含禁用岗位
     * @return 岗位列表
     */
    List<WorkPosition> getDepartmentPositions(Integer departmentId, Boolean includeDisabled);

    /**
     * 获取主管岗位列表
     * 
     * @param departmentId 部门ID，为空时获取所有部门的主管岗位
     * @return 主管岗位列表
     */
    List<WorkPosition> getManagerPositions(Integer departmentId);

    /**
     * 配置岗位分管部门
     * 
     * @param positionId 岗位ID
     * @param manageDepartments 分管部门配置
     * @return 配置结果
     */
    Result<Void> configManageDepartments(Integer positionId, List<Map<String, Object>> manageDepartments);

    /**
     * 获取岗位分管部门
     * 
     * @param positionId 岗位ID
     * @return 分管部门列表
     */
    List<Map<String, Object>> getPositionManageDepartments(Integer positionId);

    /**
     * 配置岗位权限
     * 
     * @param positionId 岗位ID
     * @param permissions 权限配置JSON
     * @return 配置结果
     */
    Result<Void> configPositionPermissions(Integer positionId, String permissions);

    /**
     * 获取岗位权限配置
     * 
     * @param positionId 岗位ID
     * @return 权限配置
     */
    String getPositionPermissions(Integer positionId);

    /**
     * 复制岗位
     * 
     * @param sourcePositionId 源岗位ID
     * @param targetDepartmentId 目标部门ID
     * @param newPositionName 新岗位名称
     * @return 复制结果
     */
    Result<WorkPosition> copyWorkPosition(Integer sourcePositionId, Integer targetDepartmentId, String newPositionName);

    /**
     * 移动岗位到新部门
     * 
     * @param positionId 岗位ID
     * @param newDepartmentId 新部门ID
     * @return 移动结果
     */
    Result<Void> moveWorkPosition(Integer positionId, Integer newDepartmentId);

    /**
     * 获取岗位统计信息
     * 
     * @param departmentId 部门ID，为空时统计全部
     * @return 统计信息
     */
    Map<String, Object> getWorkPositionStatistics(Integer departmentId);

    /**
     * 检查岗位名称是否可用
     * 
     * @param name 岗位名称
     * @param departmentId 部门ID
     * @param excludeId 排除的岗位ID
     * @return 是否可用
     */
    Boolean isPositionNameAvailable(String name, Integer departmentId, Integer excludeId);

    /**
     * 获取可分配的岗位列表（给员工分配岗位时使用）
     * 
     * @param departmentId 部门ID
     * @param excludePositionIds 排除的岗位ID
     * @return 可分配岗位列表
     */
    List<WorkPosition> getAssignablePositions(Integer departmentId, List<Integer> excludePositionIds);

    /**
     * 获取用户可担任的岗位列表
     * 
     * @param userId 用户ID
     * @return 岗位列表
     */
    List<WorkPosition> getUserPositions(Integer userId);

    /**
     * 切换用户当前岗位
     * 
     * @param userId 用户ID
     * @param positionId 岗位ID
     * @return 切换结果
     */
    Result<Void> switchUserPosition(Integer userId, Integer positionId);

    /**
     * 获取岗位人员分配情况
     * 
     * @param positionId 岗位ID
     * @return 人员分配情况
     */
    Map<String, Object> getPositionEmployeeAssignment(Integer positionId);

    /**
     * 分配员工到岗位
     * 
     * @param positionId 岗位ID
     * @param employeeIds 员工ID列表
     * @param isPrimary 是否主岗位
     * @return 分配结果
     */
    Result<Void> assignEmployeesToPosition(Integer positionId, List<Integer> employeeIds, Boolean isPrimary);

    /**
     * 从岗位移除员工
     * 
     * @param positionId 岗位ID
     * @param employeeIds 员工ID列表
     * @return 移除结果
     */
    Result<Void> removeEmployeesFromPosition(Integer positionId, List<Integer> employeeIds);

    /**
     * 获取岗位权限菜单树
     * 
     * @return 权限菜单树
     */
    List<Map<String, Object>> getPermissionMenuTree();

    /**
     * 导出岗位数据
     * 
     * @param departmentId 部门ID，为空时导出所有岗位
     * @return 导出文件路径
     */
    Result<String> exportWorkPositions(Integer departmentId);
} 