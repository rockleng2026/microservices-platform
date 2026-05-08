package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.mall.config.TenantInterceptor;
import com.central.mall.mapper.MallGoodsMapper;
import com.central.mall.mapper.MallOrderItemMapper;
import com.central.mall.mapper.MallOrderMapper;
import com.central.mall.model.dto.UserListDTO;
import com.central.mall.model.entity.MallGoods;
import com.central.mall.model.entity.MallOrder;
import com.central.mall.model.entity.MallOrderItem;
import com.central.mall.model.vo.UserStatisticsVO;
import com.central.mall.service.IAdminUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements IAdminUserService {

    private final MallOrderMapper orderMapper;
    private final MallOrderItemMapper orderItemMapper;
    private final MallGoodsMapper goodsMapper;

    @Override
    public IPage<UserListDTO> getUserPage(Long page, Long pageSize, String keyword) {
        String tenantId = TenantInterceptor.getCurrentTenantId();

        // Get all orders to aggregate by user
        LambdaQueryWrapper<MallOrder> orderWrapper = new LambdaQueryWrapper<>();
        orderWrapper.eq(MallOrder::getTenantId, tenantId);
        // Only count paid/completed orders for consumption
        orderWrapper.ge(MallOrder::getStatus, 2);
        List<MallOrder> orders = orderMapper.selectList(orderWrapper);

        // Aggregate by userId
        Map<Long, UserListDTO> userStatsMap = new LinkedHashMap<>();
        for (MallOrder order : orders) {
            userStatsMap.computeIfAbsent(order.getUserId(), userId -> {
                UserListDTO dto = new UserListDTO();
                dto.setUserId(userId);
                dto.setOrderCount(0);
                dto.setTotalConsumption(BigDecimal.ZERO);
                return dto;
            });
            UserListDTO dto = userStatsMap.get(order.getUserId());
            dto.setOrderCount(dto.getOrderCount() + 1);
            if (order.getPayAmount() != null) {
                dto.setTotalConsumption(dto.getTotalConsumption().add(order.getPayAmount()));
            }
        }

        // Filter by keyword if provided
        List<UserListDTO> filtered = userStatsMap.values().stream()
                .filter(dto -> {
                    if (keyword == null || keyword.isBlank()) return true;
                    // Filter on userId as string (no access to nickname/phone in this simplified impl)
                    return dto.getUserId().toString().contains(keyword);
                })
                .sorted((a, b) -> b.getTotalConsumption().compareTo(a.getTotalConsumption()))
                .collect(Collectors.toList());

        // Paginate
        long total = filtered.size();
        long start = (page - 1) * pageSize;
        long end = Math.min(start + pageSize, total);
        List<UserListDTO> paged = start < total ? filtered.subList((int) start, (int) end) : List.of();

        IPage<UserListDTO> result = new Page<>(page, pageSize, total);
        result.setRecords(paged);
        return result;
    }

    @Override
    public UserStatisticsVO getUserStatistics(Long userId) {
        String tenantId = TenantInterceptor.getCurrentTenantId();

        // Get all orders for this user
        LambdaQueryWrapper<MallOrder> orderWrapper = new LambdaQueryWrapper<>();
        orderWrapper.eq(MallOrder::getTenantId, tenantId)
                .eq(MallOrder::getUserId, userId);
        List<MallOrder> orders = orderMapper.selectList(orderWrapper);

        UserStatisticsVO vo = new UserStatisticsVO();
        vo.setUserId(userId);

        if (orders.isEmpty()) {
            vo.setOrderCount(0);
            vo.setCompletedOrderCount(0);
            vo.setTotalConsumption(BigDecimal.ZERO);
            vo.setAverageOrderAmount(BigDecimal.ZERO);
            vo.setLastOrderTime(null);
            vo.setFavoriteGoods(List.of());
            return vo;
        }

        // Calculate stats
        int totalOrders = orders.size();
        int completedOrders = (int) orders.stream().filter(o -> o.getStatus() == 4).count();
        BigDecimal totalConsumption = orders.stream()
                .filter(o -> o.getStatus() >= 2)
                .map(MallOrder::getPayAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal avgAmount = totalOrders > 0 ?
                totalConsumption.divide(BigDecimal.valueOf(totalOrders), 2, BigDecimal.ROUND_HALF_UP) :
                BigDecimal.ZERO;
        LocalDateTime lastOrderTime = orders.stream()
                .map(MallOrder::getCreateTime)
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(null);

        vo.setOrderCount(totalOrders);
        vo.setCompletedOrderCount(completedOrders);
        vo.setTotalConsumption(totalConsumption);
        vo.setAverageOrderAmount(avgAmount);
        vo.setLastOrderTime(lastOrderTime);

        // Get favorite goods (top 5 by order count)
        LambdaQueryWrapper<MallOrderItem> itemWrapper = new LambdaQueryWrapper<>();
        itemWrapper.eq(MallOrderItem::getUserId, userId);
        List<MallOrderItem> items = orderItemMapper.selectList(itemWrapper);

        Map<Long, Long> goodsOrderCount = items.stream()
                .collect(Collectors.groupingBy(MallOrderItem::getGoodsId, Collectors.counting()));

        List<String> topGoods = goodsOrderCount.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(5)
                .map(entry -> {
                    MallGoods goods = goodsMapper.selectById(entry.getKey());
                    return goods != null ? goods.getName() : "未知商品";
                })
                .collect(Collectors.toList());

        vo.setFavoriteGoods(topGoods);

        return vo;
    }
}