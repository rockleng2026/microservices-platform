package com.central.mall.service;

import com.central.common.model.Result;

import java.math.BigDecimal;
import java.util.Map;

/**
 * 营销服务接口
 */
public interface IMarketingService {

    // ========== 优惠券管理 ==========

    /**
     * 用户领取优惠券
     */
    Result<?> claimCoupon(Long templateId, Long userId);

    /**
     * 获取用户优惠券列表
     */
    Result<?> getUserCouponList(Long userId, Integer status, Map<String, Object> pageDTO);

    /**
     * 获取用户可用的优惠券
     */
    Result<?> getAvailableCoupons(Long userId, BigDecimal orderAmount);

    /**
     * 校验优惠券是否可用
     */
    Result<?> validateCoupon(Long userId, Long couponId, BigDecimal orderAmount);

    /**
     * 使用优惠券（下单时调用）
     */
    Result<?> useCoupon(Long userId, Long couponId, Long orderId);

    /**
     * 取消使用优惠券（订单失败时回退）
     */
    Result<?> invalidateCoupon(Long couponId, Long orderId);

    // ========== 促销活动 ==========

    /**
     * 获取进行中的促销活动
     */
    Result<?> getActivePromotions();

    /**
     * 计算促销活动优惠金额
     */
    BigDecimal calculatePromotionDiscount(Long activityId, BigDecimal orderAmount);

    // ========== 会员积分 ==========

    /**
     * 获取会员信息（含积分）
     */
    Result<?> getMemberInfo(Long userId);

    /**
     * 获取积分变动记录
     */
    Result<?> getPointsLog(Long userId, Map<String, Object> pageDTO);

    /**
     * 订单完成后增加积分
     */
    Result<?> earnPointsOnOrderComplete(Long orderId, BigDecimal payAmount);

    /**
     * 退款时扣减积分
     */
    Result<?> deductPointsOnRefund(Long orderId);
}
