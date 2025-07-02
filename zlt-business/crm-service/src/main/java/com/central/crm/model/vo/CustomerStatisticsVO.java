package com.central.crm.model.vo;

import lombok.Data;

@Data
public class CustomerStatisticsVO {
    private String startDate;
    private String endDate;
    private Long ownerEmployeeId;
    private String type; // 用于分布统计
    private String minRevenue; // 用于高价值客户
    private Integer limit; // 用于高价值客户
    private Integer daysSinceLastFollow; // 用于流失风险客户
}
 