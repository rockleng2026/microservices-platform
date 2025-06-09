package com.central.organization.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.organization.dto.EmployeeDetailDTO;
import com.central.organization.dto.EmployeeImportDTO;
import com.central.organization.dto.EmployeeStatisticsDTO;
import com.central.organization.mapper.EmployeeMapper;
import com.central.organization.model.Employee;
import com.central.organization.service.EmployeeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

/**
 * 员工管理服务实现
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Slf4j
@Service
public class EmployeeServiceImpl extends ServiceImpl<EmployeeMapper, Employee> implements EmployeeService {

    @Autowired
    private EmployeeMapper employeeMapper;

    // TODO: 获取当前租户ID
    private String getCurrentTenantId() {
        return "default";
    }

    // TODO: 获取当前用户ID
    private Integer getCurrentUserId() {
        return 1;
    }

    @Override
    public PageResult<Employee> getEmployeePage(Integer page, Integer size, String keyword, 
                                              Integer departmentId, Integer positionId, 
                                              Integer status, String employmentType) {
        String tenantId = getCurrentTenantId();
        Page<Employee> pageParam = new Page<>(page, size);
        
        IPage<Employee> result = employeeMapper.selectEmployeePageWithDetails(
            pageParam, tenantId, keyword, departmentId, positionId, status, employmentType);
        
        return PageResult.<Employee>builder()
                .list(result.getRecords())
                .total(result.getTotal())
                .page(page)
                .size(size)
                .build();
    }

    @Override
    public EmployeeDetailDTO getEmployeeDetail(Integer id) {
        String tenantId = getCurrentTenantId();
        return employeeMapper.selectEmployeeDetailById(id, tenantId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Employee> createEmployee(Employee employee) {
        try {
            // 设置租户信息
            employee.setTenantId(getCurrentTenantId());
            employee.setCreatedBy(getCurrentUserId());
            
            // 验证工号唯一性
            if (StringUtils.hasText(employee.getEmpNo())) {
                if (!isEmpNoAvailable(employee.getEmpNo(), null)) {
                    return Result.failed("工号已存在");
                }
            } else {
                // 自动生成工号
                employee.setEmpNo(generateEmpNo(employee.getDepartmentId()));
            }
            
            // 验证身份证号唯一性
            if (StringUtils.hasText(employee.getIdCardNo())) {
                if (!isIdCardNoAvailable(employee.getIdCardNo(), null)) {
                    return Result.failed("身份证号已存在");
                }
            }
            
            // 验证手机号唯一性
            if (StringUtils.hasText(employee.getPhoneNumber())) {
                if (!isPhoneNumberAvailable(employee.getPhoneNumber(), null)) {
                    return Result.failed("手机号已存在");
                }
            }
            
            // 验证邮箱唯一性
            if (StringUtils.hasText(employee.getEmail())) {
                if (!isEmailAvailable(employee.getEmail(), null)) {
                    return Result.failed("邮箱已存在");
                }
            }
            
            // 计算年龄
            if (employee.getBirthDate() != null) {
                employee.setAge(calculateAge(employee.getBirthDate()));
            }
            
            // 保存员工
            boolean success = save(employee);
            if (success) {
                return Result.succeed(employee, "创建成功");
            } else {
                return Result.failed("创建失败");
            }
        } catch (Exception e) {
            log.error("创建员工失败", e);
            return Result.failed("创建失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Employee> updateEmployee(Employee employee) {
        try {
            // 设置更新信息
            employee.setUpdatedBy(getCurrentUserId());
            
            // 验证工号唯一性
            if (StringUtils.hasText(employee.getEmpNo())) {
                if (!isEmpNoAvailable(employee.getEmpNo(), employee.getId())) {
                    return Result.failed("工号已存在");
                }
            }
            
            // 验证身份证号唯一性
            if (StringUtils.hasText(employee.getIdCardNo())) {
                if (!isIdCardNoAvailable(employee.getIdCardNo(), employee.getId())) {
                    return Result.failed("身份证号已存在");
                }
            }
            
            // 验证手机号唯一性
            if (StringUtils.hasText(employee.getPhoneNumber())) {
                if (!isPhoneNumberAvailable(employee.getPhoneNumber(), employee.getId())) {
                    return Result.failed("手机号已存在");
                }
            }
            
            // 验证邮箱唯一性
            if (StringUtils.hasText(employee.getEmail())) {
                if (!isEmailAvailable(employee.getEmail(), employee.getId())) {
                    return Result.failed("邮箱已存在");
                }
            }
            
            // 重新计算年龄
            if (employee.getBirthDate() != null) {
                employee.setAge(calculateAge(employee.getBirthDate()));
            }
            
            // 更新员工
            boolean success = updateById(employee);
            if (success) {
                return Result.succeed(employee, "更新成功");
            } else {
                return Result.failed("更新失败");
            }
        } catch (Exception e) {
            log.error("更新员工失败", e);
            return Result.failed("更新失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> deleteEmployee(Integer id) {
        try {
            String tenantId = getCurrentTenantId();
            
            // 检查员工是否为部门负责人
            Integer managedDeptCount = employeeMapper.selectManagedDepartmentCount(id, tenantId);
            if (managedDeptCount != null && managedDeptCount > 0) {
                return Result.failed("该员工是部门负责人，无法删除");
            }
            
            // 软删除员工
            List<Integer> ids = List.of(id);
            int result = employeeMapper.batchSoftDelete(ids, tenantId, getCurrentUserId());
            
            if (result > 0) {
                return Result.succeed("删除成功");
            } else {
                return Result.failed("删除失败");
            }
        } catch (Exception e) {
            log.error("删除员工失败", e);
            return Result.failed("删除失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> deleteEmployees(List<Integer> ids) {
        try {
            String tenantId = getCurrentTenantId();
            
            // 批量检查是否为部门负责人
            for (Integer id : ids) {
                Integer managedDeptCount = employeeMapper.selectManagedDepartmentCount(id, tenantId);
                if (managedDeptCount != null && managedDeptCount > 0) {
                    return Result.failed("员工ID " + id + " 是部门负责人，无法删除");
                }
            }
            
            // 批量软删除
            int result = employeeMapper.batchSoftDelete(ids, tenantId, getCurrentUserId());
            
            if (result > 0) {
                return Result.succeed("批量删除成功");
            } else {
                return Result.failed("批量删除失败");
            }
        } catch (Exception e) {
            log.error("批量删除员工失败", e);
            return Result.failed("批量删除失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> updateEmployeeStatus(Integer id, Integer status) {
        try {
            String tenantId = getCurrentTenantId();
            int result = employeeMapper.updateEmployeeStatus(id, status, tenantId, getCurrentUserId());
            
            if (result > 0) {
                return Result.succeed("状态更新成功");
            } else {
                return Result.failed("状态更新失败");
            }
        } catch (Exception e) {
            log.error("更新员工状态失败", e);
            return Result.failed("状态更新失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> transferEmployee(Integer id, Integer newDepartmentId, Integer newPositionId) {
        try {
            String tenantId = getCurrentTenantId();
            int result = employeeMapper.transferEmployee(id, newDepartmentId, newPositionId, 
                                                       tenantId, getCurrentUserId());
            
            if (result > 0) {
                return Result.succeed("调动成功");
            } else {
                return Result.failed("调动失败");
            }
        } catch (Exception e) {
            log.error("员工调动失败", e);
            return Result.failed("调动失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> confirmEmployee(Integer id) {
        try {
            String tenantId = getCurrentTenantId();
            int result = employeeMapper.confirmEmployee(id, tenantId, getCurrentUserId());
            
            if (result > 0) {
                return Result.succeed("转正成功");
            } else {
                return Result.failed("转正失败");
            }
        } catch (Exception e) {
            log.error("员工转正失败", e);
            return Result.failed("转正失败：" + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Result<Void> resignEmployee(Integer id, LocalDate leaveDate, String leaveReason) {
        try {
            String tenantId = getCurrentTenantId();
            int result = employeeMapper.resignEmployee(id, leaveDate, leaveReason, 
                                                     tenantId, getCurrentUserId());
            
            if (result > 0) {
                return Result.succeed("离职办理成功");
            } else {
                return Result.failed("离职办理失败");
            }
        } catch (Exception e) {
            log.error("员工离职失败", e);
            return Result.failed("离职办理失败：" + e.getMessage());
        }
    }

    @Override
    public List<Employee> getEmployeesByDepartment(Integer departmentId, Boolean includeSubDepartments) {
        String tenantId = getCurrentTenantId();
        if (includeSubDepartments) {
            return employeeMapper.selectEmployeesByDepartmentTree(departmentId, tenantId);
        } else {
            return employeeMapper.selectEmployeesByDepartment(departmentId, tenantId);
        }
    }

    @Override
    public List<Employee> getEmployeesByPosition(Integer positionId) {
        String tenantId = getCurrentTenantId();
        return employeeMapper.selectEmployeesByPosition(positionId, tenantId);
    }

    @Override
    public EmployeeStatisticsDTO getEmployeeStatistics(Integer departmentId) {
        String tenantId = getCurrentTenantId();
        return employeeMapper.selectEmployeeStatistics(departmentId, tenantId);
    }

    @Override
    public List<Employee> getExpiringProbationEmployees(Integer days) {
        String tenantId = getCurrentTenantId();
        return employeeMapper.selectExpiringProbationEmployees(days, tenantId);
    }

    @Override
    public List<Employee> getBirthdayEmployees(LocalDate startDate, LocalDate endDate) {
        String tenantId = getCurrentTenantId();
        return employeeMapper.selectBirthdayEmployees(startDate, endDate, tenantId);
    }

    @Override
    public Boolean isEmpNoAvailable(String empNo, Integer excludeId) {
        String tenantId = getCurrentTenantId();
        int count = employeeMapper.checkEmpNoExists(empNo, excludeId, tenantId);
        return count == 0;
    }

    @Override
    public Boolean isIdCardNoAvailable(String idCardNo, Integer excludeId) {
        String tenantId = getCurrentTenantId();
        int count = employeeMapper.checkIdCardNoExists(idCardNo, excludeId, tenantId);
        return count == 0;
    }

    @Override
    public Boolean isPhoneNumberAvailable(String phoneNumber, Integer excludeId) {
        String tenantId = getCurrentTenantId();
        int count = employeeMapper.checkPhoneNumberExists(phoneNumber, excludeId, tenantId);
        return count == 0;
    }

    @Override
    public Boolean isEmailAvailable(String email, Integer excludeId) {
        String tenantId = getCurrentTenantId();
        int count = employeeMapper.checkEmailExists(email, excludeId, tenantId);
        return count == 0;
    }

    @Override
    public Result<String> importEmployees(MultipartFile file) {
        try {
            // TODO: 实现Excel导入逻辑
            return Result.succeed("导入成功");
        } catch (Exception e) {
            log.error("导入员工失败", e);
            return Result.failed("导入失败：" + e.getMessage());
        }
    }

    @Override
    public Result<String> exportEmployees(Integer departmentId) {
        try {
            // TODO: 实现Excel导出逻辑
            return Result.succeed("/downloads/employees.xlsx");
        } catch (Exception e) {
            log.error("导出员工失败", e);
            return Result.failed("导出失败：" + e.getMessage());
        }
    }

    @Override
    public String generateEmpNo(Integer departmentId) {
        // TODO: 实现工号生成逻辑
        return "EMP" + System.currentTimeMillis();
    }

    /**
     * 计算年龄
     */
    private Integer calculateAge(LocalDate birthDate) {
        if (birthDate == null) {
            return null;
        }
        return LocalDate.now().getYear() - birthDate.getYear();
    }
} 