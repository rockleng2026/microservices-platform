package com.central.mall.model.dto;

import lombok.Data;

/**
 * 库存预警DTO
 * 用于展示低于预警阈值的SKU列表
 */
@Data
public class StockWarningDTO {
    /**
     * SKU ID
     */
    private Long skuId;

    /**
     * SKU名称
     */
    private String skuName;

    /**
     * 商品ID
     */
    private Long goodsId;

    /**
     * 商品名称
     */
    private String goodsName;

    /**
     * 实际库存
     */
    private Integer realStock;

    /**
     * 预警阈值（默认10）
     */
    private Integer warningStock;

    /**
     * 今日销量
     */
    private Integer soldToday;
}
