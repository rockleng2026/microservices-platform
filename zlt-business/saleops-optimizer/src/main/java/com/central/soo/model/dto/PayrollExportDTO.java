package com.central.soo.model.dto;

import lombok.Data;
import java.util.List;

/**
 * 工资导出DTO
 */
@Data
public class PayrollExportDTO {
    
    /**
     * 任务ID
     */
    private String taskId;
    
    /**
     * 任务名称
     */
    private String taskName;
    
    /**
     * 月份
     */
    private String month;
    
    /**
     * 开始月份
     */
    private String startMonth;
    
    /**
     * 结束月份
     */
    private String endMonth;
    
    /**
     * 员工姓名（模糊搜索）
     */
    private String employeeName;
    
    /**
     * 导出格式：EXCEL, PDF
     */
    private String exportType;
    
    /**
     * 导出字段列表
     */
    private List<String> exportFields;
    
    /**
     * 过滤部门ID
     */
    private List<Long> departmentIds;
    
    /**
     * 过滤员工ID
     */
    private List<Long> employeeIds;
    
    /**
     * 是否只导出最终版本
     */
    private Boolean isFinal;
    
    /**
     * 是否包含详细信息
     */
    private Boolean includeDetails;
} 