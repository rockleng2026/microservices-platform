package com.central.soo.controller;

import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.soo.model.dto.*;
import com.central.soo.model.entity.*;
import com.central.soo.service.ISalaryCalculationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * 薪酬计算管理控制器
 * 基于新的表结构和服务接口
 */
@Slf4j
@RestController
@RequestMapping("/api/soo/salary")
@Tag(name = "薪酬计算管理")
public class SalaryCalculationController {

    @Autowired
    private ISalaryCalculationService salaryCalculationService;

    // ==================== 薪酬计算任务管理 ====================

    @PostMapping("/tasks")
    @Operation(summary = "创建薪酬计算任务")
    public Result<SalaryCalculationTask> createCalculationTask(@RequestBody SalaryTaskCreateDTO createDTO) {
        try {
            log.info("创建薪酬计算任务: {}", createDTO.getTaskName());
            return salaryCalculationService.createCalculationTask(createDTO);
        } catch (Exception e) {
            log.error("创建薪酬计算任务失败", e);
            return Result.failed("创建任务失败: " + e.getMessage());
        }
    }

    @PostMapping("/tasks/{taskId}/execute")
    @Operation(summary = "执行薪酬计算任务")
    public Result<String> executeCalculationTask(@PathVariable String taskId) {
        try {
            log.info("执行薪酬计算任务: {}", taskId);
            return salaryCalculationService.executeCalculationTask(taskId);
        } catch (Exception e) {
            log.error("执行薪酬计算任务失败", e);
            return Result.failed("执行任务失败: " + e.getMessage());
        }
    }

    @GetMapping("/tasks")
    @Operation(summary = "查询薪酬计算任务列表")
    public PageResult<SalaryCalculationTask> getCalculationTasks(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String taskName,
            @RequestParam(required = false) String calculationMonth,
            @RequestParam(required = false) String taskStatus,
            @RequestParam(required = false) String calculationType,
            @RequestParam(required = false) Long createdBy,
            @RequestParam(required = false) Boolean isFinal,
            @RequestParam(required = false) String startTime,
            @RequestParam(required = false) String endTime) {
        
        try {
            log.info("查询薪酬计算任务列表: page={}, size={}, month={}", page, size, calculationMonth);
            
            SalaryTaskQueryDTO queryDTO = new SalaryTaskQueryDTO();
            queryDTO.setPage(page);
            queryDTO.setSize(size);
            queryDTO.setTaskName(taskName);
            queryDTO.setCalculationMonth(calculationMonth);
            queryDTO.setTaskStatus(taskStatus);
            queryDTO.setCalculationType(calculationType);
            queryDTO.setCreatedBy(createdBy);
            queryDTO.setIsFinal(isFinal);
            queryDTO.setStartTime(startTime);
            queryDTO.setEndTime(endTime);
            
            return salaryCalculationService.getCalculationTasks(queryDTO);
        } catch (Exception e) {
            log.error("查询薪酬计算任务列表失败", e);
            PageResult<SalaryCalculationTask> result = new PageResult<>();
            result.setData(new ArrayList<>());
            result.setCount(0L);
            result.setResp_code(1);
            return result;
        }
    }

    @GetMapping("/tasks/{taskId}")
    @Operation(summary = "获取任务详情")
    public Result<SalaryCalculationTask> getTaskDetail(@PathVariable String taskId) {
        try {
            log.info("获取任务详情: {}", taskId);
            return salaryCalculationService.getTaskDetail(taskId);
        } catch (Exception e) {
            log.error("获取任务详情失败", e);
            return Result.failed("获取详情失败: " + e.getMessage());
        }
    }

    @GetMapping("/tasks/{taskId}/progress")
    @Operation(summary = "获取任务执行进度")
    public Result<TaskProgressDTO> getTaskProgress(@PathVariable String taskId) {
        try {
            log.info("获取任务执行进度: {}", taskId);
            return salaryCalculationService.getTaskProgress(taskId);
        } catch (Exception e) {
            log.error("获取任务执行进度失败", e);
            return Result.failed("获取进度失败: " + e.getMessage());
        }
    }

    @PostMapping("/tasks/{taskId}/cancel")
    @Operation(summary = "取消任务")
    public Result<String> cancelTask(@PathVariable String taskId) {
        try {
            log.info("取消任务: {}", taskId);
            return salaryCalculationService.cancelTask(taskId);
        } catch (Exception e) {
            log.error("取消任务失败", e);
            return Result.failed("取消失败: " + e.getMessage());
        }
    }

