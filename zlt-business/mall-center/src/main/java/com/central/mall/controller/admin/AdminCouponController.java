package com.central.mall.controller.admin;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.central.common.model.Result;
import com.central.mall.mapper.MallCouponMapper;
import com.central.mall.mapper.MallCouponTemplateMapper;
import com.central.mall.model.entity.MallCoupon;
import com.central.mall.model.entity.MallCouponTemplate;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * 管理员优惠券控制器
 */
@RestController
@RequestMapping("/api/mall/admin/coupon")
@RequiredArgsConstructor
@Tag(name = "管理员-优惠券管理")
public class AdminCouponController {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
    private static final DateTimeFormatter DATE_ONLY_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private final MallCouponTemplateMapper templateMapper;
    private final MallCouponMapper couponMapper;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @PostMapping("/template")
    @Operation(summary = "创建优惠券模板 (MARKETING-01)")
    public Result<?> createTemplate(@RequestBody Map<String, Object> params) {
        MallCouponTemplate template = new MallCouponTemplate();
        template.setName((String) params.get("name"));
        template.setType((Integer) params.get("type"));
        if (params.get("faceValue") != null) {
            template.setFaceValue(new BigDecimal(params.get("faceValue").toString()));
        }
        if (params.get("discountRate") != null) {
            template.setDiscountRate(new BigDecimal(params.get("discountRate").toString()));
        }
        if (params.get("minAmount") != null) {
            template.setMinAmount(new BigDecimal(params.get("minAmount").toString()));
        }
        if (params.get("maxDiscount") != null) {
            template.setMaxDiscount(new BigDecimal(params.get("maxDiscount").toString()));
        }
        template.setTotalCount((Integer) params.get("totalCount"));
        template.setRemainCount((Integer) params.get("totalCount"));
        template.setPerUserLimit(params.get("perUserLimit") != null ? (Integer) params.get("perUserLimit") : 1);
        template.setValidType(params.get("validType") != null ? (Integer) params.get("validType") : 1);
        if (params.get("startTime") != null) {
            template.setStartTime(parseDateTime(params.get("startTime").toString(), true));
        }
        if (params.get("endTime") != null) {
            template.setEndTime(parseDateTime(params.get("endTime").toString(), false));
        }
        template.setValidDays(params.get("validDays") != null ? (Integer) params.get("validDays") : null);
        template.setStatus(0); // 未发布
        template.setTenantId("default"); // 租户ID
        template.setCreateTime(LocalDateTime.now());
        template.setUpdateTime(LocalDateTime.now());
        templateMapper.insert(template);
        return Result.succeed(template.getId(), "优惠券模板创建成功");
    }

    @PutMapping("/template/{id}")
    @Operation(summary = "更新优惠券模板")
    public Result<?> updateTemplate(@PathVariable Long id, @RequestBody Map<String, Object> params) {
        MallCouponTemplate template = templateMapper.selectById(id);
        if (template == null) {
            return Result.failed("优惠券不存在");
        }
        if (params.get("name") != null) template.setName((String) params.get("name"));
        if (params.get("type") != null) template.setType((Integer) params.get("type"));
        if (params.get("faceValue") != null) template.setFaceValue(new BigDecimal(params.get("faceValue").toString()));
        if (params.get("discountRate") != null) template.setDiscountRate(new BigDecimal(params.get("discountRate").toString()));
        if (params.get("minAmount") != null) template.setMinAmount(new BigDecimal(params.get("minAmount").toString()));
        if (params.get("maxDiscount") != null) template.setMaxDiscount(new BigDecimal(params.get("maxDiscount").toString()));
        if (params.get("totalCount") != null) template.setTotalCount((Integer) params.get("totalCount"));
        if (params.get("perUserLimit") != null) template.setPerUserLimit((Integer) params.get("perUserLimit"));
        if (params.get("validType") != null) template.setValidType((Integer) params.get("validType"));
        if (params.get("startTime") != null) template.setStartTime(parseDateTime(params.get("startTime").toString(), true));
        if (params.get("endTime") != null) template.setEndTime(parseDateTime(params.get("endTime").toString(), false));
        if (params.get("validDays") != null) template.setValidDays((Integer) params.get("validDays"));
        template.setUpdateTime(LocalDateTime.now());
        templateMapper.updateById(template);
        return Result.succeed(true, "更新成功");
    }

