package com.central.mall.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.central.mall.model.dto.AdminGoodsDTO;
import com.central.mall.model.entity.MallGoods;

import java.util.Map;

public interface IAdminGoodsService extends IService<MallGoods> {

    /**
     * Admin goods list with filters
     */
    IPage<AdminGoodsDTO> getGoodsPage(IPage<AdminGoodsDTO> page, Map<String, Object> params);

    /**
     * Full goods detail with SKUs
     */
    AdminGoodsDTO getGoodsDetail(Long id);

    /**
     * Create new goods, handle SKU creation
     */
    boolean publishGoods(AdminGoodsDTO dto);

    /**
     * Update goods and replace SKUs entirely
     */
    boolean updateGoods(AdminGoodsDTO dto);

    /**
     * Soft delete (delFlag=1)
     */
    boolean deleteGoods(Long id);

    /**
     * Single goods status toggle
     */
    boolean updateStatus(Long id, Integer status);

    /**
     * Batch status update - 50 items per batch (D-09)
     */
    boolean batchUpdateStatus(java.util.List<Long> goodsIds, Integer status);

    /**
     * Clone goods - returns new goodsId (D-12)
     */
    Long cloneGoods(Long goodsId, Long newCategoryId, String newName);
}
