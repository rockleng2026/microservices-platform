package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.mall.config.TenantInterceptor;
import com.central.mall.mapper.MallMarketingActivityMapper;
import com.central.mall.model.entity.MallMarketingActivity;
import com.central.mall.service.IAdminPromotionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 管理员促销活动服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminPromotionServiceImpl implements IAdminPromotionService {

    private final MallMarketingActivityMapper activityMapper;

    @Override
    public Page<MallMarketingActivity> getPromotionList(Long page, Long pageSize, Integer status) {
        Page<MallMarketingActivity> pageObj = new Page<>(page, pageSize);
        LambdaQueryWrapper<MallMarketingActivity> wrapper = new LambdaQueryWrapper<>();

        if (status != null) {
            wrapper.eq(MallMarketingActivity::getStatus, status);
        }

        wrapper.orderByDesc(MallMarketingActivity::getCreateTime);
        return activityMapper.selectPage(pageObj, wrapper);
    }

    @Override
    @Transactional
    public boolean createPromotion(MallMarketingActivity promotion) {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        if (tenantId == null) {
            tenantId = "default";
        }
        promotion.setTenantId(tenantId);
        promotion.setCreateTime(LocalDateTime.now());
        promotion.setUpdateTime(LocalDateTime.now());
        return activityMapper.insert(promotion) > 0;
    }

    @Override
    @Transactional
    public boolean updatePromotion(Long id, MallMarketingActivity promotion) {
        MallMarketingActivity existing = activityMapper.selectById(id);
        if (existing == null) {
            return false;
        }

        promotion.setId(id);
        promotion.setTenantId(existing.getTenantId());
        promotion.setCreateTime(existing.getCreateTime());
        promotion.setUpdateTime(LocalDateTime.now());
        return activityMapper.updateById(promotion) > 0;
    }

    @Override
    @Transactional
    public boolean deletePromotion(Long id) {
        return activityMapper.deleteById(id) > 0;
    }

    @Override
    @Transactional
    public boolean togglePromotion(Long id) {
        MallMarketingActivity existing = activityMapper.selectById(id);
        if (existing == null) {
            return false;
        }

        // Flip status: 1=待发布 -> 2=进行中, 2=进行中 -> 3=已结束, 3=已结束 -> 1=待发布
        int newStatus;
        if (existing.getStatus() == 1) {
            newStatus = 2; // 发布
        } else if (existing.getStatus() == 2) {
            newStatus = 3; // 结束
        } else {
            newStatus = 1; // 重新待发布
        }

        existing.setStatus(newStatus);
        existing.setUpdateTime(LocalDateTime.now());
        return activityMapper.updateById(existing) > 0;
    }
}