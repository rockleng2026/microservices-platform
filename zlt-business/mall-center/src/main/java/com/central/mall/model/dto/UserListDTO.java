package com.central.mall.model.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class UserListDTO {
    private Long userId;
    private String openId;           // WeChat openid
    private String nickname;
    private String phone;
    private LocalDateTime registerTime;
    private Integer orderCount;
    private BigDecimal totalConsumption;
}