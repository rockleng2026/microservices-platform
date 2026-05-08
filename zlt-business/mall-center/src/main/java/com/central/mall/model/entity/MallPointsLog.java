package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 积分变动日志
 */
@Data
@TableName("mall_points_log")
public class MallPointsLog {
    private Long id;
    private String tenantId;
    private Long userId;
    private Integer type;         // 1=获得,2=消耗
    private Integer points;
    private Integer balanceAfter;  // 变动后余额
    private String source;       // ORDER,REFUND,REDEEM
    private String sourceId;     // 关联业务ID
    private String remark;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
