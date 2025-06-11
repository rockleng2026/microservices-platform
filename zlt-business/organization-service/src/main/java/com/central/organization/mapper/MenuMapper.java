package com.central.organization.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 菜单权限数据访问接口
 * 
 * @author zlt
 */
@Mapper
public interface MenuMapper {

    /**
     * 根据岗位ID查询菜单权限
     * 
     * @param positionId 岗位ID
     * @return 菜单列表
     */
    List<Map<String, Object>> selectMenusByPositionId(@Param("positionId") Long positionId);

    /**
     * 根据菜单ID查询功能权限
     * 
     * @param menuId 菜单ID
     * @return 功能权限列表
     */
    List<Map<String, Object>> selectFunctionsByMenuId(@Param("menuId") Long menuId);

    /**
     * 查询所有菜单
     * 
     * @return 菜单列表
     */
    List<Map<String, Object>> selectAllMenus();

    /**
     * 根据ID查询菜单
     * 
     * @param id 菜单ID
     * @return 菜单信息
     */
    Map<String, Object> selectMenuById(@Param("id") Long id);
} 