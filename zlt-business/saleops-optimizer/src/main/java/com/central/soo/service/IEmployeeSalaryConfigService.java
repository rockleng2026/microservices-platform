package com.central.soo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.soo.model.EmployeeSalaryConfig;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.time.LocalDate;
import java.util.List;

public interface IEmployeeSalaryConfigService extends IService<EmployeeSalaryConfig> {
    /**
     * 分页条件查询
     */
    IPage<EmployeeSalaryConfig> pageQuery(Page<?> page, Long employeeId, String employeeName, Long departmentId, String jobLevelId, Integer status, LocalDate startDate, LocalDate endDate);

    /**
     * 校验唯一性（同一员工、生效日不能重复）
     */
    boolean checkUnique(Long employeeId, LocalDate effectiveDate, Long excludeId);

    /**
     * 查询员工历史薪酬配置
     */
    List<EmployeeSalaryConfig> getHistoryByEmployee(Long employeeId);

    /**
     * 恢复已删除的员工薪酬配置
     */
    boolean restore(Long id);
} 