package com.central.crm.model.vo;

import lombok.Data;

@Data
public class DashboardQueryVO {
    private String startDate;
    private String endDate;
    private Long ownerEmployeeId;
    private String granularity = "month"; // 用于趋势分析
    private Integer limit = 10; // 用于排行榜等
} 