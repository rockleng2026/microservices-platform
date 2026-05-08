package com.central.mall.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.central.common.model.Result;
import com.central.mall.mapper.MallResourceDeliveryMapper;
import com.central.mall.model.entity.MallResourceDelivery;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * 资源下载控制器
 * D-07: 虚拟商品资源下载，时效token验证
 * URL格式: /api/mall/resource/download/{deliveryId}?token={token}&expire={timestamp}
 */
@Slf4j
@RestController
@RequestMapping("/api/mall/resource")
@RequiredArgsConstructor
@Tag(name = "资源下载", description = "虚拟商品资源下载接口")
public class ResourceController {

    private final MallResourceDeliveryMapper resourceDeliveryMapper;

    /**
     * 虚拟商品资源下载
     * 验证deliveryId、token和expire时间
     *
     * @param deliveryId 交付记录ID
     * @param token      下载Token
     * @param expire     过期时间戳
     * @return 资源URL或错误
     */
    @GetMapping("/download/{deliveryId}")
    @Operation(summary = "下载虚拟商品资源")
    public Result<String> downloadResource(
            @PathVariable Long deliveryId,
            @RequestParam String token,
            @RequestParam Long expire) {

        // 1. 验证过期时间
        if (expire < System.currentTimeMillis()) {
            log.warn("Resource download expired: deliveryId={}, expire={}", deliveryId, expire);
            return Result.failed("下载链接已过期");
        }

        // 2. 查询交付记录
        MallResourceDelivery delivery = resourceDeliveryMapper.selectById(deliveryId);
        if (delivery == null) {
            log.warn("Resource delivery not found: deliveryId={}", deliveryId);
            return Result.failed("交付记录不存在");
        }

        // 3. 验证token
        if (!token.equals(delivery.getToken())) {
            log.warn("Resource download token mismatch: deliveryId={}, expected={}, got={}",
                    deliveryId, delivery.getToken(), token);
            return Result.failed("下载Token无效");
        }

        // 4. 验证过期时间（双重验证）
        if (delivery.getExpireTime() != null && delivery.getExpireTime().isBefore(LocalDateTime.now())) {
            log.warn("Resource download expired: deliveryId={}, expireTime={}", deliveryId, delivery.getExpireTime());
            return Result.failed("资源已过期");
        }

        // 5. 增加下载次数
        delivery.setDownloadCount(delivery.getDownloadCount() == null ? 1 : delivery.getDownloadCount() + 1);
        resourceDeliveryMapper.updateById(delivery);

        // 6. 返回资源URL
        log.info("Resource download success: deliveryId={}, downloadCount={}",
                deliveryId, delivery.getDownloadCount());
        return Result.succeed(delivery.getResourceUrl());
    }
}