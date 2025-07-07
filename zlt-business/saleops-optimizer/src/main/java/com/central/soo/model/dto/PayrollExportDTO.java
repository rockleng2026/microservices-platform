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
     * 导出格式：EXCEL, PDF
     */
    private String exportFormat;
    
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
    private Boolean onlyFinal;
} 