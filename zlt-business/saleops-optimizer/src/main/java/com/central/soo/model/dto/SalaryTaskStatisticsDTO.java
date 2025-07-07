package com.central.soo.model.dto;

import lombok.Data;
import java.math.BigDecimal;

/**
 * 薪酬计算任务统计DTO
 */
@Data
public class SalaryTaskStatisticsDTO {
    
    /**
     * 总任务数
     */
    private Integer totalTasks;
    
    /**
     * 运行中任务数
     */
    private Integer runningTasks;
    
    /**
     * 已完成任务数
     */
    private Integer completedTasks;
    
    /**
     * 失败任务数
     */
    private Integer failedTasks;
    
    /**
     * 本月任务数
     */
    private Integer thisMonthTasks;
    
    /**
     * 上月任务数
     */
    private Integer lastMonthTasks;
    
    /**
     * 平均执行时间
     */
    private String avgExecutionTime;
    
    /**
     * 成功率
     */
    private BigDecimal successRate;
} 