package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("mall_spec")
public class MallSpec extends Model<MallSpec> {
    private Long id;
    private String tenantId;
    private String specName;        // 规格名称(如:颜色,内存,硬盘)
    private LocalDateTime createTime;
}
