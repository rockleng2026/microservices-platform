package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.mall.config.TenantInterceptor;
import com.central.mall.mapper.MallBannerMapper;
import com.central.mall.mapper.MallGoodsMapper;
import com.central.mall.model.dto.BannerDTO;
import com.central.mall.model.entity.MallBanner;
import com.central.mall.model.entity.MallGoods;
import com.central.mall.service.IAdminBannerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Admin banner management service implementation.
 * Provides full CRUD operations for banner carousel including sorting.
 * D-04: Mixed link mode - linkType=1 (goods, uses goodsId), linkType=2 (external, uses externalUrl).
 *
 * @author Portal Team
 * @since 2026-05-08
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminBannerServiceImpl extends ServiceImpl<MallBannerMapper, MallBanner> implements IAdminBannerService {

    private final MallGoodsMapper goodsMapper;

    @Override
    public List<BannerDTO> getBannerList() {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        LambdaQueryWrapper<MallBanner> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallBanner::getTenantId, tenantId)
                .eq(MallBanner::getStatus, 1)
                .orderByAsc(MallBanner::getSort);
        List<MallBanner> banners = baseMapper.selectList(wrapper);

        return banners.stream().map(this::convertToDTO).toList();
    }

    private BannerDTO convertToDTO(MallBanner banner) {
        BannerDTO dto = new BannerDTO();
        dto.setId(banner.getId());
        dto.setTitle(banner.getTitle());
        dto.setImageUrl(banner.getImageUrl());
        dto.setLinkType(banner.getLinkType());
        dto.setGoodsId(banner.getGoodsId());
        dto.setExternalUrl(banner.getExternalUrl());
        dto.setSort(banner.getSort());
        dto.setStatus(banner.getStatus());
        return dto;
    }

    @Override
    public boolean addBanner(BannerDTO dto) {
        String tenantId = TenantInterceptor.getCurrentTenantId();

        // Validate linkType
        if (dto.getLinkType() == null || (dto.getLinkType() != 1 && dto.getLinkType() != 2)) {
            log.warn("Invalid linkType: {}", dto.getLinkType());
            return false;
        }

        // Validate linkType=1 (goods) requires valid goodsId
        if (dto.getLinkType() == 1) {
            if (dto.getGoodsId() == null) {
                log.warn("linkType=1 requires goodsId");
                return false;
            }
            MallGoods goods = goodsMapper.selectById(dto.getGoodsId());
            if (goods == null || !tenantId.equals(goods.getTenantId())) {
                log.warn("Goods not found or tenant mismatch: goodsId={}", dto.getGoodsId());
                return false;
            }
            // Validate goodsType=1 (physical goods only for banner links per D-04)
            if (goods.getGoodsType() != 1) {
                log.warn("Banner link only supports physical goods (goodsType=1), got goodsType={}", goods.getGoodsType());
                return false;
            }
        }

        MallBanner banner = new MallBanner();
        banner.setTenantId(tenantId);
        banner.setTitle(dto.getTitle());
        banner.setImageUrl(dto.getImageUrl());
        banner.setLinkType(dto.getLinkType());
        banner.setGoodsId(dto.getLinkType() == 1 ? dto.getGoodsId() : null);
        banner.setExternalUrl(dto.getLinkType() == 2 ? dto.getExternalUrl() : null);
        banner.setSort(dto.getSort() != null ? dto.getSort() : 0);
        banner.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);

        return baseMapper.insert(banner) > 0;
    }

    @Override
    public boolean updateBanner(BannerDTO dto) {
        if (dto.getId() == null) {
            return false;
        }

        String tenantId = TenantInterceptor.getCurrentTenantId();
        MallBanner existing = baseMapper.selectById(dto.getId());
        if (existing == null || !tenantId.equals(existing.getTenantId())) {
            log.warn("Banner not found or tenant mismatch: id={}", dto.getId());
            return false;
        }

        // Validate goodsId if linkType is being changed to or remains goods
        if (dto.getLinkType() != null && dto.getLinkType() == 1) {
            if (dto.getGoodsId() == null) {
                log.warn("linkType=1 requires goodsId");
                return false;
            }
            MallGoods goods = goodsMapper.selectById(dto.getGoodsId());
            if (goods == null || !tenantId.equals(goods.getTenantId()) || goods.getGoodsType() != 1) {
                log.warn("Invalid goods for banner link");
                return false;
            }
        }

        LambdaUpdateWrapper<MallBanner> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(MallBanner::getId, dto.getId())
                .eq(MallBanner::getTenantId, tenantId)
                .set(dto.getTitle() != null, MallBanner::getTitle, dto.getTitle())
                .set(dto.getImageUrl() != null, MallBanner::getImageUrl, dto.getImageUrl())
                .set(dto.getLinkType() != null, MallBanner::getLinkType, dto.getLinkType())
                .set(dto.getLinkType() != null && dto.getLinkType() == 1, MallBanner::getGoodsId, dto.getGoodsId())
                .set(dto.getLinkType() != null && dto.getLinkType() == 2, MallBanner::getExternalUrl, dto.getExternalUrl())
                .set(dto.getSort() != null, MallBanner::getSort, dto.getSort())
                .set(dto.getStatus() != null, MallBanner::getStatus, dto.getStatus());

        return baseMapper.update(null, wrapper) > 0;
    }

    @Override
    public boolean deleteBanner(Long id) {
        String tenantId = TenantInterceptor.getCurrentTenantId();

        MallBanner banner = baseMapper.selectById(id);
        if (banner == null || !tenantId.equals(banner.getTenantId())) {
            log.warn("Banner not found or tenant mismatch: id={}", id);
            return false;
        }

        return baseMapper.deleteById(id) > 0;
    }

    @Override
    public boolean updateSort(Long id, Integer sort) {
        String tenantId = TenantInterceptor.getCurrentTenantId();

        LambdaUpdateWrapper<MallBanner> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(MallBanner::getId, id)
                .eq(MallBanner::getTenantId, tenantId)
                .set(MallBanner::getSort, sort);

        return baseMapper.update(null, wrapper) > 0;
    }
}