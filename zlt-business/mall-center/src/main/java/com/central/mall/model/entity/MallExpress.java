package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("mall_express")
public class MallExpress extends Model<MallExpress> {
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
