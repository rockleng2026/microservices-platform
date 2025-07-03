package com.central.soo.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.soo.model.PayrollResult;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import java.util.List;

public interface IPayrollResultService extends IService<PayrollResult> {
    /**
     * 分页条件查询
     */
    IPage<PayrollResult> pageQuery(Page<?> page, Long employeeId, String employeeName, Long departmentId, String month, Integer status);

    /**
     * 校验唯一性（同一员工、同一月份不能重复）
     */
    boolean checkUnique(Long employeeId, String month, Long excludeId);

    /**
     * 工资计算（单人/批量）
     */
    boolean calculatePayroll(List<Long> employeeIds, String month);

    /**
     * 查询员工历史工资
     */
    List<PayrollResult> getHistoryByEmployee(Long employeeId);

    /**
     * 恢复已删除的工资结果
     */
    boolean restore(Long id);
} 