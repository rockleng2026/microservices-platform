package com.central.system.model.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 菜单树形结构DTO
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@Schema(description = "菜单树形结构")
public class SysMenuTreeDTO {

    @Schema(description = "菜单ID")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    @Schema(description = "菜单名称")
    private String name;

    @Schema(description = "父级菜单ID")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long parentId;

    @Schema(description = "菜单链接地址")
    private String linkUrl;

    @Schema(description = "菜单图标")
    private String icon;

    @Schema(description = "排序号")
    private Integer sortOrder;

    @Schema(description = "状态(1启用,0禁用)")
    private Integer status;

    @Schema(description = "菜单层级")
    private Integer level;

    @Schema(description = "是否有子菜单")
    private Boolean hasChildren;

    @Schema(description = "子菜单列表")
    private List<SysMenuTreeDTO> children;

    @Schema(description = "功能权限列表")
    private List<SysMenuFunctionDTO> functions;

    /**
     * 菜单功能权限DTO
     */
    @Data
    @Schema(description = "菜单功能权限")
    public static class SysMenuFunctionDTO {
        
        @Schema(description = "功能ID")
        @JsonSerialize(using = ToStringSerializer.class)
        private Long id;

        @Schema(description = "权限代码")
        private String permCode;

        @Schema(description = "权限名称")
        private String permName;

        @Schema(description = "权限类型(1按钮,2数据)")
        private Integer permType;

        @Schema(description = "图标")
        private String icon;

        @Schema(description = "排序号")
        private Integer sortOrder;
    }
} 