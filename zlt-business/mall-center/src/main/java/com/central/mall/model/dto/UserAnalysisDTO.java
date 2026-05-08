package com.central.mall.model.dto;

import lombok.Data;
import java.math.BigDecimal;

/**
 * 用户分析DTO
 * 用于展示新增用户数和活跃用户数统计
 */
@Data
public class UserAnalysisDTO {
    /**
     * 今日新增用户数
     */
    private Integer todayNewUsers;

    /**
     * 本周新增用户数
     */
    private Integer weekNewUsers;

    /**
     * 本月新增用户数
     */
    private Integer monthNewUsers;

    /**
     * 活跃用户数（当月有订单的用户）
     */
    private Integer activeUsers;

    /**
     * 平均订单金额
     */
    private BigDecimal avgOrderAmount;
}
