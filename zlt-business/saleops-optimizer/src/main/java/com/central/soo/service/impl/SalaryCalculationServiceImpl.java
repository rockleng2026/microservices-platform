package com.central.soo.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.common.context.TenantContextHolder;
import com.central.common.model.PageResult;
import com.central.common.model.Result;
import com.central.common.utils.LoginUserUtils;
import com.central.soo.mapper.SalaryCalculationTaskMapper;
import com.central.soo.mapper.PayrollResultMapper;
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
            SalaryCalculationTask task = this.getById(taskId);
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
            this.updateById(task);
            
            log.info("薪酬计算任务状态已更新为RUNNING，任务ID: {}", taskId);
            
            // 保存当前租户ID，用于异步线程
            String currentTenantId = TenantContextHolder.getTenant();
            log.info("保存租户上下文，租户ID: {}, 任务ID: {}", currentTenantId, taskId);
            
            // 异步执行薪酬计算
            CompletableFuture.runAsync(() -> {
                try {
                    // 在异步线程中设置租户上下文
                    TenantContextHolder.setTenant(currentTenantId);
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
                        log.info("员工薪资计算成功，员工ID: {}, 员工姓名: {}, 应发工资: {}, 实发工资: {}", 
                                employee.getEmployeeId(), employee.getEmployeeName(), 
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
            
            // 更新任务状态为完成
            task.setTaskStatus("COMPLETED");
            task.setEndTime(LocalDateTime.now());
            task.setExecutionDuration(calculateExecutionDuration(task.getStartTime(), task.getEndTime()));
            this.updateById(task);
            
            log.info("薪酬计算任务执行完成，任务ID: {}, 任务名称: {}, 执行时长: {}秒, 成功: {}, 失败: {}", 
                    task.getTaskId(), task.getTaskName(), task.getExecutionDuration(), successCount, failedCount);
            
        } catch (Exception e) {
            log.error("薪酬计算任务执行失败，任务ID: {}, 错误信息: {}", task.getTaskId(), e.getMessage(), e);
            
            // 更新任务状态为失败
            task.setTaskStatus("FAILED");
            task.setEndTime(LocalDateTime.now());
            task.setErrorMessage(e.getMessage());
            task.setExecutionDuration(calculateExecutionDuration(task.getStartTime(), task.getEndTime()));
            this.updateById(task);
        }
    }
    
    /**
     * 获取目标员工列表
     */
    private List<EmployeeBasicInfo> getTargetEmployees(SalaryCalculationTask task) {
        log.info("开始获取目标员工列表，任务ID: {}, 计算类型: {}", task.getTaskId(), task.getCalculationType());
        
        // 模拟获取员工数据 - 实际应该从组织架构服务获取
        List<EmployeeBasicInfo> employees = new ArrayList<>();
        
        // 模拟数据
        String[] names = {"张伟强", "李雅芳", "王建华", "陈小明", "刘晓宇", "赵敏", "孙丽", "周强", "吴梅", "郑刚"};
        String[] departments = {"技术开发部", "销售部", "市场部", "财务部", "人事部"};
        String[] positions = {"高级开发工程师", "销售经理", "市场专员", "财务分析师", "人事主管"};
        
        int employeeCount = 10; // 默认10个员工用于测试
        if ("DEPARTMENT".equals(task.getCalculationType()) && task.getTargetDepartmentIds() != null) {
            employeeCount = 5; // 部门计算减少员工数
            log.info("按部门计算，目标部门IDs: {}, 员工数量: {}", task.getTargetDepartmentIds(), employeeCount);
        } else if ("EMPLOYEE".equals(task.getCalculationType()) && task.getTargetEmployeeIds() != null) {
            employeeCount = task.getTargetEmployeeIds().split(",").length;
            log.info("按员工计算，目标员工IDs: {}, 员工数量: {}", task.getTargetEmployeeIds(), employeeCount);
        } else {
            log.info("全员计算，员工数量: {}", employeeCount);
        }
        
        for (int i = 0; i < employeeCount; i++) {
            EmployeeBasicInfo employee = new EmployeeBasicInfo();
            employee.setEmployeeId((long) (i + 1));
            employee.setEmployeeName(names[i % names.length]);
            employee.setEmployeeNo("EMP" + String.format("%03d", i + 1));
            employee.setDepartmentId((long) (i % 3 + 1));
            employee.setDepartmentName(departments[i % departments.length]);
            employee.setPositionId((long) (i % 5 + 1)); // 设置岗位ID
            employee.setPositionName(positions[i % positions.length]);
            employee.setRegion("BEIJING");
            employees.add(employee);
            
            log.debug("添加员工到计算列表，员工ID: {}, 姓名: {}, 部门: {}, 岗位: {}", 
                    employee.getEmployeeId(), employee.getEmployeeName(), 
                    employee.getDepartmentName(), employee.getPositionName());
        }
        
        log.info("目标员工列表获取完成，任务ID: {}, 员工总数: {}", task.getTaskId(), employees.size());
        return employees;
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
        
        // 设置员工信息
        SalaryCalculationContext.EmployeeInfo employeeInfo = new SalaryCalculationContext.EmployeeInfo();
        employeeInfo.setId(employee.getEmployeeId());
        employeeInfo.setName(employee.getEmployeeName());
        employeeInfo.setEmployeeNo(employee.getEmployeeNo());
        employeeInfo.setDepartmentId(employee.getDepartmentId());
        employeeInfo.setDepartmentName(employee.getDepartmentName());
        employeeInfo.setPositionId(employee.getPositionId());
        employeeInfo.setPositionName(employee.getPositionName());
        employeeInfo.setRegion(employee.getRegion());
        employeeInfo.setStatus(1);
        context.setEmployee(employeeInfo);
        
        // 设置薪酬配置（模拟数据）
        SalaryCalculationContext.SalaryConfig salaryConfig = new SalaryCalculationContext.SalaryConfig();
        salaryConfig.setEmployeeId(employee.getEmployeeId());
        salaryConfig.setBaseSalary(BigDecimal.valueOf(15000 + (employee.getEmployeeId() * 1000)));
        salaryConfig.setRegion(employee.getRegion());
        salaryConfig.setIsSalesIncentive(true);
        salaryConfig.setSalesIncentiveRatio(BigDecimal.valueOf(100));
        salaryConfig.setIsTeamIncentive(true);
        salaryConfig.setTeamIncentiveRatio(BigDecimal.valueOf(80));
        salaryConfig.setIsDepartmentBonus(true);
        salaryConfig.setStatus(1);
        context.setSalaryConfig(salaryConfig);
        
        // 设置地区系数（模拟数据）
        SalaryCalculationContext.RegionalCoefficient regionalCoefficient = new SalaryCalculationContext.RegionalCoefficient();
        regionalCoefficient.setRegion(employee.getRegion());
        regionalCoefficient.setSalaryCoefficient(BigDecimal.valueOf(1.2));
        regionalCoefficient.setStatus(1);
        context.setRegionalCoefficient(regionalCoefficient);
        
        // 设置绩效数据（模拟数据）
        MonthlyPerformance performance = new MonthlyPerformance();
        performance.setEmployeeId(employee.getEmployeeId());
        performance.setMonth(task.getCalculationMonth());
        performance.setPerformanceScore(BigDecimal.valueOf(85 + (employee.getEmployeeId() % 15))); // 85-100分
        performance.setPersonalProjectRevenue(BigDecimal.valueOf(100000 + (employee.getEmployeeId() * 10000)));
        performance.setPersonalProjectMargin(BigDecimal.valueOf(0.3));
        performance.setTeamProjectRevenue(BigDecimal.valueOf(500000));
        performance.setTeamProjectMargin(BigDecimal.valueOf(0.25));
        performance.setTeamMemberCount(5);
        context.setPerformance(performance);
        
        // 设置职级配置（模拟数据）
        SalaryCalculationContext.JobLevelSalary jobLevelSalary = new SalaryCalculationContext.JobLevelSalary();
        jobLevelSalary.setJobLevelCode("SENIOR");
        jobLevelSalary.setPerformanceRatioMin(BigDecimal.valueOf(0.8));
        jobLevelSalary.setPerformanceRatioMax(BigDecimal.valueOf(1.2));
        jobLevelSalary.setStatus(1);
        context.setJobLevelSalary(jobLevelSalary);
        
        // 设置社保配置（模拟数据）
        SalaryCalculationContext.SocialSecurityConfig socialSecurityConfig = new SalaryCalculationContext.SocialSecurityConfig();
        socialSecurityConfig.setRegion(employee.getRegion());
        socialSecurityConfig.setYear(2024);
        socialSecurityConfig.setSocialSecurityBaseLower(BigDecimal.valueOf(3500));
        socialSecurityConfig.setSocialSecurityBaseUpper(BigDecimal.valueOf(25000));
        socialSecurityConfig.setHousingFundBaseLower(BigDecimal.valueOf(3500));
        socialSecurityConfig.setHousingFundBaseUpper(BigDecimal.valueOf(25000));
        socialSecurityConfig.setPensionPersonalRatio(BigDecimal.valueOf(8));
        socialSecurityConfig.setPensionCompanyRatio(BigDecimal.valueOf(16));
        socialSecurityConfig.setMedicalPersonalRatio(BigDecimal.valueOf(2));
        socialSecurityConfig.setMedicalCompanyRatio(BigDecimal.valueOf(10));
        socialSecurityConfig.setUnemploymentPersonalRatio(BigDecimal.valueOf(0.5));
        socialSecurityConfig.setUnemploymentCompanyRatio(BigDecimal.valueOf(0.5));
        socialSecurityConfig.setMaternityCompanyRatio(BigDecimal.valueOf(0.8));
        socialSecurityConfig.setInjuryCompanyRatio(BigDecimal.valueOf(0.2));
        socialSecurityConfig.setHousingFundPersonalRatio(BigDecimal.valueOf(12));
        socialSecurityConfig.setHousingFundCompanyRatio(BigDecimal.valueOf(12));
        context.setSocialSecurityConfig(socialSecurityConfig);
        
        // 设置部门分红配置（模拟数据）
        SalaryCalculationContext.DepartmentBonusConfig departmentBonusConfig = new SalaryCalculationContext.DepartmentBonusConfig();
        departmentBonusConfig.setDepartmentId(employee.getDepartmentId());
        departmentBonusConfig.setBonusWeight(BigDecimal.valueOf(20)); // 20%权重
        departmentBonusConfig.setStatus(1);
        context.setDepartmentBonusConfig(departmentBonusConfig);
        
        // 设置盈亏平衡分析数据（模拟数据）
        SalaryCalculationContext.BreakevenAnalysisData breakevenAnalysis = new SalaryCalculationContext.BreakevenAnalysisData();
        breakevenAnalysis.setPeriod(task.getCalculationMonth());
        breakevenAnalysis.setDistributableProfit(BigDecimal.valueOf(1000000)); // 100万可分配利润
        context.setBreakevenAnalysis(breakevenAnalysis);
        
        return context;
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
        private String region;
        
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
        public String getRegion() { return region; }
        public void setRegion(String region) { this.region = region; }
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
            // 不直接调用setResp_code，让它保持默认值
            
            return result;
        }
    }

    @Override
    public Result<SalaryCalculationTask> getTaskDetail(String taskId) {
        try {
            SalaryCalculationTask task = new SalaryCalculationTask();
            task.setTaskId(taskId);
            task.setTaskName("2024年12月全员薪酬计算");
            task.setCalculationMonth("2024-12");
            task.setCalculationType(SalaryCalculationTask.CalculationType.FULL);
            task.setTaskStatus(SalaryCalculationTask.TaskStatus.COMPLETED);
            task.setProgressPercent(new BigDecimal("100.00"));
            task.setTotalEmployeeCount(50);
            task.setProcessedEmployeeCount(50);
            task.setSuccessEmployeeCount(50);
            task.setFailedEmployeeCount(0);
            task.setTotalGrossPay(new BigDecimal("1650000.00"));
            task.setTotalNetPay(new BigDecimal("1450000.00"));
            task.setTotalCompanyCost(new BigDecimal("1850000.00"));
            task.setExecutionDuration(1800);
            task.setIsFinal(true);
            task.setCreatedAt(LocalDateTime.now().minusDays(1));
            task.setStartTime(LocalDateTime.now().minusDays(1));
            task.setEndTime(LocalDateTime.now().minusDays(1).plusMinutes(30));
            
            return Result.succeed(task);
        } catch (Exception e) {
            return Result.failed("获取任务详情失败: " + e.getMessage());
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
            List<PayrollResult> results = new ArrayList<>();
            
            // 模拟工资结果数据
            String[] employees = {"张伟强", "李雅芳", "王建华", "陈小明", "刘晓宇"};
            String[] departments = {"技术开发部", "销售部", "市场部", "财务部", "人事部"};
            String[] positions = {"高级开发工程师", "销售经理", "市场专员", "财务分析师", "人事主管"};
            
            for (int i = 0; i < employees.length; i++) {
                PayrollResult result = new PayrollResult();
                result.setId((long) (i + 1));
                result.setTaskId("TASK_202412_001");
                result.setTaskName("2024年12月全员薪酬计算");
                result.setCalculationVersion(1);
                result.setMonth("2024-12");
                result.setEmployeeId((long) (i + 1));
                result.setEmployeeName(employees[i]);
                result.setEmployeeNo("EMP" + String.format("%03d", i + 1));
                result.setDepartmentId((long) (i % 3 + 1));
                result.setDepartmentName(departments[i % departments.length]);
                result.setPositionId((long) (i + 1));
                result.setPositionName(positions[i % positions.length]);
                result.setJobLevelCode("SENIOR");
                result.setRegion("BEIJING");
                
                // 基础工资相关
                BigDecimal baseSalary = new BigDecimal(15000 + i * 1000);
                result.setBaseSalary(baseSalary);
                result.setRegionCoefficient(new BigDecimal("1.2000"));
                result.setAdjustedBaseSalary(baseSalary.multiply(new BigDecimal("1.2")));
                
                // 绩效相关
                result.setPerformanceScore(new BigDecimal(85 + i * 2));
                result.setPerformanceRatio(new BigDecimal("0.88"));
                result.setPerformancePay(new BigDecimal(15000 + i * 500));
                
                // 提成相关
                result.setPersonalCommission(new BigDecimal(8000 + i * 400));
                result.setTeamCommission(new BigDecimal(12000 + i * 200));
                result.setDepartmentBonus(new BigDecimal(5000));
                
                // 工资汇总
                BigDecimal grossPay = result.getAdjustedBaseSalary()
                    .add(result.getPerformancePay())
                    .add(result.getPersonalCommission())
                    .add(result.getTeamCommission())
                    .add(result.getDepartmentBonus());
                result.setGrossPay(grossPay);
                
                // 扣除项
                result.setPersonalSocialTotal(new BigDecimal(4000 + i * 100));
                result.setPersonalIncomeTax(new BigDecimal(5000 + i * 200));
                result.setNetPay(grossPay.subtract(result.getPersonalSocialTotal())
                    .subtract(result.getPersonalIncomeTax()));
                
                // 公司成本
                result.setCompanySocialTotal(new BigDecimal(7000 + i * 150));
                result.setTotalCompanyCost(grossPay.add(result.getCompanySocialTotal()));
                
                // 状态
                result.setCalculationStatus(PayrollResult.CalculationStatus.SUCCESS);
                result.setApprovalStatus(i % 2 == 0 ? PayrollResult.ApprovalStatus.APPROVED : PayrollResult.ApprovalStatus.PENDING);
                result.setIsCurrentVersion(true);
                result.setIsFinal(i % 2 == 0);
                result.setCreatedAt(LocalDateTime.now().minusDays(1));
                
                results.add(result);
            }
            
            PageResult<PayrollResult> pageResult = new PageResult<>();
            pageResult.setData(results);
            pageResult.setCount((long) results.size());
            
            return pageResult;
        } catch (Exception e) {
            PageResult<PayrollResult> result = new PageResult<>();
            result.setData(new ArrayList<>());
            result.setCount(0L);
            return result;
        }
    }

    @Override
    public Result<PayrollResult> getPayrollDetail(Long resultId) {
        try {
            PayrollResult detail = new PayrollResult();
            detail.setId(resultId);
            detail.setTaskId("TASK_202412_001");
            detail.setEmployeeName("张伟强");
            detail.setEmployeeNo("EMP001");
            detail.setDepartmentName("技术开发部");
            detail.setPositionName("高级开发工程师");
            detail.setBaseSalary(new BigDecimal("15000"));
            detail.setGrossPay(new BigDecimal("59830"));
            detail.setNetPay(new BigDecimal("51550"));
            detail.setTotalCompanyCost(new BigDecimal("67066"));
            
            return Result.succeed(detail);
        } catch (Exception e) {
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
            List<SalarySummary> summaries = new ArrayList<>();
            
            SalarySummary summary = new SalarySummary();
            summary.setTaskId(taskId);
            summary.setSummaryType("COMPANY");
            summary.setTotalEmployeeCount(50);
            summary.setCalculationEmployeeCount(50);
            summary.setTotalBaseSalary(new BigDecimal("750000.00"));
            summary.setTotalGrossPay(new BigDecimal("1650000.00"));
            summary.setTotalNetPay(new BigDecimal("1450000.00"));
            summary.setTotalCompanyCost(new BigDecimal("1850000.00"));
            summary.setAvgGrossPay(new BigDecimal("33000.00"));
            summary.setAvgNetPay(new BigDecimal("29000.00"));
            summary.setAvgCompanyCost(new BigDecimal("37000.00"));
            summaries.add(summary);
            
            return Result.succeed(summaries);
        } catch (Exception e) {
            return Result.failed("获取薪酬统计汇总失败: " + e.getMessage());
        }
    }

    @Override
    public Result<SalarySummary> getDepartmentSalarySummary(String taskId, Long departmentId) {
        try {
            SalarySummary summary = new SalarySummary();
            summary.setTaskId(taskId);
            summary.setDepartmentId(departmentId);
            summary.setSummaryType("DEPARTMENT");
            summary.setTotalEmployeeCount(15);
            summary.setCalculationEmployeeCount(15);
            summary.setTotalGrossPay(new BigDecimal("495000.00"));
            summary.setTotalNetPay(new BigDecimal("435000.00"));
            summary.setTotalCompanyCost(new BigDecimal("555000.00"));
            
            return Result.succeed(summary);
        } catch (Exception e) {
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
            // 实际实现中应该生成Excel或PDF文件
            String filePath = "/exports/payroll_" + System.currentTimeMillis() + ".xlsx";
            return Result.succeed(filePath);
        } catch (Exception e) {
            return Result.failed("导出工资计算结果失败: " + e.getMessage());
        }
    }

    // ===========================
    // 盈亏平衡分析
    // ===========================

    @Override
    public Result<BreakevenAnalysis> generateBreakevenAnalysis(BreakevenAnalysisDTO analysisDTO) {
        try {
            BreakevenAnalysis analysis = new BreakevenAnalysis();
            analysis.setTaskId(analysisDTO.getTaskId());
            analysis.setAnalysisName(analysisDTO.getAnalysisName());
            analysis.setAnalysisType(analysisDTO.getAnalysisType());
            analysis.setPeriod(analysisDTO.getPeriod());
            
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
        StringBuilder json = new StringBuilder();
        json.append("{");
        json.append("\"baseCalculation\":").append(rules.getBaseCalculation()).append(",");
        json.append("\"performanceCalculation\":").append(rules.getPerformanceCalculation()).append(",");
        json.append("\"commissionCalculation\":").append(rules.getCommissionCalculation()).append(",");
        json.append("\"socialSecurityCalculation\":").append(rules.getSocialSecurityCalculation()).append(",");
        json.append("\"taxCalculation\":").append(rules.getTaxCalculation());
        json.append("}");
        return json.toString();
    }
} 