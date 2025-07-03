package com.central.soo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.soo.mapper.EmployeeSalaryConfigMapper;
import com.central.soo.model.EmployeeSalaryConfig;
import com.central.soo.service.IEmployeeSalaryConfigService;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class EmployeeSalaryConfigServiceImpl extends com.baomidou.mybatisplus.extension.service.impl.ServiceImpl<EmployeeSalaryConfigMapper, EmployeeSalaryConfig> implements IEmployeeSalaryConfigService {
    @Override
    public IPage<EmployeeSalaryConfig> pageQuery(Page<?> page, Long employeeId, String employeeName, Long departmentId, String jobLevelId, Integer status, LocalDate startDate, LocalDate endDate) {
        QueryWrapper<EmployeeSalaryConfig> qw = new QueryWrapper<>();
        if (employeeId != null) qw.eq("employee_id", employeeId);
        if (employeeName != null && !employeeName.isEmpty()) qw.like("employee_name", employeeName);
        if (departmentId != null) qw.eq("department_id", departmentId);
        if (jobLevelId != null && !jobLevelId.isEmpty()) qw.eq("job_level_id", jobLevelId);
        if (status != null) qw.eq("status", status);
        if (startDate != null) qw.ge("effective_date", startDate);
        if (endDate != null) qw.le("effective_date", endDate);
        qw.eq("delflag", 0);
        qw.orderByDesc("effective_date");
        return this.page(page, qw);
    }

    @Override
    public boolean checkUnique(Long employeeId, LocalDate effectiveDate, Long excludeId) {
        QueryWrapper<EmployeeSalaryConfig> qw = new QueryWrapper<>();
        qw.eq("employee_id", employeeId);
        qw.eq("effective_date", effectiveDate);
        qw.eq("delflag", 0);
        if (excludeId != null) qw.ne("id", excludeId);
        return this.count(qw) == 0;
    }

    @Override
    public List<EmployeeSalaryConfig> getHistoryByEmployee(Long employeeId) {
        QueryWrapper<EmployeeSalaryConfig> qw = new QueryWrapper<>();
        qw.eq("employee_id", employeeId);
        qw.eq("delflag", 0);
        qw.orderByDesc("effective_date");
        return this.list(qw);
    }

    @Override
    public boolean restore(Long id) {
        EmployeeSalaryConfig config = this.getById(id);
        if (config != null && config.getDelflag() != null && config.getDelflag() == 1) {
            config.setDelflag(0);
            return this.updateById(config);
        }
        return false;
    }
} 