package com.central.project.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.central.project.mapper.ProductProfitDistributionGuideMapper;
import com.central.project.model.ProductProfitDistributionGuide;
import com.central.project.model.dto.ProductProfitDistributionGuideQueryDTO;
import com.central.project.model.dto.ProductProfitDistributionGuideSaveDTO;
import com.central.project.service.IProductProfitDistributionGuideService;
import com.central.project.utils.IdUtils;
import com.central.common.context.TenantContextHolder;
import org.springframework.beans.BeanUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;

/**
 * 产品毛利分配指导服务实现类
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@Service
public class ProductProfitDistributionGuideServiceImpl extends ServiceImpl<ProductProfitDistributionGuideMapper, ProductProfitDistributionGuide> implements IProductProfitDistributionGuideService {
    
    @Override
    public IPage<ProductProfitDistributionGuide> getGuidePage(ProductProfitDistributionGuideQueryDTO queryDTO) {
        Page<ProductProfitDistributionGuide> page = new Page<>(queryDTO.getPage(), queryDTO.getSize());
        
        // 构建查询参数
        Map<String, Object> params = new HashMap<>();
        if (StringUtils.hasText(queryDTO.getProductName())) {
            params.put("productName", queryDTO.getProductName());
        }
        if (StringUtils.hasText(queryDTO.getRole())) {
            params.put("role", queryDTO.getRole());
        }
        if (StringUtils.hasText(queryDTO.getCommissionType())) {
            params.put("commissionType", queryDTO.getCommissionType());
        }
        if (StringUtils.hasText(queryDTO.getKeyword())) {
            params.put("keyword", queryDTO.getKeyword());
        }
        if (StringUtils.hasText(queryDTO.getCreatedAtBegin())) {
            params.put("createdAtBegin", queryDTO.getCreatedAtBegin());
        }
        if (StringUtils.hasText(queryDTO.getCreatedAtEnd())) {
            params.put("createdAtEnd", queryDTO.getCreatedAtEnd());
        }
        
        params.put("orderBy", queryDTO.getOrderBy());
        params.put("orderDirection", queryDTO.getOrderDirection());
        
        return baseMapper.selectGuidePage(page, params);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductProfitDistributionGuide saveGuide(ProductProfitDistributionGuideSaveDTO saveDTO) {
        ProductProfitDistributionGuide guide = new ProductProfitDistributionGuide();
        
        // 复制基本属性
        BeanUtils.copyProperties(saveDTO, guide);
        
        Date now = new Date();
        String tenantId = TenantContextHolder.getTenant();
        if (!StringUtils.hasText(tenantId)) {
            tenantId = "default";
        }
        
        if (saveDTO.getId() != null) {
            // 更新
            guide.setId(saveDTO.getId());
            guide.setUpdatedAt(now);
            // TODO: 设置修改人ID
            guide.setUpdatedBy(1L);
            updateById(guide);
        } else {
            // 新增
            guide.setId(IdUtils.generateId());
            guide.setTenantId(tenantId);
            guide.setDelflag(0);
            guide.setCreatedAt(now);
            guide.setUpdatedAt(now);
            // TODO: 设置创建人ID和修改人ID
            guide.setCreatedBy(1L);
            guide.setUpdatedBy(1L);
            save(guide);
        }
        
        return guide;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteGuide(Long id) {
        if (id == null) {
            return false;
        }
        
        ProductProfitDistributionGuide guide = new ProductProfitDistributionGuide();
        guide.setId(id);
        guide.setDelflag(1);
        guide.setUpdatedAt(new Date());
        // TODO: 设置修改人ID
        guide.setUpdatedBy(1L);
        
        return updateById(guide);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean batchDeleteGuides(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return false;
        }
        
        for (Long id : ids) {
            deleteGuide(id);
        }
        
        return true;
    }
    
    @Override
    public Boolean updateGuideStatus(Long id, String status) {
        if (id == null || !StringUtils.hasText(status)) {
            return false;
        }
        
        // 注意：根据当前表结构，没有status字段，这个方法暂时无效
        // 如果需要状态管理，需要在表中添加status字段
        log.warn("updateGuideStatus method is not implemented due to missing status field in table");
        return false;
    }
    
    @Override
    public ProductProfitDistributionGuide getActiveGuideByProduct(String productName, String role) {
        if (!StringUtils.hasText(productName) || !StringUtils.hasText(role)) {
            return null;
        }
        return baseMapper.selectByProductNameAndRole(productName, role);
    }
    
    @Override
    public List<ProductProfitDistributionGuide> getGuidesByProductName(String productName) {
        if (!StringUtils.hasText(productName)) {
            return new ArrayList<>();
        }
        return baseMapper.selectByProductName(productName);
    }
    
    @Override
    public List<ProductProfitDistributionGuide> getAllActiveGuides() {
        // 由于没有status字段，返回所有未删除的记录
        LambdaQueryWrapper<ProductProfitDistributionGuide> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductProfitDistributionGuide::getDelflag, 0);
        wrapper.orderByDesc(ProductProfitDistributionGuide::getCreatedAt);
        return list(wrapper);
    }
    
    @Override
    public List<String> getDistinctProductNames() {
        return baseMapper.selectAllProductNames();
    }
    
    @Override
    public List<String> getDistinctRoles() {
        return baseMapper.selectAllRoles();
    }
    
    @Override
    public List<ProductProfitDistributionGuide> getGuidesByRole(String role) {
        if (!StringUtils.hasText(role)) {
            return new ArrayList<>();
        }
        return baseMapper.selectByRole(role);
    }
    
    @Override
    public List<ProductProfitDistributionGuide> getGuidesByCommissionType(String commissionType) {
        if (!StringUtils.hasText(commissionType)) {
            return new ArrayList<>();
        }
        return baseMapper.selectByCommissionType(commissionType);
    }
    
    @Override
    public Boolean existsActiveConfig(String productName, String role, Long excludeId) {
        if (!StringUtils.hasText(productName) || !StringUtils.hasText(role)) {
            return false;
        }
        
        LambdaQueryWrapper<ProductProfitDistributionGuide> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProductProfitDistributionGuide::getProductName, productName);
        wrapper.eq(ProductProfitDistributionGuide::getRole, role);
        wrapper.eq(ProductProfitDistributionGuide::getDelflag, 0);
        
        if (excludeId != null) {
            wrapper.ne(ProductProfitDistributionGuide::getId, excludeId);
        }
        
        return count(wrapper) > 0;
    }
} 