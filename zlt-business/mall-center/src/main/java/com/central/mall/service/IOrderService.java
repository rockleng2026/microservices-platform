package com.central.mall.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.mall.model.dto.CreateOrderDTO;
import com.central.mall.model.entity.MallOrder;

import java.util.List;
import java.util.Map;

public interface IOrderService extends IService<MallOrder> {

    /**
     * Create order from cart items or direct buy (ORDER-01, ORDER-02)
     * 1. Validates address (required for physical goods)
     * 2. Calls StockService.preAllocateStock
     * 3. Creates MallOrder record (status=1 pending pay)
     * 4. Creates MallOrderItem records
     * Returns orderId
     */
    Long createOrder(Long userId, CreateOrderDTO dto);

    /**
     * Get user order list with items (ORDER-03)
     * Returns list of maps, each containing order info plus associated items
     */
    List<Map<String, Object>> getOrderList(Long userId, Integer status);

    /**
     * Get order detail with items and delivery info (ORDER-04)
     */
    Map<String, Object> getOrderDetail(Long orderId, Long userId);

    /**
     * Cancel order - only pending pay status (ORDER-05)
     */
    boolean cancelOrder(Long orderId, Long userId);

    /**
     * Confirm receipt (ORDER-06)
     */
    boolean confirmReceipt(Long orderId, Long userId);

    /**
     * Admin: ship order (ORDER-08)
     */
    boolean shipOrder(Long orderId, String expressCode, String expressName, String waybillNo);

    /**
     * Update order status after payment (PAY-03, ORDER-09)
     * For virtual goods: directly set status=4 and generate delivery record
     */
    boolean updateOrderPaid(Long orderId);

    /**
     * Handle order timeout (STOCK-03)
     */
    void handleOrderTimeout(Long orderId);

    /**
     * Admin: close shipped order (ORDER-EXT-01)
     * Only status=3 (shipped) orders can be closed. No refund, no stock return.
     */
    boolean adminCloseOrder(Long orderId, String reason);

    /**
     * Admin: adjust order amount (ORDER-EXT-02)
     * Only status in (1,2) and adjustAmount <= 0. newPayAmount must be >= 0 and <= totalAmount.
     */
    boolean adjustOrderAmount(Long orderId, java.math.BigDecimal adjustAmount, String reason);

    /**
     * User: update order remark (ORDER-EXT-03)
     */
    boolean updateUserRemark(Long orderId, Long userId, String remark);

    /**
     * Admin: update admin remark (ORDER-EXT-03)
     */
    boolean updateAdminRemark(Long orderId, String remark);
}