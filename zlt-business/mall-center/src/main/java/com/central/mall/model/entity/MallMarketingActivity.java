package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 促销活动
 */
@Data
@TableName("mall_marketing_activity")
public class MallMarketingActivity {
    private Long id;
    private String tenantId;
    private String name;
    private Integer type;          // 1=满减,2=折扣,3=买赠
    private String ruleJson;       // 规则JSON: {"minAmount":100,"discountAmount":10}
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer status;        // 1=待发布,2=进行中,3=已结束
    private Integer priority;     // 优先级
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
