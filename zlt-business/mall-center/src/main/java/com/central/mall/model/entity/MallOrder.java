package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("mall_order")
public class MallOrder {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;
    private String orderNo;         // 订单号（唯一）
    private Long userId;
    private Long addressId;         // 收货地址ID（虚拟商品可为空）
    private Integer goodsType;     // 1=实物, 2=虚拟
    private BigDecimal totalAmount;
    private BigDecimal freightAmount;
    private BigDecimal payAmount;
    private Integer status;         // 1=待付款, 2=已付款, 3=已发货, 4=已完成, 5=已取消
    private LocalDateTime payTime;
    private LocalDateTime shipTime;
    private LocalDateTime completeTime;
    private String remark;
    private Integer delFlag;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}