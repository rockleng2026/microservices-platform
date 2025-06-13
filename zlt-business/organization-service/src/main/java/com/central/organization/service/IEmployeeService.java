package com.central.organization.service;

import com.central.organization.model.Employee;
import com.central.organization.model.dto.EmployeeQueryDTO;
import com.central.organization.model.dto.EmployeeSaveDTO;
import com.central.organization.model.vo.EmployeeVO;
import com.central.organization.mapper.EmployeeMapper;

import java.util.List;
import java.util.Map;

/**
 * 员工服务接口
 * 
 * @author Central Team
 * @since 2024-12-19
 */
public interface IEmployeeService {

    /**
     * 根据ID查询员工详细信息
     * 
     * @param id 员工ID
     * @return 员工详细信息
     */
    EmployeeVO getById(Long id);

    /**
     * 根据员工编号查询员工
     * 
     * @param empNo 员工编号
     * @return 员工信息
     */
    Employee getByEmpNo(String empNo);

    /**
     * 分页查询员工列表
     * 
     * @param query 查询条件
     * @return 分页结果
     */
    PageResult<EmployeeVO> getPageList(EmployeeQueryDTO query);

    /**
     * 根据部门ID查询员工列表
     * 
     * @param departmentId 部门ID
     * @param includeSubDept 是否包含子部门
     * @return 员工列表
     */
    List<EmployeeVO> getByDepartmentId(Long departmentId, Boolean includeSubDept);

    /**
     * 根据岗位ID查询员工列表
     * 
     * @param positionId 岗位ID
     * @return 员工列表
     */
    List<EmployeeVO> getByPositionId(Long positionId);

    /**
     * 查询即将到期的试用期员工
     * 
     * @param days 提前天数
     * @return 试用期员工列表
     */
    List<EmployeeVO> getProbationExpiring(Integer days);

    /**
     * 查询员工生日列表
     * 
     * @param month 月份(1-12)，为空则查询当月
     * @return 员工列表
     */
    List<EmployeeVO> getBirthdayList(Integer month);

    /**
     * 保存员工信息(新增或修改)
     * 
     * @param saveDTO 员工保存DTO
     * @return 员工ID
     */
    Long saveEmployee(EmployeeSaveDTO saveDTO);

    /**
     * 更新员工状态
     * 
     * @param id 员工ID
     * @param status 状态
     * @return 是否成功
     */
    Boolean updateStatus(Long id, Integer status);

    /**
     * 更新员工在职状态
     * 
     * @param id 员工ID
     * @param employmentStatus 在职状态
     * @return 是否成功
     */
    Boolean updateEmploymentStatus(Long id, Integer employmentStatus);

    /**
     * 员工入职
     * 
     * @param saveDTO 员工信息
     * @return 员工ID
     */
    Long employeeJoin(EmployeeSaveDTO saveDTO);

    /**
     * 员工转正
     * 
     * @param id 员工ID
     * @return 是否成功
     */
    Boolean employeeRegular(Long id);

    /**
     * 员工调岗
     * 
     * @param id 员工ID
     * @param newDepartmentId 新部门ID
     * @param newPositionId 新岗位ID
     * @param reason 调岗原因
     * @return 是否成功
     */
    Boolean employeeTransfer(Long id, Long newDepartmentId, Long newPositionId, String reason);

    /**
     * 员工离职
     * 
     * @param id 员工ID
     * @param leaveDate 离职日期
     * @param leaveReason 离职原因
     * @return 是否成功
     */
    Boolean employeeLeave(Long id, String leaveDate, String leaveReason);

    /**
     * 批量调整员工部门
     * 
     * @param employeeIds 员工ID列表
     * @param departmentId 新部门ID
     * @return 是否成功
     */
    Boolean batchUpdateDepartment(List<Long> employeeIds, Long departmentId);

    /**
     * 批量调整员工岗位
     * 
     * @param employeeIds 员工ID列表
     * @param positionId 新岗位ID
     * @return 是否成功
     */
    Boolean batchUpdatePosition(List<Long> employeeIds, Long positionId);

    /**
     * 删除员工
     * 
     * @param id 员工ID
     * @return 是否成功
     */
    Boolean deleteById(Long id);

    /**
     * 批量删除员工
     * 
     * @param ids 员工ID列表
     * @return 是否成功
     */
    Boolean batchDelete(List<Long> ids);

    /**
     * 生成员工编号
     * 
     * @return 员工编号
     */
    String generateEmpNo();

    /**
     * 验证员工数据
     * 
     * @param saveDTO 员工数据
     * @return 验证结果
     */
    ValidationResult validateEmployee(EmployeeSaveDTO saveDTO);

    /**
     * 导入员工数据
     * 
     * @param employeeList 员工数据列表
     * @return 导入结果
     */
    ImportResult importEmployees(List<EmployeeSaveDTO> employeeList);

    /**
     * 导出员工数据
     * 
     * @param query 查询条件
     * @return 导出数据
     */
    List<EmployeeVO> exportEmployees(EmployeeQueryDTO query);

    /**
     * 获取员工统计信息
     * 
     * @return 统计信息
     */
    Map<String, Object> getStatistics();

    /**
     * 获取部门员工分布统计
     * 
     * @return 部门员工分布
     */
    List<EmployeeMapper.DepartmentEmployeeDistributionVO> getDepartmentDistribution();

    /**
     * 分页结果类
     */
    class PageResult<T> {
        private List<T> records;
        private Long total;
        private Integer page;
        private Integer size;
        private Integer pages;

        // getters and setters
        public List<T> getRecords() { return records; }
        public void setRecords(List<T> records) { this.records = records; }
        public Long getTotal() { return total; }
        public void setTotal(Long total) { this.total = total; }
        public Integer getPage() { return page; }
        public void setPage(Integer page) { this.page = page; }
        public Integer getSize() { return size; }
        public void setSize(Integer size) { this.size = size; }
        public Integer getPages() { return pages; }
        public void setPages(Integer pages) { this.pages = pages; }
    }

    /**
     * 验证结果类
     */
    class ValidationResult {
        private boolean valid;
        private String message;
        private List<String> errors;

        // getters and setters
        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public List<String> getErrors() { return errors; }
        public void setErrors(List<String> errors) { this.errors = errors; }
    }

    /**
     * 导入结果类
     */
    class ImportResult {
        private int totalCount;
        private int successCount;
        private int failCount;
        private List<String> errorMessages;

        // getters and setters
        public int getTotalCount() { return totalCount; }
        public void setTotalCount(int totalCount) { this.totalCount = totalCount; }
        public int getSuccessCount() { return successCount; }
        public void setSuccessCount(int successCount) { this.successCount = successCount; }
        public int getFailCount() { return failCount; }
        public void setFailCount(int failCount) { this.failCount = failCount; }
        public List<String> getErrorMessages() { return errorMessages; }
        public void setErrorMessages(List<String> errorMessages) { this.errorMessages = errorMessages; }
    }
} 