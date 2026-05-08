package com.central.mall.service.impl;

import com.central.mall.config.TenantInterceptor;
import com.central.mall.mapper.MallSettingsMapper;
import com.central.mall.model.dto.StatisticsDTO;
import com.central.mall.service.IAdminStatisticsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RBucket;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * 管理员统计服务实现
 * D-05: Redis缓存5分钟TTL
 * 注意: Phase 2阶段 mall_order 表尚未创建，返回mock数据，结构已准备好Phase 3集成
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminStatisticsServiceImpl implements IAdminStatisticsService {

    /**
     * 统计缓存key格式
     */
    private static final String STATS_CACHE_KEY = "stats:daily:%s:%s";

    /**
     * 缓存TTL: 5分钟
     */
    private static final long CACHE_TTL_SECONDS = 300;

    private final RedissonClient redissonClient;
    private final MallSettingsMapper settingsMapper;
    private final ObjectMapper objectMapper;

    @Override
    public StatisticsDTO getTodayStatistics() {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        String today = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
        String cacheKey = String.format(STATS_CACHE_KEY, tenantId, today);

        try {
            // 尝试从Redis获取缓存
            RBucket<String> bucket = redissonClient.getBucket(cacheKey);
            String cachedJson = bucket.get();

            if (cachedJson != null && !cachedJson.isEmpty()) {
                log.debug("Statistics cache hit for key: {}", cacheKey);
                return objectMapper.readValue(cachedJson, StatisticsDTO.class);
            }

            // 缓存miss，计算统计
            log.debug("Statistics cache miss for key: {}, computing...", cacheKey);
            StatisticsDTO stats = computeTodayStatistics(tenantId, today);

            // 存入缓存
            String statsJson = objectMapper.writeValueAsString(stats);
            bucket.set(statsJson, java.time.Duration.ofSeconds(CACHE_TTL_SECONDS));
            log.debug("Statistics cached with TTL {} seconds", CACHE_TTL_SECONDS);

            return stats;
        } catch (Exception e) {
            log.error("Error getting statistics: {}", e.getMessage(), e);
            // 降级: 返回空统计数据
            return createEmptyStatistics();
        }
    }

    /**
     * 计算今日统计数据
     * Phase 2: mall_order 表尚未创建，返回mock数据
     * Phase 3: 实际查询 mall_order 表计算
     */
    private StatisticsDTO computeTodayStatistics(String tenantId, String today) {
        // TODO: Phase 3 实现实际统计查询
        // 从 mall_order 表查询今日订单、销售额等
        // 目前返回mock数据，结构已准备好Phase 3集成

        StatisticsDTO stats = new StatisticsDTO();
        stats.setTodayOrderCount(0);
        stats.setTodaySalesAmount(BigDecimal.ZERO);
        stats.setWaitDeliveryCount(0);
        stats.setTodayNewUsers(0);
        stats.setYesterdayOrderCount(0);
        stats.setYesterdaySalesAmount(BigDecimal.ZERO);
        stats.setTotalPv(0L);
        stats.setAvgOrderAmount(BigDecimal.ZERO);

        return stats;
    }

    /**
     * 创建空统计数据（降级用）
     */
    private StatisticsDTO createEmptyStatistics() {
        StatisticsDTO stats = new StatisticsDTO();
        stats.setTodayOrderCount(0);
        stats.setTodaySalesAmount(BigDecimal.ZERO);
        stats.setWaitDeliveryCount(0);
        stats.setTodayNewUsers(0);
        stats.setYesterdayOrderCount(0);
        stats.setYesterdaySalesAmount(BigDecimal.ZERO);
        stats.setTotalPv(0L);
        stats.setAvgOrderAmount(BigDecimal.ZERO);
        return stats;
    }
}
