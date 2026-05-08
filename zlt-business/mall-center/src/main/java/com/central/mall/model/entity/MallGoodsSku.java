package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("mall_goods_sku")
public class MallGoodsSku {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;
    private Long goodsId;
    private String skuCode;
    private String specs;  // JSON对象
    private BigDecimal price;
    private Integer stock;  // -1表示无限制
    private String image;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}