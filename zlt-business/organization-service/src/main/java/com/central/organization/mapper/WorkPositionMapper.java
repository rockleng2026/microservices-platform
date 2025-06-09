package com.central.organization.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.organization.dto.WorkPositionDetailDTO;
import com.central.organization.model.WorkPosition;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 岗位数据访问层
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Mapper
public interface WorkPositionMapper extends BaseMapper<WorkPosition> {

    /**
     * 分页查询岗位详情
     * 
     * @param page 分页参数
     * @param tenantId 租户ID
     * @param keyword 关键词
     * @param departmentId 部门ID
     * @param isManager 是否主管岗位
     * @param status 状态
     * @return 分页结果
     */
    IPage<WorkPositionDetailDTO> selectWorkPositionDetailPage(Page<WorkPositionDetailDTO> page,
                                                             @Param("tenantId") String tenantId,
                                                             @Param("keyword") String keyword,
                                                             @Param("departmentId") Integer departmentId,
                                                             @Param("isManager") Boolean isManager,
                                                             @Param("status") Integer status);

    /**
     * 获取岗位详情
     * 
     * @param id 岗位ID
     * @param tenantId 租户ID
     * @return 岗位详情
     */
    WorkPositionDetailDTO selectWorkPositionDetailById(@Param("id") Integer id,
                                                      @Param("tenantId") String tenantId);

    /**
     * 根据部门ID获取岗位列表
     * 
     * @param departmentId 部门ID
     * @param includeDisabled 是否包含禁用岗位
     * @param tenantId 租户ID
     * @return 岗位列表
     */
    List<WorkPosition> selectPositionsByDepartment(@Param("departmentId") Integer departmentId,
                                                  @Param("includeDisabled") Boolean includeDisabled,
                                                  @Param("tenantId") String tenantId);

    /**
     * 获取主管岗位列表
     * 
     * @param departmentId 部门ID，为空时获取所有部门的主管岗位
     * @param tenantId 租户ID
     * @return 主管岗位列表
     */
    List<WorkPosition> selectManagerPositions(@Param("departmentId") Integer departmentId,
                                             @Param("tenantId") String tenantId);

    /**
     * 检查岗位名称是否存在
     * 
     * @param name 岗位名称
     * @param departmentId 部门ID
     * @param excludeId 排除的岗位ID
     * @param tenantId 租户ID
     * @return 存在的数量
     */
    int checkPositionNameExists(@Param("name") String name,
                               @Param("departmentId") Integer departmentId,
                               @Param("excludeId") Integer excludeId,
                               @Param("tenantId") String tenantId);

    /**
     * 获取可分配的岗位列表
     * 
     * @param departmentId 部门ID
     * @param excludePositionIds 排除的岗位ID
     * @param tenantId 租户ID
     * @return 可分配岗位列表
     */
    List<WorkPosition> selectAssignablePositions(@Param("departmentId") Integer departmentId,
                                                @Param("excludePositionIds") List<Integer> excludePositionIds,
                                                @Param("tenantId") String tenantId);

    /**
     * 根据用户ID获取岗位列表
     * 
     * @param userId 用户ID
     * @param tenantId 租户ID
     * @return 岗位列表
     */
    List<WorkPosition> selectPositionsByUserId(@Param("userId") Integer userId,
                                              @Param("tenantId") String tenantId);

    /**
     * 获取岗位人员分配情况
     * 
     * @param positionId 岗位ID
     * @param tenantId 租户ID
     * @return 人员分配情况
     */
    Map<String, Object> selectPositionEmployeeAssignment(@Param("positionId") Integer positionId,
                                                         @Param("tenantId") String tenantId);

    /**
     * 获取岗位统计信息
     * 
     * @param departmentId 部门ID，为空时统计全部
     * @param tenantId 租户ID
     * @return 统计信息
     */
    Map<String, Object> selectWorkPositionStatistics(@Param("departmentId") Integer departmentId,
                                                     @Param("tenantId") String tenantId);