    @PostMapping("/tasks/{taskId}/confirm")
    @Operation(summary = "确认任务结果")
    public Result<String> confirmTask(@PathVariable String taskId, @RequestParam Long confirmedBy) {
        try {
            log.info("确认任务结果: {}", taskId);
            return salaryCalculationService.confirmTask(taskId, confirmedBy);
        } catch (Exception e) {
            log.error("确认任务结果失败", e);
            return Result.failed("确认失败: " + e.getMessage());
        }
    }

    @GetMapping("/tasks/statistics")
    @Operation(summary = "获取薪酬计算任务统计")
    public Result<SalaryTaskStatisticsDTO> getTaskStatistics() {
        try {
            log.info("获取薪酬计算任务统计");
            return salaryCalculationService.getTaskStatistics();
        } catch (Exception e) {
            log.error("获取薪酬计算任务统计失败", e);
            return Result.failed("获取统计失败: " + e.getMessage());
        }
    }

    // ==================== 工资结果管理 ====================

    @GetMapping("/results")
    @Operation(summary = "查询工资计算结果")
    public PageResult<PayrollResult> getPayrollResults(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String taskId,
            @RequestParam(required = false) String taskName,
            @RequestParam(required = false) String month,
            @RequestParam(required = false) String startMonth,
            @RequestParam(required = false) String endMonth,
            @RequestParam(required = false) List<Long> departmentIds,
            @RequestParam(required = false) List<Long> employeeIds,
            @RequestParam(required = false) String employeeName,
            @RequestParam(required = false) String approvalStatus,
            @RequestParam(required = false) String calculationStatus,
            @RequestParam(required = false) Boolean isFinal,
            @RequestParam(required = false) Boolean isCurrentVersion) {
        
        try {
            log.info("查询工资计算结果: page={}, size={}, taskId={}, month={}", page, size, taskId, month);
            
            PayrollResultQueryDTO queryDTO = new PayrollResultQueryDTO();
            queryDTO.setPage(page);
            queryDTO.setSize(size);
            queryDTO.setTaskId(taskId);
            queryDTO.setTaskName(taskName);
            queryDTO.setMonth(month);
            queryDTO.setStartMonth(startMonth);
            queryDTO.setEndMonth(endMonth);
            queryDTO.setDepartmentIds(departmentIds);
            queryDTO.setEmployeeIds(employeeIds);
            queryDTO.setEmployeeName(employeeName);
            queryDTO.setApprovalStatus(approvalStatus);
            queryDTO.setCalculationStatus(calculationStatus);
            queryDTO.setIsFinal(isFinal);
            queryDTO.setIsCurrentVersion(isCurrentVersion);
            
            return salaryCalculationService.getPayrollResults(queryDTO);
        } catch (Exception e) {
            log.error("查询工资计算结果失败", e);
            PageResult<PayrollResult> result = new PageResult<>();
            result.setData(new ArrayList<>());
            result.setCount(0L);
            return result;
        }
    }

    @GetMapping("/results/{resultId}")
    @Operation(summary = "获取员工工资详情")
    public Result<PayrollResult> getPayrollDetail(@PathVariable Long resultId) {
        try {
            log.info("获取员工工资详情: {}", resultId);
            return salaryCalculationService.getPayrollDetail(resultId);
        } catch (Exception e) {
            log.error("获取员工工资详情失败", e);
            return Result.failed("获取详情失败: " + e.getMessage());
        }
    }

    @PostMapping("/results/{resultId}/recalculate")
    @Operation(summary = "重新计算指定员工工资")
    public Result<PayrollResult> recalculateEmployee(@PathVariable Long resultId, @RequestParam String taskId, @RequestParam Long employeeId) {
        try {
            log.info("重新计算员工工资: resultId={}, taskId={}, employeeId={}", resultId, taskId, employeeId);
            return salaryCalculationService.recalculateEmployee(taskId, employeeId);
        } catch (Exception e) {
            log.error("重新计算员工工资失败", e);
            return Result.failed("重新计算失败: " + e.getMessage());
        }
    }

