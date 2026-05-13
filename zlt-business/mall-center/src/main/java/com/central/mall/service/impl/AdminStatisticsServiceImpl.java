package com.central.mall.service.impl;

import com.central.mall.config.TenantInterceptor;
import com.central.mall.mapper.MallGoodsMapper;
import com.central.mall.mapper.MallGoodsSkuMapper;
import com.central.mall.mapper.MallMemberMapper;
import com.central.mall.mapper.MallOrderMapper;
import com.central.mall.mapper.MallSettingsMapper;
import com.central.mall.model.dto.SalesTrendDTO;
import com.central.mall.model.dto.StatisticsDTO;
import com.central.mall.model.dto.StockWarningDTO;
import com.central.mall.model.dto.UserAnalysisDTO;
import com.central.mall.model.entity.MallGoods;
import com.central.mall.model.entity.MallGoodsSku;
import com.central.mall.model.entity.MallMember;
import com.central.mall.model.entity.MallOrder;
import com.central.mall.service.IAdminStatisticsService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RBucket;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

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
    private final MallOrderMapper orderMapper;
    private final MallGoodsSkuMapper goodsSkuMapper;
    private final MallGoodsMapper goodsMapper;
    private final MallMemberMapper memberMapper;
    private final ObjectMapper objectMapper;

    @Override
    public StatisticsDTO getTodayStatistics() {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        String today = LocalDate.now().format(DateTimeFormatter.ISO_DATE);
        String cacheKey = String.format(STATS_CACHE_KEY, tenantId, today);
        log.info("[Statistics] getTodayStatistics called, tenantId={}, cacheKey={}", tenantId, cacheKey);

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
     */
    private StatisticsDTO computeTodayStatistics(String tenantId, String today) {
        StatisticsDTO stats = new StatisticsDTO();

        try {
            // 今日开始时间
            LocalDate todayDate = LocalDate.parse(today);
            LocalDate yesterdayDate = todayDate.minusDays(1);
            LocalDateTime todayStart = todayDate.atStartOfDay();
            LocalDateTime todayEnd = todayDate.plusDays(1).atStartOfDay();
            LocalDateTime yesterdayStart = yesterdayDate.atStartOfDay();

            // 今日订单统计 (status >= 2 已付款/已发货/已完成)
            LambdaQueryWrapper<MallOrder> todayWrapper = new LambdaQueryWrapper<>();
            todayWrapper.eq(MallOrder::getTenantId, tenantId);
            todayWrapper.ge(MallOrder::getStatus, 2);
            todayWrapper.between(MallOrder::getCreateTime, todayStart, todayEnd);
            List<MallOrder> todayOrders = orderMapper.selectList(todayWrapper);
            long todayOrderCount = todayOrders.size();
            BigDecimal todaySalesAmount = todayOrders.stream()
                    .map(MallOrder::getPayAmount)
                    .filter(p -> p != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // 昨日订单统计
            LambdaQueryWrapper<MallOrder> yesterdayWrapper = new LambdaQueryWrapper<>();
            yesterdayWrapper.eq(MallOrder::getTenantId, tenantId);
            yesterdayWrapper.ge(MallOrder::getStatus, 2);
            yesterdayWrapper.between(MallOrder::getCreateTime, yesterdayStart, todayStart);
            List<MallOrder> yesterdayOrders = orderMapper.selectList(yesterdayWrapper);
            long yesterdayOrderCount = yesterdayOrders.size();
            BigDecimal yesterdaySalesAmount = yesterdayOrders.stream()
                    .map(MallOrder::getPayAmount)
                    .filter(p -> p != null)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // 待发货数 (status = 2)
            LambdaQueryWrapper<MallOrder> deliveryWrapper = new LambdaQueryWrapper<>();
            deliveryWrapper.eq(MallOrder::getTenantId, tenantId);
            deliveryWrapper.eq(MallOrder::getStatus, 2);
            long waitDeliveryCount = orderMapper.selectCount(deliveryWrapper);

            // 平均订单金额
            BigDecimal avgOrderAmount = todayOrderCount > 0
                    ? todaySalesAmount.divide(BigDecimal.valueOf(todayOrderCount), 2, java.math.RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            stats.setTodayOrderCount((int) todayOrderCount);
            stats.setTodaySalesAmount(todaySalesAmount);
            stats.setWaitDeliveryCount((int) waitDeliveryCount);
            // 今日新增会员数
            LocalDateTime todayStartForStats = LocalDate.now().atStartOfDay();
            LambdaQueryWrapper<MallMember> todayMemberWrapper = new LambdaQueryWrapper<>();
            todayMemberWrapper.eq(MallMember::getTenantId, tenantId);
            todayMemberWrapper.ge(MallMember::getCreateTime, todayStartForStats);
            long todayNewUsers = memberMapper.selectCount(todayMemberWrapper);
            stats.setTodayNewUsers((int) todayNewUsers);
            stats.setYesterdayOrderCount((int) yesterdayOrderCount);
            stats.setYesterdaySalesAmount(yesterdaySalesAmount);
            stats.setTotalPv(0L); // PV统计尚未实现
            stats.setAvgOrderAmount(avgOrderAmount);
        } catch (Exception e) {
            log.error("Error computing today's statistics: {}", e.getMessage(), e);
            return createEmptyStatistics();
        }

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

    @Override
    public List<SalesTrendDTO> getSalesTrend(String type, String startDate, String endDate) {
        List<SalesTrendDTO> trends = new ArrayList<>();
        try {
            String tenantId = TenantInterceptor.getCurrentTenantId();
            log.info("[Statistics] getSalesTrend called, tenantId={}, type={}, startDate={}, endDate={}",
                    tenantId, type, startDate, endDate);

            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);

            // 查询日期范围内的已支付订单
            LambdaQueryWrapper<MallOrder> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(MallOrder::getTenantId, tenantId);
            wrapper.ge(MallOrder::getStatus, 2);
            wrapper.between(MallOrder::getCreateTime, start.atStartOfDay(), end.plusDays(1).atStartOfDay());
            List<MallOrder> orders = orderMapper.selectList(wrapper);

            // 按日期分组统计
            final DateTimeFormatter finalFormatter;
            if ("month".equals(type)) {
                finalFormatter = DateTimeFormatter.ofPattern("yyyy-MM");
            } else if ("week".equals(type)) {
                finalFormatter = DateTimeFormatter.ofPattern("yyyy-'W'ww");
            } else {
                finalFormatter = DateTimeFormatter.ISO_DATE;
            }

            java.util.Map<String, List<MallOrder>> byDate = orders.stream()
                    .collect(java.util.stream.Collectors.groupingBy(
                            o -> o.getCreateTime().format(finalFormatter)
                    ));

            for (java.util.Map.Entry<String, List<MallOrder>> entry : byDate.entrySet()) {
                SalesTrendDTO dto = new SalesTrendDTO();
                dto.setDate(entry.getKey());
                dto.setOrderCount(entry.getValue().size());
                BigDecimal salesAmount = entry.getValue().stream()
                        .map(MallOrder::getPayAmount)
                        .filter(p -> p != null)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                dto.setSalesAmount(salesAmount);
                dto.setUserCount((int) entry.getValue().stream().map(MallOrder::getUserId).distinct().count());
                trends.add(dto);
            }

            // 按日期排序
            trends.sort((a, b) -> a.getDate().compareTo(b.getDate()));
        } catch (Exception e) {
            log.error("Error getting sales trend: {}", e.getMessage(), e);
        }
        return trends;
    }

    @Override
    public List<StockWarningDTO> getStockWarningList() {
        List<StockWarningDTO> warnings = new ArrayList<>();
        try {
            // 预警阈值默认10
            LambdaQueryWrapper<MallGoodsSku> wrapper = new LambdaQueryWrapper<>();
            wrapper.le(MallGoodsSku::getStock, 10);
            wrapper.eq(MallGoodsSku::getStatus, 1);
            List<MallGoodsSku> lowStockSkus = goodsSkuMapper.selectList(wrapper);

            for (MallGoodsSku sku : lowStockSkus) {
                StockWarningDTO dto = new StockWarningDTO();
                dto.setSkuName(sku.getSkuCode());
                dto.setGoodsId(sku.getGoodsId());
                dto.setRealStock(sku.getStock());
                dto.setWarningStock(10);
                dto.setGoodsName(sku.getSkuCode()); // 实际应关联goods表获取名称
                warnings.add(dto);
            }
        } catch (Exception e) {
            log.error("Error getting stock warning list: {}", e.getMessage(), e);
        }
        return warnings;
    }

    @Override
    public UserAnalysisDTO getUserAnalysis() {
        UserAnalysisDTO dto = new UserAnalysisDTO();
        String tenantId = TenantInterceptor.getCurrentTenantId();
        log.info("[Statistics] getUserAnalysis called, tenantId={}", tenantId);

        try {
            LocalDate today = LocalDate.now();
            LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
            LocalDate monthStart = today.withDayOfMonth(1);

            LocalDateTime todayStart = today.atStartOfDay();
            LocalDateTime weekStartDateTime = weekStart.atStartOfDay();
            LocalDateTime monthStartDateTime = monthStart.atStartOfDay();

            // 今日新增会员
            LambdaQueryWrapper<MallMember> todayWrapper = new LambdaQueryWrapper<>();
            todayWrapper.eq(MallMember::getTenantId, tenantId);
            todayWrapper.ge(MallMember::getCreateTime, todayStart);
            long todayNewUsers = memberMapper.selectCount(todayWrapper);
            dto.setTodayNewUsers((int) todayNewUsers);

            // 本周新增会员
            LambdaQueryWrapper<MallMember> weekWrapper = new LambdaQueryWrapper<>();
            weekWrapper.eq(MallMember::getTenantId, tenantId);
            weekWrapper.ge(MallMember::getCreateTime, weekStartDateTime);
            long weekNewUsers = memberMapper.selectCount(weekWrapper);
            dto.setWeekNewUsers((int) weekNewUsers);

            // 本月新增会员
            LambdaQueryWrapper<MallMember> monthWrapper = new LambdaQueryWrapper<>();
            monthWrapper.eq(MallMember::getTenantId, tenantId);
            monthWrapper.ge(MallMember::getCreateTime, monthStartDateTime);
            long monthNewUsers = memberMapper.selectCount(monthWrapper);
            dto.setMonthNewUsers((int) monthNewUsers);

            // 活跃用户：当月有有效订单（已付款/已发货/已完成）的用户数
            LambdaQueryWrapper<MallOrder> activeWrapper = new LambdaQueryWrapper<>();
            activeWrapper.eq(MallOrder::getTenantId, tenantId);
            activeWrapper.ge(MallOrder::getStatus, 2); // status >= 2 已付款/已发货/已完成
            activeWrapper.ge(MallOrder::getCreateTime, monthStartDateTime);
            activeWrapper.select(MallOrder::getUserId);
            List<MallOrder> activeOrders = orderMapper.selectList(activeWrapper);
            long activeUsers = activeOrders.stream()
                    .map(MallOrder::getUserId)
                    .distinct()
                    .count();
            dto.setActiveUsers((int) activeUsers);

            log.info("[Statistics] getUserAnalysis result: todayNew={}, weekNew={}, monthNew={}, active={}",
                    todayNewUsers, weekNewUsers, monthNewUsers, activeUsers);

        } catch (Exception e) {
            log.error("Error getting user analysis: {}", e.getMessage(), e);
        }

        return dto;
    }
}
