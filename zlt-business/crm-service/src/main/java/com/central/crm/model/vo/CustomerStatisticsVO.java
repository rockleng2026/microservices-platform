package com.central.crm.model.vo;

import lombok.Data;

@Data
public class CustomerStatisticsVO {
    private String startDate;
    private String endDate;
    private Long ownerEmployeeId;
    private String type; // 用于分布统计
    private Double minRevenue; // 用于高价值客户查询
    private Integer limit; // 用于限制结果数量
    private Integer daysSinceLastFollow; // 用于流失风险客户查询
}
 