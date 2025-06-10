package com.central.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.system.mapper.SysMenuMapper;
import com.central.system.model.SysMenu;
import com.central.system.model.dto.SysMenuTreeDTO;
import com.central.system.service.SysMenuService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 系统菜单Service实现类
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Slf4j
@Service
public class SysMenuServiceImpl extends ServiceImpl<SysMenuMapper, SysMenu> implements SysMenuService {

    @Override
    public List<SysMenuTreeDTO> getMenuTree(Long parentId) {
        try {
            // 查询所有菜单
            LambdaQueryWrapper<SysMenu> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(SysMenu::getStatus, 1) // 只查询启用的菜单
                   .orderByAsc(SysMenu::getSortOrder, SysMenu::getId);
            
            List<SysMenu> allMenus = this.list(wrapper);
            
            // 构建菜单树
            return buildMenuTree(allMenus, parentId != null ? parentId : 0L);
        } catch (Exception e) {
            log.error("获取菜单树失败", e);
            throw new RuntimeException("获取菜单树失败", e);
        }
    }

    @Override
    public List<SysMenu> getUserMenus(Long userId) {
        try {
            return baseMapper.getUserMenus(userId);
        } catch (Exception e) {
            log.error("获取用户菜单失败，用户ID: {}", userId, e);
            throw new RuntimeException("获取用户菜单失败", e);
        }
    }

    @Override
    public List<SysMenu> getRoleMenus(Long roleId) {
        try {
            return baseMapper.getRoleMenus(roleId);
        } catch (Exception e) {
            log.error("获取角色菜单失败，角色ID: {}", roleId, e);
            throw new RuntimeException("获取角色菜单失败", e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean saveMenu(SysMenu menu) {
        try {
            // 验证菜单数据
            validateMenu(menu);
            
            // 设置排序号
            if (menu.getSortOrder() == null) {
                menu.setSortOrder(getNextSortOrder(menu.getParentId()));
            }
            
            return this.save(menu);
        } catch (Exception e) {
            log.error("保存菜单失败", e);
            throw new RuntimeException("保存菜单失败", e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateMenu(SysMenu menu) {
        try {
            // 验证菜单数据
            validateMenu(menu);
            
            // 检查是否存在
            SysMenu existMenu = this.getById(menu.getId());
            if (existMenu == null) {
                throw new RuntimeException("菜单不存在");
            }
            
            return this.updateById(menu);
        } catch (Exception e) {
            log.error("更新菜单失败", e);
            throw new RuntimeException("更新菜单失败", e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteMenu(Long menuId) {
        try {
            // 检查是否可以删除
            if (!canDelete(menuId)) {
                throw new RuntimeException("该菜单下存在子菜单，无法删除");
            }
            
            return this.removeById(menuId);
        } catch (Exception e) {
            log.error("删除菜单失败，ID: {}", menuId, e);
            throw new RuntimeException("删除菜单失败", e);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchUpdateStatus(List<Long> menuIds, Integer status) {
        try {
            if (menuIds == null || menuIds.isEmpty()) {
                return false;
            }
            
            int result = baseMapper.batchUpdateStatus(menuIds, status);
            return result > 0;
        } catch (Exception e) {
            log.error("批量更新菜单状态失败", e);
            throw new RuntimeException("批量更新菜单状态失败", e);
        }
    }

    @Override
    public List<SysMenuTreeDTO> buildMenuTree(List<SysMenu> menus, Long parentId) {
        List<SysMenuTreeDTO> tree = new ArrayList<>();
        
        if (menus == null || menus.isEmpty()) {
            return tree;
        }
        
        // 过滤出指定父级的菜单
        List<SysMenu> rootMenus = menus.stream()
                .filter(menu -> {
                    Long pid = menu.getParentId();
                    return (parentId == null && (pid == null || pid == 0)) || 
                           (parentId != null && parentId.equals(pid));
                })
                .collect(Collectors.toList());
        
        // 递归构建树形结构
        for (SysMenu menu : rootMenus) {
            SysMenuTreeDTO treeNode = new SysMenuTreeDTO();
            BeanUtils.copyProperties(menu, treeNode);
            
            // 递归查找子菜单
            List<SysMenuTreeDTO> children = buildMenuTree(menus, menu.getId());
            treeNode.setChildren(children);
            treeNode.setHasChildren(!children.isEmpty());
            
            tree.add(treeNode);
        }
        
        return tree;
    }

    @Override
    public boolean canDelete(Long menuId) {
        try {
            // 检查是否有子菜单
            int childrenCount = baseMapper.getChildrenCount(menuId);
            return childrenCount == 0;
        } catch (Exception e) {
            log.error("检查菜单是否可删除失败，ID: {}", menuId, e);
            return false;
        }
    }

    /**
     * 验证菜单数据
     */
    private void validateMenu(SysMenu menu) {
        if (menu == null) {
            throw new IllegalArgumentException("菜单信息不能为空");
        }
        
        if (menu.getName() == null || menu.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("菜单名称不能为空");
        }
        
        // 检查同级菜单名称是否重复
        LambdaQueryWrapper<SysMenu> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysMenu::getName, menu.getName())
               .eq(SysMenu::getParentId, menu.getParentId() != null ? menu.getParentId() : 0);
        
        if (menu.getId() != null) {
            wrapper.ne(SysMenu::getId, menu.getId());
        }
        
        long count = this.count(wrapper);
        if (count > 0) {
            throw new IllegalArgumentException("同级菜单下已存在相同名称的菜单");
        }
    }

    /**
     * 获取下一个排序号
     */
    private Integer getNextSortOrder(Long parentId) {
        LambdaQueryWrapper<SysMenu> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysMenu::getParentId, parentId != null ? parentId : 0)
               .orderByDesc(SysMenu::getSortOrder)
               .last("LIMIT 1");
        
        SysMenu lastMenu = this.getOne(wrapper);
        if (lastMenu != null && lastMenu.getSortOrder() != null) {
            return lastMenu.getSortOrder() + 10;
        }
        
        return 10;
    }
} 