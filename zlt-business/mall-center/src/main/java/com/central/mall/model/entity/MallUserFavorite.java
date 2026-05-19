package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 用户收藏商品
 */
@Data
@TableName("mall_user_favorite")
public class MallUserFavorite {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long userId;
    @JsonSerialize(using = ToStringSerializer.class)
    private Long goodsId;
    private String goodsName;
    private java.math.BigDecimal price;
    private String image;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}