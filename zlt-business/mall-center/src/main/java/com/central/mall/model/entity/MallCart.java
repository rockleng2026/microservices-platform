package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("mall_cart")
public class MallCart {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;
    private Long userId;
    private Long skuId;
    private Long goodsId;
    private Integer quantity;
    private Integer checked;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}