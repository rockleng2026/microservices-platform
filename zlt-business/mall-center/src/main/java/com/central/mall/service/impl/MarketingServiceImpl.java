package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.central.common.model.Result;
import com.central.mall.mapper.*;
import com.central.mall.model.entity.*;
import com.central.mall.service.IMarketingService;
import com.central.mall.service.IMallMemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RBucket;
import org.redisson.api.RedissonClient;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

/**
 * 营销服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MarketingServiceImpl implements IMarketingService {

    private static final String COUPON_CLAIM_LOCK_PREFIX = "coupon:claim:";
    private static final String POINTS_CACHE_PREFIX = "points:user:";
    private static final int POINTS_RATE = 100; // 100元 = 1积分

    private final MallCouponTemplateMapper templateMapper;
    private final MallCouponMapper couponMapper;
    private final MallMarketingActivityMapper activityMapper;
    private final MallPointsAccountMapper pointsAccountMapper;
    private final MallPointsLogMapper pointsLogMapper;
    private final IMallMemberService memberService;
    private final RedissonClient redissonClient;
    private final StringRedisTemplate redisTemplate;

    @Override
    @Transactional
    public Result<?> claimCoupon(Long templateId, Long userId) {
        // 1. 获取优惠券模板
        MallCouponTemplate template = templateMapper.selectById(templateId);
        if (template == null) {
            return Result.failed("优惠券不存在");
        }
        if (template.getStatus() != 1) {
            return Result.failed("优惠券未发布或已下架");
        }

        // 2. 检查有效期
        LocalDateTime now = LocalDateTime.now();
        if (template.getStartTime() != null && now.isBefore(template.getStartTime())) {
            return Result.failed("优惠券尚未开始领取");
        }
        if (template.getEndTime() != null && now.isAfter(template.getEndTime())) {
            return Result.failed("优惠券已过期");
        }

        // 3. 分布式锁防止并发超领
        String lockKey = COUPON_CLAIM_LOCK_PREFIX + templateId + ":" + userId;
        try {
            if (!redissonClient.getLock(lockKey).tryLock()) {
                return Result.failed("请求过于频繁，请稍后重试");
            }

            // 4. 检查用户已领数量
            long userClaimCount = couponMapper.selectCount(
                new LambdaQueryWrapper<MallCoupon>()
                    .eq(MallCoupon::getTemplateId, templateId)
                    .eq(MallCoupon::getUserId, userId)
            );
            if (userClaimCount >= template.getPerUserLimit()) {
                return Result.failed("您已超过此优惠券的限领次数");
            }

            // 5. 检查剩余数量（Redis原子扣减）
            if (template.getRemainCount() <= 0) {
                return Result.failed("优惠券已领完");
            }

            // 6. 创建用户优惠券
            MallCoupon coupon = new MallCoupon();
            coupon.setUserId(userId);
            coupon.setTemplateId(templateId);
            coupon.setCouponNo(UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase());
            coupon.setName(template.getName());
            coupon.setType(template.getType());
            coupon.setFaceValue(template.getFaceValue());
            coupon.setDiscountRate(template.getDiscountRate());
            coupon.setMinAmount(template.getMinAmount());
            coupon.setMaxDiscount(template.getMaxDiscount());
            coupon.setStatus(1); // 1=未使用
            coupon.setReceiveTime(now);

            // 计算过期时间
            if (template.getValidType() == 1) {
                // 固定日期
                coupon.setExpireTime(template.getEndTime());
            } else {
                // 领取后N天
                coupon.setExpireTime(now.plusDays(template.getValidDays()));
            }

            coupon.setCreateTime(now);
            coupon.setUpdateTime(now);
            couponMapper.insert(coupon);

            // 7. 扣减模板剩余数量
            template.setRemainCount(template.getRemainCount() - 1);
            templateMapper.updateById(template);

            // 8. 清除用户优惠券缓存
            redisTemplate.delete("coupon:user:" + userId + ":available");

            return Result.succeed(coupon.getId(), "优惠券领取成功");
        } catch (Exception e) {
            log.error("Claim coupon failed: templateId={}, userId={}, error={}", templateId, userId, e.getMessage(), e);
            return Result.failed("领取失败: " + e.getMessage());
        } finally {
            redissonClient.getLock(lockKey).unlock();
        }
    }

    @Override
    public Result<?> getUserCouponList(Long userId, Integer status, Map<String, Object> pageDTO) {
        LambdaQueryWrapper<MallCoupon> wrapper = new LambdaQueryWrapper<MallCoupon>()
            .eq(MallCoupon::getUserId, userId);
        if (status != null) {
            wrapper.eq(MallCoupon::getStatus, status);
        }
        wrapper.orderByDesc(MallCoupon::getReceiveTime);
        List<MallCoupon> coupons = couponMapper.selectList(wrapper);

        // Transform to frontend format
        List<Map<String, Object>> transformed = new ArrayList<>();
        for (MallCoupon coupon : coupons) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", coupon.getId());
            item.put("name", coupon.getName());
            item.put("type", getCouponTypeName(coupon.getType()));
            item.put("discount", coupon.getFaceValue() != null ? coupon.getFaceValue() : coupon.getDiscountRate());
            item.put("minAmount", coupon.getMinAmount());
            item.put("validStartTime", coupon.getReceiveTime());
            item.put("validEndTime", coupon.getExpireTime());
            item.put("status", getCouponStatusName(coupon.getStatus()));
            transformed.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", transformed);
        result.put("total", transformed.size());
        return Result.succeed(result);
    }

    private String getCouponTypeName(Integer type) {
        if (type == null) return "fixed";
        return switch (type) {
            case 1 -> "fixed";  // 满减券
            case 2 -> "discount"; // 折扣券
            case 3 -> "fixed";  // 无门槛券
            default -> "fixed";
        };
    }

    private String getCouponStatusName(Integer status) {
        if (status == null) return "unused";
        return switch (status) {
            case 1 -> "unused";
            case 2 -> "used";
            case 3 -> "expired";
            default -> "unused";
        };
    }

    @Override
    public Result<?> getAvailableCoupons(Long userId, BigDecimal orderAmount) {
        // 先从缓存获取
        String cacheKey = "coupon:user:" + userId + ":available";
        RBucket<String> bucket = redissonClient.getBucket(cacheKey);
        String cached = bucket.get();
        if (cached != null && !cached.isEmpty()) {
            // Return cached result
            log.debug("Using cached available coupons for user {}", userId);
        }

        LocalDateTime now = LocalDateTime.now();
        List<MallCoupon> availableCoupons = couponMapper.selectList(
            new LambdaQueryWrapper<MallCoupon>()
                .eq(MallCoupon::getUserId, userId)
                .eq(MallCoupon::getStatus, 1) // 未使用
                .gt(MallCoupon::getExpireTime, now) // 未过期
                .orderByDesc(MallCoupon::getReceiveTime)
        );

        // Filter by minimum order amount
        List<MallCoupon> validCoupons = new ArrayList<>();
        for (MallCoupon coupon : availableCoupons) {
            if (orderAmount == null || orderAmount.compareTo(coupon.getMinAmount()) >= 0) {
                validCoupons.add(coupon);
            }
        }

        return Result.succeed(validCoupons);
    }

    @Override
    public Result<?> validateCoupon(Long userId, Long couponId, BigDecimal orderAmount) {
        MallCoupon coupon = couponMapper.selectById(couponId);
        if (coupon == null) {
            return Result.failed("优惠券不存在");
        }
        if (!coupon.getUserId().equals(userId)) {
            return Result.failed("无权使用此优惠券");
        }
        if (coupon.getStatus() != 1) {
            return Result.failed("优惠券已使用或已过期");
        }
        if (coupon.getExpireTime() != null && LocalDateTime.now().isAfter(coupon.getExpireTime())) {
            return Result.failed("优惠券已过期");
        }
        if (orderAmount != null && coupon.getMinAmount() != null && orderAmount.compareTo(coupon.getMinAmount()) < 0) {
            return Result.failed("订单金额不满足最低消费" + coupon.getMinAmount() + "元");
        }

        // 计算优惠金额
        BigDecimal discount = calculateCouponDiscount(coupon, orderAmount);
        Map<String, Object> result = new HashMap<>();
        result.put("couponId", couponId);
        result.put("discountAmount", discount);
        result.put("couponName", coupon.getName());
        return Result.succeed(result);
    }

    private BigDecimal calculateCouponDiscount(MallCoupon coupon, BigDecimal orderAmount) {
        BigDecimal discount = BigDecimal.ZERO;
        if (coupon.getType() == 1) {
            // 满减券
            discount = coupon.getFaceValue() != null ? coupon.getFaceValue() : BigDecimal.ZERO;
            // 不超过最大优惠金额
            if (coupon.getMaxDiscount() != null && discount.compareTo(coupon.getMaxDiscount()) > 0) {
                discount = coupon.getMaxDiscount();
            }
        } else if (coupon.getType() == 2) {
            // 折扣券
            if (coupon.getDiscountRate() != null && orderAmount != null) {
                discount = orderAmount.multiply(BigDecimal.ONE.subtract(coupon.getDiscountRate()));
                if (coupon.getMaxDiscount() != null && discount.compareTo(coupon.getMaxDiscount()) > 0) {
                    discount = coupon.getMaxDiscount();
                }
            }
        } else if (coupon.getType() == 3) {
            // 无门槛券
            discount = coupon.getFaceValue() != null ? coupon.getFaceValue() : BigDecimal.ZERO;
        }
        return discount;
    }

    @Override
    @Transactional
    public Result<?> useCoupon(Long userId, Long couponId, Long orderId) {
        MallCoupon coupon = couponMapper.selectById(couponId);
        if (coupon == null || !coupon.getUserId().equals(userId)) {
            return Result.failed("优惠券不存在");
        }
        if (coupon.getStatus() != 1) {
            return Result.failed("优惠券不可用");
        }

        coupon.setOrderId(orderId);
        coupon.setStatus(2); // 已使用
        coupon.setUseTime(LocalDateTime.now());
        coupon.setUpdateTime(LocalDateTime.now());
        couponMapper.updateById(coupon);

        // 清除缓存
        redisTemplate.delete("coupon:user:" + userId + ":available");

        return Result.succeed(true, "优惠券使用成功");
    }

    @Override
    @Transactional
    public Result<?> invalidateCoupon(Long couponId, Long orderId) {
        MallCoupon coupon = couponMapper.selectById(couponId);
        if (coupon == null) {
            return Result.failed("优惠券不存在");
        }
        if (coupon.getStatus() != 2) {
            return Result.failed("优惠券状态不允许取消使用");
        }

        coupon.setOrderId(null);
        coupon.setStatus(1); // 恢复为未使用
        coupon.setUseTime(null);
        coupon.setUpdateTime(LocalDateTime.now());
        couponMapper.updateById(coupon);

        // 清除缓存
        redisTemplate.delete("coupon:user:" + coupon.getUserId() + ":available");

        return Result.succeed(true, "优惠券已取消使用");
    }

    @Override
    public Result<?> getActivePromotions() {
        LocalDateTime now = LocalDateTime.now();
        List<MallMarketingActivity> activities = activityMapper.selectList(
            new LambdaQueryWrapper<MallMarketingActivity>()
                .eq(MallMarketingActivity::getStatus, 2) // 进行中
                .le(MallMarketingActivity::getStartTime, now)
                .ge(MallMarketingActivity::getEndTime, now)
                .orderByDesc(MallMarketingActivity::getPriority)
        );
        return Result.succeed(activities);
    }

    @Override
    public BigDecimal calculatePromotionDiscount(Long activityId, BigDecimal orderAmount) {
        MallMarketingActivity activity = activityMapper.selectById(activityId);
        if (activity == null || activity.getStatus() != 2) {
            return BigDecimal.ZERO;
        }

        try {
            // Parse rule JSON: {"minAmount":100,"discountAmount":10}
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            Map<String, Object> rule = mapper.readValue(activity.getRuleJson(), Map.class);

            BigDecimal minAmount = new BigDecimal(rule.get("minAmount").toString());
            if (orderAmount.compareTo(minAmount) < 0) {
                return BigDecimal.ZERO;
            }

            if (activity.getType() == 1) {
                // 满减
                return new BigDecimal(rule.get("discountAmount").toString());
            } else if (activity.getType() == 2) {
                // 折扣
                BigDecimal discountRate = new BigDecimal(rule.get("discountRate").toString());
                return orderAmount.multiply(BigDecimal.ONE.subtract(discountRate));
            }
        } catch (Exception e) {
            log.error("Parse promotion rule failed: activityId={}, error={}", activityId, e.getMessage(), e);
        }
        return BigDecimal.ZERO;
    }

    @Override
    public Result<?> getMemberInfo(Long userId) {
        // Try cache first
        String cacheKey = POINTS_CACHE_PREFIX + userId;
        RBucket<String> bucket = redissonClient.getBucket(cacheKey);
        String cached = bucket.get();

        MallPointsAccount account = pointsAccountMapper.selectOne(
            new LambdaQueryWrapper<MallPointsAccount>()
                .eq(MallPointsAccount::getUserId, userId)
        );

        // Also get member profile for nickname/avatar
        MallMember member = null;
        try {
            // Token中的userId就是MallMember.id（自增主键）
            member = memberService.getById(userId);
        } catch (Exception e) {
            log.debug("Member not found for id: {}", userId);
        }

        if (account == null) {
            // Create new account
            account = new MallPointsAccount();
            account.setUserId(userId);
            account.setBalance(0);
            account.setTotalEarned(0);
            account.setTotalSpent(0);
            account.setCreateTime(LocalDateTime.now());
            account.setUpdateTime(LocalDateTime.now());
            pointsAccountMapper.insert(account);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("userId", userId);
        result.put("balance", account.getBalance());
        result.put("points", account.getBalance()); // Alias for frontend compatibility
        result.put("totalEarned", account.getTotalEarned());
        result.put("totalSpent", account.getTotalSpent());
        // Include member profile info
        if (member != null) {
            result.put("nickname", member.getNickname());
            result.put("avatar", member.getAvatar());
            result.put("phone", member.getPhone());
            result.put("gender", member.getGender());
            result.put("birthday", member.getBirthday());
            result.put("province", member.getProvince());
            result.put("city", member.getCity());
            result.put("level", 1); // Default level
        }

        return Result.succeed(result);
    }

    @Override
    public Result<?> getPointsLog(Long userId, Map<String, Object> pageDTO) {
        List<MallPointsLog> logs = pointsLogMapper.selectList(
            new LambdaQueryWrapper<MallPointsLog>()
                .eq(MallPointsLog::getUserId, userId)
                .orderByDesc(MallPointsLog::getCreateTime)
        );

        // Transform to frontend format
        List<Map<String, Object>> transformed = new ArrayList<>();
        for (MallPointsLog log : logs) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", log.getId());
            item.put("type", log.getType() == 1 ? "earn" : "deduct");
            item.put("points", log.getPoints());
            item.put("reason", log.getRemark());
            item.put("createTime", log.getCreateTime());
            transformed.add(item);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("list", transformed);
        result.put("total", transformed.size());
        return Result.succeed(result);
    }

    @Override
    @Transactional
    public Result<?> earnPointsOnOrderComplete(Long orderId, Long memberId, BigDecimal payAmount) {
        // 根据支付金额计算积分：100元 = 1积分
        if (payAmount == null || payAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return Result.succeed("支付金额为0，不计算积分");
        }

        int points = payAmount.divide(new BigDecimal(POINTS_RATE), 0, RoundingMode.DOWN).intValue();
        if (points <= 0) {
            return Result.succeed("支付金额不足100元，不计算积分");
        }

        // 获取用户积分账户
        MallPointsAccount account = pointsAccountMapper.selectOne(
            new LambdaQueryWrapper<MallPointsAccount>()
                .eq(MallPointsAccount::getUserId, memberId)
        );

        if (account == null) {
            account = new MallPointsAccount();
            account.setUserId(memberId);
            account.setBalance(0);
            account.setTotalEarned(0);
            account.setTotalSpent(0);
            account.setCreateTime(LocalDateTime.now());
            pointsAccountMapper.insert(account);
        }

        // 更新账户
        int newBalance = account.getBalance() + points;
        int newTotalEarned = account.getTotalEarned() + points;
        account.setBalance(newBalance);
        account.setTotalEarned(newTotalEarned);
        account.setUpdateTime(LocalDateTime.now());
        pointsAccountMapper.updateById(account);

        // 记录日志
        MallPointsLog log = new MallPointsLog();
        log.setUserId(account.getUserId());
        log.setType(1); // 获得
        log.setPoints(points);
        log.setBalanceAfter(newBalance);
        log.setSource("ORDER");
        log.setSourceId(orderId.toString());
        log.setRemark("订单完成获得积分");
        log.setCreateTime(LocalDateTime.now());
        log.setUpdateTime(LocalDateTime.now());
        pointsLogMapper.insert(log);

        // 清除缓存
        redisTemplate.delete(POINTS_CACHE_PREFIX + account.getUserId());

        return Result.succeed(points, "获得积分" + points);
    }

    @Override
    @Transactional
    public Result<?> deductPointsOnRefund(Long orderId) {
        // 查询订单获得的积分记录
        List<MallPointsLog> earnedLogs = pointsLogMapper.selectList(
            new LambdaQueryWrapper<MallPointsLog>()
                .eq(MallPointsLog::getSource, "ORDER")
                .eq(MallPointsLog::getSourceId, orderId.toString())
                .eq(MallPointsLog::getType, 1) // 获得
        );

        if (earnedLogs.isEmpty()) {
            return Result.succeed("无积分可扣减");
        }

        int totalPoints = earnedLogs.stream().mapToInt(MallPointsLog::getPoints).sum();

        // 获取用户积分账户
        MallPointsLog lastLog = earnedLogs.get(0);
        MallPointsAccount account = pointsAccountMapper.selectOne(
            new LambdaQueryWrapper<MallPointsAccount>()
                .eq(MallPointsAccount::getUserId, lastLog.getUserId())
        );

        if (account == null || account.getBalance() < totalPoints) {
            return Result.failed("积分余额不足");
        }

        // 扣减积分
        int newBalance = account.getBalance() - totalPoints;
        account.setBalance(newBalance);
        account.setTotalSpent(account.getTotalSpent() + totalPoints);
        account.setUpdateTime(LocalDateTime.now());
        pointsAccountMapper.updateById(account);

        // 记录日志
        MallPointsLog refundLog = new MallPointsLog();
        refundLog.setUserId(account.getUserId());
        refundLog.setType(2); // 消耗
        refundLog.setPoints(totalPoints);
        refundLog.setBalanceAfter(newBalance);
        refundLog.setSource("REFUND");
        refundLog.setSourceId(orderId.toString());
        refundLog.setRemark("退款扣减积分");
        refundLog.setCreateTime(LocalDateTime.now());
        refundLog.setUpdateTime(LocalDateTime.now());
        pointsLogMapper.insert(refundLog);

        // 清除缓存
        redisTemplate.delete(POINTS_CACHE_PREFIX + account.getUserId());

        return Result.succeed(totalPoints, "已扣减积分" + totalPoints);
    }
}
