package com.central.organization.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.organization.dto.DepartmentStatisticsDTO;
import com.central.organization.dto.DepartmentTreeDTO;
import com.central.organization.model.Department;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 部门数据访问层
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Mapper
public interface DepartmentMapper extends BaseMapper<Department> {

    /**
     * 获取部门树形结构
     * 
     * @param tenantId 租户ID
     * @param parentId 父部门ID
     * @param includeDisabled 是否包含禁用部门
     * @return 部门树
     */
    List<DepartmentTreeDTO> selectDepartmentTree(@Param("tenantId") String tenantId,
                                                @Param("parentId") Integer parentId,
                                                @Param("includeDisabled") Boolean includeDisabled);

    /**
     * 根据父部门ID获取子部门列表
     * 
     * @param parentId 父部门ID
     * @param tenantId 租户ID
     * @return 子部门列表
     */
    List<Department> selectChildrenByParentId(@Param("parentId") Integer parentId,
                                            @Param("tenantId") String tenantId);

    /**
     * 获取部门及其所有下级部门ID
     * 
     * @param departmentId 部门ID
     * @param tenantId 租户ID
     * @return 部门ID列表
     */
    List<Integer> selectDepartmentAndChildrenIds(@Param("departmentId") Integer departmentId,
                                               @Param("tenantId") String tenantId);

    /**
     * 分页查询部门（包含统计信息）
     * 
     * @param page 分页参数
     * @param tenantId 租户ID
     * @param keyword 关键词
     * @param parentId 父部门ID
     * @param gradeId 部门等级
     * @param status 状态
     * @return 分页结果
     */
    IPage<Department> selectDepartmentPageWithStats(Page<Department> page,
                                                   @Param("tenantId") String tenantId,
                                                   @Param("keyword") String keyword,
                                                   @Param("parentId") Integer parentId,
                                                   @Param("gradeId") Integer gradeId,
                                                   @Param("status") Integer status);

    /**
     * 获取部门详情（包含关联信息）
     * 
     * @param id 部门ID
     * @param tenantId 租户ID
     * @return 部门详情
     */
    Department selectDepartmentDetailById(@Param("id") Integer id,
                                        @Param("tenantId") String tenantId);

    /**
     * 获取部门统计信息
     * 
     * @param departmentId 部门ID
     * @param tenantId 租户ID
     * @return 统计信息
     */
    DepartmentStatisticsDTO selectDepartmentStatistics(@Param("departmentId") Integer departmentId,
                                                       @Param("tenantId") String tenantId);

    /**
     * 获取部门路径
     * 
     * @param departmentId 部门ID
     * @param tenantId 租户ID
     * @return 部门路径列表
     */
    List<Department> selectDepartmentPath(@Param("departmentId") Integer departmentId,
                                        @Param("tenantId") String tenantId);

    /**
     * 检查部门编号是否存在
     * 
     * @param depNo 部门编号
     * @param excludeId 排除的部门ID
     * @param tenantId 租户ID
     * @return 存在的数量
     */
    int checkDepNoExists(@Param("depNo") String depNo,
                        @Param("excludeId") Integer excludeId,
                        @Param("tenantId") String tenantId);

    /**
     * 获取用户可管理的部门列表
     * 
     * @param userId 用户ID
     * @param tenantId 租户ID
     * @return 部门列表
     */
    List<Department> selectUserManageableDepartments(@Param("userId") Integer userId,
                                                    @Param("tenantId") String tenantId);

    /**
     * 获取部门层级权重
     * 
     * @param departmentId 部门ID
     * @param tenantId 租户ID
     * @return 权重值
     */
    Integer selectDepartmentWeight(@Param("departmentId") Integer departmentId,
                                 @Param("tenantId") String tenantId);

    /**
     * 批量软删除部门及其子部门
     * 
     * @param departmentIds 部门ID列表
     * @param tenantId 租户ID
     * @param updatedBy 更新人
     * @return 影响行数
     */
    int batchSoftDelete(@Param("departmentIds") List<Integer> departmentIds,
                       @Param("tenantId") String tenantId,
                       @Param("updatedBy") Integer updatedBy);

    /**
     * 更新部门状态
     * 
     * @param id 部门ID
     * @param status 状态
     * @param tenantId 租户ID
     * @param updatedBy 更新人
     * @return 影响行数
     */
    int updateDepartmentStatus(@Param("id") Integer id,
                              @Param("status") Integer status,
                              @Param("tenantId") String tenantId,
                              @Param("updatedBy") Integer updatedBy);

    /**
     * 获取部门员工数量
     * 
     * @param departmentId 部门ID
     * @param tenantId 租户ID
     * @return 员工数量
     */
    Integer selectEmployeeCountByDepartment(@Param("departmentId") Integer departmentId,
                                          @Param("tenantId") String tenantId);

    /**
     * 获取部门岗位数量
     * 
     * @param departmentId 部门ID
     * @param tenantId 租户ID
     * @return 岗位数量
     */
    Integer selectPositionCountByDepartment(@Param("departmentId") Integer departmentId,
                                          @Param("tenantId") String tenantId);

    /**
     * 验证部门层级是否合规
     * 
     * @param parentId 父部门ID
     * @param gradeId 部门等级
     * @param tenantId 租户ID
     * @return 是否合规
     */
    Boolean validateDepartmentLevel(@Param("parentId") Integer parentId,
                                   @Param("gradeId") Integer gradeId,
                                   @Param("tenantId") String tenantId);
} 