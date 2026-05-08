package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.mall.mapper.MallCategoryMapper;
import com.central.mall.mapper.MallGoodsMapper;
import com.central.mall.mapper.MallGoodsSkuMapper;
import com.central.mall.model.entity.MallCategory;
import com.central.mall.model.entity.MallGoods;
import com.central.mall.model.entity.MallGoodsSku;
import com.central.mall.service.IGoodsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoodsServiceImpl extends ServiceImpl<MallGoodsMapper, MallGoods> implements IGoodsService {

    private final MallCategoryMapper categoryMapper;
    private final MallGoodsSkuMapper skuMapper;

    @Override
    public List<Map<String, Object>> getCategoryTree() {
        // 查询所有启用的分类
        LambdaQueryWrapper<MallCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallCategory::getStatus, 1).orderByAsc(MallCategory::getSort);
        List<MallCategory> allCategories = categoryMapper.selectList(wrapper);

        // 构建树形结构
        Map<Long, List<MallCategory>> childrenMap = new HashMap<>();
        List<MallCategory> rootCategories = new ArrayList<>();

        for (MallCategory category : allCategories) {
            if (category.getParentId() == null || category.getParentId() == 0) {
                rootCategories.add(category);
            } else {
                childrenMap.computeIfAbsent(category.getParentId(), k -> new ArrayList<>()).add(category);
            }
        }

        // 递归构建树
        List<Map<String, Object>> tree = new ArrayList<>();
        for (MallCategory root : rootCategories) {
            Map<String, Object> node = buildCategoryNode(root, childrenMap);
            tree.add(node);
        }

        return tree;
    }

    private Map<String, Object> buildCategoryNode(MallCategory category, Map<Long, List<MallCategory>> childrenMap) {
        Map<String, Object> node = new HashMap<>();
        node.put("id", category.getId());
        node.put("name", category.getName());
        node.put("icon", category.getIcon());
        node.put("sort", category.getSort());

        List<MallCategory> children = childrenMap.get(category.getId());
        if (children != null && !children.isEmpty()) {
            List<Map<String, Object>> childNodes = children.stream()
                    .map(child -> buildCategoryNode(child, childrenMap))
                    .collect(Collectors.toList());
            node.put("children", childNodes);
        }

        return node;
    }

    @Override
    public IPage<MallGoods> getGoodsPage(IPage<MallGoods> page, Map<String, Object> params) {
        LambdaQueryWrapper<MallGoods> wrapper = new LambdaQueryWrapper<>();

        // 分类筛选
        if (params.get("categoryId") != null && StringUtils.hasText(params.get("categoryId").toString())) {
            Long categoryId = Long.parseLong(params.get("categoryId").toString());
            wrapper.eq(MallGoods::getCategoryId, categoryId);
        }

        // 关键词搜索
        if (params.get("keyword") != null && StringUtils.hasText(params.get("keyword").toString())) {
            wrapper.and(w -> w.like(MallGoods::getName, params.get("keyword").toString())
                    .or().like(MallGoods::getSubTitle, params.get("keyword").toString()));
        }

        // 只查询上架商品
        wrapper.eq(MallGoods::getStatus, 1);
        wrapper.eq(MallGoods::getDelFlag, 0);

        // 排序
        String sortField = params.get("sortField") != null ? params.get("sortField").toString() : "createTime";
        String sortOrder = params.get("sortOrder") != null ? params.get("sortOrder").toString() : "desc";

        if ("price".equals(sortField)) {
            if ("asc".equalsIgnoreCase(sortOrder)) {
                wrapper.orderByAsc(MallGoods::getPrice);
            } else {
                wrapper.orderByDesc(MallGoods::getPrice);
            }
        } else if ("sales".equals(sortField)) {
            if ("asc".equalsIgnoreCase(sortOrder)) {
                wrapper.orderByAsc(MallGoods::getSales);
            } else {
                wrapper.orderByDesc(MallGoods::getSales);
            }
        } else {
            if ("asc".equalsIgnoreCase(sortOrder)) {
                wrapper.orderByAsc(MallGoods::getCreateTime);
            } else {
                wrapper.orderByDesc(MallGoods::getCreateTime);
            }
        }

        return baseMapper.selectPage(page, wrapper);
    }

    @Override
    public Map<String, Object> getGoodsDetail(Long goodsId) {
        // 查询商品
        MallGoods goods = baseMapper.selectById(goodsId);
        if (goods == null) {
            return null;
        }

        Map<String, Object> result = new HashMap<>();
        result.put("id", goods.getId());
        result.put("name", goods.getName());
        result.put("subTitle", goods.getSubTitle());
        result.put("mainImage", goods.getMainImage());
        result.put("images", goods.getImages());
        result.put("detail", goods.getDetail());
        result.put("price", goods.getPrice());
        result.put("sales", goods.getSales());
        result.put("status", goods.getStatus());
        result.put("goodsType", goods.getGoodsType());
        result.put("categoryId", goods.getCategoryId());
        result.put("virtualUrl", goods.getVirtualUrl());

        // 查询SKU列表
        LambdaQueryWrapper<MallGoodsSku> skuWrapper = new LambdaQueryWrapper<>();
        skuWrapper.eq(MallGoodsSku::getGoodsId, goodsId).eq(MallGoodsSku::getStatus, 1);
        List<MallGoodsSku> skus = skuMapper.selectList(skuWrapper);
        result.put("skus", skus);

        // 查询分类名称
        if (goods.getCategoryId() != null) {
            MallCategory category = categoryMapper.selectById(goods.getCategoryId());
            if (category != null) {
                result.put("categoryName", category.getName());
            }
        }

        return result;
    }

    @Override
    public List<MallGoodsSku> getGoodsSkus(Long goodsId) {
        LambdaQueryWrapper<MallGoodsSku> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallGoodsSku::getGoodsId, goodsId).eq(MallGoodsSku::getStatus, 1);
        return skuMapper.selectList(wrapper);
    }

    @Override
    public List<MallGoods> getHotGoods(int limit) {
        LambdaQueryWrapper<MallGoods> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallGoods::getStatus, 1)
                .eq(MallGoods::getDelFlag, 0)
                .orderByDesc(MallGoods::getSales)
                .last("LIMIT " + limit);
        return baseMapper.selectList(wrapper);
    }
}