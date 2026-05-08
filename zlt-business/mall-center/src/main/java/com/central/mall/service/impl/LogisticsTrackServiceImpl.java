package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.central.mall.config.TenantInterceptor;
import com.central.mall.mapper.MallDeliveryMapper;
import com.central.mall.mapper.MallOrderMapper;
import com.central.mall.model.dto.LogisticsTrackDTO;
import com.central.mall.model.entity.MallDelivery;
import com.central.mall.model.entity.MallOrder;
import com.central.mall.service.ILogisticsTrackService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LogisticsTrackServiceImpl implements ILogisticsTrackService {

    private static final String LOGISTICS_CACHE_KEY_PREFIX = "logistics:";
    private static final long CACHE_TTL_MINUTES = 30;

    private final MallDeliveryMapper deliveryMapper;
    private final MallOrderMapper orderMapper;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public LogisticsTrackDTO getLogisticsInfo(Long orderId) {
        String tenantId = TenantInterceptor.getCurrentTenantId();

        // Check Redis cache first
        String cacheKey = LOGISTICS_CACHE_KEY_PREFIX + orderId;
        try {
            String cached = redisTemplate.opsForValue().get(cacheKey);
            if (cached != null) {
                return objectMapper.readValue(cached, LogisticsTrackDTO.class);
            }
        } catch (Exception e) {
            log.warn("Failed to read logistics cache for order {}", orderId, e);
        }

        // Query delivery info
        LambdaQueryWrapper<MallDelivery> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallDelivery::getOrderId, orderId);
        MallDelivery delivery = deliveryMapper.selectOne(wrapper);

        LogisticsTrackDTO dto = new LogisticsTrackDTO();
        dto.setOrderId(orderId);

        if (delivery == null || delivery.getWaybillNo() == null || delivery.getWaybillNo().isBlank()) {
            // No delivery info yet
            dto.setStatus(0);
            dto.setStatusDesc("待发货");
            dto.setTraces(new ArrayList<>());
        } else {
            dto.setWaybillNo(delivery.getWaybillNo());
            dto.setExpressCode(delivery.getExpressCode());
            dto.setExpressName(delivery.getExpressName());

            // For v1: mock implementation - return sample traces
            // Real implementation would call 快递鸟 API here
            dto.setStatus(1);
            dto.setStatusDesc("在途");
            dto.setTraces(buildMockTraces(delivery));
            dto.setLastUpdateTime(LocalDateTime.now());
        }

        // Cache result
        try {
            redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(dto));
            redisTemplate.expire(cacheKey, java.time.Duration.ofMinutes(CACHE_TTL_MINUTES));
        } catch (Exception e) {
            log.warn("Failed to cache logistics info for order {}", orderId, e);
        }

        return dto;
    }

    @Override
    public LogisticsTrackDTO refreshLogistics(Long orderId) {
        // Force refresh: delete cache then fetch
        String cacheKey = LOGISTICS_CACHE_KEY_PREFIX + orderId;
        redisTemplate.delete(cacheKey);
        return getLogisticsInfo(orderId);
    }

    private List<LogisticsTrackDTO.LogisticsTrace> buildMockTraces(MallDelivery delivery) {
        List<LogisticsTrackDTO.LogisticsTrace> traces = new ArrayList<>();

        // Mock sample traces for testing UI
        LogisticsTrackDTO.LogisticsTrace trace1 = new LogisticsTrackDTO.LogisticsTrace();
        trace1.setTime(delivery.getShipTime() != null ? delivery.getShipTime().toString() : LocalDateTime.now().minusDays(2).toString());
        trace1.setLocation("上海市");
        trace1.setDescription("包裹已发出，等待收件端扫描");
        traces.add(trace1);

        LogisticsTrackDTO.LogisticsTrace trace2 = new LogisticsTrackDTO.LogisticsTrace();
        trace2.setTime(delivery.getShipTime() != null ? delivery.getShipTime().plusHours(2).toString() : LocalDateTime.now().minusDays(1).toString());
        trace2.setLocation("杭州市");
        trace2.setDescription("快件已到达【杭州转运中心】");
        traces.add(trace2);

        LogisticsTrackDTO.LogisticsTrace trace3 = new LogisticsTrackDTO.LogisticsTrace();
        trace3.setTime(LocalDateTime.now().toString());
        trace3.setLocation("目的地");
        trace3.setDescription("快件正在派送中，预计今日送达");
        traces.add(trace3);

        return traces;
    }
}