package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("mall_order")
public class MallOrder {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String tenantId;
    private String orderNo;         // 订单号（唯一）
    private Long userId;
    private Long addressId;         // 收货地址ID（虚拟商品可为空）
    private Integer goodsType;     // 1=实物, 2=虚拟
    private BigDecimal totalAmount;
    private BigDecimal freightAmount;
    private BigDecimal payAmount;
    private Integer status;         // 1=待付款, 2=已付款, 3=已发货, 4=已完成, 5=已取消, 6=退款中, 7=已退款, 8=已关闭

    // Status constants
    public static final Integer STATUS_PENDING = 1;
    public static final Integer STATUS_PAID = 2;
    public static final Integer STATUS_SHIPPED = 3;
    public static final Integer STATUS_COMPLETED = 4;
    public static final Integer STATUS_CANCELLED = 5;
    public static final Integer STATUS_REFUNDING = 6;
    public static final Integer STATUS_REFUNDED = 7;
    public static final Integer STATUS_CLOSED = 8;

    public String getStatusName() {
        switch (status) {
            case 1: return "PENDING";
            case 2: return "PAID";
            case 3: return "SHIPPED";
            case 4: return "COMPLETED";
            case 5: return "CANCELLED";
            case 6: return "REFUNDING";
            case 7: return "REFUNDED";
            case 8: return "CLOSED";
            default: return "UNKNOWN";
        }
    }

    private Long couponId;          // 使用的优惠券ID
    private BigDecimal discountAmount; // 优惠金额
    private LocalDateTime payTime;
    private LocalDateTime shipTime;
    private LocalDateTime completeTime;
    private String remark;
    private String adminRemark;   // 管理员备注
    private String openid;      // 用户openid，用于微信模板消息
    private Integer delFlag;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}