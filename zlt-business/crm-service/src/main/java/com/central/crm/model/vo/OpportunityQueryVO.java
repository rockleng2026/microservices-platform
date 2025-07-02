package com.central.crm.model.vo;

import lombok.Data;

@Data
public class OpportunityQueryVO {
    private Integer page = 1;
    private Integer size = 20;
    private String opportunityName;
    private Long customerId;
    private String stage;
    private String opportunitySource;
    private Long ownerEmployeeId;
    private String startDate;
    private String endDate;
    private String granularity; // 用于趋势统计
    private Integer days; // 用于即将到期商机
    private String newOpportunityName; // 用于克隆商机
    private String actualAmount; // 用于成交商机
    private String winReason; // 用于成交原因
    private String loseReason; // 用于失败原因
    private String notes; // 用于备注
    private String newStage; // 用于推进阶段
    private Integer newProbability; // 用于新概率
} 