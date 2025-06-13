package com.central.organization.controller;

import com.central.organization.mapper.EmployeeMapper;
import com.central.organization.model.dto.EmployeeQueryDTO;
import com.central.organization.model.dto.EmployeeSaveDTO;
import com.central.organization.model.vo.EmployeeVO;
import com.central.organization.service.IEmployeeService;
import com.central.organization.utils.IdUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * 员工管理控制器
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/api/organization/employee")
public class EmployeeController {

    @Autowired
    private IEmployeeService employeeService;

    /**
     * 分页查询员工列表
     * 
     * @param query 查询条件
     * @return 员工分页列表
     */
    @GetMapping("/page")
    public Result<IEmployeeService.PageResult<EmployeeVO>> getEmployeePage(EmployeeQueryDTO query) {
        // ID转换处理
        if (query.getDepartmentId() != null) {
            query.setDepartmentId(IdUtils.stringToLong(query.getDepartmentId().toString()));
        }
        if (query.getPositionId() != null) {
            query.setPositionId(IdUtils.stringToLong(query.getPositionId().toString()));
        }
        if (query.getGradeId() != null) {
            query.setGradeId(IdUtils.stringToLong(query.getGradeId().toString()));
        }

        try{
            IEmployeeService.PageResult<EmployeeVO> pageResult = employeeService.getPageList(query);
            return Result.success(pageResult);
        }catch (Exception ex){
            ex.printStackTrace();
        }
        return null;
    }

    /**
     * 根据ID查询员工详情
     * 
     * @param id 员工ID
     * @return 员工详情
     */
    @GetMapping("/{id}")
    public Result<EmployeeVO> getEmployeeById(@PathVariable String id) {
        Long employeeId = IdUtils.stringToLong(id);
        EmployeeVO employee = employeeService.getById(employeeId);
        if (employee == null) {
            return Result.error("员工不存在");
        }
        return Result.success(employee);
    }

    /**
     * 根据部门ID查询员工列表
     * 
     * @param departmentId 部门ID
     * @param includeSubDept 是否包含子部门
     * @return 员工列表
     */
    @GetMapping("/department/{departmentId}")
    public Result<List<EmployeeVO>> getEmployeesByDepartment(
            @PathVariable String departmentId,
            @RequestParam(defaultValue = "false") Boolean includeSubDept) {
        Long deptId = IdUtils.stringToLong(departmentId);
        List<EmployeeVO> employees = employeeService.getByDepartmentId(deptId, includeSubDept);
        return Result.success(employees);
    }

    /**
     * 根据岗位ID查询员工列表
     * 
     * @param positionId 岗位ID
     * @return 员工列表
     */
    @GetMapping("/position/{positionId}")
    public Result<List<EmployeeVO>> getEmployeesByPosition(@PathVariable String positionId) {
        Long posId = IdUtils.stringToLong(positionId);
        List<EmployeeVO> employees = employeeService.getByPositionId(posId);
        return Result.success(employees);
    }

    /**
     * 查询即将到期的试用期员工
     * 
     * @param days 提前天数
     * @return 试用期员工列表
     */
    @GetMapping("/probation-expiring")
    public Result<List<EmployeeVO>> getProbationExpiring(@RequestParam(defaultValue = "7") Integer days) {
        List<EmployeeVO> employees = employeeService.getProbationExpiring(days);
        return Result.success(employees);
    }

    /**
     * 查询员工生日列表
     * 
     * @param month 月份(1-12)，为空则查询当月
     * @return 员工生日列表
     */
    @GetMapping("/birthday")
    public Result<List<EmployeeVO>> getBirthdayList(@RequestParam(required = false) Integer month) {
        List<EmployeeVO> employees = employeeService.getBirthdayList(month);
        return Result.success(employees);
    }

    /**
     * 保存员工信息(新增或修改)
     * 
     * @param saveDTO 员工保存DTO
     * @return 员工ID
     */
    @PostMapping("/save")
    public Result<String> saveEmployee(@RequestBody @Valid EmployeeSaveDTO saveDTO) {
        // ID转换处理
        if (saveDTO.getId() != null) {
            saveDTO.setId(IdUtils.stringToLong(saveDTO.getId().toString()));
        }
        if (saveDTO.getDepartmentId() != null) {
            saveDTO.setDepartmentId(IdUtils.stringToLong(saveDTO.getDepartmentId().toString()));
        }
        if (saveDTO.getPositionId() != null) {
            saveDTO.setPositionId(IdUtils.stringToLong(saveDTO.getPositionId().toString()));
        }
        if (saveDTO.getGradeId() != null) {
            saveDTO.setGradeId(IdUtils.stringToLong(saveDTO.getGradeId().toString()));
        }
        if (saveDTO.getSupervisorId() != null) {
            saveDTO.setSupervisorId(IdUtils.stringToLong(saveDTO.getSupervisorId().toString()));
        }

        // 转换副岗位ID列表
        if (saveDTO.getSecondaryPositionIds() != null) {
            saveDTO.setSecondaryPositionIds(
                saveDTO.getSecondaryPositionIds().stream()
                    .map(idObj -> IdUtils.stringToLong(idObj.toString()))
                    .toList()
            );
        }

        Long employeeId = employeeService.saveEmployee(saveDTO);
        return Result.success(IdUtils.longToString(employeeId));
    }

