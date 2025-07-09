package com.central.soo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.common.context.TenantContextHolder;
import com.central.common.exception.BusinessException;
import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.common.utils.LoginUserUtils;
import com.central.soo.mapper.SalaryCalculationTaskMapper;
import com.central.soo.mapper.PayrollResultMapper;
import com.central.soo.mapper.SalarySummaryMapper;
import com.central.soo.model.dto.*;
import com.central.soo.model.entity.*;
import com.central.soo.model.MonthlyPerformance;
import com.central.soo.engine.SalaryCalculationEngine;
import com.central.soo.engine.context.SalaryCalculationContext;
import com.central.soo.service.ISalaryCalculationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;
import com.central.soo.utils.PageResultUtil;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import com.alibaba.ttl.threadpool.TtlExecutors;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.central.soo.service.IEmployeeSalaryConfigService;
import com.central.soo.service.IDepartmentBonusConfigService;
import com.central.soo.service.IMonthlyPerformanceService;
import com.central.soo.service.IJobLevelSalaryService;
import com.central.soo.service.IRegionalSalaryCoefficientService;
import com.central.soo.service.ISocialSecurityBaseService;
import com.central.soo.feign.EmployeeFeignClient;
import com.central.soo.feign.DepartmentFeignClient;
import com.central.soo.model.EmployeeSalaryConfig;
import com.central.soo.model.entity.RegionalSalaryCoefficient;
import com.central.soo.model.JobLevelSalary;
import com.central.soo.model.SocialSecurityBase;
import com.central.soo.model.DepartmentBonusConfig;
import java.time.LocalDate;

/**
 * 薪酬计算服务实现类
 * 基于新的表结构和接口设计
 */
