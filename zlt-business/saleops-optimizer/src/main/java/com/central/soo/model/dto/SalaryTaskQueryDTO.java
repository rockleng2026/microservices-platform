package com.central.soo.model.dto;

import lombok.Data;

/**
 * 薪酬计算任务查询DTO
 */
@Data
public class SalaryTaskQueryDTO {
    
    /**
     * 页码
     */
    private Integer page = 1;
    
    /**
     * 页大小
     */
    private Integer size = 10;
    
    /**
     * 任务名称
     */
    private String taskName;
    
    /**
     * 计算月份
     */
    private String calculationMonth;
    
    /**
     * 任务状态
     */
    private String taskStatus;
    
    /**
     * 计算类型
     */
    private String calculationType;
    
    /**
     * 创建人
     */
    private Long createdBy;
    
    /**
     * 是否最终版本
     */
    private Boolean isFinal;
    
    /**
     * 开始时间
     */
    private String startTime;
    
    /**
     * 结束时间
     */
    private String endTime;
} 