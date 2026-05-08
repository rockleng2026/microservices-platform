package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("mall_goods")
public class MallGoods {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;
    private Long categoryId;
    private String name;
    private String subTitle;
    private String mainImage;
    private String images;
    private String detail;
    private BigDecimal price;
    private Integer sales;
    private Integer status;
    private Integer sort;
    private Integer goodsType;  // 1=实物, 2=虚拟
    private String virtualUrl;
    private Long virtualFileId;
    private LocalDateTime virtualExpire;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer delFlag;
}