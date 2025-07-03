package com.central.soo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.soo.model.MonthlyPerformance;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.util.List;

public interface IMonthlyPerformanceService extends IService<MonthlyPerformance> {
    /**
     * 分页条件查询
     */
    IPage<MonthlyPerformance> pageQuery(Page<?> page, Long employeeId, String employeeName, Long departmentId, String month, Integer status);

    /**
     * 校验唯一性（同一员工、同一月份不能重复）
     */
    boolean checkUnique(Long employeeId, String month, Long excludeId);

    /**
     * 查询员工历史绩效
     */
    List<MonthlyPerformance> getHistoryByEmployee(Long employeeId);

    /**
     * 恢复已删除的月度绩效
     */
    boolean restore(Long id);
} 