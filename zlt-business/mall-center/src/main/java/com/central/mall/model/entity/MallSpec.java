package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("mall_spec")
public class MallSpec {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;
    private String specName;
    private LocalDateTime createTime;
}
