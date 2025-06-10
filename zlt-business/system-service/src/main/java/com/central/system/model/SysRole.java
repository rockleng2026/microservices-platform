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
 * 系统角色实体
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("roles")
@Schema(description = "系统角色")
public class SysRole {

    private static final long serialVersionUID = 1L;

    @Schema(description = "角色ID")
    @TableId(value = "id", type = IdType.AUTO)
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;



    @Schema(description = "角色名称")
    @TableField("role_name")
    private String roleName;

    @Schema(description = "角色描述")
    @TableField("role_description")
    private String roleDescription;

    @Schema(description = "角色编码")
    @TableField("role_code")
    private String roleCode;

    @Schema(description = "角色类型(1系统角色,2自定义角色)")
    @TableField("role_type")
    private Integer roleType;

    @Schema(description = "权限配置JSON")
    @TableField("permissions")
    private String permissions;

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

    @Schema(description = "更新时间")
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date updatedAt;

    @Schema(description = "租户ID")
    @TableField("tenant_id")
    private String tenantId;

    // 非数据库字段
    @Schema(description = "菜单权限列表")
    @TableField(exist = false)
    private List<SysMenu> menus;

    @Schema(description = "功能权限列表")
    @TableField(exist = false)
    private List<SysMenuFunction> functions;

    @Schema(description = "用户数量")
    @TableField(exist = false)
    private Integer userCount;
} 