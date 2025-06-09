package com.central.organization.service;

import com.central.organization.model.Employee;
import com.central.organization.dto.EmployeeDetailDTO;
import com.central.organization.dto.EmployeeSearchDTO;
import com.central.common.model.PageResult;
import com.central.common.model.Result;

import java.util.List;
import java.util.Map;

/**
 * 员工管理服务接口
 * 
 * @author Portal Team
 * @since 2024-01-01
 */
public interface EmployeeService {

    /**
     * 分页查询员工
     * 
     * @param pageNum 页码
     * @param pageSize 页大小
     * @param searchDTO 搜索条件
     * @param tenantId 租户ID
     * @return 分页结果
     */
    PageResult<Employee> getEmployeePage(int pageNum, int pageSize, EmployeeSearchDTO searchDTO, String tenantId);

    /**
     * 根据ID获取员工详情
     * 
     * @param id 员工ID
     * @param tenantId 租户ID
     * @return 员工详情
     */
    EmployeeDetailDTO getEmployeeDetailById(Long id, String tenantId);

    /**
     * 根据员工编号获取员工
     * 
     * @param empNo 员工编号
     * @param tenantId 租户ID
     * @return 员工信息
     */
    Employee getEmployeeByEmpNo(String empNo, String tenantId);

    /**
     * 保存员工（新增或更新）
     * 
     * @param employee 员工信息
     * @return 操作结果
     */
    Result<Employee> saveEmployee(Employee employee);

    /**
     * 删除员工
     * 
     * @param id 员工ID
     * @param tenantId 租户ID
     * @return 操作结果
     */
    Result<Void> deleteEmployee(Long id, String tenantId);

    /**
     * 批量删除员工
     * 
     * @param ids 员工ID列表
     * @param tenantId 租户ID
     * @return 操作结果
     */
    Result<Void> batchDeleteEmployees(List<Long> ids, String tenantId);

    /**
     * 员工调部门
     * 
     * @param employeeId 员工ID
     * @param newDepartmentId 新部门ID
     * @param newPositionId 新岗位ID
     * @param effectiveDate 生效日期
     * @param tenantId 租户ID
     * @return 操作结果
     */
    Result<Void> transferEmployee(Long employeeId, Long newDepartmentId, Long newPositionId, String effectiveDate, String tenantId);

    /**
     * 员工离职
     * 
     * @param employeeId 员工ID
     * @param leaveDate 离职日期
     * @param leaveReason 离职原因
     * @param tenantId 租户ID
     * @return 操作结果
     */
    Result<Void> employeeLeave(Long employeeId, String leaveDate, String leaveReason, String tenantId);

    /**
     * 员工入职
     * 
     * @param employee 员工信息
     * @return 操作结果
     */
    Result<Employee> employeeEntry(Employee employee);

    /**
     * 批量导入员工
     * 
     * @param employees 员工数据列表
     * @param tenantId 租户ID
     * @return 导入结果
     */
    Result<Map<String, Object>> importEmployees(List<Employee> employees, String tenantId);

    /**
     * 导出员工数据
     * 
     * @param searchDTO 搜索条件
     * @param tenantId 租户ID
     * @return 员工数据
     */
    List<Employee> exportEmployees(EmployeeSearchDTO searchDTO, String tenantId);

    /**
     * 根据部门ID获取员工列表
     * 
     * @param departmentId 部门ID
     * @param includeSubDepts 是否包含下级部门
     * @param tenantId 租户ID
     * @return 员工列表
     */
    List<Employee> getEmployeesByDepartment(Long departmentId, boolean includeSubDepts, String tenantId);

    /**
     * 根据岗位ID获取员工列表
     * 
     * @param positionId 岗位ID
     * @param tenantId 租户ID
     * @return 员工列表
     */
    List<Employee> getEmployeesByPosition(Long positionId, String tenantId);

    /**
     * 检查员工编号是否存在
     * 
     * @param empNo 员工编号
     * @param excludeId 排除的员工ID
     * @param tenantId 租户ID
     * @return 是否存在
     */
    boolean checkEmpNoExists(String empNo, Long excludeId, String tenantId);

    /**
     * 生成员工编号
     * 
     * @param departmentId 部门ID
     * @param tenantId 租户ID
     * @return 员工编号
     */
    String generateEmpNo(Long departmentId, String tenantId);

    /**
     * 获取员工统计信息
     * 
     * @param departmentId 部门ID（可选）
     * @param tenantId 租户ID
     * @return 统计信息
     */
    Map<String, Object> getEmployeeStatistics(Long departmentId, String tenantId);

    /**
     * 员工试用期转正
     * 
     * @param employeeId 员工ID
     * @param conversionDate 转正日期
     * @param tenantId 租户ID
     * @return 操作结果
     */
    Result<Void> employeeConversion(Long employeeId, String conversionDate, String tenantId);

    /**
     * 更新员工头像
     * 
     * @param employeeId 员工ID
     * @param avatarUrl 头像URL
     * @param tenantId 租户ID
     * @return 操作结果
     */
    Result<Void> updateEmployeeAvatar(Long employeeId, String avatarUrl, String tenantId);

    /**
     * 获取我的团队（部门主管查看下属）
     * 
     * @param managerId 主管员工ID
     * @param tenantId 租户ID
     * @return 团队成员列表
     */
    List<Employee> getMyTeam(Long managerId, String tenantId);

    /**
     * 获取组织架构图数据
     * 
     * @param rootDepartmentId 根部门ID
     * @param tenantId 租户ID
     * @return 组织架构数据
     */
    Map<String, Object> getOrganizationChart(Long rootDepartmentId, String tenantId);
} 