package com.central.mall.service;

import java.util.List;
import java.util.Map;

public interface IStockService {

    /**
     * Pre-allocate stock at order time (STOCK-01)
     * Uses Redis DECRBY - if result < 0, rollback and return false
     * @return true if all SKUs have sufficient stock
     */
    boolean preAllocateStock(Long orderId, List<Map<String, Object>> items);

    /**
     * Real stock deduction after payment (STOCK-02)
     * Updates MallGoodsSku.stock in database and writes MallStockLog
     */
    void deductRealStock(Long orderId);

    /**
     * Release pre-allocated stock on cancel/timeout (STOCK-03)
     * Uses Redis INCRBY to restore stock
     */
    void releaseStock(Long orderId);

    /**
     * Manual stock correction by admin (STOCK-05)
     */
    boolean correctStock(Long skuId, Integer change, String operator, String remark);

    /**
     * Get current available stock for a SKU
     */
    Integer getCurrentStock(Long skuId);

    /**
     * Check if stock is below threshold (STOCK-06)
     */
    boolean isBelowThreshold(Long skuId);

    /**
     * Restore stock on refund (REFUND-09)
     * Called only after WeChat refund success callback
     */
    void restoreStockOnRefund(Long orderId);
}