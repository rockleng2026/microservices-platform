package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("mall_goods_spec")
public class MallGoodsSpec extends Model<MallGoodsSpec> {
    private Long id;
    private String tenantId;
    private Long goodsId;
    private String specName;
    private String specValues;  // JSON数组
    private LocalDateTime createTime;
}