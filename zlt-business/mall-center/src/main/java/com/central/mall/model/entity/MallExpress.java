package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("mall_express")
public class MallExpress {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;
    private String name;             // 物流公司名称
    private String code;             // 物流编码
    private String logo;             // Logo URL
    private Integer sort;
    private Integer status;          // 0禁用, 1启用
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
