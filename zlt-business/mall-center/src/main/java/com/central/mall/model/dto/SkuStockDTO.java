package com.central.mall.model.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class SkuStockDTO {
    private Long id;
    private Long skuId;
    private Long goodsId;
    private String goodsName;
    private String skuCode;
    private String specs;  // JSON object
    private BigDecimal price;
    private Integer stock;  // current stock from DB
    private Integer realStock;  // actual stock (Redis vs DB)
    private String stockStatus;  // 正常/预警/无限制
    private Integer threshold;
    private LocalDateTime lastStockChangeTime;
    private String lastStockChangeType;
}