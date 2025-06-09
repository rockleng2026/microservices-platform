package com.central.organization.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.organization.dto.EmployeeDetailDTO;
import com.central.organization.dto.EmployeeSearchDTO;
import com.central.organization.model.Employee;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 员工数据访问层
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Mapper
public interface EmployeeMapper extends BaseMapper<Employee> {

    /**
     * 分页查询员工详情
     * 
     * @param page 分页参数
     * @param searchDTO 查询条件
     * @param tenantId 租户ID
     * @return 分页结果
     */
    IPage<EmployeeDetailDTO> selectEmployeeDetailPage(Page<EmployeeDetailDTO> page,
                                                     @Param("searchDTO") EmployeeSearchDTO searchDTO,
                                                     @Param("tenantId") String tenantId);

    /**
     * 获取员工详情
     * 
     * @param id 员工ID
     * @param tenantId 租户ID
     * @return 员工详情
     */
    EmployeeDetailDTO selectEmployeeDetailById(@Param("id") Integer id,
                                              @Param("tenantId") String tenantId);

    /**
     * 检查员工编号是否存在
     * 
     * @param empNo 员工编号
     * @param excludeId 排除的员工ID
     * @param tenantId 租户ID
     * @return 存在的数量
     */
    int checkEmpNoExists(@Param("empNo") String empNo,
                        @Param("excludeId") Integer excludeId,
                        @Param("tenantId") String tenantId);

    /**
     * 检查身份证号是否存在
     * 
     * @param idCard 身份证号
     * @param excludeId 排除的员工ID
     * @param tenantId 租户ID
     * @return 存在的数量
     */
    int checkIdCardExists(@Param("idCard") String idCard,
                         @Param("excludeId") Integer excludeId,
                         @Param("tenantId") String tenantId);

    /**
     * 根据部门ID获取员工列表
     * 
     * @param departmentId 部门ID
     * @param includeSubDept 是否包含子部门
     * @param tenantId 租户ID
     * @return 员工列表
     */
    List<Employee> selectEmployeesByDepartment(@Param("departmentId") Integer departmentId,
                                              @Param("includeSubDept") Boolean includeSubDept,
                                              @Param("tenantId") String tenantId);

    /**
     * 根据岗位ID获取员工列表
     * 
     * @param positionId 岗位ID
     * @param tenantId 租户ID
     * @return 员工列表
     */
    List<Employee> selectEmployeesByPosition(@Param("positionId") Integer positionId,
                                            @Param("tenantId") String tenantId);

    /**
     * 生成员工编号
     * 
     * @param tenantId 租户ID
     * @return 下一个员工编号
     */
    String generateEmployeeNo(@Param("tenantId") String tenantId);

    /**
     * 获取员工统计信息
     * 
     * @param departmentId 部门ID，为空时统计全部
     * @param tenantId 租户ID
     * @return 统计信息
     */
    Map<String, Object> selectEmployeeStatistics(@Param("departmentId") Integer departmentId,
                                                 @Param("tenantId") String tenantId);

    /**
     * 批量软删除员工
     * 
     * @param employeeIds 员工ID列表
     * @param tenantId 租户ID
     * @param updatedBy 更新人
     * @return 影响行数
     */
    int batchSoftDelete(@Param("employeeIds") List<Integer> employeeIds,
                       @Param("tenantId") String tenantId,
                       @Param("updatedBy") Integer updatedBy);

    /**
     * 更新员工状态
     * 
     * @param id 员工ID
     * @param employmentStatus 在职状态
     * @param tenantId 租户ID
     * @param updatedBy 更新人
     * @return 影响行数
     */
    int updateEmploymentStatus(@Param("id") Integer id,
                              @Param("employmentStatus") Integer employmentStatus,
                              @Param("tenantId") String tenantId,
                              @Param("updatedBy") Integer updatedBy);

    /**
     * 员工转正
     * 
     * @param employeeId 员工ID
     * @param formalDate 转正日期
     * @param tenantId 租户ID
     * @param updatedBy 更新人
     * @return 影响行数
     */
    int updateEmployeeFormal(@Param("employeeId") Integer employeeId,
                            @Param("formalDate") String formalDate,
                            @Param("tenantId") String tenantId,
                            @Param("updatedBy") Integer updatedBy);

    /**
     * 员工调岗
     * 
     * @param employeeId 员工ID
     * @param newDepartmentId 新部门ID
     * @param newPositionId 新岗位ID
     * @param tenantId 租户ID
     * @param updatedBy 更新人
     * @return 影响行数
     */
    int updateEmployeeTransfer(@Param("employeeId") Integer employeeId,
                              @Param("newDepartmentId") Integer newDepartmentId,
                              @Param("newPositionId") Integer newPositionId,
                              @Param("tenantId") String tenantId,
                              @Param("updatedBy") Integer updatedBy);

    /**
     * 员工离职
     * 
     * @param employeeId 员工ID
     * @param leaveDate 离职日期
     * @param leaveReason 离职原因
     * @param tenantId 租户ID
     * @param updatedBy 更新人
     * @return 影响行数
     */
    int updateEmployeeLeave(@Param("employeeId") Integer employeeId,
                           @Param("leaveDate") String leaveDate,
                           @Param("leaveReason") String leaveReason,
                           @Param("tenantId") String tenantId,
                           @Param("updatedBy") Integer updatedBy);

    /**
     * 根据用户ID获取员工信息
     * 
     * @param userId 用户ID
     * @param tenantId 租户ID
     * @return 员工信息
     */
    Employee selectEmployeeByUserId(@Param("userId") Integer userId,
                                   @Param("tenantId") String tenantId);

    /**
     * 获取部门主管列表
     * 
     * @param departmentIds 部门ID列表
     * @param tenantId 租户ID
     * @return 主管列表
     */
    List<Employee> selectDepartmentManagers(@Param("departmentIds") List<Integer> departmentIds,
                                           @Param("tenantId") String tenantId);

    /**
     * 根据岗位获取在职员工数量
     * 
     * @param positionId 岗位ID
     * @param tenantId 租户ID
     * @return 在职员工数量
     */
    Integer selectActiveEmployeeCountByPosition(@Param("positionId") Integer positionId,
                                              @Param("tenantId") String tenantId);

    /**
     * 根据部门获取在职员工数量
     * 
     * @param departmentId 部门ID
     * @param includeSubDept 是否包含子部门
     * @param tenantId 租户ID
     * @return 在职员工数量
     */
    Integer selectActiveEmployeeCountByDepartment(@Param("departmentId") Integer departmentId,
                                                @Param("includeSubDept") Boolean includeSubDept,
                                                @Param("tenantId") String tenantId);

    /**
     * 导出员工数据
     * 
     * @param searchDTO 查询条件
     * @param tenantId 租户ID
     * @return 员工列表
     */
    List<EmployeeDetailDTO> selectEmployeesForExport(@Param("searchDTO") EmployeeSearchDTO searchDTO,
                                                    @Param("tenantId") String tenantId);
} 