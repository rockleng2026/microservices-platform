package com.central.mall.model.dto;

import lombok.Data;

@Data
public class StockCorrectDTO {
    private Integer change;  // positive=increase, negative=decrease
    private String operator;  // admin name
    private String remark;  // reason for correction
}