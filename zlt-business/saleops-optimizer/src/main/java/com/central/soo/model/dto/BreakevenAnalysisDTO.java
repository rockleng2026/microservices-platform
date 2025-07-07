package com.central.soo.model.dto;

import lombok.Data;

/**
 * 盈亏平衡分析DTO
 */
@Data
public class BreakevenAnalysisDTO {
    
    /**
     * 任务ID
     */
    private String taskId;
    
    /**
     * 分析名称
     */
    private String analysisName;
    
    /**
     * 分析类型
     */
    private String analysisType;
    
    /**
     * 分析周期
     */
    private String period;
} 