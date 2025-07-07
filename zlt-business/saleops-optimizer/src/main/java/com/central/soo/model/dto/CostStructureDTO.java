package com.central.soo.model.dto;

import lombok.Data;
import java.math.BigDecimal;

/**
 * 成本结构DTO
 */
@Data
public class CostStructureDTO {
    
    /**
     * 任务ID
     */
    private String taskId;
    
    /**
     * 总人力成本
     */
    private BigDecimal totalPersonnelCost;
    
    /**
     * 基础工资成本
     */
    private BigDecimal baseSalaryCost;
    
    /**
     * 绩效成本
     */
    private BigDecimal performanceCost;
    
    /**
     * 提成成本
     */
    private BigDecimal commissionCost;
    
    /**
     * 社保成本
     */
    private BigDecimal socialSecurityCost;
    
    /**
     * 其他成本
     */
    private BigDecimal otherCost;
} 