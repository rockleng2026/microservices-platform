package com.central.soo.model.dto;

import lombok.Data;
import java.math.BigDecimal;

/**
 * 任务进度DTO
 */
@Data
public class TaskProgressDTO {
    private String taskId;
    private String taskStatus;
    private BigDecimal progressPercent;
    private Integer totalEmployeeCount;
    private Integer processedEmployeeCount;
    private Integer successEmployeeCount;
    private Integer failedEmployeeCount;
    private String currentStep;
    private String errorMessage;
} 