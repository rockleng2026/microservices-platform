package com.central.system.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.system.model.SysMenu;
import com.central.system.model.dto.SysMenuTreeDTO;

import java.util.List;

/**
 * 系统菜单Service接口
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
public interface SysMenuService extends IService<SysMenu> {

    /**
     * 获取菜单树形结构
     * 
     * @param parentId 父菜单ID，为空则获取所有
     * @return 菜单树列表
     */
    List<SysMenuTreeDTO> getMenuTree(Long parentId);

    /**
     * 根据用户ID获取用户菜单权限
     * 
     * @param userId 用户ID
     * @return 菜单列表
     */
    List<SysMenu> getUserMenus(Long userId);

    /**
     * 根据角色ID获取角色菜单权限
     * 
     * @param roleId 角色ID
     * @return 菜单列表
     */
    List<SysMenu> getRoleMenus(Long roleId);

    /**
     * 保存菜单
     * 
     * @param menu 菜单信息
     * @return 是否成功
     */
    boolean saveMenu(SysMenu menu);

    /**
     * 更新菜单
     * 
     * @param menu 菜单信息
     * @return 是否成功
     */
    boolean updateMenu(SysMenu menu);

    /**
     * 删除菜单
     * 
     * @param menuId 菜单ID
     * @return 是否成功
     */
    boolean deleteMenu(Long menuId);

    /**
     * 批量更新菜单状态
     * 
     * @param menuIds 菜单ID列表
     * @param status 状态
     * @return 是否成功
     */
    boolean batchUpdateStatus(List<Long> menuIds, Integer status);

    /**
     * 构建菜单树形结构
     * 
     * @param menus 菜单列表
     * @param parentId 父菜单ID
     * @return 菜单树
     */
    List<SysMenuTreeDTO> buildMenuTree(List<SysMenu> menus, Long parentId);

    /**
     * 验证菜单是否可以删除
     * 
     * @param menuId 菜单ID
     * @return 是否可删除
     */
    boolean canDelete(Long menuId);
} 