package com.central.mall.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.central.mall.model.entity.MallGoods;
import com.central.mall.model.entity.MallGoodsSku;

import java.util.List;
import java.util.Map;

public interface IGoodsService extends IService<MallGoods> {

    /**
     * 获取分类树
     */
    List<Map<String, Object>> getCategoryTree();

    /**
     * 分页查询商品列表
     */
    IPage<MallGoods> getGoodsPage(IPage<MallGoods> page, Map<String, Object> params);

    /**
     * 获取商品详情（含SKU）
     */
    Map<String, Object> getGoodsDetail(Long goodsId);

    /**
     * 获取商品SKU列表
     */
    List<MallGoodsSku> getGoodsSkus(Long goodsId);

    /**
     * 获取热门/推荐商品
     */
    List<MallGoods> getHotGoods(int limit);
}