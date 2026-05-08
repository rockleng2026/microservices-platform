package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.mall.mapper.MallCartMapper;
import com.central.mall.mapper.MallGoodsMapper;
import com.central.mall.mapper.MallGoodsSkuMapper;
import com.central.mall.model.entity.MallCart;
import com.central.mall.model.entity.MallGoods;
import com.central.mall.model.entity.MallGoodsSku;
import com.central.mall.service.ICartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartServiceImpl extends ServiceImpl<MallCartMapper, MallCart> implements ICartService {

    private final MallGoodsMapper goodsMapper;
    private final MallGoodsSkuMapper skuMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean addToCart(Long userId, Long skuId, Integer quantity) {
        // 检查SKU是否存在
        MallGoodsSku sku = skuMapper.selectById(skuId);
        if (sku == null) {
            throw new RuntimeException("SKU不存在");
        }

        // 检查是否已存在于购物车
        LambdaQueryWrapper<MallCart> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallCart::getUserId, userId).eq(MallCart::getSkuId, skuId);
        MallCart existCart = baseMapper.selectOne(wrapper);

        if (existCart != null) {
            // 更新数量
            existCart.setQuantity(existCart.getQuantity() + quantity);
            return updateById(existCart);
        } else {
            // 新增购物车记录
            MallCart cart = new MallCart();
            cart.setUserId(userId);
            cart.setSkuId(skuId);
            cart.setGoodsId(sku.getGoodsId());
            cart.setQuantity(quantity);
            cart.setChecked(1);
            cart.setTenantId(sku.getTenantId());
            return save(cart);
        }
    }

    @Override
    public List<Map<String, Object>> getCartList(Long userId) {
        LambdaQueryWrapper<MallCart> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallCart::getUserId, userId);
        List<MallCart> carts = baseMapper.selectList(wrapper);

        List<Map<String, Object>> result = new ArrayList<>();
        for (MallCart cart : carts) {
            Map<String, Object> item = new HashMap<>();
            item.put("cartId", cart.getId());
            item.put("skuId", cart.getSkuId());
            item.put("goodsId", cart.getGoodsId());
            item.put("quantity", cart.getQuantity());
            item.put("checked", cart.getChecked());

            // 查询商品信息
            MallGoods goods = goodsMapper.selectById(cart.getGoodsId());
            if (goods != null) {
                item.put("goodsName", goods.getName());
                item.put("mainImage", goods.getMainImage());
                item.put("goodsType", goods.getGoodsType());
            }

            // 查询SKU信息
            MallGoodsSku sku = skuMapper.selectById(cart.getSkuId());
            if (sku != null) {
                item.put("skuPrice", sku.getPrice());
                item.put("skuSpecs", sku.getSpecs());
                item.put("stock", sku.getStock());
            }

            result.add(item);
        }

        return result;
    }

    @Override
    public BigDecimal calculateTotal(Long userId, List<Long> checkedSkuIds) {
        if (checkedSkuIds == null || checkedSkuIds.isEmpty()) {
            return BigDecimal.ZERO;
        }

        BigDecimal total = BigDecimal.ZERO;
        for (Long skuId : checkedSkuIds) {
            MallGoodsSku sku = skuMapper.selectById(skuId);
            if (sku != null) {
                // 查询购物车中该SKU的数量
                LambdaQueryWrapper<MallCart> wrapper = new LambdaQueryWrapper<>();
                wrapper.eq(MallCart::getUserId, userId).eq(MallCart::getSkuId, skuId).eq(MallCart::getChecked, 1);
                MallCart cart = baseMapper.selectOne(wrapper);
                if (cart != null) {
                    total = total.add(sku.getPrice().multiply(new BigDecimal(cart.getQuantity())));
                }
            }
        }

        return total;
    }

    @Override
    public boolean updateQuantity(Long cartId, Integer quantity) {
        MallCart cart = baseMapper.selectById(cartId);
        if (cart == null) {
            return false;
        }
        cart.setQuantity(quantity);
        return updateById(cart);
    }

    @Override
    public boolean updateChecked(Long cartId, Integer checked) {
        MallCart cart = baseMapper.selectById(cartId);
        if (cart == null) {
            return false;
        }
        cart.setChecked(checked);
        return updateById(cart);
    }

    @Override
    public boolean deleteCartItem(Long cartId) {
        return removeById(cartId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean clearChecked(Long userId) {
        LambdaQueryWrapper<MallCart> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallCart::getUserId, userId).eq(MallCart::getChecked, 1);
        return remove(wrapper);
    }
}