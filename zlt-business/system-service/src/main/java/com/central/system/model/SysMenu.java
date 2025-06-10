package com.central.system.model;

import com.baomidou.mybatisplus.annotation.*;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;
import java.util.List;

/**
 * 系统菜单实体
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("menu_page")
@Schema(description = "系统菜单")
public class SysMenu {

    private static final long serialVersionUID = 1L;

    @Schema(description = "菜单ID")
    @TableId(value = "id", type = IdType.AUTO)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;



    @Schema(description = "菜单名称")
    @TableField("name")
    private String name;

    @Schema(description = "父级菜单ID")
    @TableField("parent_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long parentId;

    @Schema(description = "菜单链接地址")
    @TableField("link_url")
    private String linkUrl;

    @Schema(description = "菜单描述")
    @TableField("description")
    private String description;

    @Schema(description = "菜单图片路径")
    @TableField("image_path")
    private String imagePath;

    @Schema(description = "菜单图标")
    @TableField("icon")
    private String icon;

    @Schema(description = "排序号")
    @TableField("sort_order")
    private Integer sortOrder;

    @Schema(description = "状态(1启用,0禁用)")
    @TableField("status")
    private Integer status;

    @Schema(description = "删除标识(0正常,1删除)")
    @TableField("delflag")
    @TableLogic
    private Integer delflag;

    @Schema(description = "创建时间")
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createdAt;

    @Schema(description = "租户ID")
    @TableField("tenant_id")
    private String tenantId;

    // 非数据库字段
    @Schema(description = "子菜单列表")
    @TableField(exist = false)
    private List<SysMenu> children;

    @Schema(description = "功能权限列表")
    @TableField(exist = false)
    private List<SysMenuFunction> functions;

    @Schema(description = "是否有子菜单")
    @TableField(exist = false)
    private Boolean hasChildren = false;

    @Schema(description = "菜单层级")
    @TableField(exist = false)
    private Integer level = 0;
} 