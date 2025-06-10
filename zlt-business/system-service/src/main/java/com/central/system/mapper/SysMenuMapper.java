package com.central.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.system.model.SysMenu;
import com.central.system.model.dto.SysMenuTreeDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 系统菜单Mapper接口
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Mapper
public interface SysMenuMapper extends BaseMapper<SysMenu> {

    /**
     * 获取菜单树形结构
     * 
     * @param parentId 父菜单ID
     * @return 菜单树列表
     */
    List<SysMenuTreeDTO> getMenuTree(@Param("parentId") Long parentId);

    /**
     * 根据用户ID获取用户菜单权限
     * 
     * @param userId 用户ID
     * @return 菜单列表
     */
    List<SysMenu> getUserMenus(@Param("userId") Long userId);

    /**
     * 根据角色ID获取角色菜单权限
     * 
     * @param roleId 角色ID
     * @return 菜单列表
     */
    List<SysMenu> getRoleMenus(@Param("roleId") Long roleId);

    /**
     * 根据菜单ID获取子菜单数量
     * 
     * @param menuId 菜单ID
     * @return 子菜单数量
     */
    int getChildrenCount(@Param("menuId") Long menuId);

    /**
     * 批量更新菜单状态
     * 
     * @param menuIds 菜单ID列表
     * @param status 状态
     * @return 更新数量
     */
    int batchUpdateStatus(@Param("menuIds") List<Long> menuIds, @Param("status") Integer status);
} 