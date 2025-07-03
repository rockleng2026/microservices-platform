package com.central.soo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.soo.mapper.MonthlyPerformanceMapper;
import com.central.soo.model.MonthlyPerformance;
import com.central.soo.service.IMonthlyPerformanceService;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MonthlyPerformanceServiceImpl extends com.baomidou.mybatisplus.extension.service.impl.ServiceImpl<MonthlyPerformanceMapper, MonthlyPerformance> implements IMonthlyPerformanceService {
    @Override
    public IPage<MonthlyPerformance> pageQuery(Page<?> page, Long employeeId, String employeeName, Long departmentId, String month, Integer status) {
        QueryWrapper<MonthlyPerformance> qw = new QueryWrapper<>();
        if (employeeId != null) qw.eq("employee_id", employeeId);
        if (employeeName != null && !employeeName.isEmpty()) qw.like("employee_name", employeeName);
        if (departmentId != null) qw.eq("department_id", departmentId);
        if (month != null && !month.isEmpty()) qw.eq("month", month);
        if (status != null) qw.eq("status", status);
        qw.eq("delflag", 0);
        qw.orderByDesc("month");
        return this.page(page, qw);
    }

    @Override
    public boolean checkUnique(Long employeeId, String month, Long excludeId) {
        QueryWrapper<MonthlyPerformance> qw = new QueryWrapper<>();
        qw.eq("employee_id", employeeId);
        qw.eq("month", month);
        qw.eq("delflag", 0);
        if (excludeId != null) qw.ne("id", excludeId);
        return this.count(qw) == 0;
    }

    @Override
    public List<MonthlyPerformance> getHistoryByEmployee(Long employeeId) {
        QueryWrapper<MonthlyPerformance> qw = new QueryWrapper<>();
        qw.eq("employee_id", employeeId);
        qw.eq("delflag", 0);
        qw.orderByDesc("month");
        return this.list(qw);
    }

    @Override
    public boolean restore(Long id) {
        MonthlyPerformance config = this.getById(id);
        if (config != null && config.getDelflag() != null && config.getDelflag() == 1) {
            config.setDelflag(0);
            return this.updateById(config);
        }
        return false;
    }
} 