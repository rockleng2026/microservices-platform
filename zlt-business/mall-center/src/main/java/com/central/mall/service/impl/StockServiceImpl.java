package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.central.mall.config.TenantInterceptor;
import com.central.mall.mapper.MallGoodsSkuMapper;
import com.central.mall.mapper.MallStockLogMapper;
import com.central.mall.model.entity.MallGoodsSku;
import com.central.mall.model.entity.MallStockLog;
import com.central.mall.service.IStockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class StockServiceImpl implements IStockService {

    private static final String SKU_STOCK_KEY_PREFIX = "sku:stock:";
    private static final String ORDER_STOCK_LOCK_PREFIX = "order:stock:lock:";

    private final StringRedisTemplate redisTemplate;
    private final MallGoodsSkuMapper skuMapper;
    private final MallStockLogMapper stockLogMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean preAllocateStock(Long orderId, List<Map<String, Object>> items) {
        String tenantId = TenantInterceptor.getCurrentTenantId();

        for (Map<String, Object> item : items) {
            Long skuId = Long.valueOf(item.get("skuId").toString());
            Integer quantity = Integer.valueOf(item.get("quantity").toString());

            // Check unlimited stock (-1)
            Integer currentStock = getCurrentStock(skuId);
            if (currentStock != null && currentStock == -1) {
                // Unlimited stock - skip pre-allocation
                continue;
            }

            // Atomic decrement
            String stockKey = SKU_STOCK_KEY_PREFIX + skuId;
            Long stockAfterDecr = redisTemplate.opsForValue().decrement(stockKey, quantity);

            if (stockAfterDecr != null && stockAfterDecr < 0) {
                // Rollback the decrement
                redisTemplate.opsForValue().increment(stockKey, quantity);
                log.warn("Stock insufficient for SKU {}: requested {}, available before: {}",
                        skuId, quantity, stockAfterDecr + quantity);
                return false;
            }

            // Record pre-allocation in Redis hash
            String lockKey = ORDER_STOCK_LOCK_PREFIX + orderId;
            redisTemplate.opsForHash().put(lockKey, skuId.toString(), quantity.toString());

            // Write stock log
            MallStockLog stockLog = new MallStockLog();
            stockLog.setTenantId(tenantId);
            stockLog.setSkuId(skuId);
            stockLog.setOrderId(orderId);
            stockLog.setChange(-quantity);
            stockLog.setStockBefore(currentStock != null ? currentStock : 0);
            stockLog.setStockAfter(stockAfterDecr != null ? stockAfterDecr.intValue() : 0);
            stockLog.setOperationType(1); // 1=pre-allocate
            stockLog.setCreateTime(LocalDateTime.now());
            stockLogMapper.insert(stockLog);
        }

        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deductRealStock(Long orderId) {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        String lockKey = ORDER_STOCK_LOCK_PREFIX + orderId;

        // Get all pre-allocated items from Redis
        Map<Object, Object> lockedItems = redisTemplate.opsForHash().entries(lockKey);
        if (lockedItems == null || lockedItems.isEmpty()) {
            log.warn("No pre-allocated stock found for order {}", orderId);
            return;
        }

        for (Map.Entry<Object, Object> entry : lockedItems.entrySet()) {
            Long skuId = Long.valueOf(entry.getKey().toString());
            Integer quantity = Integer.valueOf(entry.getValue().toString());

            // Real database deduction
            MallGoodsSku sku = skuMapper.selectById(skuId);
            if (sku != null) {
                int newStock = sku.getStock() - quantity;
                sku.setStock(newStock);
                skuMapper.updateById(sku);

                // Write stock log with operationType=2 (real deduction)
                MallStockLog stockLog = new MallStockLog();
                stockLog.setTenantId(tenantId);
                stockLog.setSkuId(skuId);
                stockLog.setOrderId(orderId);
                stockLog.setChange(-quantity);
                stockLog.setStockBefore(sku.getStock() + quantity);
                stockLog.setStockAfter(newStock);
                stockLog.setOperationType(2); // 2=real deduction
                stockLog.setCreateTime(LocalDateTime.now());
                stockLogMapper.insert(stockLog);

                // Sync Redis stock value to match database
                redisTemplate.opsForValue().set(SKU_STOCK_KEY_PREFIX + skuId, String.valueOf(newStock));
            }
        }

        // Delete the pre-allocation lock
        redisTemplate.delete(lockKey);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void releaseStock(Long orderId) {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        String lockKey = ORDER_STOCK_LOCK_PREFIX + orderId;

        // Get all pre-allocated items from Redis
        Map<Object, Object> lockedItems = redisTemplate.opsForHash().entries(lockKey);
        if (lockedItems == null || lockedItems.isEmpty()) {
            log.warn("No pre-allocated stock found for order {}", orderId);
            return;
        }

        for (Map.Entry<Object, Object> entry : lockedItems.entrySet()) {
            Long skuId = Long.valueOf(entry.getKey().toString());
            Integer quantity = Integer.valueOf(entry.getValue().toString());

            // Restore stock via Redis INCRBY
            String stockKey = SKU_STOCK_KEY_PREFIX + skuId;
            Long stockAfterIncr = redisTemplate.opsForValue().increment(stockKey, quantity);

            // Get current stock before release for log
            Integer stockBefore = stockAfterIncr != null ? (int) (stockAfterIncr - quantity) : 0;

            // Write stock log with operationType=3 (release)
            MallStockLog stockLog = new MallStockLog();
            stockLog.setTenantId(tenantId);
            stockLog.setSkuId(skuId);
            stockLog.setOrderId(orderId);
            stockLog.setChange(quantity);
            stockLog.setStockBefore(stockBefore);
            stockLog.setStockAfter(stockAfterIncr != null ? stockAfterIncr.intValue() : 0);
            stockLog.setOperationType(3); // 3=release/rollback
            stockLog.setCreateTime(LocalDateTime.now());
            stockLogMapper.insert(stockLog);
        }

        // Delete the pre-allocation lock
        redisTemplate.delete(lockKey);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean correctStock(Long skuId, Integer change, String operator, String remark) {
        String tenantId = TenantInterceptor.getCurrentTenantId();

        MallGoodsSku sku = skuMapper.selectById(skuId);
        if (sku == null) {
            return false;
        }

        int stockBefore = sku.getStock();
        int stockAfter = stockBefore + change;

        // Update database
        sku.setStock(stockAfter);
        skuMapper.updateById(sku);

        // Sync to Redis
        redisTemplate.opsForValue().set(SKU_STOCK_KEY_PREFIX + skuId, String.valueOf(stockAfter));

        // Write stock log with operationType=4 (manual correction)
        MallStockLog stockLog = new MallStockLog();
        stockLog.setTenantId(tenantId);
        stockLog.setSkuId(skuId);
        stockLog.setOrderId(null); // Manual correction has no order
        stockLog.setChange(change);
        stockLog.setStockBefore(stockBefore);
        stockLog.setStockAfter(stockAfter);
        stockLog.setOperationType(4); // 4=manual correction
        stockLog.setOperator(operator);
        stockLog.setRemark(remark);
        stockLog.setCreateTime(LocalDateTime.now());
        stockLogMapper.insert(stockLog);

        return true;
    }

    @Override
    public Integer getCurrentStock(Long skuId) {
        String stockKey = SKU_STOCK_KEY_PREFIX + skuId;
        String stockValue = redisTemplate.opsForValue().get(stockKey);

        if (stockValue == null) {
            // Initialize from database
            MallGoodsSku sku = skuMapper.selectById(skuId);
            if (sku != null) {
                redisTemplate.opsForValue().set(stockKey, String.valueOf(sku.getStock()));
                return sku.getStock();
            }
            return null;
        }

        return Integer.valueOf(stockValue);
    }

    @Override
    public boolean isBelowThreshold(Long skuId) {
        Integer currentStock = getCurrentStock(skuId);
        if (currentStock == null || currentStock == -1) {
            return false; // Unlimited stock is never below threshold
        }
        // Threshold can be configured, default to 10
        return currentStock < 10;
    }
}