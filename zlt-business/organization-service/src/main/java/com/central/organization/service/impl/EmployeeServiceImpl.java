package com.central.organization.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.date.DateUtil;
import cn.hutool.core.util.StrUtil;
import com.central.organization.mapper.EmployeeMapper;
import com.central.organization.mapper.DepartmentMapper;
import com.central.organization.model.Employee;
import com.central.organization.model.Department;
import com.central.organization.model.dto.EmployeeQueryDTO;
import com.central.organization.model.dto.EmployeeSaveDTO;
import com.central.organization.model.vo.EmployeeVO;
import com.central.organization.service.IEmployeeService;
import com.central.organization.utils.IdUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 员工服务实现类
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@Service
public class EmployeeServiceImpl implements IEmployeeService {

    @Autowired
    private EmployeeMapper employeeMapper;

    @Autowired
    private DepartmentMapper departmentMapper;

    @Override
    public EmployeeVO getById(Long id) {
        if (id == null) {
            return null;
        }
        return employeeMapper.selectDetailById(id);
    }

    @Override
    public Employee getByEmpNo(String empNo) {
        if (StrUtil.isBlank(empNo)) {
            return null;
        }
        return employeeMapper.selectByEmpNo(empNo);
    }

    @Override
    public PageResult<EmployeeVO> getPageList(EmployeeQueryDTO query) {
        if (query == null) {
            query = new EmployeeQueryDTO();
        }

        // 设置默认值
        if (query.getPage() == null || query.getPage() < 1) {
            query.setPage(1);
        }
        if (query.getSize() == null || query.getSize() < 1) {
            query.setSize(20);
        }

        // 查询数据
        List<EmployeeVO> records = employeeMapper.selectPageList(query);
        Long total = employeeMapper.selectCount(query);

        // 构建分页结果
        PageResult<EmployeeVO> pageResult = new PageResult<>();
        pageResult.setRecords(records);
        pageResult.setTotal(total);
        pageResult.setPage(query.getPage());
        pageResult.setSize(query.getSize());
        pageResult.setPages((int) Math.ceil((double) total / query.getSize()));

        return pageResult;
    }

    @Override
    public List<EmployeeVO> getByDepartmentId(Long departmentId, Boolean includeSubDept) {
        if (departmentId == null) {
            return Collections.emptyList();
        }
        return employeeMapper.selectByDepartmentId(departmentId, includeSubDept);
    }

    @Override
    public List<EmployeeVO> getByPositionId(Long positionId) {
        if (positionId == null) {
            return Collections.emptyList();
        }
        return employeeMapper.selectByPositionId(positionId);
    }

    @Override
    public List<EmployeeVO> getProbationExpiring(Integer days) {
        if (days == null || days < 0) {
            days = 7; // 默认7天
        }
        return employeeMapper.selectProbationExpiring(days);
    }

