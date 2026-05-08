package com.central.mall.model.dto;

import lombok.Data;

@Data
public class ShipOrderDTO {
    private String expressCode;    // 物流编码
    private String expressName;    // 物流名称
    private String waybillNo;      // 运单号
}