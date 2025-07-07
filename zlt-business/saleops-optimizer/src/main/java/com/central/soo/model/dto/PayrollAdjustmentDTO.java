package com.central.soo.model.dto;

import lombok.Data;
import java.math.BigDecimal;

/**
 * 工资调整DTO
 */
@Data
public class PayrollAdjustmentDTO {
    
    /**
     * 工资结果ID
     */
    private Long resultId;
    
    /**
     * 调整类型：MANUAL, AUTO
     */
    private String adjustmentType;
    
    /**
     * 调整项目
     */
    private String adjustmentItem;
    
    /**
     * 调整金额
     */
    private BigDecimal adjustmentAmount;
    
    /**
     * 调整原因
     */
    private String adjustmentReason;
    
    /**
     * 调整人
     */
    private Long adjustedBy;
} 