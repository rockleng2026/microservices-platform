package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.mall.config.TenantInterceptor;
import com.central.mall.mapper.MallMerchantMapper;
import com.central.mall.model.dto.MerchantDTO;
import com.central.mall.model.entity.MallMerchant;
import com.central.mall.service.IMerchantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * 商户服务实现
 *
 * @author Portal Team
 * @since 2026-05-08
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MerchantServiceImpl extends ServiceImpl<MallMerchantMapper, MallMerchant> implements IMerchantService {

    @Override
    public IPage<MerchantDTO> getMerchantPage(IPage<MerchantDTO> page, Map<String, Object> params) {
        LambdaQueryWrapper<MallMerchant> wrapper = new LambdaQueryWrapper<>();
        if (params != null && params.get("status") != null && params.get("status").toString() != "") {
            wrapper.eq(MallMerchant::getStatus, Integer.valueOf(params.get("status").toString()));
        }
        if (params != null && params.get("keyword") != null && params.get("keyword").toString() != "") {
            String keyword = params.get("keyword").toString();
            wrapper.and(w -> w.like(MallMerchant::getMerchantName, keyword)
                    .or().like(MallMerchant::getContactName, keyword));
        }
        wrapper.orderByDesc(MallMerchant::getApplyTime);
        IPage<MallMerchant> result = baseMapper.selectPage(page, wrapper);
        return result.convert(this::toDTO);
    }

    @Override
    public MerchantDTO getMerchantDetail(Long id) {
        MallMerchant merchant = baseMapper.selectById(id);
        return merchant == null ? null : toDTO(merchant);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean reviewMerchant(Long id, Integer status, String rejectReason) {
        MallMerchant merchant = baseMapper.selectById(id);
        if (merchant == null) {
            return false;
        }
        if (status.equals(MallMerchant.STATUS_APPROVED)) {
            // Auto-generate tenantId for approved merchant
            merchant.setTenantId("MERCHANT_" + id);
        }
        merchant.setStatus(status);
        merchant.setRejectReason(rejectReason);
        merchant.setReviewTime(LocalDateTime.now());
        merchant.setUpdateTime(LocalDateTime.now());
        return baseMapper.updateById(merchant) > 0;
    }

    @Override
    public MallMerchant getByTenantId(String tenantId) {
        LambdaQueryWrapper<MallMerchant> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallMerchant::getTenantId, tenantId);
        return baseMapper.selectOne(wrapper);
    }

    private MerchantDTO toDTO(MallMerchant merchant) {
        MerchantDTO dto = new MerchantDTO();
        dto.setId(merchant.getId());
        dto.setTenantId(merchant.getTenantId());
        dto.setMerchantName(merchant.getMerchantName());
        dto.setContactName(merchant.getContactName());
        dto.setContactPhone(merchant.getContactPhone());
        dto.setBusinessLicenseUrl(merchant.getBusinessLicenseUrl());
        dto.setStatus(merchant.getStatus());
        dto.setRejectReason(merchant.getRejectReason());
        dto.setApplyTime(merchant.getApplyTime());
        dto.setReviewTime(merchant.getReviewTime());
        dto.setCreateTime(merchant.getCreateTime());
        dto.setUpdateTime(merchant.getUpdateTime());
        return dto;
    }
}