package com.central.mall.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.mall.config.TenantInterceptor;
import com.central.mall.mapper.MallCategoryMapper;
import com.central.mall.model.dto.AdminCategoryDTO;
import com.central.mall.model.entity.MallCategory;
import com.central.mall.service.IAdminCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Admin category management service implementation.
 * Provides full CRUD operations for product categories including tree structure and sorting.
 *
 * @author Portal Team
 * @since 2026-05-08
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminCategoryServiceImpl extends ServiceImpl<MallCategoryMapper, MallCategory> implements IAdminCategoryService {

    @Override
    public List<AdminCategoryDTO> getCategoryTree() {
        String tenantId = TenantInterceptor.getCurrentTenantId();
        LambdaQueryWrapper<MallCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallCategory::getTenantId, tenantId)
                .orderByAsc(MallCategory::getSort);
        List<MallCategory> allCategories = baseMapper.selectList(wrapper);

        // Build tree structure
        Map<Long, List<MallCategory>> childrenMap = new HashMap<>();
        List<MallCategory> rootCategories = new ArrayList<>();

        for (MallCategory category : allCategories) {
            if (category.getParentId() == null || category.getParentId() == 0) {
                rootCategories.add(category);
            } else {
                childrenMap.computeIfAbsent(category.getParentId(), k -> new ArrayList<>()).add(category);
            }
        }

        // Build tree recursively
        List<AdminCategoryDTO> tree = new ArrayList<>();
        for (MallCategory root : rootCategories) {
            tree.add(buildCategoryNode(root, childrenMap));
        }

        return tree;
    }

    private AdminCategoryDTO buildCategoryNode(MallCategory category, Map<Long, List<MallCategory>> childrenMap) {
        AdminCategoryDTO dto = new AdminCategoryDTO();
        dto.setId(category.getId());
        dto.setParentId(category.getParentId());
        dto.setName(category.getName());
        dto.setIcon(category.getIcon());
        dto.setSort(category.getSort());
        dto.setStatus(category.getStatus());

        List<MallCategory> children = childrenMap.get(category.getId());
        if (children != null && !children.isEmpty()) {
            List<AdminCategoryDTO> childNodes = children.stream()
                    .map(child -> buildCategoryNode(child, childrenMap))
                    .collect(Collectors.toList());
            dto.setChildren(childNodes);
        }

        return dto;
    }

    @Override
    public boolean addCategory(AdminCategoryDTO dto) {
        String tenantId = TenantInterceptor.getCurrentTenantId();

        // Validate parent exists if parentId > 0
        if (dto.getParentId() != null && dto.getParentId() > 0) {
            MallCategory parent = baseMapper.selectById(dto.getParentId());
            if (parent == null || !tenantId.equals(parent.getTenantId())) {
                log.warn("Parent category not found or tenant mismatch: parentId={}", dto.getParentId());
                return false;
            }
        }

        MallCategory category = new MallCategory();
        category.setTenantId(tenantId);
        category.setParentId(dto.getParentId() != null ? dto.getParentId() : 0);
        category.setName(dto.getName());
        category.setIcon(dto.getIcon());
        category.setSort(dto.getSort() != null ? dto.getSort() : 0);
        category.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);

        return baseMapper.insert(category) > 0;
    }

    @Override
    public boolean updateCategory(AdminCategoryDTO dto) {
        if (dto.getId() == null) {
            return false;
        }

        String tenantId = TenantInterceptor.getCurrentTenantId();
        MallCategory existing = baseMapper.selectById(dto.getId());
        if (existing == null || !tenantId.equals(existing.getTenantId())) {
            log.warn("Category not found or tenant mismatch: id={}", dto.getId());
            return false;
        }

        LambdaUpdateWrapper<MallCategory> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(MallCategory::getId, dto.getId())
                .eq(MallCategory::getTenantId, tenantId)
                .set(dto.getName() != null, MallCategory::getName, dto.getName())
                .set(dto.getIcon() != null, MallCategory::getIcon, dto.getIcon())
                .set(dto.getSort() != null, MallCategory::getSort, dto.getSort())
                .set(dto.getStatus() != null, MallCategory::getStatus, dto.getStatus())
                .set(dto.getParentId() != null, MallCategory::getParentId, dto.getParentId());

        return baseMapper.update(null, wrapper) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteCategory(Long id) {
        String tenantId = TenantInterceptor.getCurrentTenantId();

        MallCategory category = baseMapper.selectById(id);
        if (category == null || !tenantId.equals(category.getTenantId())) {
            log.warn("Category not found or tenant mismatch: id={}", id);
            return false;
        }

        // Find and delete all children recursively
        deleteChildrenRecursively(id, tenantId);

        // Delete the category itself
        return baseMapper.deleteById(id) > 0;
    }

    private void deleteChildrenRecursively(Long parentId, String tenantId) {
        LambdaQueryWrapper<MallCategory> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(MallCategory::getParentId, parentId)
                .eq(MallCategory::getTenantId, tenantId);
        List<MallCategory> children = baseMapper.selectList(wrapper);

        for (MallCategory child : children) {
            deleteChildrenRecursively(child.getId(), tenantId);
            baseMapper.deleteById(child.getId());
        }
    }

    @Override
    public boolean sortCategories(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return false;
        }

        String tenantId = TenantInterceptor.getCurrentTenantId();

        // Update sort for each category in the order given
        for (int i = 0; i < ids.size(); i++) {
            LambdaUpdateWrapper<MallCategory> wrapper = new LambdaUpdateWrapper<>();
            wrapper.eq(MallCategory::getId, ids.get(i))
                    .eq(MallCategory::getTenantId, tenantId)
                    .set(MallCategory::getSort, i + 1);
            baseMapper.update(null, wrapper);
        }

        return true;
    }
}