    /**
     * 批量软删除岗位
     * 
     * @param positionIds 岗位ID列表
     * @param tenantId 租户ID
     * @param updatedBy 更新人
     * @return 影响行数
     */
    int batchSoftDelete(@Param("positionIds") List<Integer> positionIds,
                       @Param("tenantId") String tenantId,
                       @Param("updatedBy") Integer updatedBy);

    /**
     * 更新岗位状态
     * 
     * @param id 岗位ID
     * @param status 状态
     * @param tenantId 租户ID
     * @param updatedBy 更新人
     * @return 影响行数
     */
    int updateWorkPositionStatus(@Param("id") Integer id,
                                @Param("status") Integer status,
                                @Param("tenantId") String tenantId,
                                @Param("updatedBy") Integer updatedBy);

    /**
     * 移动岗位到新部门
     * 
     * @param positionId 岗位ID
     * @param newDepartmentId 新部门ID
     * @param tenantId 租户ID
     * @param updatedBy 更新人
     * @return 影响行数
     */
    int moveWorkPositionToDepartment(@Param("positionId") Integer positionId,
                                    @Param("newDepartmentId") Integer newDepartmentId,
                                    @Param("tenantId") String tenantId,
                                    @Param("updatedBy") Integer updatedBy);

    /**
     * 配置岗位权限
     * 
     * @param positionId 岗位ID
     * @param permissions 权限配置JSON
     * @param tenantId 租户ID
     * @param updatedBy 更新人
     * @return 影响行数
     */
    int updatePositionPermissions(@Param("positionId") Integer positionId,
                                 @Param("permissions") String permissions,
                                 @Param("tenantId") String tenantId,
                                 @Param("updatedBy") Integer updatedBy);

    /**
     * 获取岗位分管部门
     * 
     * @param positionId 岗位ID
     * @return 分管部门列表
     */
    List<Map<String, Object>> selectPositionManageDepartments(@Param("positionId") Integer positionId);

    /**
     * 删除岗位分管部门
     * 
     * @param positionId 岗位ID
     * @return 影响行数
     */
    int deletePositionManageDepartments(@Param("positionId") Integer positionId);

    /**
     * 批量插入岗位分管部门
     * 
     * @param manageDepartments 分管部门配置
     * @return 影响行数
     */
    int batchInsertPositionManageDepartments(@Param("manageDepartments") List<Map<String, Object>> manageDepartments);

    /**
     * 获取权限菜单树
     * 
     * @param tenantId 租户ID
     * @return 权限菜单树
     */
    List<Map<String, Object>> selectPermissionMenuTree(@Param("tenantId") String tenantId);

    /**
     * 导出岗位数据
     * 
     * @param departmentId 部门ID，为空时导出所有岗位
     * @param tenantId 租户ID
     * @return 岗位列表
     */
    List<WorkPositionDetailDTO> selectWorkPositionsForExport(@Param("departmentId") Integer departmentId,
                                                            @Param("tenantId") String tenantId);

    /**
     * 分配员工到岗位
     * 
     * @param positionId 岗位ID
     * @param employeeIds 员工ID列表
     * @param isPrimary 是否主岗位
     * @param tenantId 租户ID
     * @param createdBy 创建人
     * @return 影响行数
     */
    int assignEmployeesToPosition(@Param("positionId") Integer positionId,
                                 @Param("employeeIds") List<Integer> employeeIds,
                                 @Param("isPrimary") Boolean isPrimary,
                                 @Param("tenantId") String tenantId,
                                 @Param("createdBy") Integer createdBy);

    /**
     * 从岗位移除员工
     * 
     * @param positionId 岗位ID
     * @param employeeIds 员工ID列表
     * @param tenantId 租户ID
     * @return 影响行数
     */
    int removeEmployeesFromPosition(@Param("positionId") Integer positionId,
                                   @Param("employeeIds") List<Integer> employeeIds,
                                   @Param("tenantId") String tenantId);
} 