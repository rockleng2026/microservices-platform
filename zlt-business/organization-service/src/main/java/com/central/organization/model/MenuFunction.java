package com.central.organization.model;

import lombok.Data;

/**
 * 菜单功能权限模型
 * 
 * @author zlt
 */
@Data
public class MenuFunction {
    
    /**
     * 功能ID
     */
    private Long id;
    
    /**
     * 所属菜单ID
     */
    private Long menuId;
    
    /**
     * 功能名称
     */
    private String name;
    
    /**
     * 功能编码
     */
    private String code;
    
    /**
     * 功能描述
     */
    private String description;
    
    /**
     * 排序序号
     */
    private Integer sortOrder;
    
    /**
     * 是否启用
     */
    private Boolean enabled;
    
    /**
     * 租户ID
     */
    private String tenantId;
} 