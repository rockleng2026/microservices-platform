package com.central.organization.mapper;

import com.central.organization.model.Employee;
import com.central.organization.model.dto.EmployeeQueryDTO;
import com.central.organization.model.vo.EmployeeVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 员工数据访问层
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Mapper
public interface EmployeeMapper {

    /**
     * 根据ID查询员工
     * 
     * @param id 员工ID
     * @return 员工信息
     */
    Employee selectById(@Param("id") Long id);

    /**
     * 根据ID查询员工详细信息(包含关联信息)
     * 
     * @param id 员工ID
     * @return 员工详细信息
     */
    EmployeeVO selectDetailById(@Param("id") Long id);

    /**
     * 根据员工编号查询员工
     * 
     * @param empNo 员工编号
     * @return 员工信息
     */
    Employee selectByEmpNo(@Param("empNo") String empNo);

    /**
     * 根据手机号查询员工
     * 
     * @param mobile 手机号
     * @return 员工信息
     */
    Employee selectByMobile(@Param("mobile") String mobile);

    /**
     * 根据身份证号查询员工
     * 
     * @param idCard 身份证号
     * @return 员工信息
     */
    Employee selectByIdCard(@Param("idCard") String idCard);

    /**
     * 分页查询员工列表
     * 
     * @param query 查询条件
     * @return 员工列表
     */
    List<EmployeeVO> selectPageList(@Param("query") EmployeeQueryDTO query);

    /**
     * 查询员工总数
     * 
     * @param query 查询条件
     * @return 总数
     */
    Long selectCount(@Param("query") EmployeeQueryDTO query);

    /**
     * 根据部门ID查询员工列表
     * 
     * @param departmentId 部门ID
     * @param includeSubDept 是否包含子部门
     * @return 员工列表
     */
    List<EmployeeVO> selectByDepartmentId(@Param("departmentId") Long departmentId, 
                                         @Param("includeSubDept") Boolean includeSubDept);

    /**
     * 根据岗位ID查询员工列表
     * 
     * @param positionId 岗位ID
     * @return 员工列表
     */
    List<EmployeeVO> selectByPositionId(@Param("positionId") Long positionId);

    /**
     * 查询部门下的在职员工数量
     * 
     * @param departmentId 部门ID
     * @return 在职员工数量
     */
    Integer countActiveByDepartmentId(@Param("departmentId") Long departmentId);

    /**
     * 查询岗位下的在职员工数量
     * 
     * @param positionId 岗位ID
     * @return 在职员工数量
     */
    Integer countActiveByPositionId(@Param("positionId") Long positionId);

    /**
     * 查询即将到期的试用期员工
     * 
     * @param days 提前天数
     * @return 试用期员工列表
     */
    List<EmployeeVO> selectProbationExpiring(@Param("days") Integer days);

    /**
     * 查询员工生日列表(当月或指定月份)
     * 
     * @param month 月份(1-12)
     * @return 员工列表
     */
    List<EmployeeVO> selectBirthdayList(@Param("month") Integer month);

    /**
     * 新增员工
     * 
     * @param employee 员工信息
     * @return 影响行数
     */
    int insert(Employee employee);

    /**
     * 更新员工信息
     * 
     * @param employee 员工信息
     * @return 影响行数
     */
    int updateById(Employee employee);

    /**
     * 更新员工状态
     * 
     * @param id 员工ID
     * @param status 状态
     * @return 影响行数
     */
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    /**
     * 更新员工在职状态
     * 
     * @param id 员工ID
     * @param employmentStatus 在职状态
     * @return 影响行数
     */
    int updateEmploymentStatus(@Param("id") Long id, @Param("employmentStatus") Integer employmentStatus);

    /**
     * 批量更新员工部门
     * 
     * @param employeeIds 员工ID列表
     * @param departmentId 新部门ID
     * @param departmentName 新部门名称
     * @return 影响行数
     */
    int batchUpdateDepartment(@Param("employeeIds") List<Long> employeeIds, 
                             @Param("departmentId") Long departmentId, 
                             @Param("departmentName") String departmentName);

    /**
     * 批量更新员工岗位
     * 
     * @param employeeIds 员工ID列表
     * @param positionId 新岗位ID
     * @param positionName 新岗位名称
     * @return 影响行数
     */
    int batchUpdatePosition(@Param("employeeIds") List<Long> employeeIds, 
                           @Param("positionId") Long positionId, 
                           @Param("positionName") String positionName);

    /**
     * 软删除员工
     * 
     * @param id 员工ID
     * @return 影响行数
     */
    int deleteById(@Param("id") Long id);

    /**
     * 批量软删除员工
     * 
     * @param ids 员工ID列表
     * @return 影响行数
     */
    int batchDelete(@Param("ids") List<Long> ids);

    /**
     * 生成下一个员工编号
     * 
     * @param prefix 前缀(如:EMP)
     * @param year 年份
     * @return 员工编号
     */
    String generateNextEmpNo(@Param("prefix") String prefix, @Param("year") Integer year);

    /**
     * 检查员工编号是否存在
     * 
     * @param empNo 员工编号
     * @param excludeId 排除的员工ID
     * @return 是否存在
     */
    Boolean existsEmpNo(@Param("empNo") String empNo, @Param("excludeId") Long excludeId);

    /**
     * 检查手机号是否存在
     * 
     * @param mobile 手机号
     * @param excludeId 排除的员工ID
     * @return 是否存在
     */
    Boolean existsMobile(@Param("mobile") String mobile, @Param("excludeId") Long excludeId);

    /**
     * 检查身份证号是否存在
     * 
     * @param idCard 身份证号
     * @param excludeId 排除的员工ID
     * @return 是否存在
     */
    Boolean existsIdCard(@Param("idCard") String idCard, @Param("excludeId") Long excludeId);

    /**
     * 获取员工统计信息
     * 
     * @return 统计信息
     */
    EmployeeStatisticsVO getStatistics();

    /**
     * 获取部门员工分布统计
     * 
     * @return 部门员工分布
     */
    List<DepartmentEmployeeDistributionVO> getDepartmentDistribution();

    /**
     * 员工统计信息VO
     */
    interface EmployeeStatisticsVO {
        Integer getTotalCount();
        Integer getActiveCount();
        Integer getProbationCount();
        Integer getLeaveCount();
        Integer getThisMonthJoinCount();
        Integer getThisMonthLeaveCount();
    }

    /**
     * 部门员工分布VO
     */
    interface DepartmentEmployeeDistributionVO {
        Long getDepartmentId();
        String getDepartmentName();
        Integer getEmployeeCount();
        Integer getActiveCount();
        Integer getProbationCount();
    }
} 