    @PostMapping("/results/approve")
    @Operation(summary = "批量审批工资结果")
    public Result<String> batchApprovePayroll(@RequestBody PayrollApprovalDTO approvalDTO) {
        try {
            log.info("批量审批工资结果: {}", approvalDTO.getResultIds());
            return salaryCalculationService.batchApprovePayroll(approvalDTO);
        } catch (Exception e) {
            log.error("批量审批工资结果失败", e);
            return Result.failed("批量审批失败: " + e.getMessage());
        }
    }

    @PostMapping("/results/adjust")
    @Operation(summary = "调整工资结果")
    public Result<PayrollResult> adjustPayrollResult(@RequestBody PayrollAdjustmentDTO adjustmentDTO) {
        try {
            log.info("调整工资结果: {}", adjustmentDTO.getResultId());
            return salaryCalculationService.adjustPayrollResult(adjustmentDTO);
        } catch (Exception e) {
            log.error("调整工资结果失败", e);
            return Result.failed("调整失败: " + e.getMessage());
        }
    }

    @GetMapping("/results/{resultId}/logs")
    @Operation(summary = "获取计算日志")
    public Result<List<String>> getCalculationLog(@PathVariable Long resultId) {
        try {
            log.info("获取计算日志: {}", resultId);
            return salaryCalculationService.getCalculationLog(resultId);
        } catch (Exception e) {
            log.error("获取计算日志失败", e);
            return Result.failed("获取日志失败: " + e.getMessage());
        }
    }

    // ==================== 薪酬统计分析 ====================

    @GetMapping("/summary/{taskId}")
    @Operation(summary = "获取薪酬统计汇总")
    public Result<List<SalarySummary>> getSalarySummary(@PathVariable String taskId) {
        try {
            log.info("获取薪酬统计汇总: {}", taskId);
            return salaryCalculationService.getSalarySummary(taskId);
        } catch (Exception e) {
            log.error("获取薪酬统计汇总失败", e);
            return Result.failed("获取汇总失败: " + e.getMessage());
        }
    }

    @GetMapping("/summary/{taskId}/department/{departmentId}")
    @Operation(summary = "获取部门薪酬统计")
    public Result<SalarySummary> getDepartmentSalarySummary(@PathVariable String taskId, @PathVariable Long departmentId) {
        try {
            log.info("获取部门薪酬统计: taskId={}, departmentId={}", taskId, departmentId);
            return salaryCalculationService.getDepartmentSalarySummary(taskId, departmentId);
        } catch (Exception e) {
            log.error("获取部门薪酬统计失败", e);
            return Result.failed("获取统计失败: " + e.getMessage());
        }
    }

    @PostMapping("/trend")
    @Operation(summary = "获取薪酬趋势分析")
    public Result<SalaryTrendDTO> getSalaryTrend(@RequestBody SalaryTrendQueryDTO queryDTO) {
        try {
            log.info("获取薪酬趋势分析: {}", queryDTO.getAnalysisType());
            return salaryCalculationService.getSalaryTrend(queryDTO);
        } catch (Exception e) {
            log.error("获取薪酬趋势分析失败", e);
            return Result.failed("获取趋势分析失败: " + e.getMessage());
        }
    }

    @GetMapping("/distribution/{taskId}")
    @Operation(summary = "获取薪酬分布分析")
    public Result<SalaryDistributionDTO> getSalaryDistribution(@PathVariable String taskId) {
        try {
            log.info("获取薪酬分布分析: {}", taskId);
            return salaryCalculationService.getSalaryDistribution(taskId);
        } catch (Exception e) {
            log.error("获取薪酬分布分析失败", e);
            return Result.failed("获取分布分析失败: " + e.getMessage());
        }
    }

