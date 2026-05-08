package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 优惠券模板（管理员创建）
 */
@Data
@TableName("mall_coupon_template")
public class MallCouponTemplate {
    private Long id;
    private String tenantId;
    private String name;           // 券名称
    private Integer type;          // 1=满减券,2=折扣券,3=无门槛券
    private BigDecimal faceValue;  // 面额（满减券）
    private BigDecimal discountRate; // 折扣率（折扣券，如0.85=85折）
    private BigDecimal minAmount;  // 最低消费金额
    private BigDecimal maxDiscount; // 最高优惠金额
    private Integer totalCount;    // 总数量
    private Integer remainCount;   // 剩余数量
    private Integer perUserLimit;  // 每人限领数量
    private Integer validType;     // 1=固定日期,2=领取后N天
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer validDays;      // 领取后有效天数
    private Integer status;        // 0=未发布,1=已发布,2=已下架
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
