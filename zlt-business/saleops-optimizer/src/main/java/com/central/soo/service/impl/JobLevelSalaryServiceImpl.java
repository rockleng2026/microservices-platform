package com.central.soo.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.soo.mapper.JobLevelSalaryMapper;
import com.central.soo.model.JobLevelSalary;
import com.central.soo.service.IJobLevelSalaryService;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class JobLevelSalaryServiceImpl extends com.baomidou.mybatisplus.extension.service.impl.ServiceImpl<JobLevelSalaryMapper, JobLevelSalary> implements IJobLevelSalaryService {
    @Override
    public IPage<JobLevelSalary> pageQuery(Page<?> page, Long departmentId, String jobLevelId, String jobLevelName, Integer status, LocalDate startDate, LocalDate endDate) {
        QueryWrapper<JobLevelSalary> qw = new QueryWrapper<>();
        if (departmentId != null) qw.eq("department_id", departmentId);
        if (jobLevelId != null && !jobLevelId.isEmpty()) qw.eq("job_level_id", jobLevelId);
        if (jobLevelName != null && !jobLevelName.isEmpty()) qw.like("job_level_name", jobLevelName);
        if (status != null) qw.eq("status", status);
        if (startDate != null) qw.ge("effective_date", startDate);
        if (endDate != null) qw.le("effective_date", endDate);
        qw.eq("delflag", 0);
        qw.orderByDesc("effective_date");
        return this.page(page, qw);
    }

    @Override
    public boolean checkUnique(Long departmentId, String jobLevelId, LocalDate effectiveDate, Long excludeId) {
        QueryWrapper<JobLevelSalary> qw = new QueryWrapper<>();
        qw.eq("department_id", departmentId);
        qw.eq("job_level_id", jobLevelId);
        qw.eq("effective_date", effectiveDate);
        qw.eq("delflag", 0);
        if (excludeId != null) qw.ne("id", excludeId);
        return this.count(qw) == 0;
    }

    @Override
    public List<JobLevelSalary> getHistoryByJobLevel(String jobLevelId, Long departmentId) {
        QueryWrapper<JobLevelSalary> qw = new QueryWrapper<>();
        qw.eq("job_level_id", jobLevelId);
        if (departmentId != null) qw.eq("department_id", departmentId);
        qw.eq("delflag", 0);
        qw.orderByDesc("effective_date");
        return this.list(qw);
    }

    @Override
    public boolean restore(Long id) {
        JobLevelSalary config = this.getById(id);
        if (config != null && config.getDelflag() != null && config.getDelflag() == 1) {
            config.setDelflag(0);
            return this.updateById(config);
        }
        return false;
    }
} 