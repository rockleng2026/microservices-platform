package com.central.organization.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.organization.model.Department;
import com.central.organization.model.dto.DepartmentQueryDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 部门Mapper接口
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Mapper
public interface DepartmentMapper extends BaseMapper<Department> {
    
    /**
     * 根据ID查询部门（含租户隔离）
     * @param id 部门ID
     * @return 部门信息
     */
    Department selectById(@Param("id") Long id);
    
    /**
     * 查询部门列表（包含统计信息）
     * @param query 查询条件
     * @return 部门列表
     */
    List<Department> listDepartmentsWithStats(@Param("query") DepartmentQueryDTO query);
    
    /**
     * 根据父部门ID查询子部门
     * @param parentId 父部门ID
     * @param includeDisabled 是否包含禁用部门
     * @return 子部门列表
     */
    List<Department> selectByParentId(@Param("parentId") Long parentId, 
                                    @Param("includeDisabled") Boolean includeDisabled);
    
    /**
     * 查询部门及其所有下级部门ID
     * @param departmentId 部门ID
     * @return 部门ID列表
     */
    List<Long> selectDepartmentAndChildrenIds(@Param("departmentId") Long departmentId);
    
    /**
     * 查询部门路径
     * @param departmentId 部门ID
     * @return 从根部门到当前部门的路径
     */
    String selectDepartmentPath(@Param("departmentId") Long departmentId);
    
    /**
     * 统计部门下的员工数量
     * @param departmentId 部门ID
     * @param includeChildren 是否包含子部门
     * @return 员工数量
     */
    Integer countEmployeesByDepartment(@Param("departmentId") Long departmentId, 
                                     @Param("includeChildren") Boolean includeChildren);
    
    /**
     * 统计部门下的子部门数量
     * @param parentId 父部门ID
     * @return 子部门数量
     */
    Integer countChildrenByParentId(@Param("parentId") Long parentId);
    
    /**
     * 检查部门编号是否存在
     * @param depNo 部门编号
     * @param excludeId 排除的部门ID
     * @return 是否存在
     */
    Boolean existsByDepNo(@Param("depNo") String depNo, @Param("excludeId") Long excludeId);
    
    /**
     * 检查部门名称在同级部门中是否存在
     * @param name 部门名称
     * @param parentId 父部门ID
     * @param excludeId 排除的部门ID
     * @return 是否存在
     */
    Boolean existsByNameAndParentId(@Param("name") String name, 
                                  @Param("parentId") Long parentId, 
                                  @Param("excludeId") Long excludeId);
    
    /**
     * 更新部门状态
     * @param departmentId 部门ID
     * @param status 状态
     * @return 更新数量
     */
    Integer updateStatus(@Param("departmentId") Long departmentId, @Param("status") Integer status);
    
    /**
     * 软删除部门
     * @param departmentId 部门ID
     * @return 更新数量
     */
    Integer softDelete(@Param("departmentId") Long departmentId);
    
    /**
     * 批量更新部门的父部门ID
     * @param departmentIds 部门ID列表
     * @param newParentId 新的父部门ID
     * @return 更新数量
     */
    Integer batchUpdateParentId(@Param("departmentIds") List<Long> departmentIds, 
                              @Param("newParentId") Long newParentId);
} 