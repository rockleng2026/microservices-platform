package com.central.soo.model.dto;

import lombok.Data;
import java.util.List;

/**
 * 工资审批DTO
 */
@Data
public class PayrollApprovalDTO {
    
    /**
     * 工资结果ID列表
     */
    private List<Long> resultIds;
    
    /**
     * 审批状态：APPROVED, REJECTED
     */
    private String approvalStatus;
    
    /**
     * 审批人
     */
    private Long approvalBy;
    
    /**
     * 审批意见
     */
    private String approvalComment;
} 