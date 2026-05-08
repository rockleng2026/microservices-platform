package com.central.mall.model.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class EvaluateListDTO {
    private Long id;
    private Long orderId;
    private Long orderItemId;
    private Long goodsId;
    private Long userId;
    private Integer star;
    private String content;
    private List<String> images;
    private String goodsName;
    private String userNickname; // "匿名用户" if not available
    private LocalDateTime createTime;
}