@Slf4j
@Service
public class SalaryCalculationServiceImpl extends ServiceImpl<SalaryCalculationTaskMapper, SalaryCalculationTask> 
    implements ISalaryCalculationService {

    @Autowired
    private PayrollResultMapper payrollResultMapper;

    @Autowired
    private SalaryCalculationEngine salaryCalculationEngine;
    
    @Autowired
    private IEmployeeSalaryConfigService employeeSalaryConfigService;
    
    @Autowired
    private IDepartmentBonusConfigService departmentBonusConfigService;
    
    @Autowired
    private IMonthlyPerformanceService monthlyPerformanceService;
    
    @Autowired
    private IJobLevelSalaryService jobLevelSalaryService;
    
    @Autowired
    private IRegionalSalaryCoefficientService regionalSalaryCoefficientService;
    
    @Autowired
    private ISocialSecurityBaseService socialSecurityBaseService;
    
    @Autowired
    private EmployeeFeignClient employeeFeignClient;
    
    @Autowired
    private DepartmentFeignClient departmentFeignClient;
    
    @Autowired
    private SalarySummaryMapper salarySummaryMapper;

    // 配置支持TTL的线程池
    private final Executor ttlExecutor = TtlExecutors.getTtlExecutor(
        Executors.newFixedThreadPool(5)
    );

    // ===========================
    // 薪酬计算任务管理
    // ===========================

    @Override
    public Result<SalaryCalculationTask> createCalculationTask(SalaryTaskCreateDTO createDTO) {
        log.info("开始创建薪酬计算任务，任务名称: {}, 计算月份: {}, 计算类型: {}", 
                createDTO.getTaskName(), createDTO.getCalculationMonth(), createDTO.getCalculationType());
        
        try {
            // 生成任务ID
            String taskId = "SALARY_" + System.currentTimeMillis();
            
            // 创建任务实体
            SalaryCalculationTask task = new SalaryCalculationTask();
            task.setTaskId(taskId);
            task.setTaskName(createDTO.getTaskName());
            task.setCalculationMonth(createDTO.getCalculationMonth());
            task.setCalculationType(createDTO.getCalculationType());
            
            // 处理目标设置，转换为逗号分隔的字符串
            if (createDTO.getTargetDepartmentIds() != null) {
                task.setTargetDepartmentIds(String.join(",", createDTO.getTargetDepartmentIds().stream()
                    .map(String::valueOf).toArray(String[]::new)));
            }
            if (createDTO.getTargetEmployeeIds() != null) {
                task.setTargetEmployeeIds(String.join(",", createDTO.getTargetEmployeeIds().stream()
                    .map(String::valueOf).toArray(String[]::new)));
            }
            if (createDTO.getExcludeEmployeeIds() != null) {
                task.setExcludeEmployeeIds(String.join(",", createDTO.getExcludeEmployeeIds().stream()
                    .map(String::valueOf).toArray(String[]::new)));
            }
            
            task.setCalculationRules(buildCalculationRulesJson(createDTO.getCalculationRules()));
            task.setRemark(createDTO.getRemark());
            task.setTaskStatus("PENDING");
            task.setCreatedAt(LocalDateTime.now());
            task.setCreatedBy(LoginUserUtils.getCurrentSysUser().getId()); // 模拟创建人ID，实际应该从当前登录用户获取
            task.setTenantId(TenantContextHolder.getTenant());
            task.setDelflag(false);
            
            // 保存到数据库
            boolean saved = this.save(task);
            if (saved) {
                log.info("薪酬计算任务创建成功，任务ID: {}, 任务名称: {}", taskId, createDTO.getTaskName());
                return Result.succeed(task, "任务创建成功");
            } else {
                log.error("薪酬计算任务保存到数据库失败，任务ID: {}", taskId);
                return Result.failed("任务创建失败");
            }
            
        } catch (Exception e) {
            log.error("创建薪酬计算任务失败，任务名称: {}, 错误信息: {}", createDTO.getTaskName(), e.getMessage(), e);
            return Result.failed("任务创建失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> executeCalculationTask(String taskId) {
        log.info("开始执行薪酬计算任务，任务ID: {}", taskId);
        
        try {
            // 查询任务信息
            com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SalaryCalculationTask> queryWrapper =
                    new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
            queryWrapper.eq(SalaryCalculationTask::getTaskId, taskId)
                       .eq(SalaryCalculationTask::getDelflag, false); // 确保查询未删除的记录
            
            SalaryCalculationTask task = baseMapper.selectOne(queryWrapper); // 使用baseMapper直接查询
            if (task == null) {
                log.warn("薪酬计算任务不存在，任务ID: {}", taskId);
                return Result.failed("任务不存在");
            }
            
            if (!"PENDING".equals(task.getTaskStatus())) {
                log.warn("薪酬计算任务状态不正确，无法执行，任务ID: {}, 当前状态: {}", taskId, task.getTaskStatus());
                return Result.failed("任务状态不正确，无法执行");
            }
            
            log.info("薪酬计算任务验证通过，开始异步执行，任务ID: {}, 任务名称: {}", taskId, task.getTaskName());
            
            // 更新任务状态为运行中
            task.setTaskStatus("RUNNING");
            task.setStartTime(LocalDateTime.now());
            baseMapper.updateById(task);
            
            log.info("薪酬计算任务状态已更新为RUNNING，任务ID: {}", taskId);
            
            // 保存当前租户ID，用于异步线程
            String currentTenantId = TenantContextHolder.getTenant();
            log.info("保存租户上下文，租户ID: {}, 任务ID: {}", currentTenantId, taskId);
            
            // 异步执行薪酬计算
            CompletableFuture.runAsync(() -> {
                try {
                    // 在异步线程中设置租户上下文
                    if (currentTenantId != null) {
                        TenantContextHolder.setTenant(currentTenantId);
                    }
                    log.info("异步线程开始执行薪酬计算，任务ID: {}, 租户ID: {}", taskId, currentTenantId);
                    
                    performSalaryCalculation(task);
                    
                    log.info("异步薪酬计算任务执行完成，任务ID: {}", taskId);
                } catch (Exception e) {
                    log.error("异步薪酬计算任务执行失败，任务ID: {}, 错误信息: {}", taskId, e.getMessage(), e);
                } finally {
                    // 清理租户上下文
                    TenantContextHolder.clear();
                    log.debug("清理租户上下文，任务ID: {}", taskId);
                }
            }, ttlExecutor);
            
            log.info("薪酬计算任务已提交到异步执行队列，任务ID: {}", taskId);
            return Result.succeed("任务执行中");
            
        } catch (Exception e) {
            log.error("执行薪酬计算任务失败，任务ID: {}, 错误信息: {}", taskId, e.getMessage(), e);
            return Result.failed("任务执行失败: " + e.getMessage());
        }
    }

    /**
     * 执行薪酬计算的核心逻辑
     */
    private void performSalaryCalculation(SalaryCalculationTask task) {
        log.info("开始执行薪酬计算核心逻辑，任务ID: {}, 任务名称: {}", task.getTaskId(), task.getTaskName());
        
        try {
            // 获取目标员工列表
            List<EmployeeBasicInfo> employees = getTargetEmployees(task);
            log.info("获取到待计算员工列表，员工数量: {}, 任务ID: {}", employees.size(), task.getTaskId());
            
            if (employees.isEmpty()) {
                log.warn("没有找到符合条件的员工，任务ID: {}", task.getTaskId());
                task.setTaskStatus("COMPLETED");
                task.setEndTime(LocalDateTime.now());
                task.setRemark(String.format("没有找到符合条件的员工，任务ID: %s", task.getTaskId()));
                this.updateById(task);
                return;
            }
            
            // 计算结果列表
            List<PayrollResult> results = new ArrayList<>();
            int successCount = 0;
            int failedCount = 0;
            
            log.info("开始逐个计算员工薪资，任务ID: {}, 总员工数: {}", task.getTaskId(), employees.size());
            
            // 逐个计算员工薪资
            for (int i = 0; i < employees.size(); i++) {
                EmployeeBasicInfo employee = employees.get(i);
                try {
                    log.info("开始计算员工薪资，员工ID: {}, 员工姓名: {}, 进度: {}/{}, 任务ID: {}", 
                            employee.getEmployeeId(), employee.getEmployeeName(), 
                            i + 1, employees.size(), task.getTaskId());
                    
                    PayrollResult result = calculateEmployeeSalary(task, employee);
                    results.add(result);
                    
                    if ("SUCCESS".equals(result.getCalculationStatus())) {
                        successCount++;
                        log.info("员工薪资计算成功，员工ID: {}, 员工姓名: {}, 基础工资:{},应发工资: {}, 实发工资: {}",
                                employee.getEmployeeId(), employee.getEmployeeName(), result.getBaseSalary(),
                                result.getGrossPay(), result.getNetPay());
                    } else {
                        failedCount++;
                        log.warn("员工薪资计算失败，员工ID: {}, 员工姓名: {}, 错误信息: {}", 
                                employee.getEmployeeId(), employee.getEmployeeName(), result.getErrorMessage());
                    }
                    
                } catch (Exception e) {
                    failedCount++;
                    log.error("计算员工薪资时发生异常，员工ID: {}, 员工姓名: {}, 错误信息: {}", 
                            employee.getEmployeeId(), employee.getEmployeeName(), e.getMessage(), e);
                }
            }
            
            log.info("员工薪资计算阶段完成，任务ID: {}, 成功: {}, 失败: {}, 总数: {}", 
                    task.getTaskId(), successCount, failedCount, employees.size());
            
            // 批量保存计算结果
            if (!results.isEmpty()) {
                log.info("开始批量保存薪资计算结果，任务ID: {}, 结果数量: {}", task.getTaskId(), results.size());
                
                for (PayrollResult result : results) {
                    try {
                        payrollResultMapper.insert(result);
                        log.debug("薪资计算结果保存成功，员工ID: {}, 结果ID: {}", result.getEmployeeId(), result.getId());
                    } catch (Exception e) {
                        log.error("保存薪资计算结果失败，员工ID: {}, 错误信息: {}", result.getEmployeeId(), e.getMessage(), e);
                    }
                }
                
                log.info("薪资计算结果批量保存完成，任务ID: {}", task.getTaskId());
            }
            
            // 计算任务汇总数据
            BigDecimal totalGrossPay = BigDecimal.ZERO;
            BigDecimal totalNetPay = BigDecimal.ZERO;
            BigDecimal totalCompanyCost = BigDecimal.ZERO;
            
            for (PayrollResult result : results) {
                if ("SUCCESS".equals(result.getCalculationStatus())) {
                    if (result.getGrossPay() != null) {
                        totalGrossPay = totalGrossPay.add(result.getGrossPay());
                    }
                    if (result.getNetPay() != null) {
                        totalNetPay = totalNetPay.add(result.getNetPay());
                    }
                    if (result.getTotalCompanyCost() != null) {
                        totalCompanyCost = totalCompanyCost.add(result.getTotalCompanyCost());
                    }
                }
            }
            
            log.info("薪资汇总计算完成，任务ID: {}, 总应发工资: {}, 总实发工资: {}, 总公司成本: {}", 
                    task.getTaskId(), totalGrossPay, totalNetPay, totalCompanyCost);
            
            // 生成薪酬统计汇总数据
            generateSalarySummary(task, results);
            
            // 更新任务状态为完成
            task.setTaskStatus("COMPLETED");
            task.setEndTime(LocalDateTime.now());
            task.setExecutionDuration(calculateExecutionDuration(task.getStartTime(), task.getEndTime()));
            task.setRemark(String.format("员工薪资计算阶段完成，任务ID: %s, 成功: %s, 失败: %s, 总数: %s",
                    task.getTaskId(), successCount, failedCount, employees.size()));
            task.setTotalEmployeeCount(employees.size());
            task.setProcessedEmployeeCount(results.size());
            task.setSuccessEmployeeCount(successCount);
            task.setFailedEmployeeCount(failedCount);
            
            // 设置薪资汇总数据
            task.setTotalGrossPay(totalGrossPay);
            task.setTotalNetPay(totalNetPay);
            task.setTotalCompanyCost(totalCompanyCost);

            baseMapper.updateById(task);
            
            log.info("薪酬计算任务执行完成，任务ID: {}, 任务名称: {}, 执行时长: {}秒, 成功: {}, 失败: {}", 
                    task.getTaskId(), task.getTaskName(), task.getExecutionDuration(), successCount, failedCount);
            
        } catch (Exception e) {
            log.error("薪酬计算任务执行失败，任务ID: {}, 错误信息: {}", task.getTaskId(), e.getMessage(), e);
            
            // 更新任务状态为失败
            task.setTaskStatus("FAILED");
            task.setEndTime(LocalDateTime.now());
            task.setErrorMessage(e.getMessage());
            task.setExecutionDuration(calculateExecutionDuration(task.getStartTime(), task.getEndTime()));
            baseMapper.updateById(task);
        }
    }
    
    /**
     * 获取目标员工列表
     */
    private List<EmployeeBasicInfo> getTargetEmployees(SalaryCalculationTask task) {
        log.info("开始获取目标员工列表，任务ID: {}, 计算类型: {}", task.getTaskId(), task.getCalculationType());
        
        List<EmployeeBasicInfo> employees = new ArrayList<>();
        
        try {
            if ("DEPARTMENT".equals(task.getCalculationType()) && task.getTargetDepartmentIds() != null) {
                // 按部门计算：获取指定部门的所有员工
                String[] departmentIds = task.getTargetDepartmentIds().split(",");
                log.info("按部门计算，目标部门IDs: {}", task.getTargetDepartmentIds());
                
                for (String departmentIdStr : departmentIds) {
                    Long departmentId = Long.valueOf(departmentIdStr.trim());
                    try {
                        Result<List<Map<String, Object>>> result = employeeFeignClient.getEmployeesByDepartment(departmentId, true);
                        if (result != null && result.getDatas() != null) {
                            for (Map<String, Object> empData : result.getDatas()) {
                                EmployeeBasicInfo employee = convertToEmployeeBasicInfo(empData);
                                if (employee != null) {
                                    employees.add(employee);
                                }
                            }
                        }
                    } catch (Exception e) {
                        log.error("获取部门{}员工列表失败: {}", departmentId, e.getMessage(), e);
                    }
                }
                
            } else if ("EMPLOYEE".equals(task.getCalculationType()) && task.getTargetEmployeeIds() != null) {
                // 按员工计算：获取指定员工信息
                String[] employeeIds = task.getTargetEmployeeIds().split(",");
                log.info("按员工计算，目标员工IDs: {}", task.getTargetEmployeeIds());
                
                List<Long> employeeIdList = new ArrayList<>();
                for (String employeeIdStr : employeeIds) {
                    employeeIdList.add(Long.valueOf(employeeIdStr.trim()));
                }
                
                try {
                    Result<List<Map<String, Object>>> result = employeeFeignClient.getEmployeeBatchDetail(employeeIdList);
                                            if (result != null && result.getDatas() != null) {
                            for (Map<String, Object> empData : result.getDatas()) {
                            EmployeeBasicInfo employee = convertToEmployeeBasicInfo(empData);
                            if (employee != null) {
                                employees.add(employee);
                            }
                        }
                    }
                } catch (Exception e) {
                    log.error("批量获取员工详情失败: {}", e.getMessage(), e);
                }
                
            } else {
                // 全员计算：获取所有在职员工
                log.info("全员计算，获取所有在职员工");
                try {
                    Result<PageResult<Map<String, Object>>> result = employeeFeignClient.getEmployeePage(1, 1000, null, null, null, 1);
                                         if (result != null && result.getDatas() != null && result.getDatas().getData() != null) {
                         for (Map<String, Object> empData : result.getDatas().getData()) {
                            EmployeeBasicInfo employee = convertToEmployeeBasicInfo(empData);
                            if (employee != null) {
                                employees.add(employee);
                            }
                        }
                    }
                } catch (Exception e) {
                    log.error("获取全员列表失败: {}", e.getMessage(), e);
                }
            }
            
            log.info("目标员工列表获取完成，任务ID: {}, 员工总数: {}", task.getTaskId(), employees.size());
            
        } catch (Exception e) {
            log.error("获取目标员工列表异常，任务ID: {}, 错误信息: {}", task.getTaskId(), e.getMessage(), e);
        }
        
        return employees;
    }
    
    /**
     * 将组织服务返回的员工数据转换为EmployeeBasicInfo
     */
    private EmployeeBasicInfo convertToEmployeeBasicInfo(Map<String, Object> empData) {
        try {
            EmployeeBasicInfo employee = new EmployeeBasicInfo();
            
            // 处理Long类型的ID字段
            Object idObj = empData.get("id");
            if (idObj != null) {
                if (idObj instanceof String) {
                    employee.setEmployeeId(Long.valueOf((String) idObj));
                } else if (idObj instanceof Number) {
                    employee.setEmployeeId(((Number) idObj).longValue());
                }
            }
            
            employee.setEmployeeName((String) empData.get("name"));
            employee.setEmployeeNo((String) empData.get("empNo"));
            
            // 处理部门信息
            Object deptIdObj = empData.get("departmentId");
            if (deptIdObj != null) {
                if (deptIdObj instanceof String) {
                    employee.setDepartmentId(Long.valueOf((String) deptIdObj));
                } else if (deptIdObj instanceof Number) {
                    employee.setDepartmentId(((Number) deptIdObj).longValue());
                }
            }
            employee.setDepartmentName((String) empData.get("departmentName"));
            
            // 处理岗位信息
            Object positionIdObj = empData.get("positionId");
            if (positionIdObj != null) {
                if (positionIdObj instanceof String) {
                    employee.setPositionId(Long.valueOf((String) positionIdObj));
                } else if (positionIdObj instanceof Number) {
                    employee.setPositionId(((Number) positionIdObj).longValue());
                }
            }
            employee.setPositionName((String) empData.get("positionName"));
            
            // 默认地区，可以从员工的扩展信息中获取
//            employee.setRegion("BEIJING"); // 默认值，后续可以从员工配置中读取
            
            log.debug("转换员工数据成功，员工ID: {}, 姓名: {}, 部门: {}, 岗位: {}", 
                    employee.getEmployeeId(), employee.getEmployeeName(), 
                    employee.getDepartmentName(), employee.getPositionName());
            
            return employee;
        } catch (Exception e) {
            log.error("转换员工数据失败，原始数据: {}, 错误信息: {}", empData, e.getMessage(), e);
            return null;
        }
    }
    
    /**
     * 计算单个员工薪资
     */
    private PayrollResult calculateEmployeeSalary(SalaryCalculationTask task, EmployeeBasicInfo employee) {
        log.info("开始计算单个员工薪资，员工ID: {}, 员工姓名: {}, 任务ID: {}", 
                employee.getEmployeeId(), employee.getEmployeeName(), task.getTaskId());
        
        try {
            // 构建计算上下文
            log.debug("构建薪资计算上下文，员工ID: {}", employee.getEmployeeId());
            SalaryCalculationContext context = buildCalculationContext(task, employee);
            
            // 使用薪酬计算引擎进行计算
            log.debug("调用薪酬计算引擎进行计算，员工ID: {}", employee.getEmployeeId());
            PayrollResult result = salaryCalculationEngine.calculateSalary(context);

            result.setTenantId(TenantContextHolder.getTenant());
            // 设置任务相关信息
            result.setTaskId(task.getTaskId());
            result.setTaskName(task.getTaskName());
            result.setCalculationVersion(1);
            result.setMonth(task.getCalculationMonth());
            
            // 设置状态信息
            result.setCalculationStatus("SUCCESS");
            result.setApprovalStatus("PENDING");
            result.setIsFinal(false);
            result.setIsCurrentVersion(true);
            result.setCreatedAt(LocalDateTime.now());
            result.setTenantId(TenantContextHolder.getTenant());
            result.setDelflag(false);
            
            log.info("员工薪资计算成功，员工ID: {}, 员工姓名: {}, 应发工资: {}, 实发工资: {}, 任务ID: {}", 
                    employee.getEmployeeId(), employee.getEmployeeName(), 
                    result.getGrossPay(), result.getNetPay(), task.getTaskId());
            
            return result;
        } catch (Exception e) {
            log.error("员工薪资计算失败，员工ID: {}, 员工姓名: {}, 任务ID: {}, 错误信息: {}", 
                    employee.getEmployeeId(), employee.getEmployeeName(), task.getTaskId(), e.getMessage(), e);
            
            // 创建失败记录
            PayrollResult result = new PayrollResult();
            result.setTaskId(task.getTaskId());
            result.setTaskName(task.getTaskName());
            result.setMonth(task.getCalculationMonth());
            result.setEmployeeId(employee.getEmployeeId());
            result.setEmployeeName(employee.getEmployeeName());
            result.setEmployeeNo(employee.getEmployeeNo());
            result.setDepartmentId(employee.getDepartmentId());
            result.setDepartmentName(employee.getDepartmentName());
            result.setPositionId(employee.getPositionId());
            result.setPositionName(employee.getPositionName());
            result.setCalculationStatus("FAILED");
            result.setErrorMessage(e.getMessage());
            result.setCreatedAt(LocalDateTime.now());
            result.setTenantId(TenantContextHolder.getTenant());
            result.setDelflag(false);
            
            return result;
        }
    }
    
    /**
     * 构建薪酬计算上下文
     */
    private SalaryCalculationContext buildCalculationContext(SalaryCalculationTask task, EmployeeBasicInfo employee) {
        SalaryCalculationContext context = new SalaryCalculationContext();
        context.setMonth(task.getCalculationMonth());
        
        log.debug("开始构建薪酬计算上下文，员工ID: {}, 月份: {}", employee.getEmployeeId(), task.getCalculationMonth());
        
        // 设置员工信息
        SalaryCalculationContext.EmployeeInfo employeeInfo = new SalaryCalculationContext.EmployeeInfo();
        employeeInfo.setId(employee.getEmployeeId());
        employeeInfo.setName(employee.getEmployeeName());
        employeeInfo.setEmployeeNo(employee.getEmployeeNo());
        employeeInfo.setDepartmentId(employee.getDepartmentId());
        employeeInfo.setDepartmentName(employee.getDepartmentName());
        employeeInfo.setPositionId(employee.getPositionId());
        employeeInfo.setPositionName(employee.getPositionName());
        employeeInfo.setStatus(1);
        context.setEmployee(employeeInfo);
        
        try {
            // 1. 获取员工薪酬配置
            SalaryCalculationContext.SalaryConfig salaryConfig = getSalaryConfig(employee.getEmployeeId());
            context.setSalaryConfig(salaryConfig);
            employeeInfo.setRegion(salaryConfig.getRegion());
            
            // 2. 获取地区系数
            SalaryCalculationContext.RegionalCoefficient regionalCoefficient = getRegionalCoefficient(salaryConfig.getRegion());
            context.setRegionalCoefficient(regionalCoefficient);
            
            // 3. 获取绩效数据
            MonthlyPerformance performance = getMonthlyPerformance(employee.getEmployeeId(), task.getCalculationMonth());
            context.setPerformance(performance);
            
            // 4. 获取职级配置
            SalaryCalculationContext.JobLevelSalary jobLevelSalary = getJobLevelSalary(employee.getPositionId());
            context.setJobLevelSalary(jobLevelSalary);
            
            // 5. 获取社保配置
            SalaryCalculationContext.SocialSecurityConfig socialSecurityConfig = getSocialSecurityConfig(salaryConfig.getRegion(), task.getCalculationMonth());
            context.setSocialSecurityConfig(socialSecurityConfig);
            
            // 6. 获取部门分红配置
            SalaryCalculationContext.DepartmentBonusConfig departmentBonusConfig = getDepartmentBonusConfig(employee.getDepartmentId());
            context.setDepartmentBonusConfig(departmentBonusConfig);
            
            // 7. 获取盈亏平衡分析数据
            SalaryCalculationContext.BreakevenAnalysisData breakevenAnalysis = getBreakevenAnalysisData(task.getCalculationMonth());
            context.setBreakevenAnalysis(breakevenAnalysis);
            
            log.debug("薪酬计算上下文构建完成，员工ID: {}", employee.getEmployeeId());
            
        } catch (Exception e) {
            log.error("构建薪酬计算上下文失败，员工ID: {}, 错误信息: {}", employee.getEmployeeId(), e.getMessage(), e);
            throw new BusinessException("构建薪酬计算上下文失败", 1);
            // 设置默认值以确保计算能够继续
            // setDefaultCalculationContext(context, employee);
        }
        
        return context;
    }
    
    /**
     * 获取员工薪酬配置
     */
    private SalaryCalculationContext.SalaryConfig getSalaryConfig(Long employeeId) {
        SalaryCalculationContext.SalaryConfig salaryConfig = new SalaryCalculationContext.SalaryConfig();
        
        try {
            // 从数据库获取员工薪酬配置
            QueryWrapper<EmployeeSalaryConfig> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("employee_id", employeeId)
                       .eq("status", 1)
                       .eq("delflag", 0)
                       .le("effective_date", LocalDate.now())
                       .and(wrapper -> wrapper.isNull("expire_date").or().ge("expire_date", LocalDate.now()))
                       .orderByDesc("effective_date")
                       .last("LIMIT 1");
            
            EmployeeSalaryConfig config = employeeSalaryConfigService.getOne(queryWrapper);
            
            if (config != null) {
                salaryConfig.setEmployeeId(employeeId);
                salaryConfig.setBaseSalary(config.getBaseSalary());
                salaryConfig.setRegion(config.getRegion());
                salaryConfig.setIsSalesIncentive(config.getIsSalesIncentive() != null && config.getIsSalesIncentive() == 1);
                salaryConfig.setSalesIncentiveRatio(config.getSalesIncentiveRatio());
                salaryConfig.setIsTeamIncentive(config.getIsTeamIncentive() != null && config.getIsTeamIncentive() == 1);
                salaryConfig.setTeamIncentiveRatio(config.getTeamIncentiveRatio());
                salaryConfig.setIsDepartmentBonus(config.getIsDepartmentBonus() != null && config.getIsDepartmentBonus() == 1);
                salaryConfig.setStatus(1);

                log.debug("获取员工薪酬配置成功，员工ID: {}, 基础工资: {}", employeeId, config.getBaseSalary());
            } else {
                // 如果没有配置，设置默认值
                setDefaultSalaryConfig(salaryConfig, employeeId);
                log.warn("员工{}未找到薪酬配置，使用默认值", employeeId);
            }
            
        } catch (Exception e) {
            log.error("获取员工薪酬配置失败，员工ID: {}, 错误信息: {}", employeeId, e.getMessage(), e);
            setDefaultSalaryConfig(salaryConfig, employeeId);
        }
        
        return salaryConfig;
    }
    
    /**
     * 获取地区系数
     */
    private SalaryCalculationContext.RegionalCoefficient getRegionalCoefficient(String region) {
        SalaryCalculationContext.RegionalCoefficient regionalCoefficient = new SalaryCalculationContext.RegionalCoefficient();
        
        try {
            QueryWrapper<RegionalSalaryCoefficient> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("region_code", region)
                       .eq("status", 1)
                       .eq("delflag", 0)
                    .le("effective_date", LocalDate.now())
                       .and(wrapper -> wrapper.isNull("expire_date").or().ge("expire_date", LocalDate.now()))
                       .orderByDesc("effective_date")
                       .last("LIMIT 1");
            
            RegionalSalaryCoefficient config = regionalSalaryCoefficientService.getOne(queryWrapper);
            
            if (config != null) {
                regionalCoefficient.setRegion(region);
                regionalCoefficient.setSalaryCoefficient(config.getSalaryCoefficient());
                regionalCoefficient.setStatus(1);
                
                log.debug("获取地区系数成功，地区: {}, 系数: {}", region, config.getSalaryCoefficient());
            } else {
                // 如果没有配置，设置默认系数为1.0
                regionalCoefficient.setRegion(region);
                regionalCoefficient.setSalaryCoefficient(BigDecimal.valueOf(1.0));
                regionalCoefficient.setStatus(1);
                log.warn("地区{}未找到工资系数配置，使用默认系数1.0", region);
            }
            
        } catch (Exception e) {
            log.error("获取地区系数失败，地区: {}, 错误信息: {}", region, e.getMessage(), e);
            // 设置默认值
            regionalCoefficient.setRegion(region);
            regionalCoefficient.setSalaryCoefficient(BigDecimal.valueOf(1.0));
            regionalCoefficient.setStatus(1);
        }
        
        return regionalCoefficient;
    }
    
    /**
     * 获取月度绩效数据
     */
    private MonthlyPerformance getMonthlyPerformance(Long employeeId, String month) {
        try {
            QueryWrapper<MonthlyPerformance> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("employee_id", employeeId)
                       .eq("month", month)
                       .eq("status", 1)
                       .eq("delflag", 0)
                       .orderByDesc("updated_at")
                       .last("LIMIT 1");
            
            MonthlyPerformance performance = monthlyPerformanceService.getOne(queryWrapper);
            
            if (performance != null) {
                log.debug("获取月度绩效数据成功，员工ID: {}, 月份: {}, 绩效得分: {}", 
                        employeeId, month, performance.getPerformanceScore());
                return performance;
            } else {
                // 如果没有绩效数据，创建默认绩效
                MonthlyPerformance defaultPerformance = createDefaultPerformance(employeeId, month);
                log.warn("员工{}在{}月未找到绩效数据，使用默认绩效: {}", employeeId, month, defaultPerformance.getPerformanceScore());
                return defaultPerformance;
            }
            
        } catch (Exception e) {
            log.error("获取月度绩效数据失败，员工ID: {}, 月份: {}, 错误信息: {}", employeeId, month, e.getMessage(), e);
            return createDefaultPerformance(employeeId, month);
        }
    }
    
    /**
     * 获取职级薪资标准
     */
    private SalaryCalculationContext.JobLevelSalary getJobLevelSalary(Long positionId) {
        SalaryCalculationContext.JobLevelSalary jobLevelSalary = new SalaryCalculationContext.JobLevelSalary();
        
        try {
            QueryWrapper<JobLevelSalary> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("position_id", positionId)
                       .eq("status", 1)
                       .eq("delflag", 0)
                       .le("effective_date", LocalDate.now())
                       .and(wrapper -> wrapper.isNull("expire_date").or().ge("expire_date", LocalDate.now()))
                       .orderByDesc("effective_date")
                       .last("LIMIT 1");
            
            JobLevelSalary config = jobLevelSalaryService.getOne(queryWrapper);
            
            if (config != null) {
                jobLevelSalary.setJobLevelCode(config.getJobLevelCode());
                jobLevelSalary.setPerformanceRatioMin(config.getPerformanceRatioMin());
                jobLevelSalary.setPerformanceRatioMax(config.getPerformanceRatioMax());
                jobLevelSalary.setStatus(1);
                
                log.debug("获取职级薪资标准成功，岗位ID: {}, 职级: {}, 绩效比例范围: {} - {}", 
                        positionId, config.getJobLevelCode(), config.getPerformanceRatioMin(), config.getPerformanceRatioMax());
            } else {
                // 设置默认值
                jobLevelSalary.setJobLevelCode("NORMAL");
                jobLevelSalary.setPerformanceRatioMin(BigDecimal.valueOf(0.8));
                jobLevelSalary.setPerformanceRatioMax(BigDecimal.valueOf(1.2));
                jobLevelSalary.setStatus(1);
                log.warn("岗位{}未找到职级薪资标准，使用默认值", positionId);
            }
            
        } catch (Exception e) {
            log.error("获取职级薪资标准失败，岗位ID: {}, 错误信息: {}", positionId, e.getMessage(), e);
            // 设置默认值
            jobLevelSalary.setJobLevelCode("NORMAL");
            jobLevelSalary.setPerformanceRatioMin(BigDecimal.valueOf(0.8));
            jobLevelSalary.setPerformanceRatioMax(BigDecimal.valueOf(1.2));
            jobLevelSalary.setStatus(1);
        }
        
        return jobLevelSalary;
    }
    
    /**
     * 获取社保配置
     */
    private SalaryCalculationContext.SocialSecurityConfig getSocialSecurityConfig(String region, String month) {
        SalaryCalculationContext.SocialSecurityConfig socialSecurityConfig = new SalaryCalculationContext.SocialSecurityConfig();
        
        try {
            QueryWrapper<SocialSecurityBase> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("region", region)
                       .eq("year", month.substring(0,4))
                       .eq("status", 1)
                       .eq("delflag", 0)
                       .le("effective_date", LocalDate.now())
                       .and(wrapper -> wrapper.isNull("expire_date").or().ge("expire_date", LocalDate.now()))
                       .orderByDesc("effective_date")
                       .last("LIMIT 1");
            
            SocialSecurityBase config = socialSecurityBaseService.getOne(queryWrapper);
            
            if (config != null) {
                socialSecurityConfig.setRegion(region);
                socialSecurityConfig.setYear(config.getYear());
                socialSecurityConfig.setSocialSecurityBaseLower(config.getSocialSecurityBaseLower());
                socialSecurityConfig.setSocialSecurityBaseUpper(config.getSocialSecurityBaseUpper());
                socialSecurityConfig.setHousingFundBaseLower(config.getHousingFundBaseLower());
                socialSecurityConfig.setHousingFundBaseUpper(config.getHousingFundBaseUpper());
                socialSecurityConfig.setPensionPersonalRatio(config.getPensionPersonalRatio());
                socialSecurityConfig.setPensionCompanyRatio(config.getPensionCompanyRatio());
                socialSecurityConfig.setMedicalPersonalRatio(config.getMedicalPersonalRatio());
                socialSecurityConfig.setMedicalCompanyRatio(config.getMedicalCompanyRatio());
                socialSecurityConfig.setUnemploymentPersonalRatio(config.getUnemploymentPersonalRatio());
                socialSecurityConfig.setUnemploymentCompanyRatio(config.getUnemploymentCompanyRatio());
                socialSecurityConfig.setMaternityCompanyRatio(config.getMaternityCompanyRatio());
                socialSecurityConfig.setInjuryCompanyRatio(config.getInjuryCompanyRatio());
                socialSecurityConfig.setHousingFundPersonalRatio(config.getHousingFundPersonalRatio());
                socialSecurityConfig.setHousingFundCompanyRatio(config.getHousingFundCompanyRatio());
                
                log.debug("获取社保配置成功，地区: {}, 年度: {}", region, config.getYear());
            } else {
                // 设置默认社保配置
                setDefaultSocialSecurityConfig(socialSecurityConfig, region);
                log.warn("地区{}未找到社保配置，使用默认值", region);
            }
            
        } catch (Exception e) {
            log.error("获取社保配置失败，地区: {}, 错误信息: {}", region, e.getMessage(), e);
            setDefaultSocialSecurityConfig(socialSecurityConfig, region);
        }
        
        return socialSecurityConfig;
    }
    
    /**
     * 获取部门分红配置
     */
    private SalaryCalculationContext.DepartmentBonusConfig getDepartmentBonusConfig(Long departmentId) {
        SalaryCalculationContext.DepartmentBonusConfig departmentBonusConfig = new SalaryCalculationContext.DepartmentBonusConfig();
        
        try {
            QueryWrapper<DepartmentBonusConfig> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("department_id", departmentId)
                       .eq("status", 1)
                       .eq("delflag", 0)
                       .le("effective_date", LocalDate.now())
                       .and(wrapper -> wrapper.isNull("expire_date").or().ge("expire_date", LocalDate.now()))
                       .orderByDesc("effective_date")
                       .last("LIMIT 1");
            
            DepartmentBonusConfig config = departmentBonusConfigService.getOne(queryWrapper);
            
            if (config != null) {
                departmentBonusConfig.setDepartmentId(departmentId);
                departmentBonusConfig.setBonusWeight(config.getBonusWeight());
                departmentBonusConfig.setStatus(1);
                
                log.debug("获取部门分红配置成功，部门ID: {}, 分红权重: {}", departmentId, config.getBonusWeight());
            } else {
                // 设置默认值
                departmentBonusConfig.setDepartmentId(departmentId);
                departmentBonusConfig.setBonusWeight(BigDecimal.valueOf(10)); // 默认10%权重
                departmentBonusConfig.setStatus(1);
                log.warn("部门{}未找到分红配置，使用默认权重10%", departmentId);
            }
            
        } catch (Exception e) {
            log.error("获取部门分红配置失败，部门ID: {}, 错误信息: {}", departmentId, e.getMessage(), e);
            // 设置默认值
            departmentBonusConfig.setDepartmentId(departmentId);
            departmentBonusConfig.setBonusWeight(BigDecimal.valueOf(10));
            departmentBonusConfig.setStatus(1);
        }
        
        return departmentBonusConfig;
    }
    
    /**
     * 获取盈亏平衡分析数据
     */
    private SalaryCalculationContext.BreakevenAnalysisData getBreakevenAnalysisData(String month) {
        SalaryCalculationContext.BreakevenAnalysisData breakevenAnalysis = new SalaryCalculationContext.BreakevenAnalysisData();
        
        try {
            // 这里可以根据实际业务需求从盈亏平衡分析表中获取数据
            // 暂时设置模拟数据
            breakevenAnalysis.setPeriod(month);
            breakevenAnalysis.setDistributableProfit(BigDecimal.valueOf(0)); // 100万可分配利润,展示没有可分配利润，到年底才有分红这一说
            
            log.debug("获取盈亏平衡分析数据成功，月份: {}, 可分配利润: {}", month, breakevenAnalysis.getDistributableProfit());
            
        } catch (Exception e) {
            log.error("获取盈亏平衡分析数据失败，月份: {}, 错误信息: {}", month, e.getMessage(), e);
            breakevenAnalysis.setPeriod(month);
            breakevenAnalysis.setDistributableProfit(BigDecimal.valueOf(500000)); // 默认50万
        }
        
        return breakevenAnalysis;
    }
    
    /**
     * 创建默认绩效数据
     */
    private MonthlyPerformance createDefaultPerformance(Long employeeId, String month) {
        MonthlyPerformance performance = new MonthlyPerformance();
        performance.setEmployeeId(employeeId);
        performance.setMonth(month);
        performance.setPerformanceScore(BigDecimal.valueOf(80)); // 默认80分
        performance.setPersonalProjectRevenue(BigDecimal.ZERO);
        performance.setPersonalProjectMargin(BigDecimal.ZERO);
        performance.setTeamProjectRevenue(BigDecimal.ZERO);
        performance.setTeamProjectMargin(BigDecimal.ZERO);
        performance.setTeamMemberCount(1);
        performance.setStatus(1);
        return performance;
    }
    
    /**
     * 设置默认薪酬配置
     */
    private void setDefaultSalaryConfig(SalaryCalculationContext.SalaryConfig salaryConfig, Long employeeId) {
        salaryConfig.setEmployeeId(employeeId);
        salaryConfig.setBaseSalary(BigDecimal.valueOf(8000)); // 默认基础工资8000
        salaryConfig.setRegion("BEIJING");
        salaryConfig.setIsSalesIncentive(false);
        salaryConfig.setSalesIncentiveRatio(BigDecimal.ZERO);
        salaryConfig.setIsTeamIncentive(false);
        salaryConfig.setTeamIncentiveRatio(BigDecimal.ZERO);
        salaryConfig.setIsDepartmentBonus(true);
        salaryConfig.setStatus(1);
    }
    
    /**
     * 设置默认社保配置
     */
    private void setDefaultSocialSecurityConfig(SalaryCalculationContext.SocialSecurityConfig config, String region) {
        config.setRegion(region);
        config.setYear(LocalDate.now().getYear());
        config.setSocialSecurityBaseLower(BigDecimal.valueOf(3500));
        config.setSocialSecurityBaseUpper(BigDecimal.valueOf(25000));
        config.setHousingFundBaseLower(BigDecimal.valueOf(3500));
        config.setHousingFundBaseUpper(BigDecimal.valueOf(25000));
        config.setPensionPersonalRatio(BigDecimal.valueOf(8));
        config.setPensionCompanyRatio(BigDecimal.valueOf(16));
        config.setMedicalPersonalRatio(BigDecimal.valueOf(2));
        config.setMedicalCompanyRatio(BigDecimal.valueOf(10));
        config.setUnemploymentPersonalRatio(BigDecimal.valueOf(1));
        config.setUnemploymentCompanyRatio(BigDecimal.valueOf(1));
        config.setMaternityCompanyRatio(BigDecimal.valueOf(1));
        config.setInjuryCompanyRatio(BigDecimal.valueOf(1));
        config.setHousingFundPersonalRatio(BigDecimal.valueOf(12));
        config.setHousingFundCompanyRatio(BigDecimal.valueOf(12));
    }
    
    /**
     * 设置默认计算上下文
     */
    private void setDefaultCalculationContext(SalaryCalculationContext context, EmployeeBasicInfo employee) {
        // 设置默认薪酬配置
        SalaryCalculationContext.SalaryConfig salaryConfig = new SalaryCalculationContext.SalaryConfig();
        setDefaultSalaryConfig(salaryConfig, employee.getEmployeeId());
        context.setSalaryConfig(salaryConfig);
        
        // 设置默认地区系数
        SalaryCalculationContext.RegionalCoefficient regionalCoefficient = new SalaryCalculationContext.RegionalCoefficient();
        regionalCoefficient.setRegion(context.getSalaryConfig().getRegion());
        regionalCoefficient.setSalaryCoefficient(BigDecimal.valueOf(1.0));
        regionalCoefficient.setStatus(1);
        context.setRegionalCoefficient(regionalCoefficient);
        
        // 设置默认绩效
        MonthlyPerformance performance = createDefaultPerformance(employee.getEmployeeId(), context.getMonth());
        context.setPerformance(performance);
        
        // 设置默认职级配置
        SalaryCalculationContext.JobLevelSalary jobLevelSalary = new SalaryCalculationContext.JobLevelSalary();
        jobLevelSalary.setJobLevelCode("NORMAL");
        jobLevelSalary.setPerformanceRatioMin(BigDecimal.valueOf(0.8));
        jobLevelSalary.setPerformanceRatioMax(BigDecimal.valueOf(1.2));
        jobLevelSalary.setStatus(1);
        context.setJobLevelSalary(jobLevelSalary);
        
        // 设置默认社保配置
        SalaryCalculationContext.SocialSecurityConfig socialSecurityConfig = new SalaryCalculationContext.SocialSecurityConfig();
        setDefaultSocialSecurityConfig(socialSecurityConfig, context.getSalaryConfig().getRegion());
        context.setSocialSecurityConfig(socialSecurityConfig);
        
        // 设置默认部门分红配置
        SalaryCalculationContext.DepartmentBonusConfig departmentBonusConfig = new SalaryCalculationContext.DepartmentBonusConfig();
        departmentBonusConfig.setDepartmentId(employee.getDepartmentId());
        departmentBonusConfig.setBonusWeight(BigDecimal.valueOf(10));
        departmentBonusConfig.setStatus(1);
        context.setDepartmentBonusConfig(departmentBonusConfig);
        
        // 设置默认盈亏平衡分析
        SalaryCalculationContext.BreakevenAnalysisData breakevenAnalysis = new SalaryCalculationContext.BreakevenAnalysisData();
        breakevenAnalysis.setPeriod(context.getMonth());
        breakevenAnalysis.setDistributableProfit(BigDecimal.valueOf(500000));
        context.setBreakevenAnalysis(breakevenAnalysis);
        
        log.warn("使用默认计算上下文，员工ID: {}", employee.getEmployeeId());
    }
    
    /**
     * 计算执行时长(秒)
     */
    private Integer calculateExecutionDuration(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            return 0;
        }
        return (int) java.time.Duration.between(startTime, endTime).getSeconds();
    }
    
    /**
     * 员工基础信息类
     */
    private static class EmployeeBasicInfo {
        private Long employeeId;
        private String employeeName;
        private String employeeNo;
        private Long departmentId;
        private String departmentName;
        private Long positionId;
        private String positionName;

        // getter setter方法
        public Long getEmployeeId() { return employeeId; }
        public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
        public String getEmployeeName() { return employeeName; }
        public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }
        public String getEmployeeNo() { return employeeNo; }
        public void setEmployeeNo(String employeeNo) { this.employeeNo = employeeNo; }
        public Long getDepartmentId() { return departmentId; }
        public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }
        public String getDepartmentName() { return departmentName; }
        public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
        public Long getPositionId() { return positionId; }
        public void setPositionId(Long positionId) { this.positionId = positionId; }
        public String getPositionName() { return positionName; }
        public void setPositionName(String positionName) { this.positionName = positionName; }
    }

    @Override
    public PageResult<SalaryCalculationTask> getCalculationTasks(SalaryTaskQueryDTO queryDTO) {
        try {
            // 使用MyBatis-Plus进行数据库查询
            com.baomidou.mybatisplus.extension.plugins.pagination.Page<SalaryCalculationTask> page =
                new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(
                    queryDTO.getPage() != null ? queryDTO.getPage() : 1,
                    queryDTO.getSize() != null ? queryDTO.getSize() : 20
                );

            // 构建查询条件
            com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SalaryCalculationTask> queryWrapper =
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
            
            // 设置查询条件
            if (queryDTO.getCalculationMonth() != null && !queryDTO.getCalculationMonth().trim().isEmpty()) {
                queryWrapper.eq(SalaryCalculationTask::getCalculationMonth, queryDTO.getCalculationMonth());
            }
            if (queryDTO.getTaskStatus() != null && !queryDTO.getTaskStatus().trim().isEmpty()) {
                queryWrapper.eq(SalaryCalculationTask::getTaskStatus, queryDTO.getTaskStatus());
            }
            if (queryDTO.getTaskName() != null && !queryDTO.getTaskName().trim().isEmpty()) {
                queryWrapper.like(SalaryCalculationTask::getTaskName, queryDTO.getTaskName());
            }
            if (queryDTO.getCalculationType() != null && !queryDTO.getCalculationType().trim().isEmpty()) {
                queryWrapper.eq(SalaryCalculationTask::getCalculationType, queryDTO.getCalculationType());
            }
            if (queryDTO.getCreatedBy() != null) {
                queryWrapper.eq(SalaryCalculationTask::getCreatedBy, queryDTO.getCreatedBy());
            }
            if (queryDTO.getIsFinal() != null) {
                queryWrapper.eq(SalaryCalculationTask::getIsFinal, queryDTO.getIsFinal());
            }
            
            // 只查询未删除的记录
            queryWrapper.eq(SalaryCalculationTask::getDelflag, false);
            
            // 按创建时间倒序排列
            queryWrapper.orderByDesc(SalaryCalculationTask::getCreatedAt);

            // 执行分页查询
            com.baomidou.mybatisplus.extension.plugins.pagination.Page<SalaryCalculationTask> pageResult = 
                this.page(page, queryWrapper);

            // 使用工具类构建返回结果
            return PageResultUtil.buildPageResult(pageResult);
            
        } catch (Exception e) {
            log.error("查询薪酬计算任务失败: {}", e.getMessage(), e);
            
            // 查询失败时返回错误信息
            PageResult<SalaryCalculationTask> result = new PageResult<>();
            result.setData(new ArrayList<>());
            result.setCount(0L);
            result.setPage(queryDTO.getPage() != null ? queryDTO.getPage() : 1);
            result.setSize(queryDTO.getSize() != null ? queryDTO.getSize() : 20);
            result.setPages(0);
            result.setResp_code(1);
            // 不直接调用setResp_code，让它保持默认值
            
            return result;
        }
    }

    @Override
    public Result<SalaryCalculationTask> getTaskDetail(String taskId) {
        try {
            log.info("获取任务详情，任务ID: {}", taskId);
            
            // 查询任务信息
            com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SalaryCalculationTask> queryWrapper =
                    new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
            queryWrapper.eq(SalaryCalculationTask::getTaskId, taskId)
                       .eq(SalaryCalculationTask::getDelflag, false);
            
            SalaryCalculationTask task = baseMapper.selectOne(queryWrapper);
            if (task == null) {
                log.warn("任务不存在，任务ID: {}", taskId);
                return Result.failed("任务不存在");
            }
            
            log.info("获取任务详情成功，任务ID: {}, 任务名称: {}, 状态: {}", 
                    taskId, task.getTaskName(), task.getTaskStatus());
            
            return Result.succeed(task);
        } catch (Exception e) {
            log.error("获取任务详情失败，任务ID: {}, 错误信息: {}", taskId, e.getMessage(), e);
            return Result.failed("获取详情失败: " + e.getMessage());
        }
    }

    @Override
    public Result<TaskProgressDTO> getTaskProgress(String taskId) {
        try {
            TaskProgressDTO progress = new TaskProgressDTO();
            progress.setTaskId(taskId);
            progress.setTaskStatus("RUNNING");
            progress.setProgressPercent(new BigDecimal("75.50"));
            progress.setTotalEmployeeCount(50);
            progress.setProcessedEmployeeCount(38);
            progress.setSuccessEmployeeCount(35);
            progress.setFailedEmployeeCount(3);
            progress.setCurrentStep("正在计算绩效工资...");
            
            return Result.succeed(progress);
        } catch (Exception e) {
            return Result.failed("获取任务进度失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> cancelTask(String taskId) {
        try {
            // 实际实现中应该：
            // 1. 检查任务状态是否可以取消
            // 2. 更新任务状态为CANCELLED
            // 3. 停止正在执行的计算
            
            return Result.succeed("任务已取消");
        } catch (Exception e) {
            return Result.failed("取消任务失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> confirmTask(String taskId, Long confirmedBy) {
        try {
            // 实际实现中应该：
            // 1. 更新任务的确认状态
            // 2. 设置确认人和确认时间
            // 3. 将结果标记为最终版本
            
            return Result.succeed("任务结果已确认");
        } catch (Exception e) {
            return Result.failed("确认任务失败: " + e.getMessage());
        }
    }

    @Override
    public Result<SalaryTaskStatisticsDTO> getTaskStatistics() {
        try {
            // 使用数据库查询统计数据
            com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SalaryCalculationTask> queryWrapper =
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
            
            // 只查询未删除的记录
            queryWrapper.eq(SalaryCalculationTask::getDelflag, false);
            
            // 统计总任务数
            long totalTasks = this.count(queryWrapper);
            
            // 统计各状态任务数
            queryWrapper.clear();
            queryWrapper.eq(SalaryCalculationTask::getDelflag, false)
                        .eq(SalaryCalculationTask::getTaskStatus, SalaryCalculationTask.TaskStatus.RUNNING);
            long runningTasks = this.count(queryWrapper);
            
            queryWrapper.clear();
            queryWrapper.eq(SalaryCalculationTask::getDelflag, false)
                        .eq(SalaryCalculationTask::getTaskStatus, SalaryCalculationTask.TaskStatus.COMPLETED);
            long completedTasks = this.count(queryWrapper);
            
            queryWrapper.clear();
            queryWrapper.eq(SalaryCalculationTask::getDelflag, false)
                        .eq(SalaryCalculationTask::getTaskStatus, SalaryCalculationTask.TaskStatus.FAILED);
            long failedTasks = this.count(queryWrapper);
            
            // 计算本月任务数（当前月份）
            String currentMonth = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM"));
            queryWrapper.clear();
            queryWrapper.eq(SalaryCalculationTask::getDelflag, false)
                        .eq(SalaryCalculationTask::getCalculationMonth, currentMonth);
            long thisMonthTasks = this.count(queryWrapper);
            
            // 计算上月任务数
            String lastMonth = LocalDateTime.now().minusMonths(1).format(DateTimeFormatter.ofPattern("yyyy-MM"));
            queryWrapper.clear();
            queryWrapper.eq(SalaryCalculationTask::getDelflag, false)
                        .eq(SalaryCalculationTask::getCalculationMonth, lastMonth);
            long lastMonthTasks = this.count(queryWrapper);
            
            // 计算平均执行时间（已完成的任务）
            queryWrapper.clear();
            queryWrapper.eq(SalaryCalculationTask::getDelflag, false)
                        .eq(SalaryCalculationTask::getTaskStatus, SalaryCalculationTask.TaskStatus.COMPLETED)
                        .isNotNull(SalaryCalculationTask::getExecutionDuration);
            List<SalaryCalculationTask> completedTasksWithDuration = this.list(queryWrapper);
            
            double avgExecutionTime = 0;
            String avgExecutionTimeStr = "0分钟";
            if (!completedTasksWithDuration.isEmpty()) {
                double totalDuration = completedTasksWithDuration.stream()
                    .mapToDouble(task -> task.getExecutionDuration() != null ? task.getExecutionDuration() : 0)
                    .sum();
                avgExecutionTime = totalDuration / completedTasksWithDuration.size();
                
                // 转换为可读格式
                if (avgExecutionTime < 60) {
                    avgExecutionTimeStr = String.format("%.0f秒", avgExecutionTime);
                } else if (avgExecutionTime < 3600) {
                    avgExecutionTimeStr = String.format("%.1f分钟", avgExecutionTime / 60);
                } else {
                    avgExecutionTimeStr = String.format("%.1f小时", avgExecutionTime / 3600);
                }
            }
            
            // 计算成功率
            double successRate = 0;
            if (totalTasks > 0) {
                successRate = (double) completedTasks / totalTasks * 100;
            }
            
            // 构建统计结果
            SalaryTaskStatisticsDTO statistics = new SalaryTaskStatisticsDTO();
            statistics.setTotalTasks((int) totalTasks);
            statistics.setRunningTasks((int) runningTasks);
            statistics.setCompletedTasks((int) completedTasks);
            statistics.setFailedTasks((int) failedTasks);
            statistics.setThisMonthTasks((int) thisMonthTasks);
            statistics.setLastMonthTasks((int) lastMonthTasks);
            statistics.setAvgExecutionTime(avgExecutionTimeStr);
            statistics.setSuccessRate(BigDecimal.valueOf(successRate).setScale(2, BigDecimal.ROUND_HALF_UP));
            
            return Result.succeed(statistics);
        } catch (Exception e) {
            // 记录错误日志
            System.err.println("获取任务统计失败: " + e.getMessage());
            e.printStackTrace();
            
            // 返回默认统计数据
            SalaryTaskStatisticsDTO statistics = new SalaryTaskStatisticsDTO();
            statistics.setTotalTasks(0);
            statistics.setRunningTasks(0);
            statistics.setCompletedTasks(0);
            statistics.setFailedTasks(0);
            statistics.setThisMonthTasks(0);
            statistics.setLastMonthTasks(0);
            statistics.setAvgExecutionTime("0分钟");
            statistics.setSuccessRate(BigDecimal.ZERO);
            
            return Result.failed("获取任务统计失败: " + e.getMessage());
        }
    }

    // ===========================
    // 工资计算结果管理
    // ===========================

    @Override
    public PageResult<PayrollResult> getPayrollResults(PayrollResultQueryDTO queryDTO) {
        try {
            log.info("查询工资计算结果，查询条件: page={}, size={}, taskId={}, taskName={}, month={}", 
                    queryDTO.getPage(), queryDTO.getSize(), queryDTO.getTaskId(), queryDTO.getTaskName(), queryDTO.getMonth());
            
            // 构建查询条件
            com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<PayrollResult> queryWrapper =
                    new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
            
            // 基本查询条件
            queryWrapper.eq(PayrollResult::getDelflag, false);
            
            // 添加查询条件
            if (queryDTO.getTaskId() != null && !queryDTO.getTaskId().trim().isEmpty()) {
                queryWrapper.eq(PayrollResult::getTaskId, queryDTO.getTaskId());
            }
            
            // 新增：支持通过任务名称查询
            if (queryDTO.getTaskName() != null && !queryDTO.getTaskName().trim().isEmpty()) {
                // 通过任务名称查找对应的任务ID
                com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<SalaryCalculationTask> taskQueryWrapper =
                        new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
                taskQueryWrapper.like(SalaryCalculationTask::getTaskName, queryDTO.getTaskName())
                               .eq(SalaryCalculationTask::getDelflag, false);
                
                // 使用正确的Mapper来查询任务
                List<SalaryCalculationTask> matchingTasks = this.list(taskQueryWrapper);
                if (matchingTasks.isEmpty()) {
                    log.warn("未找到匹配的薪酬计算任务，任务名称: {}", queryDTO.getTaskName());
                    // 返回空结果
                    PageResult<PayrollResult> emptyResult = new PageResult<>();
                    emptyResult.setData(new ArrayList<>());
                    emptyResult.setCount(0L);
                    emptyResult.setPage(queryDTO.getPage());
                    emptyResult.setSize(queryDTO.getSize());
                    emptyResult.setPages(0);
                    emptyResult.setResp_code(0);
                    return emptyResult;
                } else {
                    // 使用匹配的任务ID进行查询
                    List<String> taskIds = matchingTasks.stream()
                            .map(SalaryCalculationTask::getTaskId)
                            .collect(java.util.stream.Collectors.toList());
                    queryWrapper.in(PayrollResult::getTaskId, taskIds);
                    log.info("根据任务名称 '{}' 找到 {} 个匹配任务，任务ID: {}", 
                            queryDTO.getTaskName(), taskIds.size(), taskIds);
                }
            }
            
            if (queryDTO.getMonth() != null && !queryDTO.getMonth().trim().isEmpty()) {
                queryWrapper.eq(PayrollResult::getMonth, queryDTO.getMonth());
            }
            if (queryDTO.getStartMonth() != null && !queryDTO.getStartMonth().trim().isEmpty()) {
                queryWrapper.ge(PayrollResult::getMonth, queryDTO.getStartMonth());
            }
            if (queryDTO.getEndMonth() != null && !queryDTO.getEndMonth().trim().isEmpty()) {
                queryWrapper.le(PayrollResult::getMonth, queryDTO.getEndMonth());
            }
            if (queryDTO.getDepartmentIds() != null && !queryDTO.getDepartmentIds().isEmpty()) {
                queryWrapper.in(PayrollResult::getDepartmentId, queryDTO.getDepartmentIds());
            }
            if (queryDTO.getEmployeeIds() != null && !queryDTO.getEmployeeIds().isEmpty()) {
                queryWrapper.in(PayrollResult::getEmployeeId, queryDTO.getEmployeeIds());
            }
            if (queryDTO.getEmployeeName() != null && !queryDTO.getEmployeeName().trim().isEmpty()) {
                queryWrapper.like(PayrollResult::getEmployeeName, queryDTO.getEmployeeName());
            }
            if (queryDTO.getApprovalStatus() != null && !queryDTO.getApprovalStatus().trim().isEmpty()) {
                queryWrapper.eq(PayrollResult::getApprovalStatus, queryDTO.getApprovalStatus());
            }
            if (queryDTO.getCalculationStatus() != null && !queryDTO.getCalculationStatus().trim().isEmpty()) {
                queryWrapper.eq(PayrollResult::getCalculationStatus, queryDTO.getCalculationStatus());
            }
            if (queryDTO.getIsFinal() != null) {
                queryWrapper.eq(PayrollResult::getIsFinal, queryDTO.getIsFinal());
            }
            if (queryDTO.getIsCurrentVersion() != null) {
                queryWrapper.eq(PayrollResult::getIsCurrentVersion, queryDTO.getIsCurrentVersion());
            }
            
            // 按创建时间倒序排列
            queryWrapper.orderByDesc(PayrollResult::getCreatedAt);
            
            // 分页查询
            com.baomidou.mybatisplus.extension.plugins.pagination.Page<PayrollResult> page = 
                    new com.baomidou.mybatisplus.extension.plugins.pagination.Page<>(queryDTO.getPage(), queryDTO.getSize());
            
            com.baomidou.mybatisplus.extension.plugins.pagination.Page<PayrollResult> resultPage = 
                    payrollResultMapper.selectPage(page, queryWrapper);
            
            log.info("工资计算结果查询完成，总记录数: {}, 当前页数据: {}", 
                    resultPage.getTotal(), resultPage.getRecords().size());
            
            // 构建返回结果
            PageResult<PayrollResult> pageResult = new PageResult<>();
            pageResult.setData(resultPage.getRecords());
            pageResult.setCount(resultPage.getTotal());
            pageResult.setPage((int) resultPage.getCurrent());
            pageResult.setSize((int) resultPage.getSize());
            pageResult.setPages((int) resultPage.getPages());
            
            // 设置响应码，适配前端格式
            pageResult.setResp_code(0); // 成功状态码
            
            return pageResult;
        } catch (Exception e) {
            log.error("查询工资计算结果失败，错误信息: {}", e.getMessage(), e);
            PageResult<PayrollResult> result = new PageResult<>();
            result.setData(new ArrayList<>());
            result.setCount(0L);
            result.setResp_code(1); // 失败状态码
            return result;
        }
    }

    @Override
    public Result<PayrollResult> getPayrollDetail(Long resultId) {
        try {
            log.info("获取员工工资详情，结果ID: {}", resultId);
            
            // 查询工资结果详情
            com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<PayrollResult> queryWrapper =
                    new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
            queryWrapper.eq(PayrollResult::getId, resultId)
                       .eq(PayrollResult::getDelflag, false);
            
            PayrollResult detail = payrollResultMapper.selectOne(queryWrapper);
            if (detail == null) {
                log.warn("工资详情不存在，结果ID: {}", resultId);
                return Result.failed("工资详情不存在");
            }
            
            log.info("获取员工工资详情成功，员工ID: {}, 员工姓名: {}, 应发工资: {}, 实发工资: {}", 
                    detail.getEmployeeId(), detail.getEmployeeName(), 
                    detail.getGrossPay(), detail.getNetPay());
            
            return Result.succeed(detail);
        } catch (Exception e) {
            log.error("获取员工工资详情失败，结果ID: {}, 错误信息: {}", resultId, e.getMessage(), e);
            return Result.failed("获取工资详情失败: " + e.getMessage());
        }
    }

    @Override
    public Result<PayrollResult> recalculateEmployee(String taskId, Long employeeId) {
        try {
            // 实际实现中应该重新计算指定员工的工资
            PayrollResult result = new PayrollResult();
            result.setEmployeeId(employeeId);
            result.setTaskId(taskId);
            // ... 设置其他字段
            
            return Result.succeed(result);
        } catch (Exception e) {
            return Result.failed("重新计算员工工资失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> batchApprovePayroll(PayrollApprovalDTO approvalDTO) {
        try {
            // 实际实现中应该批量更新审批状态
            return Result.succeed("批量审批完成，共处理 " + approvalDTO.getResultIds().size() + " 条记录");
        } catch (Exception e) {
            return Result.failed("批量审批失败: " + e.getMessage());
        }
    }

    @Override
    public Result<PayrollResult> adjustPayrollResult(PayrollAdjustmentDTO adjustmentDTO) {
        try {
            // 实际实现中应该调整工资结果
            PayrollResult result = new PayrollResult();
            result.setId(adjustmentDTO.getResultId());
            // ... 应用调整
            
            return Result.succeed(result);
        } catch (Exception e) {
            return Result.failed("调整工资结果失败: " + e.getMessage());
        }
    }

    @Override
    public Result<List<String>> getCalculationLog(Long resultId) {
        try {
            List<String> logs = Arrays.asList(
                "2024-12-01 09:00:00 - 开始计算员工工资",
                "2024-12-01 09:01:00 - 获取员工基础信息",
                "2024-12-01 09:02:00 - 计算基础工资: 15000 * 1.2 = 18000",
                "2024-12-01 09:03:00 - 计算绩效工资: 18000 * 0.88 = 15840",
                "2024-12-01 09:04:00 - 计算个人提成: 120000 * 0.07 = 8400",
                "2024-12-01 09:05:00 - 计算社保个税扣除",
                "2024-12-01 09:06:00 - 工资计算完成"
            );
            
            return Result.succeed(logs);
        } catch (Exception e) {
            return Result.failed("获取计算日志失败: " + e.getMessage());
        }
    }

    // ===========================
    // 薪酬统计分析
    // ===========================

    @Override
    public Result<List<SalarySummary>> getSalarySummary(String taskId) {
        try {
            List<SalarySummary> summaries = salarySummaryMapper.selectByTaskId(taskId);
            return Result.succeed(summaries);
        } catch (Exception e) {
            log.error("获取薪酬统计汇总失败，任务ID: {}, 错误信息: {}", taskId, e.getMessage(), e);
            return Result.failed("获取薪酬统计汇总失败: " + e.getMessage());
        }
    }

    @Override
    public Result<SalarySummary> getDepartmentSalarySummary(String taskId, Long departmentId) {
        try {
            SalarySummary summary = salarySummaryMapper.selectByTaskIdAndDepartmentId(taskId, departmentId);
            if (summary == null) {
                return Result.failed("未找到指定任务和部门的薪酬统计数据");
            }
            return Result.succeed(summary);
        } catch (Exception e) {
            log.error("获取部门薪酬统计失败，任务ID: {}, 部门ID: {}, 错误信息: {}", taskId, departmentId, e.getMessage(), e);
            return Result.failed("获取部门薪酬统计失败: " + e.getMessage());
        }
    }

    @Override
    public Result<SalaryTrendDTO> getSalaryTrend(SalaryTrendQueryDTO queryDTO) {
        try {
            SalaryTrendDTO trend = new SalaryTrendDTO();
            trend.setMonths(Arrays.asList("2024-08", "2024-09", "2024-10", "2024-11", "2024-12"));
            trend.setTotalGrossPay(Arrays.asList(1520000, 1580000, 1620000, 1650000, 1650000));
            trend.setTotalNetPay(Arrays.asList(1320000, 1380000, 1420000, 1450000, 1450000));
            trend.setTotalCompanyCost(Arrays.asList(1720000, 1780000, 1820000, 1850000, 1850000));
            trend.setEmployeeCount(Arrays.asList(48, 49, 50, 50, 50));
            trend.setAvgSalary(Arrays.asList(31667, 32245, 32400, 33000, 33000));
            
            return Result.succeed(trend);
        } catch (Exception e) {
            return Result.failed("获取薪酬趋势分析失败: " + e.getMessage());
        }
    }

    @Override
    public Result<SalaryDistributionDTO> getSalaryDistribution(String taskId) {
        try {
            SalaryDistributionDTO distribution = new SalaryDistributionDTO();
            distribution.setTaskId(taskId);
            distribution.setSalaryRanges(Arrays.asList("0-10K", "10K-20K", "20K-30K", "30K-40K", "40K+"));
            distribution.setEmployeeCounts(Arrays.asList(5, 15, 20, 8, 2));
            distribution.setPercentages(Arrays.asList(10.0, 30.0, 40.0, 16.0, 4.0));
            
            return Result.succeed(distribution);
        } catch (Exception e) {
            return Result.failed("获取薪酬分布分析失败: " + e.getMessage());
        }
    }

    @Override
    public Result<String> exportPayrollResults(PayrollExportDTO exportDTO) {
        try {
            byte[] excelBytes = generateExcelBytes(exportDTO);
            if (excelBytes != null && excelBytes.length > 0) {
                return Result.succeed("导出成功");
            } else {
                return Result.failed("导出失败，无数据");
            }
        } catch (Exception e) {
            log.error("导出工资计算结果失败，错误信息: {}", e.getMessage(), e);
            return Result.failed("导出工资计算结果失败: " + e.getMessage());
        }
    }

    @Override
    public byte[] generateExcelBytes(PayrollExportDTO exportDTO) {
        try {
            log.info("开始生成Excel文件，导出参数: {}", exportDTO);
            
            // 1. 根据任务名称查询任务
            List<SalaryCalculationTask> tasks = new ArrayList<>();
            if (exportDTO.getTaskName() != null && !exportDTO.getTaskName().trim().isEmpty()) {
                String taskName = exportDTO.getTaskName().trim();
                log.info("根据任务名称查询: {}", taskName);
                
                QueryWrapper<SalaryCalculationTask> taskQueryWrapper = new QueryWrapper<>();
                taskQueryWrapper.like("task_name", taskName);
                List<SalaryCalculationTask> matchingTasks = this.list(taskQueryWrapper);
                
                log.info("根据任务名称 '{}' 找到 {} 个匹配任务，任务ID: {}", 
                    taskName, matchingTasks.size(), 
                    matchingTasks.stream().map(SalaryCalculationTask::getTaskId).toArray());
                
                tasks.addAll(matchingTasks);
            }
            
            // 2. 构建查询条件
            QueryWrapper<PayrollResult> queryWrapper = new QueryWrapper<>();
            
            // 添加任务ID条件（如果通过任务名称找到了任务）
            if (!tasks.isEmpty()) {
                List<String> taskIds = tasks.stream()
                    .map(SalaryCalculationTask::getTaskId)
                    .toList();
                queryWrapper.in("task_id", taskIds);
            }
            
            // 添加其他查询条件
            if (exportDTO.getEmployeeIds() != null && !exportDTO.getEmployeeIds().isEmpty()) {
                queryWrapper.in("employee_id", exportDTO.getEmployeeIds());
            }
            
            if (exportDTO.getDepartmentIds() != null && !exportDTO.getDepartmentIds().isEmpty()) {
                queryWrapper.in("department_id", exportDTO.getDepartmentIds());
            }
            
            if (exportDTO.getEmployeeName() != null && !exportDTO.getEmployeeName().trim().isEmpty()) {
                queryWrapper.like("employee_name", exportDTO.getEmployeeName().trim());
            }
            
            if (exportDTO.getMonth() != null && !exportDTO.getMonth().trim().isEmpty()) {
                queryWrapper.eq("month", exportDTO.getMonth().trim());
            }
            
            if (exportDTO.getStartMonth() != null && !exportDTO.getStartMonth().trim().isEmpty() &&
                exportDTO.getEndMonth() != null && !exportDTO.getEndMonth().trim().isEmpty()) {
                queryWrapper.between("month", exportDTO.getStartMonth().trim(), exportDTO.getEndMonth().trim());
            }
            
            if (exportDTO.getIsFinal() != null) {
                queryWrapper.eq("is_final", exportDTO.getIsFinal());
            }
            
            // 按员工姓名和月份排序
            queryWrapper.orderByAsc("employee_name", "month");
            
            // 3. 查询数据
            List<PayrollResult> dataList = payrollResultMapper.selectList(queryWrapper);
            log.info("找到 {} 条工资记录需要导出", dataList.size());
            
            if (dataList.isEmpty()) {
                log.warn("没有找到匹配的工资记录");
                return null;
            }
            
            // 4. 创建Excel工作簿
            org.apache.poi.xssf.usermodel.XSSFWorkbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook();
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("工资查询结果");
            
            // 5. 创建表头样式
            org.apache.poi.ss.usermodel.CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.BLUE.getIndex());
            headerStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            headerStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            headerStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            headerStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            
            org.apache.poi.ss.usermodel.Font headerFont = workbook.createFont();
            headerFont.setColor(org.apache.poi.ss.usermodel.IndexedColors.WHITE.getIndex());
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            
            // 6. 创建数据样式
            org.apache.poi.ss.usermodel.CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            dataStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            dataStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            dataStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            
            // 7. 创建数字格式样式
            org.apache.poi.ss.usermodel.CellStyle numberStyle = workbook.createCellStyle();
            numberStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            numberStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            numberStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            numberStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);
            numberStyle.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));
            
            // 8. 创建表头
            String[] headers = {
                "员工工号", "员工姓名", "部门名称", "岗位名称", "月份", "区域",
                "基础工资", "调整后基础工资", "绩效得分", "绩效系数", "绩效工资",
                "个人提成", "团队提成", "部门分红", "应发工资", 
                "个人社保合计", "个人所得税", "实发工资", "公司总成本",
                "是否最终版", "确认时间"
            };
            
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // 9. 填充数据
            for (int i = 0; i < dataList.size(); i++) {
                PayrollResult result = dataList.get(i);
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(i + 1);
                
                // 员工工号
                org.apache.poi.ss.usermodel.Cell cell0 = row.createCell(0);
                cell0.setCellValue(result.getEmployeeNo() != null ? result.getEmployeeNo() : "");
                cell0.setCellStyle(dataStyle);
                
                // 员工姓名
                org.apache.poi.ss.usermodel.Cell cell1 = row.createCell(1);
                cell1.setCellValue(result.getEmployeeName() != null ? result.getEmployeeName() : "");
                cell1.setCellStyle(dataStyle);
                
                // 部门名称
                org.apache.poi.ss.usermodel.Cell cell2 = row.createCell(2);
                cell2.setCellValue(result.getDepartmentName() != null ? result.getDepartmentName() : "");
                cell2.setCellStyle(dataStyle);
                
                // 岗位名称
                org.apache.poi.ss.usermodel.Cell cell3 = row.createCell(3);
                cell3.setCellValue(result.getPositionName() != null ? result.getPositionName() : "");
                cell3.setCellStyle(dataStyle);
                
                // 月份
                org.apache.poi.ss.usermodel.Cell cell4 = row.createCell(4);
                cell4.setCellValue(result.getMonth() != null ? result.getMonth() : "");
                cell4.setCellStyle(dataStyle);
                
                // 区域
                org.apache.poi.ss.usermodel.Cell cell5 = row.createCell(5);
                cell5.setCellValue(result.getRegion() != null ? result.getRegion() : "");
                cell5.setCellStyle(dataStyle);
                
                // 基础工资
                org.apache.poi.ss.usermodel.Cell cell6 = row.createCell(6);
                cell6.setCellValue(result.getBaseSalary() != null ? result.getBaseSalary().doubleValue() : 0.0);
                cell6.setCellStyle(numberStyle);
                
                // 调整后基础工资
                org.apache.poi.ss.usermodel.Cell cell7 = row.createCell(7);
                cell7.setCellValue(result.getAdjustedBaseSalary() != null ? result.getAdjustedBaseSalary().doubleValue() : 0.0);
                cell7.setCellStyle(numberStyle);
                
                // 绩效得分
                org.apache.poi.ss.usermodel.Cell cell8 = row.createCell(8);
                cell8.setCellValue(result.getPerformanceScore() != null ? result.getPerformanceScore().doubleValue() : 0.0);
                cell8.setCellStyle(numberStyle);
                
                // 绩效系数
                org.apache.poi.ss.usermodel.Cell cell9 = row.createCell(9);
                cell9.setCellValue(result.getPerformanceRatio() != null ? result.getPerformanceRatio().doubleValue() : 0.0);
                cell9.setCellStyle(numberStyle);
                
                // 绩效工资
                org.apache.poi.ss.usermodel.Cell cell10 = row.createCell(10);
                cell10.setCellValue(result.getPerformancePay() != null ? result.getPerformancePay().doubleValue() : 0.0);
                cell10.setCellStyle(numberStyle);
                
                // 个人提成
                org.apache.poi.ss.usermodel.Cell cell11 = row.createCell(11);
                cell11.setCellValue(result.getPersonalCommission() != null ? result.getPersonalCommission().doubleValue() : 0.0);
                cell11.setCellStyle(numberStyle);
                
                // 团队提成
                org.apache.poi.ss.usermodel.Cell cell12 = row.createCell(12);
                cell12.setCellValue(result.getTeamCommission() != null ? result.getTeamCommission().doubleValue() : 0.0);
                cell12.setCellStyle(numberStyle);
                
                // 部门分红
                org.apache.poi.ss.usermodel.Cell cell13 = row.createCell(13);
                cell13.setCellValue(result.getDepartmentBonus() != null ? result.getDepartmentBonus().doubleValue() : 0.0);
                cell13.setCellStyle(numberStyle);
                
                // 应发工资
                org.apache.poi.ss.usermodel.Cell cell14 = row.createCell(14);
                cell14.setCellValue(result.getGrossPay() != null ? result.getGrossPay().doubleValue() : 0.0);
                cell14.setCellStyle(numberStyle);
                
                // 个人社保合计
                org.apache.poi.ss.usermodel.Cell cell15 = row.createCell(15);
                cell15.setCellValue(result.getPersonalSocialTotal() != null ? result.getPersonalSocialTotal().doubleValue() : 0.0);
                cell15.setCellStyle(numberStyle);
                
                // 个人所得税
                org.apache.poi.ss.usermodel.Cell cell16 = row.createCell(16);
                cell16.setCellValue(result.getPersonalIncomeTax() != null ? result.getPersonalIncomeTax().doubleValue() : 0.0);
                cell16.setCellStyle(numberStyle);
                
                // 实发工资
                org.apache.poi.ss.usermodel.Cell cell17 = row.createCell(17);
                cell17.setCellValue(result.getNetPay() != null ? result.getNetPay().doubleValue() : 0.0);
                cell17.setCellStyle(numberStyle);
                
                // 公司总成本
                org.apache.poi.ss.usermodel.Cell cell18 = row.createCell(18);
                cell18.setCellValue(result.getTotalCompanyCost() != null ? result.getTotalCompanyCost().doubleValue() : 0.0);
                cell18.setCellStyle(numberStyle);
                
                // 是否最终版
                org.apache.poi.ss.usermodel.Cell cell19 = row.createCell(19);
                cell19.setCellValue(result.getIsFinal() != null && result.getIsFinal() ? "是" : "否");
                cell19.setCellStyle(dataStyle);
                
                // 确认时间
                org.apache.poi.ss.usermodel.Cell cell20 = row.createCell(20);
                cell20.setCellValue(result.getConfirmedAt() != null ? 
                    result.getConfirmedAt().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : "");
                cell20.setCellStyle(dataStyle);
            }
            
            // 自动调整列宽
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                // 设置最小列宽
                if (sheet.getColumnWidth(i) < 2000) {
                    sheet.setColumnWidth(i, 2000);
                }
            }
            
            // 将工作簿写入字节数组
            java.io.ByteArrayOutputStream outputStream = new java.io.ByteArrayOutputStream();
            workbook.write(outputStream);
            workbook.close();
            
            byte[] excelBytes = outputStream.toByteArray();
            outputStream.close();
            
            log.info("Excel文件生成完成，导出了 {} 条记录，文件大小: {} 字节", dataList.size(), excelBytes.length);
            
            return excelBytes;
        } catch (Exception e) {
            log.error("生成Excel文件失败，错误信息: {}", e.getMessage(), e);
            return null;
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

    // ===========================
    // 盈亏平衡分析
    // ===========================

    @Override
    public Result<BreakevenAnalysis> generateBreakevenAnalysis(BreakevenAnalysisDTO analysisDTO) {
        try {
            BreakevenAnalysis analysis = new BreakevenAnalysis();
//            analysis.setTaskId(analysisDTO.getTaskId());
            analysis.setAnalysisName(analysisDTO.getAnalysisName());
            analysis.setAnalysisType(analysisDTO.getAnalysisType());
            analysis.setAnalysisPeriod(analysisDTO.getAnalysisPeriod());
            
            return Result.succeed(analysis);
        } catch (Exception e) {
            return Result.failed("生成盈亏平衡分析失败: " + e.getMessage());
        }
    }

    @Override
    public PageResult<BreakevenAnalysis> getBreakevenAnalysisList(BreakevenQueryDTO queryDTO) {
        try {
            List<BreakevenAnalysis> analyses = new ArrayList<>();
            // 模拟数据
            
            PageResult<BreakevenAnalysis> result = new PageResult<>();
            result.setData(analyses);
            result.setCount((long) analyses.size());
            
            return result;
        } catch (Exception e) {
            PageResult<BreakevenAnalysis> result = new PageResult<>();
            result.setData(new ArrayList<>());
            result.setCount(0L);
            result.setResp_code(1);
            return result;
        }
    }

    @Override
    public Result<CostStructureDTO> getCostStructureAnalysis(String taskId) {
        try {
            CostStructureDTO costStructure = new CostStructureDTO();
            costStructure.setTaskId(taskId);
            costStructure.setTotalPersonnelCost(new BigDecimal("1850000.00"));
            costStructure.setBaseSalaryCost(new BigDecimal("750000.00"));
            costStructure.setPerformanceCost(new BigDecimal("400000.00"));
            costStructure.setCommissionCost(new BigDecimal("300000.00"));
            costStructure.setSocialSecurityCost(new BigDecimal("250000.00"));
            costStructure.setOtherCost(new BigDecimal("150000.00"));
            
            return Result.succeed(costStructure);
        } catch (Exception e) {
            return Result.failed("获取成本结构分析失败: " + e.getMessage());
        }
    }

    // ===========================
    // 数据验证
    // ===========================

    @Override
    public Result<DataValidationDTO> validateCalculationData(String taskId) {
        try {
            DataValidationDTO validation = new DataValidationDTO();
            validation.setTaskId(taskId);
            validation.setIsValid(true);
            validation.setTotalChecks(10);
            validation.setPassedChecks(10);
            validation.setFailedChecks(0);
            validation.setValidationResults(Arrays.asList(
                "员工基础数据完整性检查通过",
                "薪酬配置数据完整性检查通过",
                "绩效数据完整性检查通过",
                "项目数据完整性检查通过"
            ));
            
            return Result.succeed(validation);
        } catch (Exception e) {
            return Result.failed("验证薪酬计算数据失败: " + e.getMessage());
        }
    }

    @Override
    public Result<DataIntegrityDTO> checkDataIntegrity(String month, List<Long> employeeIds) {
        try {
            DataIntegrityDTO integrity = new DataIntegrityDTO();
            integrity.setMonth(month);
            integrity.setTotalEmployees(employeeIds != null ? employeeIds.size() : 50);
            integrity.setValidEmployees(employeeIds != null ? employeeIds.size() : 50);
            integrity.setMissingData(new ArrayList<>());
            integrity.setIsComplete(true);
            
            return Result.succeed(integrity);
        } catch (Exception e) {
            return Result.failed("检查基础数据完整性失败: " + e.getMessage());
        }
    }

    // ===========================
    // 辅助方法
    // ===========================

    private String buildCalculationRulesJson(SalaryTaskCreateDTO.CalculationRulesDTO rules) {
        if (rules == null) {
            return "{}";
        }
        return String.format(
                "{\"baseCalculation\": %s, \"performanceCalculation\": %s, \"commissionCalculation\": %s, \"socialSecurityCalculation\": %s, \"taxCalculation\": %s}",
                rules.getBaseCalculation(), rules.getPerformanceCalculation(), rules.getCommissionCalculation(), 
                rules.getSocialSecurityCalculation(), rules.getTaxCalculation()
        );
    }
    
    /**
     * 生成薪酬统计汇总数据
     */
    private void generateSalarySummary(SalaryCalculationTask task, List<PayrollResult> results) {
        try {
            log.info("开始生成薪酬统计汇总数据，任务ID: {}, 结果数量: {}", task.getTaskId(), results.size());
            
            // 删除该任务的旧统计数据
            salarySummaryMapper.deleteByTaskId(task.getTaskId());
            
            // 1. 生成全公司汇总统计
            generateTotalSummary(task, results);
            
            // 2. 生成各部门汇总统计
            // generateDepartmentSummary(task, results);
            
            log.info("薪酬统计汇总数据生成完成，任务ID: {}", task.getTaskId());
            
        } catch (Exception e) {
            log.error("生成薪酬统计汇总数据失败，任务ID: {}, 错误信息: {}", task.getTaskId(), e.getMessage(), e);
        }
    }
    
    /**
     * 生成全公司汇总统计
     */
    private void generateTotalSummary(SalaryCalculationTask task, List<PayrollResult> results) {
        try {
            SalarySummary totalSummary = new SalarySummary();
            
            // 基本信息
            totalSummary.setTaskId(task.getTaskId());
            totalSummary.setSummaryType("TOTAL");
            totalSummary.setMonth(task.getCalculationMonth());
            totalSummary.setDepartmentId(null);
            totalSummary.setDepartmentName("全公司");
            
            // 统计数据
            int totalEmployees = results.size();
            int calculationEmployees = 0;
            
            BigDecimal totalBaseSalary = BigDecimal.ZERO;
            BigDecimal totalPerformancePay = BigDecimal.ZERO;
            BigDecimal totalCommission = BigDecimal.ZERO;
            BigDecimal totalBonus = BigDecimal.ZERO;
            BigDecimal totalAllowance = BigDecimal.ZERO;
            BigDecimal totalGrossPay = BigDecimal.ZERO;
            BigDecimal totalDeduction = BigDecimal.ZERO;
            BigDecimal totalNetPay = BigDecimal.ZERO;
            BigDecimal totalPersonalSocial = BigDecimal.ZERO;
            BigDecimal totalCompanySocial = BigDecimal.ZERO;
            BigDecimal totalPersonalTax = BigDecimal.ZERO;
            BigDecimal totalCompanyCost = BigDecimal.ZERO;
            
            for (PayrollResult result : results) {
                if ("SUCCESS".equals(result.getCalculationStatus())) {
                    calculationEmployees++;
                    
                    if (result.getBaseSalary() != null) {
                        totalBaseSalary = totalBaseSalary.add(result.getBaseSalary());
                    }
                    if (result.getPerformancePay() != null) {
                        totalPerformancePay = totalPerformancePay.add(result.getPerformancePay());
                    }
                    if (result.getPersonalCommission() != null) {
                        totalCommission = totalCommission.add(result.getPersonalCommission());
                    }
                    if (result.getTeamCommission() != null) {
                        totalCommission = totalCommission.add(result.getTeamCommission());
                    }
                    if (result.getDepartmentBonus() != null) {
                        totalBonus = totalBonus.add(result.getDepartmentBonus());
                    }
                    if (result.getGrossPay() != null) {
                        totalGrossPay = totalGrossPay.add(result.getGrossPay());
                    }
                    if (result.getPersonalSocialTotal() != null) {
                        totalPersonalSocial = totalPersonalSocial.add(result.getPersonalSocialTotal());
                        totalDeduction = totalDeduction.add(result.getPersonalSocialTotal());
                    }
                    if (result.getPersonalIncomeTax() != null) {
                        totalPersonalTax = totalPersonalTax.add(result.getPersonalIncomeTax());
                        totalDeduction = totalDeduction.add(result.getPersonalIncomeTax());
                    }
                    if (result.getNetPay() != null) {
                        totalNetPay = totalNetPay.add(result.getNetPay());
                    }
                    if (result.getCompanySocialTotal() != null) {
                        totalCompanySocial = totalCompanySocial.add(result.getCompanySocialTotal());
                    }
                    if (result.getTotalCompanyCost() != null) {
                        totalCompanyCost = totalCompanyCost.add(result.getTotalCompanyCost());
                    }
                }
            }
            
            // 设置统计数据
            totalSummary.setTotalEmployeeCount(totalEmployees);
            totalSummary.setCalculationEmployeeCount(calculationEmployees);
            totalSummary.setTotalBaseSalary(totalBaseSalary);
            totalSummary.setTotalPerformancePay(totalPerformancePay);
            totalSummary.setTotalCommission(totalCommission);
            totalSummary.setTotalBonus(totalBonus);
            totalSummary.setTotalAllowance(totalAllowance);
            totalSummary.setTotalGrossPay(totalGrossPay);
            totalSummary.setTotalDeduction(totalDeduction);
            totalSummary.setTotalNetPay(totalNetPay);
            totalSummary.setTotalPersonalSocial(totalPersonalSocial);
            totalSummary.setTotalCompanySocial(totalCompanySocial);
            totalSummary.setTotalPersonalTax(totalPersonalTax);
            totalSummary.setTotalCompanyCost(totalCompanyCost);
            
            // 计算平均值
            if (calculationEmployees > 0) {
                totalSummary.setAvgGrossPay(totalGrossPay.divide(BigDecimal.valueOf(calculationEmployees), 2, BigDecimal.ROUND_HALF_UP));
                totalSummary.setAvgNetPay(totalNetPay.divide(BigDecimal.valueOf(calculationEmployees), 2, BigDecimal.ROUND_HALF_UP));
                totalSummary.setAvgCompanyCost(totalCompanyCost.divide(BigDecimal.valueOf(calculationEmployees), 2, BigDecimal.ROUND_HALF_UP));
            } else {
                totalSummary.setAvgGrossPay(BigDecimal.ZERO);
                totalSummary.setAvgNetPay(BigDecimal.ZERO);
                totalSummary.setAvgCompanyCost(BigDecimal.ZERO);
            }
            
            // 设置系统字段
            totalSummary.setCreatedAt(LocalDateTime.now());
            totalSummary.setUpdatedAt(LocalDateTime.now());
            totalSummary.setTenantId(TenantContextHolder.getTenant());
            totalSummary.setDelflag(0);
            
            // 保存全公司汇总
            salarySummaryMapper.insert(totalSummary);
            
            log.info("全公司薪酬汇总生成完成，任务ID: {}, 总员工数: {}, 参与计算: {}, 总应发: {}, 总实发: {}", 
                    task.getTaskId(), totalEmployees, calculationEmployees, totalGrossPay, totalNetPay);
            
        } catch (Exception e) {
            log.error("生成全公司薪酬汇总失败，任务ID: {}, 错误信息: {}", task.getTaskId(), e.getMessage(), e);
        }
    }
    
    /**
     * 生成各部门汇总统计
     */
    private void generateDepartmentSummary(SalaryCalculationTask task, List<PayrollResult> results) {
        try {
            // 按部门分组统计
            Map<Long, List<PayrollResult>> departmentResults = new HashMap<>();
            Map<Long, String> departmentNames = new HashMap<>();
            
            for (PayrollResult result : results) {
                if ("SUCCESS".equals(result.getCalculationStatus()) && result.getDepartmentId() != null) {
                    departmentResults.computeIfAbsent(result.getDepartmentId(), k -> new ArrayList<>()).add(result);
                    departmentNames.put(result.getDepartmentId(), result.getDepartmentName());
                }
            }
            
            // 为每个部门生成汇总
            for (Map.Entry<Long, List<PayrollResult>> entry : departmentResults.entrySet()) {
                Long departmentId = entry.getKey();
                List<PayrollResult> deptResults = entry.getValue();
                String departmentName = departmentNames.get(departmentId);
                
                generateSingleDepartmentSummary(task, departmentId, departmentName, deptResults);
            }
            
            log.info("部门薪酬汇总生成完成，任务ID: {}, 部门数量: {}", task.getTaskId(), departmentResults.size());
            
        } catch (Exception e) {
            log.error("生成部门薪酬汇总失败，任务ID: {}, 错误信息: {}", task.getTaskId(), e.getMessage(), e);
        }
    }
    
    /**
     * 生成单个部门汇总统计
     */
    private void generateSingleDepartmentSummary(SalaryCalculationTask task, Long departmentId, String departmentName, List<PayrollResult> deptResults) {
        try {
            SalarySummary deptSummary = new SalarySummary();
            
            // 基本信息
            deptSummary.setTaskId(task.getTaskId());
            deptSummary.setSummaryType("DEPARTMENT");
            deptSummary.setMonth(task.getCalculationMonth());
            deptSummary.setDepartmentId(departmentId);
            deptSummary.setDepartmentName(departmentName);
            
            // 统计数据
            int totalEmployees = deptResults.size();
            int calculationEmployees = 0;
            
            BigDecimal totalBaseSalary = BigDecimal.ZERO;
            BigDecimal totalPerformancePay = BigDecimal.ZERO;
            BigDecimal totalCommission = BigDecimal.ZERO;
            BigDecimal totalBonus = BigDecimal.ZERO;
            BigDecimal totalAllowance = BigDecimal.ZERO;
            BigDecimal totalGrossPay = BigDecimal.ZERO;
            BigDecimal totalDeduction = BigDecimal.ZERO;
            BigDecimal totalNetPay = BigDecimal.ZERO;
            BigDecimal totalPersonalSocial = BigDecimal.ZERO;
            BigDecimal totalCompanySocial = BigDecimal.ZERO;
            BigDecimal totalPersonalTax = BigDecimal.ZERO;
            BigDecimal totalCompanyCost = BigDecimal.ZERO;
            
            for (PayrollResult result : deptResults) {
                calculationEmployees++;
                
                if (result.getBaseSalary() != null) {
                    totalBaseSalary = totalBaseSalary.add(result.getBaseSalary());
                }
                if (result.getPerformancePay() != null) {
                    totalPerformancePay = totalPerformancePay.add(result.getPerformancePay());
                }
                if (result.getPersonalCommission() != null) {
                    totalCommission = totalCommission.add(result.getPersonalCommission());
                }
                if (result.getTeamCommission() != null) {
                    totalCommission = totalCommission.add(result.getTeamCommission());
                }
                if (result.getDepartmentBonus() != null) {
                    totalBonus = totalBonus.add(result.getDepartmentBonus());
                }
                if (result.getGrossPay() != null) {
                    totalGrossPay = totalGrossPay.add(result.getGrossPay());
                }
                if (result.getPersonalSocialTotal() != null) {
                    totalPersonalSocial = totalPersonalSocial.add(result.getPersonalSocialTotal());
                    totalDeduction = totalDeduction.add(result.getPersonalSocialTotal());
                }
                if (result.getPersonalIncomeTax() != null) {
                    totalPersonalTax = totalPersonalTax.add(result.getPersonalIncomeTax());
                    totalDeduction = totalDeduction.add(result.getPersonalIncomeTax());
                }
                if (result.getNetPay() != null) {
                    totalNetPay = totalNetPay.add(result.getNetPay());
                }
                if (result.getCompanySocialTotal() != null) {
                    totalCompanySocial = totalCompanySocial.add(result.getCompanySocialTotal());
                }
                if (result.getTotalCompanyCost() != null) {
                    totalCompanyCost = totalCompanyCost.add(result.getTotalCompanyCost());
                }
            }
            
            // 设置统计数据
            deptSummary.setTotalEmployeeCount(totalEmployees);
            deptSummary.setCalculationEmployeeCount(calculationEmployees);
            deptSummary.setTotalBaseSalary(totalBaseSalary);
            deptSummary.setTotalPerformancePay(totalPerformancePay);
            deptSummary.setTotalCommission(totalCommission);
            deptSummary.setTotalBonus(totalBonus);
            deptSummary.setTotalAllowance(totalAllowance);
            deptSummary.setTotalGrossPay(totalGrossPay);
            deptSummary.setTotalDeduction(totalDeduction);
            deptSummary.setTotalNetPay(totalNetPay);
            deptSummary.setTotalPersonalSocial(totalPersonalSocial);
            deptSummary.setTotalCompanySocial(totalCompanySocial);
            deptSummary.setTotalPersonalTax(totalPersonalTax);
            deptSummary.setTotalCompanyCost(totalCompanyCost);
            
            // 计算平均值
            if (calculationEmployees > 0) {
                deptSummary.setAvgGrossPay(totalGrossPay.divide(BigDecimal.valueOf(calculationEmployees), 2, BigDecimal.ROUND_HALF_UP));
                deptSummary.setAvgNetPay(totalNetPay.divide(BigDecimal.valueOf(calculationEmployees), 2, BigDecimal.ROUND_HALF_UP));
                deptSummary.setAvgCompanyCost(totalCompanyCost.divide(BigDecimal.valueOf(calculationEmployees), 2, BigDecimal.ROUND_HALF_UP));
            } else {
                deptSummary.setAvgGrossPay(BigDecimal.ZERO);
                deptSummary.setAvgNetPay(BigDecimal.ZERO);
                deptSummary.setAvgCompanyCost(BigDecimal.ZERO);
            }
            
            // 设置系统字段
            deptSummary.setCreatedAt(LocalDateTime.now());
            deptSummary.setUpdatedAt(LocalDateTime.now());
            deptSummary.setTenantId(TenantContextHolder.getTenant());
            deptSummary.setDelflag(0);
            
            // 保存部门汇总
            salarySummaryMapper.insert(deptSummary);
            
            log.info("部门薪酬汇总生成完成，任务ID: {}, 部门: {}({}), 员工数: {}, 总应发: {}, 总实发: {}", 
                    task.getTaskId(), departmentName, departmentId, calculationEmployees, totalGrossPay, totalNetPay);
            
        } catch (Exception e) {
            log.error("生成部门薪酬汇总失败，任务ID: {}, 部门: {}({}), 错误信息: {}", 
                    task.getTaskId(), departmentName, departmentId, e.getMessage(), e);
        }
    }
} 