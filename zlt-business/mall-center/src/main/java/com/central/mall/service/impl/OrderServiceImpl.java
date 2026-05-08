package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.mall.config.TenantInterceptor;
import com.central.mall.mapper.*;
import com.central.mall.model.dto.CreateOrderDTO;
import com.central.mall.model.entity.*;
import com.central.mall.service.IOrderService;
import com.central.mall.service.IStockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderServiceImpl extends ServiceImpl<MallOrderMapper, MallOrder> implements IOrderService {

    private final IStockService stockService;
    private final StringRedisTemplate redisTemplate;
    private final MallOrderItemMapper orderItemMapper;
    private final MallGoodsMapper goodsMapper;
    private final MallGoodsSkuMapper skuMapper;
    private final MallCartMapper cartMapper;
    private final MallUserAddressMapper addressMapper;
    private final MallDeliveryMapper deliveryMapper;
    private final MallResourceDeliveryMapper resourceDeliveryMapper;

    /**
     * Stub: get current user ID from auth context
     * TODO: integrate with zlt-uaa auth system
     */
    private Long getCurrentUserId() {
        return 1L;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long createOrder(Long userId, CreateOrderDTO dto) {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        if (tenantId == null) tenantId = "default";

        // Validate address required for physical goods
        if (dto.getGoodsType() != null && dto.getGoodsType() == 1 && dto.getAddressId() == null) {
            throw new RuntimeException("Physical goods require shipping address");
        }

        // Collect items and calculate total
        List<Map<String, Object>> orderItems = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        if (dto.getCartItemIds() != null && !dto.getCartItemIds().isEmpty()) {
            // From cart purchase
            for (Long cartId : dto.getCartItemIds()) {
                MallCart cart = cartMapper.selectById(cartId);
                if (cart == null || !cart.getUserId().equals(userId)) {
                    continue;
                }

                MallGoodsSku sku = skuMapper.selectById(cart.getSkuId());
                if (sku == null) {
                    throw new RuntimeException("SKU not found: " + cart.getSkuId());
                }

                Map<String, Object> item = new HashMap<>();
                item.put("skuId", cart.getSkuId());
                item.put("goodsId", cart.getGoodsId());
                item.put("quantity", cart.getQuantity());
                item.put("price", sku.getPrice());
                item.put("goodsName", goodsMapper.selectById(cart.getGoodsId()).getName());
                item.put("goodsImage", goodsMapper.selectById(cart.getGoodsId()).getMainImage());
                item.put("skuSpecs", sku.getSpecs());
                orderItems.add(item);

                totalAmount = totalAmount.add(sku.getPrice().multiply(new BigDecimal(cart.getQuantity())));
            }
        } else if (dto.getItems() != null && !dto.getItems().isEmpty()) {
            // Direct purchase
            for (CreateOrderDTO.DirectBuyItemDTO directItem : dto.getItems()) {
                MallGoodsSku sku = skuMapper.selectById(directItem.getSkuId());
                if (sku == null) {
                    throw new RuntimeException("SKU not found: " + directItem.getSkuId());
                }

                MallGoods goods = goodsMapper.selectById(sku.getGoodsId());

                Map<String, Object> item = new HashMap<>();
                item.put("skuId", directItem.getSkuId());
                item.put("goodsId", goods.getId());
                item.put("quantity", directItem.getQuantity());
                item.put("price", sku.getPrice());
                item.put("goodsName", goods.getName());
                item.put("goodsImage", goods.getMainImage());
                item.put("skuSpecs", sku.getSpecs());
                orderItems.add(item);

                totalAmount = totalAmount.add(sku.getPrice().multiply(new BigDecimal(directItem.getQuantity())));
            }
        } else {
            throw new RuntimeException("No items provided for order");
        }

        // Build stock items for pre-allocation
        List<Map<String, Object>> stockItems = new ArrayList<>();
        for (Map<String, Object> item : orderItems) {
            Map<String, Object> stockItem = new HashMap<>();
            stockItem.put("skuId", item.get("skuId"));
            stockItem.put("quantity", item.get("quantity"));
            stockItems.add(stockItem);
        }

        // Create order first with a placeholder orderNo (we'll generate real one after getting ID)
        MallOrder order = new MallOrder();
        order.setTenantId(tenantId);
        order.setUserId(userId);
        order.setOrderNo("PENDING_" + System.currentTimeMillis()); // placeholder
        order.setAddressId(dto.getAddressId());
        order.setGoodsType(dto.getGoodsType());
        order.setTotalAmount(totalAmount);
        order.setFreightAmount(BigDecimal.ZERO);
        order.setPayAmount(totalAmount);
        order.setStatus(1); // 1=pending pay
        order.setRemark(dto.getRemark());
        order.setDelFlag(0);
        order.setCreateTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());

        // Save order first to get real orderId
        baseMapper.insert(order);
        Long orderId = order.getId();

        // Now generate the real orderNo and update
        String realOrderNo = generateOrderNo(orderId);
        order.setOrderNo(realOrderNo);
        baseMapper.updateById(order);

        // Pre-allocate stock using real orderId
        boolean stockAllocated = stockService.preAllocateStock(orderId, stockItems);
        if (!stockAllocated) {
            // Rollback: delete order and throw
            baseMapper.deleteById(orderId);
            throw new RuntimeException("Insufficient stock for one or more items");
        }

        // Create order items
        for (Map<String, Object> item : orderItems) {
            MallOrderItem orderItem = new MallOrderItem();
            orderItem.setTenantId(tenantId);
            orderItem.setOrderId(orderId);
            orderItem.setUserId(userId);
            orderItem.setSkuId(Long.valueOf(item.get("skuId").toString()));
            orderItem.setGoodsId(Long.valueOf(item.get("goodsId").toString()));
            orderItem.setGoodsName((String) item.get("goodsName"));
            orderItem.setSkuSpecs((String) item.get("skuSpecs"));
            orderItem.setGoodsImage((String) item.get("goodsImage"));
            orderItem.setPrice((BigDecimal) item.get("price"));
            orderItem.setQuantity(Integer.valueOf(item.get("quantity").toString()));
            orderItem.setSubtotal(((BigDecimal) item.get("price")).multiply(new BigDecimal(item.get("quantity").toString())));
            orderItem.setCreateTime(LocalDateTime.now());
            orderItem.setUpdateTime(LocalDateTime.now());
            orderItemMapper.insert(orderItem);
        }

        // Clear cart items if from cart purchase
        if (dto.getCartItemIds() != null && !dto.getCartItemIds().isEmpty()) {
            cartMapper.deleteBatchIds(dto.getCartItemIds());
        }

        return orderId;
    }

    @Override
    public List<MallOrder> getOrderList(Long userId, Integer status) {
        LambdaQueryWrapper<MallOrder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallOrder::getUserId, userId);
        wrapper.eq(MallOrder::getDelFlag, 0);
        if (status != null) {
            wrapper.eq(MallOrder::getStatus, status);
        }
        wrapper.orderByDesc(MallOrder::getCreateTime);
        return baseMapper.selectList(wrapper);
    }

    @Override
    public Map<String, Object> getOrderDetail(Long orderId, Long userId) {
        MallOrder order = baseMapper.selectById(orderId);
        if (order == null || (userId != null && !order.getUserId().equals(userId))) {
            throw new RuntimeException("Order not found");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("order", order);

        // Get order items
        LambdaQueryWrapper<MallOrderItem> itemWrapper = new LambdaQueryWrapper<>();
        itemWrapper.eq(MallOrderItem::getOrderId, orderId);
        List<MallOrderItem> items = orderItemMapper.selectList(itemWrapper);
        result.put("items", items);

        // Get delivery info
        LambdaQueryWrapper<MallDelivery> deliveryWrapper = new LambdaQueryWrapper<>();
        deliveryWrapper.eq(MallDelivery::getOrderId, orderId);
        MallDelivery delivery = deliveryMapper.selectOne(deliveryWrapper);
        result.put("delivery", delivery);

        // Get address if physical goods
        if (order.getAddressId() != null) {
            MallUserAddress address = addressMapper.selectById(order.getAddressId());
            result.put("address", address);
        }

        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean cancelOrder(Long orderId, Long userId) {
        MallOrder order = baseMapper.selectById(orderId);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new RuntimeException("Order not found");
        }
        if (order.getStatus() != 1) {
            throw new RuntimeException("Only pending pay orders can be cancelled");
        }

        // Release pre-allocated stock
        stockService.releaseStock(orderId);

        // Update order status
        order.setStatus(5); // 5=cancelled
        order.setUpdateTime(LocalDateTime.now());
        baseMapper.updateById(order);

        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean confirmReceipt(Long orderId, Long userId) {
        MallOrder order = baseMapper.selectById(orderId);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new RuntimeException("Order not found");
        }
        if (order.getStatus() != 3) { // 3=shipped
            throw new RuntimeException("Only shipped orders can be confirmed");
        }

        order.setStatus(4); // 4=completed
        order.setCompleteTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        baseMapper.updateById(order);

        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean shipOrder(Long orderId, String expressCode, String expressName, String waybillNo) {
        MallOrder order = baseMapper.selectById(orderId);
        if (order == null) {
            throw new RuntimeException("Order not found");
        }
        if (order.getStatus() != 2) { // 2=paid
            throw new RuntimeException("Only paid orders can be shipped");
        }

        // Create delivery record
        MallDelivery delivery = new MallDelivery();
        delivery.setTenantId(order.getTenantId());
        delivery.setOrderId(orderId);
        delivery.setExpressCode(expressCode);
        delivery.setExpressName(expressName);
        delivery.setWaybillNo(waybillNo);
        delivery.setShipTime(LocalDateTime.now());
        delivery.setCreateTime(LocalDateTime.now());
        delivery.setUpdateTime(LocalDateTime.now());
        deliveryMapper.insert(delivery);

        // Update order status
        order.setStatus(3); // 3=shipped
        order.setShipTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        baseMapper.updateById(order);

        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateOrderPaid(Long orderId) {
        MallOrder order = baseMapper.selectById(orderId);
        if (order == null) {
            throw new RuntimeException("Order not found");
        }
        if (order.getStatus() != 1) {
            // Idempotency: already processed
            return true;
        }

        // Update order status to paid
        order.setStatus(2); // 2=paid
        order.setPayTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        baseMapper.updateById(order);

        // Deduct real stock
        stockService.deductRealStock(orderId);

        // For virtual goods: auto complete and generate delivery record
        if (order.getGoodsType() != null && order.getGoodsType() == 2) {
            order.setStatus(4); // 4=completed
            order.setCompleteTime(LocalDateTime.now());
            baseMapper.updateById(order);

            // Generate delivery record
            LambdaQueryWrapper<MallOrderItem> itemWrapper = new LambdaQueryWrapper<>();
            itemWrapper.eq(MallOrderItem::getOrderId, orderId);
            List<MallOrderItem> items = orderItemMapper.selectList(itemWrapper);

            for (MallOrderItem item : items) {
                MallResourceDelivery resourceDelivery = new MallResourceDelivery();
                resourceDelivery.setTenantId(order.getTenantId());
                resourceDelivery.setOrderId(orderId);
                resourceDelivery.setOrderItemId(item.getId());
                resourceDelivery.setGoodsId(item.getGoodsId());
                resourceDelivery.setSkuId(item.getSkuId());
                resourceDelivery.setUserId(order.getUserId());
                // resourceUrl, fileId, token would be populated from goods virtualUrl/virtualFileId
                resourceDelivery.setDeliverTime(LocalDateTime.now());
                // expireTime from goods virtualExpire
                resourceDelivery.setDownloadCount(0);
                resourceDelivery.setCreateTime(LocalDateTime.now());
                resourceDeliveryMapper.insert(resourceDelivery);
            }
        }

        return true;
    }

    @Override
    public void handleOrderTimeout(Long orderId) {
        MallOrder order = baseMapper.selectById(orderId);
        if (order != null && order.getStatus() == 1) {
            // Check if order is older than 30 minutes
            if (order.getCreateTime().plusMinutes(30).isBefore(LocalDateTime.now())) {
                cancelOrder(orderId, order.getUserId());
            }
        }
    }

    private String generateOrderNo(Long orderId) {
        return "ORD" + String.format("%013d", orderId) + String.format("%03d", new Random().nextInt(1000));
    }

    private static final String ORDER_CLOSE_LOCK_PREFIX = "order:close:";

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean adminCloseOrder(Long orderId, String reason) {
        String lockKey = ORDER_CLOSE_LOCK_PREFIX + orderId;
        Boolean lockAcquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "1", java.time.Duration.ofMinutes(5));
        if (lockAcquired == null || !lockAcquired) {
            throw new RuntimeException("Order is being processed, please try again later");
        }
        try {
            MallOrder order = baseMapper.selectById(orderId);
            if (order == null) {
                throw new RuntimeException("Order not found");
            }
            // Only status=3 (shipped) can be closed
            if (!Integer.valueOf(3).equals(order.getStatus())) {
                throw new RuntimeException("Only shipped orders (status=3) can be closed");
            }
            order.setStatus(MallOrder.STATUS_CLOSED);
            order.setUpdateTime(LocalDateTime.now());
            baseMapper.updateById(order);
            log.info("Admin closed order {} with reason: {}", orderId, reason);
            return true;
        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean adjustOrderAmount(Long orderId, java.math.BigDecimal adjustAmount, String reason) {
        if (adjustAmount == null || adjustAmount.compareTo(java.math.BigDecimal.ZERO) > 0) {
            throw new RuntimeException("Adjust amount must be negative");
        }
        String lockKey = ORDER_CLOSE_LOCK_PREFIX + orderId;
        Boolean lockAcquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "1", java.time.Duration.ofMinutes(5));
        if (lockAcquired == null || !lockAcquired) {
            throw new RuntimeException("Order is being processed, please try again later");
        }
        try {
            MallOrder order = baseMapper.selectById(orderId);
            if (order == null) {
                throw new RuntimeException("Order not found");
            }
            // Only status in (1,2) can be adjusted
            if (!Integer.valueOf(1).equals(order.getStatus()) && !Integer.valueOf(2).equals(order.getStatus())) {
                throw new RuntimeException("Only pending pay (1) or paid (2) orders can be adjusted");
            }
            java.math.BigDecimal newPayAmount = order.getPayAmount().add(adjustAmount);
            if (newPayAmount.compareTo(java.math.BigDecimal.ZERO) < 0) {
                throw new RuntimeException("Pay amount cannot be negative");
            }
            if (newPayAmount.compareTo(order.getTotalAmount()) > 0) {
                throw new RuntimeException("Pay amount cannot exceed total amount");
            }
            order.setPayAmount(newPayAmount);
            order.setUpdateTime(LocalDateTime.now());
            baseMapper.updateById(order);
            log.info("Admin adjusted order {} amount by {} from {} to {}, reason: {}",
                    orderId, adjustAmount, order.getPayAmount().subtract(adjustAmount), newPayAmount, reason);
            return true;
        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateUserRemark(Long orderId, Long userId, String remark) {
        MallOrder order = baseMapper.selectById(orderId);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new RuntimeException("Order not found");
        }
        order.setRemark(remark);
        order.setUpdateTime(LocalDateTime.now());
        baseMapper.updateById(order);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateAdminRemark(Long orderId, String adminRemark) {
        MallOrder order = baseMapper.selectById(orderId);
        if (order == null) {
            throw new RuntimeException("Order not found");
        }
        order.setAdminRemark(adminRemark);
        order.setUpdateTime(LocalDateTime.now());
        baseMapper.updateById(order);
        return true;
    }
}