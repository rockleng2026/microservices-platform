package com.central.mall.controller.admin;

import com.central.common.model.Result;
import com.central.mall.mapper.MallCouponTemplateMapper;
import com.central.mall.model.entity.MallCouponTemplate;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 管理员优惠券控制器
 */
@RestController
@RequestMapping("/api/mall/admin/coupon")
@RequiredArgsConstructor
@Tag(name = "管理员-优惠券管理")
public class AdminCouponController {

    private final MallCouponTemplateMapper templateMapper;

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
        template.setStartTime(params.get("startTime") != null ? LocalDateTime.parse(params.get("startTime").toString()) : null);
        template.setEndTime(params.get("endTime") != null ? LocalDateTime.parse(params.get("endTime").toString()) : null);
        template.setValidDays(params.get("validDays") != null ? (Integer) params.get("validDays") : null);
        template.setStatus(0); // 未发布
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
        if (params.get("startTime") != null) template.setStartTime(LocalDateTime.parse(params.get("startTime").toString()));
        if (params.get("endTime") != null) template.setEndTime(LocalDateTime.parse(params.get("endTime").toString()));
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
}
