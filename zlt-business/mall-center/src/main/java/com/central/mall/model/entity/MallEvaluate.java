package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("mall_evaluate")
public class MallEvaluate {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;
    private Long orderId;
    private Long orderItemId;  // UNIQUE constraint - one evaluation per order item
    private Long goodsId;
    private Long userId;
    private Integer star;       // 1-5 rating
    private String content;    // Max 500 characters
    private String images;     // JSON array of image URLs
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}