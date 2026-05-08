package com.central.mall.model.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 退款申请记录
 */
@Data
@TableName("mall_refund")
public class MallRefund {
    private Long id;
    private String tenantId;
    private Long orderId;
    private String orderNo;
    private Long userId;
    private String refundNo;        // 唯一键，用于幂等
    private Integer refundType;      // 1=仅退款, 2=退货退款
    private BigDecimal refundAmount;
    private String reason;
    private String evidenceImages;   // JSON array of image URLs
    private Integer status;          // 1=待审核,2=审核通过,3=审核拒绝,4=退款中,5=已完成,6=已关闭
    private Long adminId;
    private String adminRemark;
    private String wechatRefundNo;
    private LocalDateTime refundTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
