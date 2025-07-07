package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 薪酬计算任务实体
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("soo_salary_calculation_task")
public class SalaryCalculationTask implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @TableField("task_id")
    private String taskId;

    @TableField("task_name")
    private String taskName;

    @TableField("calculation_month")
    private String calculationMonth;

    @TableField("calculation_type")
    private String calculationType;

    @TableField("target_department_ids")
    private String targetDepartmentIds;

    @TableField("target_employee_ids")
    private String targetEmployeeIds;

    @TableField("exclude_employee_ids")
    private String excludeEmployeeIds;

    @TableField("calculation_rules")
    private String calculationRules;

    @TableField("task_status")
    private String taskStatus;

    @TableField("progress_percent")
    private BigDecimal progressPercent;

    @TableField("total_employee_count")
    private Integer totalEmployeeCount;

    @TableField("processed_employee_count")
    private Integer processedEmployeeCount;

    @TableField("success_employee_count")
    private Integer successEmployeeCount;

    @TableField("failed_employee_count")
    private Integer failedEmployeeCount;

    @TableField("total_gross_pay")
    private BigDecimal totalGrossPay;

    @TableField("total_net_pay")
    private BigDecimal totalNetPay;

    @TableField("total_company_cost")
    private BigDecimal totalCompanyCost;

    @TableField("start_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime startTime;

    @TableField("end_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime endTime;

    @TableField("execution_duration")
    private Integer executionDuration;

    @TableField("error_message")
    private String errorMessage;

    @TableField("execution_log")
    private String executionLog;

    @TableField("is_final")
    private Boolean isFinal;

    @TableField("confirmed_by")
    private Long confirmedBy;

    @TableField("confirmed_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime confirmedAt;

    @TableField("remark")
    private String remark;

    @TableField("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;

    @TableField("created_by")
    private Long createdBy;

    @TableField("updated_by")
    private Long updatedBy;

    @TableField("tenant_id")
    private String tenantId;

    @TableField("delflag")
    private Boolean delflag;

    // 任务状态枚举
    public static class TaskStatus {
        public static final String PENDING = "PENDING";
        public static final String RUNNING = "RUNNING";
        public static final String COMPLETED = "COMPLETED";
        public static final String FAILED = "FAILED";
        public static final String CANCELLED = "CANCELLED";
    }

    // 计算类型枚举
    public static class CalculationType {
        public static final String FULL = "FULL";
        public static final String DEPARTMENT = "DEPARTMENT";
        public static final String EMPLOYEE = "EMPLOYEE";
    }
} 