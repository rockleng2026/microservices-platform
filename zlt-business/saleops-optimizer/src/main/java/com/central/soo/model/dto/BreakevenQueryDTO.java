package com.central.soo.model.dto;

import lombok.Data;

/**
 * 盈亏平衡查询DTO
 */
@Data
public class BreakevenQueryDTO {
    
    private Integer page = 1;
    private Integer size = 10;
    private String taskId;
    private String analysisType;
    private String period;
} 