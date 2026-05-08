package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.activerecord.Model;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("mall_settings")
public class MallSettings extends Model<MallSettings> {
    private Long id;
    private String tenantId;
    private String settingKey;       // 配置键
    private String settingValue;    // 配置值(AES加密存储)
    private String valueType;       // string/int/json
    private String description;     // 配置描述
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
