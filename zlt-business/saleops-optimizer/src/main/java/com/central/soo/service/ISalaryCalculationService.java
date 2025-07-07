package com.central.soo.service;

import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.soo.model.dto.*;
import com.central.soo.model.entity.*;
import com.baomidou.mybatisplus.extension.service.IService;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 薪酬计算服务接口
 * 基于任务化薪酬计算流程设计
 */
public interface ISalaryCalculationService extends IService<SalaryCalculationTask> {
    
    // ===========================
    // 薪酬计算任务管理
    // ===========================
    
    /**
     * 创建薪酬计算任务
     * @param createDTO 任务创建参数
     * @return 任务详情
     */
    Result<SalaryCalculationTask> createCalculationTask(SalaryTaskCreateDTO createDTO);
    
    /**
     * 执行薪酬计算任务
     * @param taskId 任务ID
     * @return 执行结果
     */
    Result<String> executeCalculationTask(String taskId);
    
    /**
     * 查询薪酬计算任务列表
     * @param queryDTO 查询参数
     * @return 任务列表
     */
    PageResult<SalaryCalculationTask> getCalculationTasks(SalaryTaskQueryDTO queryDTO);
    
    /**
     * 获取任务详情
     * @param taskId 任务ID
     * @return 任务详情
     */
    Result<SalaryCalculationTask> getTaskDetail(String taskId);
    
    /**
     * 获取任务执行进度
     * @param taskId 任务ID
     * @return 进度信息
     */
    Result<TaskProgressDTO> getTaskProgress(String taskId);
    
    /**
     * 取消任务执行
     * @param taskId 任务ID
     * @return 操作结果
     */
    Result<String> cancelTask(String taskId);
    
    /**
     * 确认任务结果
     * @param taskId 任务ID
     * @param confirmedBy 确认人ID
     * @return 操作结果
     */
    Result<String> confirmTask(String taskId, Long confirmedBy);
    
    /**
     * 获取薪酬计算任务统计
     * @return 统计数据
     */
    Result<SalaryTaskStatisticsDTO> getTaskStatistics();
    
    // ===========================
    // 工资计算结果管理
    // ===========================
    
    /**
     * 查询工资计算结果
     * @param queryDTO 查询参数
     * @return 计算结果列表
     */
    PageResult<PayrollResult> getPayrollResults(PayrollResultQueryDTO queryDTO);
    
    /**
     * 获取员工工资详情
     * @param resultId 结果ID
     * @return 工资详情
     */
    Result<PayrollResult> getPayrollDetail(Long resultId);
    
    /**
     * 重新计算单个员工工资
     * @param taskId 任务ID
     * @param employeeId 员工ID
     * @return 计算结果
     */
    Result<PayrollResult> recalculateEmployee(String taskId, Long employeeId);
    
    /**
     * 批量审批工资结果
     * @param approvalDTO 审批参数
     * @return 操作结果
     */
    Result<String> batchApprovePayroll(PayrollApprovalDTO approvalDTO);
    
    /**
     * 调整工资结果
     * @param adjustmentDTO 调整参数
     * @return 调整结果
     */
    Result<PayrollResult> adjustPayrollResult(PayrollAdjustmentDTO adjustmentDTO);
    
    /**
     * 获取工资计算日志
     * @param resultId 结果ID
     * @return 计算日志
     */
    Result<List<String>> getCalculationLog(Long resultId);
    
    // ===========================
    // 薪酬统计分析
    // ===========================
    
    /**
     * 获取薪酬统计汇总
     * @param taskId 任务ID
     * @return 统计汇总
     */
    Result<List<SalarySummary>> getSalarySummary(String taskId);
    
    /**
     * 获取部门薪酬统计
     * @param taskId 任务ID
     * @param departmentId 部门ID
     * @return 部门统计
     */
    Result<SalarySummary> getDepartmentSalarySummary(String taskId, Long departmentId);
    
    /**
     * 获取薪酬趋势分析
     * @param queryDTO 查询参数
     * @return 趋势数据
     */
    Result<SalaryTrendDTO> getSalaryTrend(SalaryTrendQueryDTO queryDTO);
    
    /**
     * 获取薪酬分布分析
     * @param taskId 任务ID
     * @return 分布数据
     */
    Result<SalaryDistributionDTO> getSalaryDistribution(String taskId);
    
    /**
     * 导出工资计算结果
     * @param exportDTO 导出参数
     * @return 导出文件路径
     */
    Result<String> exportPayrollResults(PayrollExportDTO exportDTO);
    
    // ===========================
    // 盈亏平衡分析
    // ===========================
    
    /**
     * 基于薪酬数据生成盈亏平衡分析
     * @param analysisDTO 分析参数
     * @return 分析结果
     */
    Result<BreakevenAnalysis> generateBreakevenAnalysis(BreakevenAnalysisDTO analysisDTO);
    
    /**
     * 获取盈亏平衡分析列表
     * @param queryDTO 查询参数
     * @return 分析列表
     */
    PageResult<BreakevenAnalysis> getBreakevenAnalysisList(BreakevenQueryDTO queryDTO);
    
    /**
     * 获取成本结构分析
     * @param taskId 任务ID
     * @return 成本结构
     */
    Result<CostStructureDTO> getCostStructureAnalysis(String taskId);
    
    // ===========================
    // 数据验证
    // ===========================
    
    /**
     * 验证薪酬计算数据
     * @param taskId 任务ID
     * @return 验证结果
     */
    Result<DataValidationDTO> validateCalculationData(String taskId);
    
    /**
     * 检查基础数据完整性
     * @param month 计算月份
     * @param employeeIds 员工ID列表
     * @return 检查结果
     */
    Result<DataIntegrityDTO> checkDataIntegrity(String month, List<Long> employeeIds);
} 