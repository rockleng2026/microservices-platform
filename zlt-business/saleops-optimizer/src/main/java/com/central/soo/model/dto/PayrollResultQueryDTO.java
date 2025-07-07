package com.central.soo.model.dto;

import lombok.Data;
import java.util.List;

/**
 * 工资计算结果查询DTO
 */
@Data
public class PayrollResultQueryDTO {
    
    private int page = 1;
    private int size = 10;
    private String taskId;
    private String month;
    private String startMonth;
    private String endMonth;
    private List<Long> departmentIds;
    private List<Long> employeeIds;
    private String employeeName;
    private String calculationStatus;
    private String approvalStatus;
    private Boolean isFinal;
    private Boolean isCurrentVersion;
} 