    /**
     * 员工入职
     * 
     * @param saveDTO 员工信息
     * @return 员工ID
     */
    @PostMapping("/join")
    public Result<String> employeeJoin(@RequestBody @Valid EmployeeSaveDTO saveDTO) {
        // ID转换处理
        if (saveDTO.getDepartmentId() != null) {
            saveDTO.setDepartmentId(IdUtils.stringToLong(saveDTO.getDepartmentId().toString()));
        }
        if (saveDTO.getPositionId() != null) {
            saveDTO.setPositionId(IdUtils.stringToLong(saveDTO.getPositionId().toString()));
        }
        if (saveDTO.getGradeId() != null) {
            saveDTO.setGradeId(IdUtils.stringToLong(saveDTO.getGradeId().toString()));
        }
        if (saveDTO.getSupervisorId() != null) {
            saveDTO.setSupervisorId(IdUtils.stringToLong(saveDTO.getSupervisorId().toString()));
        }

        Long employeeId = employeeService.employeeJoin(saveDTO);
        return Result.success(IdUtils.longToString(employeeId));
    }

    /**
     * 员工转正
     * 
     * @param id 员工ID
     * @return 操作结果
     */
    @PostMapping("/{id}/regular")
    public Result<Void> employeeRegular(@PathVariable String id) {
        Long employeeId = IdUtils.stringToLong(id);
        boolean success = employeeService.employeeRegular(employeeId);
        if (success) {
            return Result.success();
        } else {
            return Result.error("员工转正失败");
        }
    }

    /**
     * 员工调岗
     * 
     * @param id 员工ID
     * @param transferDTO 调岗信息
     * @return 操作结果
     */
    @PostMapping("/{id}/transfer")
    public Result<Void> employeeTransfer(@PathVariable String id, 
                                       @RequestBody EmployeeTransferDTO transferDTO) {
        Long employeeId = IdUtils.stringToLong(id);
        Long newDepartmentId = IdUtils.stringToLong(transferDTO.getNewDepartmentId());
        Long newPositionId = IdUtils.stringToLong(transferDTO.getNewPositionId());
        
        boolean success = employeeService.employeeTransfer(employeeId, newDepartmentId, 
                                                          newPositionId, transferDTO.getReason());
        if (success) {
            return Result.success();
        } else {
            return Result.error("员工调岗失败");
        }
    }

    /**
     * 员工离职
     * 
     * @param id 员工ID
     * @param leaveDTO 离职信息
     * @return 操作结果
     */
    @PostMapping("/{id}/leave")
    public Result<Void> employeeLeave(@PathVariable String id, 
                                    @RequestBody EmployeeLeaveDTO leaveDTO) {
        Long employeeId = IdUtils.stringToLong(id);
        boolean success = employeeService.employeeLeave(employeeId, leaveDTO.getLeaveDate(), 
                                                       leaveDTO.getLeaveReason());
        if (success) {
            return Result.success();
        } else {
            return Result.error("员工离职失败");
        }
    }

    /**
     * 批量调整员工部门
     * 
     * @param batchUpdateDTO 批量更新信息
     * @return 操作结果
     */
    @PostMapping("/batch-update-department")
    public Result<Void> batchUpdateDepartment(@RequestBody BatchUpdateDepartmentDTO batchUpdateDTO) {
        List<Long> employeeIds = batchUpdateDTO.getEmployeeIds().stream()
                .map(IdUtils::stringToLong)
                .toList();
        Long departmentId = IdUtils.stringToLong(batchUpdateDTO.getDepartmentId());
        
        boolean success = employeeService.batchUpdateDepartment(employeeIds, departmentId);
        if (success) {
            return Result.success();
        } else {
            return Result.error("批量调整部门失败");
        }
    }

    /**
     * 批量调整员工岗位
     * 
     * @param batchUpdateDTO 批量更新信息
     * @return 操作结果
     */
    @PostMapping("/batch-update-position")
    public Result<Void> batchUpdatePosition(@RequestBody BatchUpdatePositionDTO batchUpdateDTO) {
        List<Long> employeeIds = batchUpdateDTO.getEmployeeIds().stream()
                .map(IdUtils::stringToLong)
                .toList();
        Long positionId = IdUtils.stringToLong(batchUpdateDTO.getPositionId());
        
        boolean success = employeeService.batchUpdatePosition(employeeIds, positionId);
        if (success) {
            return Result.success();
        } else {
            return Result.error("批量调整岗位失败");
        }
    }

