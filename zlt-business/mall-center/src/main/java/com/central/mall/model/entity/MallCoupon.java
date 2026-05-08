package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 用户已领取的优惠券
 */
@Data
@TableName("mall_coupon")
public class MallCoupon {
    private Long id;
    private String tenantId;
    private Long userId;
    private Long templateId;
    private String couponNo;      // 唯一标识
    private String name;
    private Integer type;
    private BigDecimal faceValue;
    private BigDecimal discountRate;
    private BigDecimal minAmount;
    private BigDecimal maxDiscount;
    private Long orderId;          // 关联使用的订单
    private Integer status;        // 1=未使用,2=已使用,3=已过期
    private LocalDateTime receiveTime;
    private LocalDateTime useTime;
    private LocalDateTime expireTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
