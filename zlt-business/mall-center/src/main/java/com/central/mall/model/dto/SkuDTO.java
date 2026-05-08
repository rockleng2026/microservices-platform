package com.central.mall.model.dto;

import lombok.Data;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class SkuDTO implements Serializable {
    private Long id;
    private String skuCode;
    private String specs;
    private BigDecimal price;
    private Integer stock;
    private String image;
    private Integer status;
}
