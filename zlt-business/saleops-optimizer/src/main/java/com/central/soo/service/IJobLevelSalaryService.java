package com.central.soo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.soo.model.JobLevelSalary;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.time.LocalDate;
import java.util.List;

public interface IJobLevelSalaryService extends IService<JobLevelSalary> {
    /**
     * 分页条件查询
     */
    IPage<JobLevelSalary> pageQuery(Page<?> page, Long departmentId, String jobLevelId, String jobLevelName, Integer status, LocalDate startDate, LocalDate endDate);

    /**
     * 校验唯一性（同一部门、职级、生效日不能重复）
     */
    boolean checkUnique(Long departmentId, String jobLevelId, LocalDate effectiveDate, Long excludeId);

    /**
     * 查询职级历史薪资标准
     */
    List<JobLevelSalary> getHistoryByJobLevel(String jobLevelId, Long departmentId);

    /**
     * 恢复已删除的职级薪资标准
     */
    boolean restore(Long id);
} 