    /**
     * 更新员工状态
     * 
     * @param id 员工ID
     * @param status 状态
     * @return 操作结果
     */
    @PostMapping("/{id}/status")
    public Result<Void> updateStatus(@PathVariable String id, @RequestParam Integer status) {
        Long employeeId = IdUtils.stringToLong(id);
        boolean success = employeeService.updateStatus(employeeId, status);
        if (success) {
            return Result.success();
        } else {
            return Result.error("更新状态失败");
        }
    }

    /**
     * 删除员工
     * 
     * @param id 员工ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    public Result<Void> deleteEmployee(@PathVariable String id) {
        Long employeeId = IdUtils.stringToLong(id);
        boolean success = employeeService.deleteById(employeeId);
        if (success) {
            return Result.success();
        } else {
            return Result.error("删除员工失败");
        }
    }

    /**
     * 批量删除员工
     * 
     * @param ids 员工ID列表
     * @return 操作结果
     */
    @DeleteMapping("/batch")
    public Result<Void> batchDeleteEmployees(@RequestBody List<String> ids) {
        List<Long> employeeIds = ids.stream()
                .map(IdUtils::stringToLong)
                .toList();
        boolean success = employeeService.batchDelete(employeeIds);
        if (success) {
            return Result.success();
        } else {
            return Result.error("批量删除员工失败");
        }
    }

    /**
     * 生成员工编号
     * 
     * @return 员工编号
     */
    @GetMapping("/generate-emp-no")
    public Result<String> generateEmpNo() {
        String empNo = employeeService.generateEmpNo();
        return Result.success(empNo);
    }

    /**
     * 获取员工统计信息
     * 
     * @return 统计信息
     */
    @GetMapping("/statistics")
    public Result<EmployeeStatisticsVO> getStatistics() {
        var statistics = employeeService.getStatistics();
        return Result.success(new EmployeeStatisticsVO(statistics));
    }

    /**
     * 获取部门员工分布统计
     * 
     * @return 部门员工分布
     */
    @GetMapping("/department-distribution")
    public Result<List<DepartmentEmployeeDistributionVO>> getDepartmentDistribution() {
        var distribution = employeeService.getDepartmentDistribution();
        List<DepartmentEmployeeDistributionVO> result = distribution.stream()
                .map(item -> new DepartmentEmployeeDistributionVO(
                    IdUtils.longToString(item.getDepartmentId()),
                    item.getDepartmentName(),
                    item.getEmployeeCount(),
                    item.getActiveCount(),
                    item.getProbationCount()
                ))
                .toList();
        return Result.success(result);
    }

    /**
     * 导出员工数据
     * 
     * @param query 查询条件
     * @return 导出数据
     */
    @PostMapping("/export")
    public Result<List<EmployeeVO>> exportEmployees(@RequestBody EmployeeQueryDTO query) {
        // ID转换处理
        if (query.getDepartmentId() != null) {
            query.setDepartmentId(IdUtils.stringToLong(query.getDepartmentId().toString()));
        }
        if (query.getPositionId() != null) {
            query.setPositionId(IdUtils.stringToLong(query.getPositionId().toString()));
        }
        if (query.getGradeId() != null) {
            query.setGradeId(IdUtils.stringToLong(query.getGradeId().toString()));
        }
        
        List<EmployeeVO> employees = employeeService.exportEmployees(query);
        return Result.success(employees);
    }

    // 内部DTO类定义

    /**
     * 员工调岗DTO
     */
    public static class EmployeeTransferDTO {
        private String newDepartmentId;
        private String newPositionId;
        private String reason;

        // getters and setters
        public String getNewDepartmentId() { return newDepartmentId; }
        public void setNewDepartmentId(String newDepartmentId) { this.newDepartmentId = newDepartmentId; }
        public String getNewPositionId() { return newPositionId; }
        public void setNewPositionId(String newPositionId) { this.newPositionId = newPositionId; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }

    /**
     * 员工离职DTO
     */
    public static class EmployeeLeaveDTO {
        private String leaveDate;
        private String leaveReason;

        // getters and setters
        public String getLeaveDate() { return leaveDate; }
        public void setLeaveDate(String leaveDate) { this.leaveDate = leaveDate; }
        public String getLeaveReason() { return leaveReason; }
        public void setLeaveReason(String leaveReason) { this.leaveReason = leaveReason; }
    }

    /**
     * 批量更新部门DTO
     */
    public static class BatchUpdateDepartmentDTO {
        private List<String> employeeIds;
        private String departmentId;

