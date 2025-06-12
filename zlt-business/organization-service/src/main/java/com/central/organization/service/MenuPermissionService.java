package com.central.organization.service;

import java.util.List;
import java.util.Map;

/**
 * 菜单权限服务接口
 * 
 * @author zlt
 */
public interface MenuPermissionService {

    /**
     * 获取用户的权限菜单
     * 基于用户的员工ID和岗位信息计算权限
     * 
     * @param userId 用户ID
     * @return 菜单权限列表
     */
    List<Map<String, Object>> getCurrentUserAllMenus(Long userId);


    /**
     * 获取用户的岗位的权限菜单
     * 逻辑是按岗位查询，positionId可选参数，传入了就查询指定用户岗位的ID，没传就查询该用户下默认岗位的id
     *
     * @param userId 用户ID
     * @param positionId 岗位ID
     * @return 菜单权限列表
     */
    List<Map<String, Object>> getCurrentUserPositionMenus(Long userId, Long positionId);

    /**
     * 根据岗位ID获取权限菜单
     * 
     * @param positionId 岗位ID
     * @return 菜单权限列表
     */
    List<Map<String, Object>> getMenusByPositionId(Long positionId);

    /**
     * 构建菜单树结构
     * 
     * @param menuList 平铺菜单列表
     * @return 树形菜单结构
     */
    List<Map<String, Object>> buildMenuTree(List<Map<String, Object>> menuList);
} 