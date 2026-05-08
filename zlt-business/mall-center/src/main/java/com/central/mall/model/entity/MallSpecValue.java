package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("mall_spec_value")
public class MallSpecValue extends Model<MallSpecValue> {
    private Long id;
    private String tenantId;
    private Long specId;
    private String specValue;
    private LocalDateTime createTime;
}
