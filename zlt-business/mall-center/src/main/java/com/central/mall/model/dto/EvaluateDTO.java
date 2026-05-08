package com.central.mall.model.dto;

import lombok.Data;
import java.util.List;

@Data
public class EvaluateDTO {
    private Long orderId;
    private Long orderItemId;
    private Long goodsId;
    private Integer star;        // Required, 1-5
    private String content;     // Optional, max 500 chars
    private List<String> images; // Optional, max 9 URLs
}