    @Override
    public List<EmployeeVO> getBirthdayList(Integer month) {
        if (month == null) {
            month = DateUtil.thisMonth() + 1; // 当前月份
        }
        return employeeMapper.selectBirthdayList(month);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long saveEmployee(EmployeeSaveDTO saveDTO) {
        // 验证数据
        ValidationResult validation = validateEmployee(saveDTO);
        if (!validation.isValid()) {
            throw new IllegalArgumentException(validation.getMessage());
        }

        Employee employee = new Employee();
        BeanUtil.copyProperties(saveDTO, employee);

        // 手动映射字段名不匹配的字段
        if (StrUtil.isNotBlank(saveDTO.getGraduateSchool())) {
            employee.setGraduationSchool(saveDTO.getGraduateSchool());
        }
        
        // 映射民族字段：前端传递nation，后端存储为ethnicity
        if (StrUtil.isNotBlank(saveDTO.getNation())) {
            employee.setNation(saveDTO.getNation());
        }
        
        // 映射籍贯字段：前端传递birthplace，后端存储为nativePlace
        if (StrUtil.isNotBlank(saveDTO.getBirthplace())) {
            employee.setBirthplace(saveDTO.getBirthplace());
        }

        // 自动计算年龄
        if (employee.getBirthDate() != null) {
            int age = DateUtil.ageOfNow(employee.getBirthDate());
            employee.setAge(age);
        }

        LocalDateTime now = LocalDateTime.now();
        if (employee.getId() == null) {
            // 新增
            employee.setId(IdUtils.nextId());
            if (StrUtil.isBlank(employee.getEmpNo())) {
                employee.setEmpNo(generateEmpNo(saveDTO.getDepartmentId()));
            }
            employee.setCreatedAt(now);
            employee.setDelflag(0);
            
            // 设置租户ID - 这里需要从当前上下文获取，暂时设置为默认值
            if (StrUtil.isBlank(employee.getTenantId())) {
                employee.setTenantId("default");
            }
            
            // 设置创建人 - 这里需要从当前上下文获取，暂时设置为默认值
            if (employee.getCreatedBy() == null) {
                employee.setCreatedBy(1L); // 默认系统用户
            }
            
            employeeMapper.insert(employee);
        } else {
            // 修改
            employee.setUpdatedAt(now);
            
            // 设置更新人 - 这里需要从当前上下文获取，暂时设置为默认值
            if (employee.getUpdatedBy() == null) {
                employee.setUpdatedBy(1L); // 默认系统用户
            }
            
            employeeMapper.updateById(employee);
        }

        return employee.getId();
    }

    @Override
    public Boolean updateStatus(Long id, Integer status) {
        if (id == null || status == null) {
            return false;
        }
        return employeeMapper.updateStatus(id, status) > 0;
    }

    @Override
    public Boolean updateEmploymentStatus(Long id, Integer employmentStatus) {
        if (id == null || employmentStatus == null) {
            return false;
        }
        return employeeMapper.updateEmploymentStatus(id, employmentStatus) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long employeeJoin(EmployeeSaveDTO saveDTO) {
        // 设置为试用状态
        saveDTO.setEmploymentStatus(2);
        if (saveDTO.getEntryDate() == null) {
            saveDTO.setEntryDate(new Date());
        }
        
        Long employeeId = saveEmployee(saveDTO);
        
        log.info("员工入职成功: empNo={}, name={}", saveDTO.getEmpNo(), saveDTO.getName());
        return employeeId;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean employeeRegular(Long id) {
        if (id == null) {
            return false;
        }

        Employee employee = employeeMapper.selectById(id);
        if (employee == null) {
            throw new IllegalArgumentException("员工不存在");
        }

        if (!employee.isProbation()) {
            throw new IllegalArgumentException("员工不在试用期，无法转正");
        }

        // 更新为正式员工状态
        employee.setEmploymentStatus(1);
        employee.setUpdatedAt(LocalDateTime.now());

        boolean success = employeeMapper.updateById(employee) > 0;
        
        if (success) {
            log.info("员工转正成功: empNo={}, name={}", employee.getEmpNo(), employee.getName());
        }
        
        return success;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean employeeTransfer(Long id, Long newDepartmentId, Long newPositionId, String reason) {
        if (id == null || newDepartmentId == null || newPositionId == null) {
            return false;
        }

        Employee employee = employeeMapper.selectById(id);
        if (employee == null) {
            throw new IllegalArgumentException("员工不存在");
        }

        // 验证新部门
        Department newDepartment = departmentMapper.selectById(newDepartmentId);
        if (newDepartment == null) {
            throw new IllegalArgumentException("目标部门不存在");
        }

        // 记录原部门和岗位信息
        Long oldDepartmentId = employee.getDepartmentId();
        Long oldPositionId = employee.getPositionId();

        // 更新员工信息
        employee.setDepartmentId(newDepartmentId);
        employee.setDepartmentName(newDepartment.getName());
        employee.setPositionId(newPositionId);
        employee.setUpdatedAt(LocalDateTime.now());

        boolean success = employeeMapper.updateById(employee) > 0;
        
        if (success) {
            log.info("员工调岗成功: empNo={}, name={}, 从部门[{}]调到部门[{}], 原因: {}", 
                employee.getEmpNo(), employee.getName(), oldDepartmentId, newDepartmentId, reason);
        }
        
        return success;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean employeeLeave(Long id, String leaveDate, String leaveReason) {
        if (id == null) {
            return false;
        }

        Employee employee = employeeMapper.selectById(id);
        if (employee == null) {
            throw new IllegalArgumentException("员工不存在");
        }

        if (employee.getEmploymentStatus() == 3) {
            throw new IllegalArgumentException("员工已离职");
        }

        // 更新离职信息
        employee.setEmploymentStatus(3);
        employee.setLeaveDate(StrUtil.isNotBlank(leaveDate) ? DateUtil.parse(leaveDate) : new Date());
        employee.setLeaveReason(leaveReason);
        employee.setUpdatedAt(LocalDateTime.now());

        boolean success = employeeMapper.updateById(employee) > 0;
        
        if (success) {
            log.info("员工离职成功: empNo={}, name={}, 离职原因: {}", 
                employee.getEmpNo(), employee.getName(), leaveReason);
        }
        
        return success;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean batchUpdateDepartment(List<Long> employeeIds, Long departmentId) {
        if (CollUtil.isEmpty(employeeIds) || departmentId == null) {
            return false;
        }

        Department department = departmentMapper.selectById(departmentId);
        if (department == null) {
            throw new IllegalArgumentException("目标部门不存在");
        }

        return employeeMapper.batchUpdateDepartment(employeeIds, departmentId, department.getName()) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean batchUpdatePosition(List<Long> employeeIds, Long positionId) {
        if (CollUtil.isEmpty(employeeIds) || positionId == null) {
            return false;
        }

        // 这里需要从岗位服务获取岗位信息，暂时使用positionId作为名称
        return employeeMapper.batchUpdatePosition(employeeIds, positionId, "岗位" + positionId) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteById(Long id) {
        if (id == null) {
            return false;
        }

        Employee employee = employeeMapper.selectById(id);
        if (employee == null) {
            return false;
        }

        boolean success = employeeMapper.deleteById(id) > 0;
        
        if (success) {
            log.info("删除员工成功: empNo={}, name={}", employee.getEmpNo(), employee.getName());
        }
        
        return success;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean batchDelete(List<Long> ids) {
        if (CollUtil.isEmpty(ids)) {
            return false;
        }
        return employeeMapper.batchDelete(ids) > 0;
    }

    @Override
    public String generateEmpNo(Long departmentId) {
        String prefix = "EMP";
        Integer year = DateUtil.thisYear();
        
        // 如果有部门ID，可以根据部门生成特定前缀的工号
        if (departmentId != null) {
            Department department = departmentMapper.selectById(departmentId);
            if (department != null && StrUtil.isNotBlank(department.getDepNo())) {
                prefix = department.getDepNo();
            }
        }
        
        return employeeMapper.generateNextEmpNo(prefix, year);
    }

    @Override
    public ValidationResult validateEmployee(EmployeeSaveDTO saveDTO) {
        ValidationResult result = new ValidationResult();
        List<String> errors = new ArrayList<>();

        if (saveDTO == null) {
            result.setValid(false);
            result.setMessage("员工信息不能为空");
            return result;
        }

        // 验证必填字段
        if (StrUtil.isBlank(saveDTO.getName())) {
            errors.add("姓名不能为空");
        }

        if (StrUtil.isBlank(saveDTO.getMobile())) {
            errors.add("手机号不能为空");
        }

        if (saveDTO.getDepartmentId() == null) {
            errors.add("部门不能为空");
        }

        if (saveDTO.getPositionId() == null) {
            errors.add("岗位不能为空");
        }

        // 验证唯一性
        if (StrUtil.isNotBlank(saveDTO.getEmpNo())) {
            Boolean exists = employeeMapper.existsEmpNo(saveDTO.getEmpNo(), saveDTO.getId());
            if (Boolean.TRUE.equals(exists)) {
                errors.add("员工编号已存在");
            }
        }

        if (StrUtil.isNotBlank(saveDTO.getMobile())) {
            Boolean exists = employeeMapper.existsMobile(saveDTO.getMobile(), saveDTO.getId());
            if (Boolean.TRUE.equals(exists)) {
                errors.add("手机号已存在");
            }
        }

        if (StrUtil.isNotBlank(saveDTO.getIdCard())) {
            Boolean exists = employeeMapper.existsIdCard(saveDTO.getIdCard(), saveDTO.getId());
            if (Boolean.TRUE.equals(exists)) {
                errors.add("身份证号已存在");
            }
        }

        result.setValid(errors.isEmpty());
        result.setErrors(errors);
        if (!errors.isEmpty()) {
            result.setMessage(String.join(", ", errors));
        }

        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ImportResult importEmployees(List<EmployeeSaveDTO> employeeList) {
        ImportResult result = new ImportResult();
        result.setTotalCount(employeeList.size());
        
        List<String> errorMessages = new ArrayList<>();
        int successCount = 0;

        for (int i = 0; i < employeeList.size(); i++) {
            EmployeeSaveDTO employee = employeeList.get(i);
            try {
                ValidationResult validation = validateEmployee(employee);
                if (validation.isValid()) {
                    saveEmployee(employee);
                    successCount++;
                } else {
                    errorMessages.add(String.format("第%d行: %s", i + 1, validation.getMessage()));
                }
            } catch (Exception e) {
                errorMessages.add(String.format("第%d行: %s", i + 1, e.getMessage()));
                log.error("导入员工失败: 第{}行, 错误: {}", i + 1, e.getMessage(), e);
            }
        }

        result.setSuccessCount(successCount);
        result.setFailCount(employeeList.size() - successCount);
        result.setErrorMessages(errorMessages);

        return result;
    }

    @Override
    public List<EmployeeVO> exportEmployees(EmployeeQueryDTO query) {
        if (query == null) {
            query = new EmployeeQueryDTO();
        }
        // 导出时不分页，获取所有数据
        query.setPage(1);
        query.setSize(Integer.MAX_VALUE);
        
        return employeeMapper.selectPageList(query);
    }

    @Override
    public Map<String, Object> getStatistics() {
        return employeeMapper.getStatistics();
    }

    @Override
    public List<EmployeeMapper.DepartmentEmployeeDistributionVO> getDepartmentDistribution() {
        return employeeMapper.getDepartmentDistribution();
    }

    @Override
    public Boolean checkEmpNoAvailable(String empNo, Long excludeId) {
        if (StrUtil.isBlank(empNo)) {
            return false;
        }
        Boolean exists = employeeMapper.existsEmpNo(empNo, excludeId);
        return !Boolean.TRUE.equals(exists);
    }

    @Override
    public Boolean checkPhoneNumberAvailable(String phoneNumber, Long excludeId) {
        if (StrUtil.isBlank(phoneNumber)) {
            return false;
        }
        Boolean exists = employeeMapper.existsMobile(phoneNumber, excludeId);
        return !Boolean.TRUE.equals(exists);
    }

    @Override
    public Boolean checkEmailAvailable(String email, Long excludeId) {
        if (StrUtil.isBlank(email)) {
            return false;
        }
        Boolean exists = employeeMapper.existsEmail(email, excludeId);
        return !Boolean.TRUE.equals(exists);
    }

    @Override
    public List<EmployeeVO> getByIds(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return Collections.emptyList();
        }
        return employeeMapper.selectDetailByIds(ids);
    }
} 