    @PostMapping("/template/{id}/publish")
    @Operation(summary = "发布优惠券 (MARKETING-02)")
    public Result<?> publishTemplate(@PathVariable Long id) {
        MallCouponTemplate template = templateMapper.selectById(id);
        if (template == null) {
            return Result.failed("优惠券不存在");
        }
        if (template.getStatus() != 0) {
            return Result.failed("只能发布未发布的优惠券");
        }
        template.setStatus(1); // 已发布
        template.setUpdateTime(LocalDateTime.now());
        templateMapper.updateById(template);
        return Result.succeed(true, "发布成功");
    }

    @PostMapping("/template/{id}/offline")
    @Operation(summary = "下架优惠券 (MARKETING-02)")
    public Result<?> offlineTemplate(@PathVariable Long id) {
        MallCouponTemplate template = templateMapper.selectById(id);
        if (template == null) {
            return Result.failed("优惠券不存在");
        }
        template.setStatus(2); // 已下架
        template.setUpdateTime(LocalDateTime.now());
        templateMapper.updateById(template);
        return Result.succeed(true, "下架成功");
    }

    @GetMapping("/template/list")
    @Operation(summary = "优惠券模板列表")
    public Result<?> getTemplateList(
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long page,
            @RequestParam(required = false) Long pageSize) {
        com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<MallCouponTemplate> wrapper =
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<>();
        if (status != null) {
            wrapper.eq(MallCouponTemplate::getStatus, status);
        }
        wrapper.orderByDesc(MallCouponTemplate::getCreateTime);
        var templates = templateMapper.selectList(wrapper);
        return Result.succeed(templates);
    }

    @PostMapping("/template/{id}/issue")
    @Operation(summary = "向指定用户发放优惠券 (ADMIN-04-05)")
    public Result<?> issueCouponToUser(@PathVariable Long id, @RequestBody Map<String, Object> params) {
        MallCouponTemplate template = templateMapper.selectById(id);
        if (template == null) {
            return Result.failed("优惠券不存在");
        }
        if (template.getStatus() != 1) {
            return Result.failed("只能向已发布的优惠券发放");
        }
        Long userId = ((Number) params.get("userId")).longValue();
        if (userId == null || userId <= 0) {
            return Result.failed("用户ID无效");
        }
        // 检查剩余数量
        if (template.getRemainCount() <= 0) {
            return Result.failed("优惠券已领完");
        }
        // 创建用户优惠券（复制模板数据）
        MallCoupon coupon = new MallCoupon();
        coupon.setUserId(userId);
        coupon.setTemplateId(id);
        coupon.setCouponNo(UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase());
        coupon.setName(template.getName());
        coupon.setType(template.getType());
        coupon.setFaceValue(template.getFaceValue());
        coupon.setDiscountRate(template.getDiscountRate());
        coupon.setMinAmount(template.getMinAmount());
        coupon.setMaxDiscount(template.getMaxDiscount());
        coupon.setStatus(1); // 1=未使用
        coupon.setTenantId(template.getTenantId()); // 继承模板的租户ID
        coupon.setReceiveTime(LocalDateTime.now());
        // 计算过期时间
        LocalDateTime now = LocalDateTime.now();
        if (template.getValidType() == 1) {
            coupon.setExpireTime(template.getEndTime());
        } else {
            coupon.setExpireTime(now.plusDays(template.getValidDays() != null ? template.getValidDays() : 7));
        }
        coupon.setCreateTime(now);
        coupon.setUpdateTime(now);
        couponMapper.insert(coupon);
        // 扣减 remainCount
        template.setRemainCount(template.getRemainCount() - 1);
        template.setUpdateTime(now);
        templateMapper.updateById(template);
        return Result.succeed(coupon.getId(), "发放成功");
    }

