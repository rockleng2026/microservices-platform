package com.central.organization.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.organization.model.Workposition;
import com.central.organization.model.dto.WorkpositionQueryDTO;
import com.central.organization.model.vo.WorkpositionVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 工作岗位 Mapper接口
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Mapper
public interface WorkpositionMapper extends BaseMapper<Workposition> {

    /**
     * 分页查询岗位列表
     * 
     * @param page 分页参数
     * @param queryDTO 查询条件
     * @param tenantId 租户ID
     * @return 岗位分页列表
     */
    IPage<WorkpositionVO> selectPageList(@Param("page") Page<WorkpositionVO> page, 
                                        @Param("query") WorkpositionQueryDTO queryDTO,
                                        @Param("tenantId") String tenantId);

    /**
     * 根据ID查询岗位详情
     * 
     * @param id 岗位ID
     * @param tenantId 租户ID
     * @return 岗位详情
     */
    WorkpositionVO selectDetailById(@Param("id") Long id, @Param("tenantId") String tenantId);

    /**
     * 根据部门ID查询岗位列表
     * 
     * @param departmentId 部门ID
     * @param tenantId 租户ID
     * @return 岗位列表
     */
    List<WorkpositionVO> selectByDepartmentId(@Param("departmentId") Long departmentId, @Param("tenantId") String tenantId);

    /**
     * 根据员工ID查询岗位列表（通过员工关联）
     * 
     * @param employeeId 员工ID
     * @param tenantId 租户ID
     * @return 岗位列表
     */
    List<WorkpositionVO> selectByEmployeeId(@Param("employeeId") Long employeeId, @Param("tenantId") String tenantId);

    /**
     * 根据用户ID查询岗位列表（通过用户-员工-岗位关联）
     * 
     * @param userId 用户ID
     * @param tenantId 租户ID
     * @return 岗位列表
     */
    List<WorkpositionVO> selectByUserId(@Param("userId") Long userId, @Param("tenantId") String tenantId);

    /**
     * 查询管理岗位列表
     * 
     * @param tenantId 租户ID
     * @return 管理岗位列表
     */
    List<WorkpositionVO> selectManagerPositions(@Param("tenantId") String tenantId);

    /**
     * 根据岗位ID查询分管岗位列表（从workposition_manage_dept表获取）
     * 
     * @param positionId 岗位ID
     * @param tenantId 租户ID
     * @return 分管岗位列表
     */
    List<WorkpositionVO> selectSubPositionsByPositionId(@Param("positionId") Long positionId, @Param("tenantId") String tenantId);

    /**
     * 检查岗位名称是否已存在
     * 
     * @param name 岗位名称
     * @param departmentId 部门ID
     * @param excludeId 排除的岗位ID（编辑时使用）
     * @param tenantId 租户ID
     * @return 数量
     */
    Integer checkNameExists(@Param("name") String name, 
                           @Param("departmentId") Long departmentId,
                           @Param("excludeId") Long excludeId,
                           @Param("tenantId") String tenantId);

    /**
     * 批量删除岗位
     * 
     * @param ids 岗位ID列表
     * @param tenantId 租户ID
     * @return 影响行数
     */
    Integer batchDelete(@Param("ids") List<Long> ids, @Param("tenantId") String tenantId);

    /**
     * 更新岗位状态
     * 
     * @param ids 岗位ID列表
     * @param status 状态
     * @param tenantId 租户ID
     * @return 影响行数
     */
    Integer updateStatus(@Param("ids") List<Long> ids, 
                        @Param("status") Integer status,
                        @Param("tenantId") String tenantId);

    /**
     * 获取部门下岗位数量
     * 
     * @param departmentId 部门ID
     * @param tenantId 租户ID
     * @return 岗位数量
     */
    Integer getPositionCountByDepartment(@Param("departmentId") Long departmentId, @Param("tenantId") String tenantId);

    /**
     * 获取岗位下员工数量
     * 
     * @param positionId 岗位ID
     * @param tenantId 租户ID
     * @return 员工数量
     */
    Integer getEmployeeCountByPosition(@Param("positionId") Long positionId, @Param("tenantId") String tenantId);
} 