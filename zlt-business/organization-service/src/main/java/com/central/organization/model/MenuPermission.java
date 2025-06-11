package com.central.organization.model;

import lombok.Data;

import java.util.List;

/**
 * 菜单权限模型
 * 
 * @author zlt
 */
@Data
public class MenuPermission {
    
    /**
     * 菜单ID
     */
    private Long id;
    
    /**
     * 菜单名称
     */
    private String name;
    
    /**
     * 菜单编码
     */
    private String code;
    
    /**
     * 父菜单ID
     */
    private Long parentId;
    
    /**
     * 菜单路径
     */
    private String path;
    
    /**
     * 组件路径
     */
    private String component;
    
    /**
     * 菜单图标
     */
    private String icon;
    
    /**
     * 菜单类型：1-菜单，2-按钮，3-外链
     */
    private Integer menuType;
    
    /**
     * 排序序号
     */
    private Integer sortOrder;
    
    /**
     * 是否显示
     */
    private Boolean visible;
    
    /**
     * 是否启用
     */
    private Boolean enabled;
    
    /**
     * 子菜单列表
     */
    private List<MenuPermission> children;
    
    /**
     * 功能权限列表
     */
    private List<MenuFunction> functions;
} 