        // getters and setters
        public List<String> getEmployeeIds() { return employeeIds; }
        public void setEmployeeIds(List<String> employeeIds) { this.employeeIds = employeeIds; }
        public String getDepartmentId() { return departmentId; }
        public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }
    }

    /**
     * 批量更新岗位DTO
     */
    public static class BatchUpdatePositionDTO {
        private List<String> employeeIds;
        private String positionId;

        // getters and setters
        public List<String> getEmployeeIds() { return employeeIds; }
        public void setEmployeeIds(List<String> employeeIds) { this.employeeIds = employeeIds; }
        public String getPositionId() { return positionId; }
        public void setPositionId(String positionId) { this.positionId = positionId; }
    }

    /**
     * 员工统计信息VO
     */
    public static class EmployeeStatisticsVO {
        private Integer totalCount;
        private Integer activeCount;
        private Integer probationCount;
        private Integer leaveCount;
        private Integer thisMonthJoinCount;
        private Integer thisMonthLeaveCount;

        public EmployeeStatisticsVO(Map<String, Object> statistics) {
            this.totalCount = statistics.get("totalCount") != null ? 
                ((Number) statistics.get("totalCount")).intValue() : 0;
            this.activeCount = statistics.get("activeCount") != null ? 
                ((Number) statistics.get("activeCount")).intValue() : 0;
            this.probationCount = statistics.get("probationCount") != null ? 
                ((Number) statistics.get("probationCount")).intValue() : 0;
            this.leaveCount = statistics.get("leaveCount") != null ? 
                ((Number) statistics.get("leaveCount")).intValue() : 0;
            this.thisMonthJoinCount = statistics.get("thisMonthJoinCount") != null ? 
                ((Number) statistics.get("thisMonthJoinCount")).intValue() : 0;
            this.thisMonthLeaveCount = statistics.get("thisMonthLeaveCount") != null ? 
                ((Number) statistics.get("thisMonthLeaveCount")).intValue() : 0;
        }

        // getters and setters
        public Integer getTotalCount() { return totalCount; }
        public void setTotalCount(Integer totalCount) { this.totalCount = totalCount; }
        public Integer getActiveCount() { return activeCount; }
        public void setActiveCount(Integer activeCount) { this.activeCount = activeCount; }
        public Integer getProbationCount() { return probationCount; }
        public void setProbationCount(Integer probationCount) { this.probationCount = probationCount; }
        public Integer getLeaveCount() { return leaveCount; }
        public void setLeaveCount(Integer leaveCount) { this.leaveCount = leaveCount; }
        public Integer getThisMonthJoinCount() { return thisMonthJoinCount; }
        public void setThisMonthJoinCount(Integer thisMonthJoinCount) { this.thisMonthJoinCount = thisMonthJoinCount; }
        public Integer getThisMonthLeaveCount() { return thisMonthLeaveCount; }
        public void setThisMonthLeaveCount(Integer thisMonthLeaveCount) { this.thisMonthLeaveCount = thisMonthLeaveCount; }
    }

    /**
     * 部门员工分布VO
     */
    public static class DepartmentEmployeeDistributionVO {
        private String departmentId;
        private String departmentName;
        private Integer employeeCount;
        private Integer activeCount;
        private Integer probationCount;

        public DepartmentEmployeeDistributionVO(String departmentId, String departmentName, 
                                               Integer employeeCount, Integer activeCount, Integer probationCount) {
            this.departmentId = departmentId;
            this.departmentName = departmentName;
            this.employeeCount = employeeCount;
            this.activeCount = activeCount;
            this.probationCount = probationCount;
        }

        // getters and setters
        public String getDepartmentId() { return departmentId; }
        public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }
        public String getDepartmentName() { return departmentName; }
        public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
        public Integer getEmployeeCount() { return employeeCount; }
        public void setEmployeeCount(Integer employeeCount) { this.employeeCount = employeeCount; }
        public Integer getActiveCount() { return activeCount; }
        public void setActiveCount(Integer activeCount) { this.activeCount = activeCount; }
        public Integer getProbationCount() { return probationCount; }
        public void setProbationCount(Integer probationCount) { this.probationCount = probationCount; }
    }

    /**
     * 统一返回结果类
     */
    public static class Result<T> {
        private boolean success;
        private String message;
        private T data;

        private Result(boolean success, String message, T data) {
            this.success = success;
            this.message = message;
            this.data = data;
        }

        public static <T> Result<T> success() {
            return new Result<>(true, "成功", null);
        }

        public static <T> Result<T> success(T data) {
            return new Result<>(true, "成功", data);
        }

        public static <T> Result<T> error(String message) {
            return new Result<>(false, message, null);
        }

        // getters and setters
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public T getData() { return data; }
        public void setData(T data) { this.data = data; }
    }
} 