    @PostMapping("/export")
    @Operation(summary = "导出工资计算结果")
    public ResponseEntity<ByteArrayResource> exportPayrollResults(@RequestBody PayrollExportDTO exportDTO) {
        try {
            log.info("开始导出工资计算结果，导出参数: {}", exportDTO);
            
            // 调用服务层方法获取Excel字节数组
            byte[] excelBytes = salaryCalculationService.generateExcelBytes(exportDTO);
            
            if (excelBytes == null || excelBytes.length == 0) {
                return ResponseEntity.badRequest().build();
            }
            
            // 生成文件名
            String fileName = generateExportFileName(exportDTO);
            
            ByteArrayResource resource = new ByteArrayResource(excelBytes);
            
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + fileName);
            headers.add(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            
            log.info("Excel文件导出成功，文件名: {}, 文件大小: {} 字节", fileName, excelBytes.length);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(excelBytes.length)
                    .body(resource);
        } catch (Exception e) {
            log.error("导出工资计算结果失败，错误信息: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * 生成导出文件名
     */
    private String generateExportFileName(PayrollExportDTO exportDTO) {
        StringBuilder fileName = new StringBuilder("工资查询结果");
        
        if (exportDTO.getTaskName() != null && !exportDTO.getTaskName().trim().isEmpty()) {
            fileName.append("_").append(exportDTO.getTaskName());
        }
        
        if (exportDTO.getMonth() != null && !exportDTO.getMonth().trim().isEmpty()) {
            fileName.append("_").append(exportDTO.getMonth());
        } else if (exportDTO.getStartMonth() != null && exportDTO.getEndMonth() != null) {
            fileName.append("_").append(exportDTO.getStartMonth()).append("至").append(exportDTO.getEndMonth());
        }
        
        fileName.append("_").append(java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")));
        fileName.append(".xlsx");
        
        return fileName.toString();
    }

    // ==================== 盈亏平衡分析 ====================

    @PostMapping("/breakeven")
    @Operation(summary = "生成盈亏平衡分析")
    public Result<BreakevenAnalysis> generateBreakevenAnalysis(@RequestBody BreakevenAnalysisDTO analysisDTO) {
        try {
            log.info("生成盈亏平衡分析: {}", analysisDTO.getAnalysisName());
            return salaryCalculationService.generateBreakevenAnalysis(analysisDTO);
        } catch (Exception e) {
            log.error("生成盈亏平衡分析失败", e);
            return Result.failed("生成分析失败: " + e.getMessage());
        }
    }

    @GetMapping("/breakeven")
    @Operation(summary = "查询盈亏平衡分析列表")
    public PageResult<BreakevenAnalysis> getBreakevenAnalysisList(
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String taskId,
            @RequestParam(required = false) String analysisType,
            @RequestParam(required = false) String period) {
        
        try {
            log.info("查询盈亏平衡分析列表: page={}, size={}", page, size);
            
            BreakevenQueryDTO queryDTO = new BreakevenQueryDTO();
            queryDTO.setPage(page);
            queryDTO.setSize(size);
            queryDTO.setAnalysisType(analysisType);

            return salaryCalculationService.getBreakevenAnalysisList(queryDTO);
        } catch (Exception e) {
            log.error("查询盈亏平衡分析列表失败", e);
            PageResult<BreakevenAnalysis> result = new PageResult<>();
            result.setData(new ArrayList<>());
            result.setCount(0L);
            return result;
        }
    }

    @GetMapping("/cost-structure/{taskId}")
    @Operation(summary = "获取成本结构分析")
    public Result<CostStructureDTO> getCostStructureAnalysis(@PathVariable String taskId) {
        try {
            log.info("获取成本结构分析: {}", taskId);
            return salaryCalculationService.getCostStructureAnalysis(taskId);
        } catch (Exception e) {
            log.error("获取成本结构分析失败", e);
            return Result.failed("获取成本分析失败: " + e.getMessage());
        }
    }

    // ==================== 数据验证 ====================

    @PostMapping("/validate/{taskId}")
    @Operation(summary = "验证薪酬计算数据")
    public Result<DataValidationDTO> validateCalculationData(@PathVariable String taskId) {
        try {
            log.info("验证薪酬计算数据: {}", taskId);
            return salaryCalculationService.validateCalculationData(taskId);
        } catch (Exception e) {
            log.error("验证薪酬计算数据失败", e);
            return Result.failed("验证失败: " + e.getMessage());
        }
    }

    @PostMapping("/check-integrity")
    @Operation(summary = "检查基础数据完整性")
    public Result<DataIntegrityDTO> checkDataIntegrity(@RequestParam String month, @RequestBody(required = false) List<Long> employeeIds) {
        try {
            log.info("检查基础数据完整性: month={}", month);
            return salaryCalculationService.checkDataIntegrity(month, employeeIds);
        } catch (Exception e) {
            log.error("检查基础数据完整性失败", e);
            return Result.failed("检查失败: " + e.getMessage());
        }
    }
} 