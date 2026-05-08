package com.central.mall.model.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AdminAdjustOrderDTO {
    private Long orderId;
    private BigDecimal adjustAmount;  // 负数=减少金额，正数不允许
    private String reason;            // 调整原因
}