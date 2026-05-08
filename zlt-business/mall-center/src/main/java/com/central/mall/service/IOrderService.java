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
     * Get user order list (ORDER-03)
     */
    List<MallOrder> getOrderList(Long userId, Integer status);

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
}