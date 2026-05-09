package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.mall.config.TenantInterceptor;
import com.central.mall.mapper.MallGoodsMapper;
import com.central.mall.mapper.MallGoodsSkuMapper;
import com.central.mall.mapper.MallGoodsSpecMapper;
import com.central.mall.model.dto.AdminGoodsDTO;
import com.central.mall.model.dto.SkuDTO;
import com.central.mall.model.entity.MallGoods;
import com.central.mall.model.entity.MallGoodsSku;
import com.central.mall.model.entity.MallGoodsSpec;
import com.central.mall.service.IAdminGoodsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminGoodsServiceImpl extends ServiceImpl<MallGoodsMapper, MallGoods> implements IAdminGoodsService {

    private final MallGoodsMapper goodsMapper;
    private final MallGoodsSkuMapper skuMapper;
    private final MallGoodsSpecMapper specMapper;

    @Override
    public IPage<AdminGoodsDTO> getGoodsPage(IPage<AdminGoodsDTO> page, Map<String, Object> params) {
        LambdaQueryWrapper<MallGoods> wrapper = new LambdaQueryWrapper<>();
        String tenantId = TenantInterceptor.getCurrentTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            tenantId = "SUPER"; // default tenant for development
        }
        wrapper.eq(MallGoods::getTenantId, tenantId);
        wrapper.eq(MallGoods::getDelFlag, 0);

        if (params.get("categoryId") != null && StringUtils.isNotBlank(params.get("categoryId").toString()) && !"".equals(params.get("categoryId").toString())) {
            Long categoryId = Long.parseLong(params.get("categoryId").toString());
            wrapper.eq(MallGoods::getCategoryId, categoryId);
        }
        if (params.get("keyword") != null && StringUtils.isNotBlank(params.get("keyword").toString())) {
            String keyword = params.get("keyword").toString();
            wrapper.and(w -> w.like(MallGoods::getName, keyword).or().like(MallGoods::getSubTitle, keyword));
        }
        if (params.get("status") != null && StringUtils.isNotBlank(params.get("status").toString()) && !"".equals(params.get("status").toString())) {
            wrapper.eq(MallGoods::getStatus, Integer.parseInt(params.get("status").toString()));
        }
        if (params.get("goodsType") != null && StringUtils.isNotBlank(params.get("goodsType").toString()) && !"".equals(params.get("goodsType").toString())) {
            wrapper.eq(MallGoods::getGoodsType, Integer.parseInt(params.get("goodsType").toString()));
        }
        wrapper.orderByDesc(MallGoods::getCreateTime);
        // Use manual count query + select with wrapper.last() to avoid double LIMIT issue
        // First get count
        Long total = goodsMapper.selectCount(wrapper.clone());
        // Apply pagination with wrapper.last() for LIMIT clause
        wrapper.last("LIMIT " + page.getSize() + " OFFSET " + (page.getCurrent() - 1) * page.getSize());
        List<MallGoods> goodsList = goodsMapper.selectList(wrapper);
        page.setTotal(total);
        page.setRecords(goodsList.stream().map(this::convertToDTO).collect(Collectors.toList()));
        return page;
    }

    @Override
    public AdminGoodsDTO getGoodsDetail(Long id) {
        MallGoods goods = baseMapper.selectById(id);
        if (goods == null || goods.getDelFlag() == 1) return null;
        AdminGoodsDTO dto = convertToDTO(goods);
        LambdaQueryWrapper<MallGoodsSku> skuWrapper = new LambdaQueryWrapper<>();
        skuWrapper.eq(MallGoodsSku::getGoodsId, id);
        List<MallGoodsSku> skus = skuMapper.selectList(skuWrapper);
        dto.setSkus(skus.stream().map(this::convertSkuToDTO).collect(Collectors.toList()));
        return dto;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean publishGoods(AdminGoodsDTO dto) {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        LocalDateTime now = LocalDateTime.now();
        MallGoods goods = new MallGoods();
        goods.setTenantId(tenantId);
        goods.setCategoryId(dto.getCategoryId());
        goods.setName(dto.getName());
        goods.setSubTitle(dto.getSubTitle());
        goods.setMainImage(dto.getMainImage());
        goods.setImages(dto.getImages());
        goods.setDetail(dto.getDetail());
        goods.setPrice(dto.getPrice());
        goods.setGoodsType(dto.getGoodsType());
        goods.setVirtualUrl(dto.getVirtualUrl());
        goods.setVirtualFileId(dto.getVirtualFileId());
        goods.setVirtualExpire(dto.getVirtualExpire());
        goods.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        goods.setSort(dto.getSort() != null ? dto.getSort() : 0);
        goods.setDelFlag(0);
        goods.setCreateTime(now);
        goods.setUpdateTime(now);
        baseMapper.insert(goods);
        Long goodsId = goods.getId();
        if (dto.getSkus() != null && !dto.getSkus().isEmpty()) {
            for (SkuDTO skuDTO : dto.getSkus()) {
                MallGoodsSku sku = new MallGoodsSku();
                sku.setTenantId(tenantId);
                sku.setGoodsId(goodsId);
                sku.setSkuCode(skuDTO.getSkuCode());
                sku.setSpecs(skuDTO.getSpecs());
                sku.setPrice(skuDTO.getPrice());
                sku.setStock(skuDTO.getStock() != null ? skuDTO.getStock() : -1);
                sku.setImage(skuDTO.getImage());
                sku.setStatus(skuDTO.getStatus() != null ? skuDTO.getStatus() : 1);
                sku.setCreateTime(now);
                sku.setUpdateTime(now);
                skuMapper.insert(sku);
            }
        }
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateGoods(AdminGoodsDTO dto) {
        if (dto.getId() == null) return false;
        String tenantId = TenantInterceptor.getCurrentTenantId();
        LocalDateTime now = LocalDateTime.now();
        MallGoods goods = baseMapper.selectById(dto.getId());
        if (goods == null || goods.getDelFlag() == 1) return false;
        goods.setCategoryId(dto.getCategoryId());
        goods.setName(dto.getName());
        goods.setSubTitle(dto.getSubTitle());
        goods.setMainImage(dto.getMainImage());
        goods.setImages(dto.getImages());
        goods.setDetail(dto.getDetail());
        goods.setPrice(dto.getPrice());
        goods.setGoodsType(dto.getGoodsType());
        goods.setVirtualUrl(dto.getVirtualUrl());
        goods.setVirtualFileId(dto.getVirtualFileId());
        goods.setVirtualExpire(dto.getVirtualExpire());
        if (dto.getStatus() != null) goods.setStatus(dto.getStatus());
        if (dto.getSort() != null) goods.setSort(dto.getSort());
        goods.setUpdateTime(now);
        baseMapper.updateById(goods);
        LambdaQueryWrapper<MallGoodsSku> deleteSkuWrapper = new LambdaQueryWrapper<>();
        deleteSkuWrapper.eq(MallGoodsSku::getGoodsId, dto.getId());
        skuMapper.delete(deleteSkuWrapper);
        if (dto.getSkus() != null && !dto.getSkus().isEmpty()) {
            for (SkuDTO skuDTO : dto.getSkus()) {
                MallGoodsSku sku = new MallGoodsSku();
                sku.setTenantId(tenantId);
                sku.setGoodsId(dto.getId());
                sku.setSkuCode(skuDTO.getSkuCode());
                sku.setSpecs(skuDTO.getSpecs());
                sku.setPrice(skuDTO.getPrice());
                sku.setStock(skuDTO.getStock() != null ? skuDTO.getStock() : -1);
                sku.setImage(skuDTO.getImage());
                sku.setStatus(skuDTO.getStatus() != null ? skuDTO.getStatus() : 1);
                sku.setCreateTime(now);
                sku.setUpdateTime(now);
                skuMapper.insert(sku);
            }
        }
        return true;
    }

    @Override
    public boolean deleteGoods(Long id) {
        MallGoods goods = baseMapper.selectById(id);
        if (goods == null) return false;
        goods.setDelFlag(1);
        goods.setUpdateTime(LocalDateTime.now());
        baseMapper.updateById(goods);
        return true;
    }

    @Override
    public boolean updateStatus(Long id, Integer status) {
        MallGoods goods = baseMapper.selectById(id);
        if (goods == null || goods.getDelFlag() == 1) return false;
        goods.setStatus(status);
        goods.setUpdateTime(LocalDateTime.now());
        baseMapper.updateById(goods);
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchUpdateStatus(List<Long> goodsIds, Integer status) {
        if (goodsIds == null || goodsIds.isEmpty()) return false;
        int batchSize = 50;
        for (int i = 0; i < goodsIds.size(); i += batchSize) {
            List<Long> batch = goodsIds.subList(i, Math.min(i + batchSize, goodsIds.size()));
            LambdaQueryWrapper<MallGoods> wrapper = new LambdaQueryWrapper<>();
            wrapper.in(MallGoods::getId, batch);
            List<MallGoods> goodsList = baseMapper.selectList(wrapper);
            for (MallGoods g : goodsList) {
                g.setStatus(status);
                g.setUpdateTime(LocalDateTime.now());
                baseMapper.updateById(g);
            }
            log.info("Batch status update: processed {} goods", batch.size());
        }
        return true;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long cloneGoods(Long goodsId, Long newCategoryId, String newName) {
        MallGoods original = baseMapper.selectById(goodsId);
        if (original == null || original.getDelFlag() == 1) return null;
        String tenantId = TenantInterceptor.getCurrentTenantId();
        LocalDateTime now = LocalDateTime.now();
        MallGoods clone = new MallGoods();
        clone.setTenantId(tenantId);
        clone.setCategoryId(newCategoryId != null ? newCategoryId : original.getCategoryId());
        clone.setName(newName != null ? newName : original.getName() + " (clone)");
        clone.setSubTitle(original.getSubTitle());
        clone.setMainImage(original.getMainImage());
        clone.setImages(original.getImages());
        clone.setDetail(original.getDetail());
        clone.setPrice(original.getPrice());
        clone.setGoodsType(original.getGoodsType());
        clone.setVirtualUrl(original.getVirtualUrl());
        clone.setVirtualFileId(original.getVirtualFileId());
        clone.setVirtualExpire(original.getVirtualExpire());
        clone.setStatus(0);
        clone.setSort(original.getSort());
        clone.setDelFlag(0);
        clone.setCreateTime(now);
        clone.setUpdateTime(now);
        baseMapper.insert(clone);
        Long newGoodsId = clone.getId();
        LambdaQueryWrapper<MallGoodsSku> skuWrapper = new LambdaQueryWrapper<>();
        skuWrapper.eq(MallGoodsSku::getGoodsId, goodsId);
        List<MallGoodsSku> originalSkus = skuMapper.selectList(skuWrapper);
        for (MallGoodsSku originalSku : originalSkus) {
            MallGoodsSku newSku = new MallGoodsSku();
            newSku.setTenantId(tenantId);
            newSku.setGoodsId(newGoodsId);
            newSku.setSkuCode(originalSku.getSkuCode());
            newSku.setSpecs(originalSku.getSpecs());
            newSku.setPrice(originalSku.getPrice());
            newSku.setStock(originalSku.getStock());
            newSku.setImage(originalSku.getImage());
            newSku.setStatus(originalSku.getStatus());
            newSku.setCreateTime(now);
            newSku.setUpdateTime(now);
            skuMapper.insert(newSku);
        }
        return newGoodsId;
    }

    private AdminGoodsDTO convertToDTO(MallGoods goods) {
        AdminGoodsDTO dto = new AdminGoodsDTO();
        dto.setId(goods.getId());
        dto.setCategoryId(goods.getCategoryId());
        dto.setName(goods.getName());
        dto.setSubTitle(goods.getSubTitle());
        dto.setMainImage(goods.getMainImage());
        dto.setImages(goods.getImages());
        dto.setDetail(goods.getDetail());
        dto.setPrice(goods.getPrice());
        dto.setGoodsType(goods.getGoodsType());
        dto.setVirtualUrl(goods.getVirtualUrl());
        dto.setVirtualFileId(goods.getVirtualFileId());
        dto.setVirtualExpire(goods.getVirtualExpire());
        dto.setStatus(goods.getStatus());
        dto.setSort(goods.getSort());
        return dto;
    }

    private SkuDTO convertSkuToDTO(MallGoodsSku sku) {
        SkuDTO dto = new SkuDTO();
        dto.setId(sku.getId());
        dto.setSkuCode(sku.getSkuCode());
        dto.setSpecs(sku.getSpecs());
        dto.setPrice(sku.getPrice());
        dto.setStock(sku.getStock());
        dto.setImage(sku.getImage());
        dto.setStatus(sku.getStatus());
        return dto;
    }
}
