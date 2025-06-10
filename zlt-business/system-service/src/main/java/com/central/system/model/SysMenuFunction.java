package com.central.system.model;

import com.baomidou.mybatisplus.annotation.*;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

/**
 * 系统菜单功能点实体
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("menu_func")
@Schema(description = "系统菜单功能点")
public class SysMenuFunction {

    private static final long serialVersionUID = 1L;

    @Schema(description = "功能点ID")
    @TableId(value = "id", type = IdType.AUTO)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;



    @Schema(description = "权限代码")
    @TableField("perm_code")
    private String permCode;

    @Schema(description = "权限名称")
    @TableField("perm_name")
    private String permName;

    @Schema(description = "权限类型(1按钮,2数据)")
    @TableField("perm_type")
    private Integer permType;

    @Schema(description = "所属菜单ID")
    @TableField("menu_page_id")
    @JsonSerialize(using = ToStringSerializer.class)
    private Long menuPageId;

    @Schema(description = "排序号")
    @TableField("sort_order")
    private Integer sortOrder;

    @Schema(description = "图标")
    @TableField("icon")
    private String icon;

    @Schema(description = "功能描述")
    @TableField("description")
    private String description;

    @Schema(description = "创建时间")
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createdAt;

    @Schema(description = "租户ID")
    @TableField("tenant_id")
    private String tenantId;

    // 非数据库字段
    @Schema(description = "所属菜单名称")
    @TableField(exist = false)
    private String menuName;
} 