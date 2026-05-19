package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.mall.mapper.MallGoodsMapper;
import com.central.mall.mapper.MallUserFavoriteMapper;
import com.central.mall.model.entity.MallGoods;
import com.central.mall.model.entity.MallUserFavorite;
import com.central.mall.service.IFavoriteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 收藏服务实现
 */
@Service
@RequiredArgsConstructor
public class FavoriteServiceImpl extends ServiceImpl<MallUserFavoriteMapper, MallUserFavorite> implements IFavoriteService {

    @Override
    public List<MallUserFavorite> getUserFavorites(Long userId, int page, int pageSize) {
        LambdaQueryWrapper<MallUserFavorite> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallUserFavorite::getUserId, userId)
               .orderByDesc(MallUserFavorite::getCreateTime);

        // Simple pagination - limit offset
        int offset = (page - 1) * pageSize;
        wrapper.last("LIMIT " + offset + ", " + pageSize);

        return baseMapper.selectList(wrapper);
    }

    @Override
    public boolean addFavorite(Long userId, Long goodsId, String goodsName, java.math.BigDecimal price, String image) {
        // Check if already favorited
        LambdaQueryWrapper<MallUserFavorite> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallUserFavorite::getUserId, userId)
               .eq(MallUserFavorite::getGoodsId, goodsId);

        if (baseMapper.selectCount(wrapper) > 0) {
            return true; // Already favorited
        }

        MallUserFavorite favorite = new MallUserFavorite();
        favorite.setUserId(userId);
        favorite.setGoodsId(goodsId);
        favorite.setGoodsName(goodsName);
        favorite.setPrice(price);
        favorite.setImage(image);
        favorite.setCreateTime(LocalDateTime.now());
        favorite.setUpdateTime(LocalDateTime.now());

        return baseMapper.insert(favorite) > 0;
    }

    @Override
    public boolean removeFavorite(Long userId, Long id) {
        LambdaQueryWrapper<MallUserFavorite> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallUserFavorite::getUserId, userId)
               .eq(MallUserFavorite::getId, id);

        return baseMapper.delete(wrapper) > 0;
    }
}