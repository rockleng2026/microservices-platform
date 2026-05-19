package com.central.mall.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.mall.model.entity.MallMarketingActivity;

/**
 * 管理员促销活动服务接口
 */
public interface IAdminPromotionService {

    /**
     * 获取促销列表（分页）
     */
    Page<MallMarketingActivity> getPromotionList(Long page, Long pageSize, Integer status);

    /**
     * 创建促销活动
     */
    boolean createPromotion(MallMarketingActivity promotion);

    /**
     * 更新促销活动
     */
    boolean updatePromotion(Long id, MallMarketingActivity promotion);

    /**
     * 删除促销活动
     */
    boolean deletePromotion(Long id);

    /**
     * 启用/禁用促销活动
     */
    boolean togglePromotion(Long id);
}