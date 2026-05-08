package com.central.mall.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsDTO {
    private Integer todayOrderCount;
    private BigDecimal todaySalesAmount;
    private Integer waitDeliveryCount;
    private Integer todayNewUsers;
    private Integer yesterdayOrderCount;
    private BigDecimal yesterdaySalesAmount;  // for comparison
    private Long totalPv;
    private BigDecimal avgOrderAmount;
}
