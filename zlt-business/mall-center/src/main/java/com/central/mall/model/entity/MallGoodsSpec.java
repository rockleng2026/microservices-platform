package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("mall_goods_spec")
public class MallGoodsSpec {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;
    private Long goodsId;
    private String specName;
    private String specValues;  // JSON数组
    private LocalDateTime createTime;
}