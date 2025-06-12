package com.central.organization.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.organization.model.Workposition;
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
     * 根据部门ID查询岗位列表
     * 
     * @param departmentId 部门ID
     * @param tenantId 租户ID
     * @return 岗位列表
     */
    List<Workposition> selectByDepartmentId(@Param("departmentId") Long departmentId, @Param("tenantId") String tenantId);

    /**
     * 根据员工ID查询岗位列表（通过员工关联）
     * 
     * @param employeeId 员工ID
     * @param tenantId 租户ID
     * @return 岗位列表
     */
    List<Workposition> selectByEmployeeId(@Param("employeeId") Long employeeId, @Param("tenantId") String tenantId);

    /**
     * 根据用户ID查询岗位列表（通过用户-员工-岗位关联）
     * 
     * @param userId 用户ID
     * @param tenantId 租户ID
     * @return 岗位列表
     */
    List<Workposition> selectByUserId(@Param("userId") Long userId, @Param("tenantId") String tenantId);

    /**
     * 查询管理岗位列表
     * 
     * @param tenantId 租户ID
     * @return 管理岗位列表
     */
    List<Workposition> selectManagerPositions(@Param("tenantId") String tenantId);

    /**
     * 根据岗位ID查询分管岗位列表（从workposition_manage_dept表获取）
     * 
     * @param positionId 岗位ID
     * @param tenantId 租户ID
     * @return 分管岗位列表
     */
    List<Workposition> selectSubPositionsByPositionId(@Param("positionId") Long positionId, @Param("tenantId") String tenantId);
} 