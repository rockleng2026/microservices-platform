package com.central.mall.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.mall.model.entity.MallUserFavorite;

import java.util.List;

public interface IFavoriteService extends IService<MallUserFavorite> {

    /**
     * Get user's favorites with pagination
     */
    List<MallUserFavorite> getUserFavorites(Long userId, int page, int pageSize);

    /**
     * Add to favorites
     */
    boolean addFavorite(Long userId, Long goodsId, String goodsName, java.math.BigDecimal price, String image);

    /**
     * Remove from favorites
     */
    boolean removeFavorite(Long userId, Long id);
}