package com.central.soo.service;

import com.central.common.model.PageResult;
import com.central.soo.model.dto.SalaryCalculationRequestDTO;
import com.central.soo.model.dto.SalaryCalculationTaskQueryDTO;
import com.central.soo.model.entity.PayrollResult;
import com.central.soo.model.entity.SalaryCalculationTask;
import com.central.soo.model.vo.PayrollResultVO;
import com.central.soo.model.vo.SalaryCalculationTaskVO;

import java.util.List;

/**
 * 薪酬计算服务接口
 */
public interface ISalaryCalculationService {

    /**
     * 创建月度工资计算任务
     */
    SalaryCalculationTaskVO createMonthlySalaryTask(SalaryCalculationRequestDTO request);

    /**
     * 执行工资计算任务
     */
    void executeCalculationTask(Long taskId);

    /**
     * 计算单个员工工资
     */
    PayrollResultVO calculateEmployeeSalary(Long employeeId, String month);

    /**
     * 批量计算员工工资
     */
    List<PayrollResultVO> batchCalculateSalary(SalaryCalculationRequestDTO request);

    /**
     * 获取计算任务状态
     */
    SalaryCalculationTaskVO getTaskStatus(Long taskId);

    /**
     * 查询计算任务列表
     */
    PageResult<SalaryCalculationTaskVO> getTaskList(SalaryCalculationTaskQueryDTO query);

    /**
     * 获取工资计算结果
     */
    PageResult<PayrollResultVO> getPayrollResults(String month, Long departmentId, Long employeeId, Integer page, Integer size);

    /**
     * 审核工资计算结果
     */
    void approveSalary(List<Long> resultIds, String approveStatus, String remark);

    /**
     * 调整工资计算结果
     */
    void adjustSalary(Long resultId, PayrollResultVO adjustment);

    /**
     * 重新计算工资
     */
    void recalculateSalary(List<Long> resultIds);

    /**
     * 生成工资条
     */
    void generatePayslips(String month, List<Long> employeeIds);

    /**
     * 获取工资计算详情
     */
    PayrollResultVO getPayrollDetail(Long resultId);

    /**
     * 导出工资数据
     */
    byte[] exportPayrollData(String month, Long departmentId);
} 