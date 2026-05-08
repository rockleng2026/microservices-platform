package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * 用户积分账户
 */
@Data
@TableName("mall_points_account")
public class MallPointsAccount {
    private Long id;
    private String tenantId;
    private Long userId;
    private Integer balance;       // 当前余额
    private Integer totalEarned;  // 累计获得
    private Integer totalSpent;   // 累计消耗
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
