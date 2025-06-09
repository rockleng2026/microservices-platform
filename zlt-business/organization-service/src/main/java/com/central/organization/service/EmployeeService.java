package com.central.organization.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.organization.dto.EmployeeDetailDTO;
import com.central.organization.dto.EmployeeSearchDTO;
import com.central.organization.model.Employee;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * 员工管理服务接口
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
public interface EmployeeService extends IService<Employee> {

    /**
     * 分页查询员工
     * 
     * @param searchDTO 查询条件
     * @return 分页结果
     */
    PageResult<EmployeeDetailDTO> getEmployeePage(EmployeeSearchDTO searchDTO);

    /**
     * 获取员工详情
     * 
     * @param id 员工ID
     * @return 员工详情
     */
    EmployeeDetailDTO getEmployeeDetail(Integer id);

    /**
     * 创建员工
     * 
     * @param employee 员工信息
     * @return 创建结果
     */
    Result<Employee> createEmployee(Employee employee);

    /**
     * 更新员工信息
     * 
     * @param employee 员工信息
     * @return 更新结果
     */
    Result<Employee> updateEmployee(Employee employee);

    /**
     * 删除员工（软删除）
     * 
     * @param id 员工ID
     * @return 删除结果
     */
    Result<Void> deleteEmployee(Integer id);

    /**
     * 批量删除员工
     * 
     * @param ids 员工ID列表
     * @return 删除结果
     */
    Result<Void> deleteEmployees(List<Integer> ids);

    /**
     * 员工入职
     * 
     * @param employee 员工信息
     * @return 入职结果
     */
    Result<Employee> employeeEntry(Employee employee);

    /**
     * 员工转正
     * 
     * @param employeeId 员工ID
     * @param formalDate 转正日期
     * @return 转正结果
     */
    Result<Void> employeeFormal(Integer employeeId, String formalDate);

    /**
     * 员工调岗
     * 
     * @param employeeId 员工ID
     * @param newDepartmentId 新部门ID
     * @param newPositionId 新岗位ID
     * @param transferReason 调岗原因
     * @return 调岗结果
     */
    Result<Void> employeeTransfer(Integer employeeId, Integer newDepartmentId, 
                                Integer newPositionId, String transferReason);

    /**
     * 员工离职
     * 
     * @param employeeId 员工ID
     * @param leaveDate 离职日期
     * @param leaveReason 离职原因
     * @return 离职结果
     */
    Result<Void> employeeLeave(Integer employeeId, String leaveDate, String leaveReason);

    /**
     * 检查员工编号是否可用
     * 
     * @param empNo 员工编号
     * @param excludeId 排除的员工ID
     * @return 是否可用
     */
    Boolean isEmployeeNoAvailable(String empNo, Integer excludeId);

    /**
     * 检查身份证号是否存在
     * 
     * @param idCard 身份证号
     * @param excludeId 排除的员工ID
     * @return 是否存在
     */
    Boolean isIdCardExists(String idCard, Integer excludeId);

    /**
     * 获取部门员工列表
     * 
     * @param departmentId 部门ID
     * @param includeSubDept 是否包含子部门
     * @return 员工列表
     */
    List<Employee> getDepartmentEmployees(Integer departmentId, Boolean includeSubDept);

    /**
     * 获取岗位员工列表
     * 
     * @param positionId 岗位ID
     * @return 员工列表
     */
    List<Employee> getPositionEmployees(Integer positionId);

    /**
     * 生成员工编号
     * 
     * @return 员工编号
     */
    String generateEmployeeNo();

    /**
     * 批量导入员工
     * 
     * @param file Excel文件
     * @return 导入结果
     */
    Result<Map<String, Object>> importEmployees(MultipartFile file);

    /**
     * 导出员工数据
     * 
     * @param searchDTO 查询条件
     * @return 导出文件路径
     */
    Result<String> exportEmployees(EmployeeSearchDTO searchDTO);

    /**
     * 保存员工扩展数据
     * 
     * @param employeeId 员工ID
     * @param configId 配置ID
     * @param dataContent 数据内容
     * @return 保存结果
     */
    Result<Void> saveEmployeeExtendData(Integer employeeId, Integer configId, String dataContent);

    /**
     * 获取员工扩展数据
     * 
     * @param employeeId 员工ID
     * @param configId 配置ID
     * @return 扩展数据
     */
    String getEmployeeExtendData(Integer employeeId, Integer configId);

    /**
     * 上传员工附件
     * 
     * @param employeeId 员工ID
     * @param attachmentType 附件类型
     * @param file 文件
     * @return 上传结果
     */
    Result<String> uploadEmployeeAttachment(Integer employeeId, String attachmentType, MultipartFile file);

    /**
     * 获取员工附件列表
     * 
     * @param employeeId 员工ID
     * @return 附件列表
     */
    List<Map<String, Object>> getEmployeeAttachments(Integer employeeId);

    /**
     * 删除员工附件
     * 
     * @param attachmentId 附件ID
     * @return 删除结果
     */
    Result<Void> deleteEmployeeAttachment(Integer attachmentId);

    /**
     * 获取员工统计信息
     * 
     * @param departmentId 部门ID，为空时统计全部
     * @return 统计信息
     */
    Map<String, Object> getEmployeeStatistics(Integer departmentId);

    /**
     * 创建员工登录账号
     * 
     * @param employeeId 员工ID
     * @param username 用户名
     * @param password 密码
     * @return 创建结果
     */
    Result<Void> createEmployeeAccount(Integer employeeId, String username, String password);

    /**
     * 重置员工密码
     * 
     * @param employeeId 员工ID
     * @param newPassword 新密码
     * @return 重置结果
     */
    Result<Void> resetEmployeePassword(Integer employeeId, String newPassword);

    /**
     * 启用/禁用员工账号
     * 
     * @param employeeId 员工ID
     * @param enabled 是否启用
     * @return 操作结果
     */
    Result<Void> toggleEmployeeAccountStatus(Integer employeeId, Boolean enabled);
} 