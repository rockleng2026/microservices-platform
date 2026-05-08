package com.central.mall.model.dto;

import lombok.Data;
import java.math.BigDecimal;

/**
 * 销售趋势DTO
 * 用于展示日/周/月维度的销售统计数据
 */
@Data
public class SalesTrendDTO {
    /**
     * 日期（格式：yyyy-MM-dd）
     */
    private String date;

    /**
     * 订单数
     */
    private Integer orderCount;

    /**
     * 销售额
     */
    private BigDecimal salesAmount;

    /**
     * 购买用户数
     */
    private Integer userCount;
}
