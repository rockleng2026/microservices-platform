package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 退款商品明细
 */
@Data
@TableName("mall_refund_item")
public class MallRefundItem {
    private Long id;
    private Long refundId;
    private Long orderItemId;
    private Long skuId;
    private Long goodsId;
    private Integer quantity;
    private BigDecimal refundAmount;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
