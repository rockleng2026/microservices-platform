package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("mall_resource_delivery")
public class MallResourceDelivery {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;
    private Long orderId;            // 订单ID
    private Long orderItemId;        // 订单项ID
    private Long goodsId;           // 商品ID
    private Long skuId;             // SKU ID
    private Long userId;            // 用户ID
    private String resourceUrl;     // 资源下载链接
    private Long fileId;            // 文件ID
    private String token;            // 下载Token(UUID)
    private LocalDateTime deliverTime;  // 交付时间
    private LocalDateTime expireTime;   // 过期时间
    private Integer downloadCount;  // 下载次数
    private LocalDateTime createTime;
}