    @GetMapping("/template/{id}/statistics")
    @Operation(summary = "优惠券使用统计 (ADMIN-04-06)")
    public Result<Map<String, Object>> getCouponStatistics(@PathVariable Long id) {
        MallCouponTemplate template = templateMapper.selectById(id);
        if (template == null) {
            return Result.failed("优惠券不存在");
        }
        // 统计已发放数量 = totalCount - remainCount
        int totalCount = template.getTotalCount() != null ? template.getTotalCount() : 0;
        int remainCount = template.getRemainCount() != null ? template.getRemainCount() : 0;
        int issuedCount = totalCount - remainCount;
        // 统计已使用/未使用
        LambdaQueryWrapper<MallCoupon> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallCoupon::getTemplateId, id);
        var coupons = couponMapper.selectList(wrapper);
        int usedCount = 0;
        int unusedCount = 0;
        for (MallCoupon c : coupons) {
            if (c.getStatus() != null) {
                if (c.getStatus() == 2) usedCount++;
                else if (c.getStatus() == 1) unusedCount++;
            }
        }
        double usageRate = issuedCount > 0 ? (double) usedCount / issuedCount * 100 : 0;
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCount", totalCount);
        stats.put("remainCount", remainCount);
        stats.put("issuedCount", issuedCount);
        stats.put("usedCount", usedCount);
        stats.put("unusedCount", unusedCount);
        stats.put("usageRate", String.format("%.1f", usageRate) + "%");
        return Result.succeed(stats);
    }

    @GetMapping("/template/{id}/claim-code")
    @Operation(summary = "生成限时领取码 (D-11)")
    public Result<Map<String, Object>> generateClaimCode(@PathVariable Long id,
        @RequestParam(defaultValue = "7") Integer expireDays) {
        MallCouponTemplate template = templateMapper.selectById(id);
        if (template == null) {
            return Result.failed("优惠券不存在");
        }
        if (template.getStatus() != 1) {
            return Result.failed("只能为已发布的优惠券生成领取码");
        }
        // 生成一次性 UUID 作为 claim code
        String claimCode = UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        String redisKey = "coupon:claim:" + claimCode;
        // 存入 Redis，设置过期时间
        redisTemplate.opsForValue().set(redisKey, String.valueOf(id), expireDays, TimeUnit.DAYS);
        LocalDateTime expireTime = LocalDateTime.now().plusDays(expireDays);
        Map<String, Object> result = new HashMap<>();
        result.put("claimCode", claimCode);
        result.put("claimUrl", "/pages/index/index?claimCode=" + claimCode);
        result.put("expireTime", expireTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        result.put("expireDays", expireDays);
        return Result.succeed(result, "领取码生成成功");
    }

    @DeleteMapping("/template/{id}")
    @Operation(summary = "删除优惠券模板 (ADMIN-04-03)")
    public Result<?> deleteTemplate(@PathVariable Long id) {
        MallCouponTemplate template = templateMapper.selectById(id);
        if (template == null) {
            return Result.failed("优惠券不存在");
        }
        templateMapper.deleteById(id);
        return Result.succeed(true, "删除成功");
    }

    /**
     * 解析日期时间字符串，支持 yyyy-MM-dd 和 yyyy-MM-dd'T'HH:mm:ss 格式
     * @param dateStr 日期字符串
     * @param isStartTime true-开始时间自动补全00:00:00，false-结束时间自动补全23:59:59
     */
    private LocalDateTime parseDateTime(String dateStr, boolean isStartTime) {
        if (dateStr == null || dateStr.isEmpty()) {
            return null;
        }
        try {
            // 尝试 ISO 格式 (yyyy-MM-dd'T'HH:mm:ss)
            return LocalDateTime.parse(dateStr, DATE_TIME_FORMATTER);
        } catch (Exception e) {
            // 尝试简单日期格式 (yyyy-MM-dd)
            try {
                LocalDate date = LocalDate.parse(dateStr, DATE_ONLY_FORMATTER);
                if (isStartTime) {
                    return date.atStartOfDay(); // 00:00:00
                } else {
                    return date.atTime(23, 59, 59); // 23:59:59
                }
            } catch (Exception e2) {
                throw new IllegalArgumentException("无效的日期格式: " + dateStr);
            }
        }
    }
}
