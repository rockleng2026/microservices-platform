package com.central.soo.model.dto;

import lombok.Data;
import java.util.List;

/**
 * 薪酬分布DTO
 */
@Data
public class SalaryDistributionDTO {
    
    /**
     * 任务ID
     */
    private String taskId;
    
    /**
     * 薪酬区间列表
     */
    private List<String> salaryRanges;
    
    /**
     * 员工数量列表
     */
    private List<Integer> employeeCounts;
    
    /**
     * 占比列表
     */
    private List<Double> percentages;
} 