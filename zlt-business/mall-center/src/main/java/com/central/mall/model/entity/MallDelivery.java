package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("mall_delivery")
public class MallDelivery {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;
    private Long orderId;
    private String expressCode;    // 物流编码
    private String expressName;    // 物流名称
    private String waybillNo;       // 运单号
    private LocalDateTime shipTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}