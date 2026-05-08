package com.central.mall.model.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class UserStatisticsVO {
    private Long userId;
    private String nickname;
    private String openId;
    private Integer orderCount;
    private Integer completedOrderCount;
    private BigDecimal totalConsumption;
    private BigDecimal averageOrderAmount;
    private LocalDateTime lastOrderTime;
    private List<String> favoriteGoods;  // Top 5 purchased goods names
}