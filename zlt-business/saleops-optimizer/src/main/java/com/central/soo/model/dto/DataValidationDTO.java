package com.central.soo.model.dto;

import lombok.Data;
import java.util.List;

/**
 * 数据验证DTO
 */
@Data
public class DataValidationDTO {
    
    /**
     * 任务ID
     */
    private String taskId;
    
    /**
     * 是否验证通过
     */
    private Boolean isValid;
    
    /**
     * 总检查项数
     */
    private Integer totalChecks;
    
    /**
     * 通过检查项数
     */
    private Integer passedChecks;
    
    /**
     * 失败检查项数
     */
    private Integer failedChecks;
    
    /**
     * 验证结果列表
     */
    private List<String> validationResults;
} 