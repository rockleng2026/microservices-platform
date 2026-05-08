package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("mall_banner")
public class MallBanner {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;
    private String title;
    private String imageUrl;
    private Integer linkType;       // 1=商品, 2=外部链接
    private Long goodsId;           // 关联商品ID
    private String externalUrl;     // 外部链接地址
    private Integer sort;
    private Integer status;         // 0禁用, 1启用
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
