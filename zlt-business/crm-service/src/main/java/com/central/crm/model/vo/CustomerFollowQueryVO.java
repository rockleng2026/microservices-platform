package com.central.crm.model.vo;

import lombok.Data;

@Data
public class CustomerFollowQueryVO {
    private Integer page = 1;
    private Integer size = 20;
    private Long customerId;
    private Long employeeId;
    private String followType;
    private String stage;
    private String startDate;
    private String endDate;
    private Integer limit; // 用于最近跟进等接口
    private Integer days;  // 用于待跟进客户接口
} 