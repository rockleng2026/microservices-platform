package com.central.crm.model.vo;

import lombok.Data;
import java.util.List;

@Data
public class CustomerTransferQueryVO {
    private Integer page = 1;
    private Integer size = 20;
    private Long customerId;
    private Long fromEmployeeId;
    private Long toEmployeeId;
    private String approvalStatus;
    private String startDate;
    private String endDate;
    private Long approverId;
    private Long employeeId;
    private String approvalNotes;
    private String transferReason;
    private String cancelReason;
    private Long operatorId;
    private List<Long> customerIds; // 用于批量移交
} 