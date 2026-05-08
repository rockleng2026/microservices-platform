package com.central.mall.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.mall.model.entity.MallCart;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface ICartService extends IService<MallCart> {

    /**
     * 加入购物车
     */
    boolean addToCart(Long userId, Long skuId, Integer quantity);

    /**
     * 获取购物车列表（含商品和SKU信息）
     */
    List<Map<String, Object>> getCartList(Long userId);

    /**
     * 计算购物车总价
     */
    BigDecimal calculateTotal(Long userId, List<Long> checkedSkuIds);

    /**
     * 修改购物车商品数量
     */
    boolean updateQuantity(Long cartId, Long userId, Integer quantity);

    /**
     * 修改选中状态
     */
    boolean updateChecked(Long cartId, Long userId, Integer checked);

    /**
     * 删除购物车项
     */
    boolean deleteCartItem(Long cartId, Long userId);

    /**
     * 清空已选中的购物车项
     */
    boolean clearChecked(Long userId);
}