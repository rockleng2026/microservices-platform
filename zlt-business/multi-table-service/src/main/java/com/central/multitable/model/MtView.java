package com.central.multitable.model;

import com.baomidou.mybatisplus.annotation.*;
import com.central.common.model.SuperEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

/**
 * 视图实体类
 *
 * @author zlt
 * @date 2025-06-17
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mt_view")
@Schema(description = "视图实体")
public class MtView extends SuperEntity {

    @Schema(description = "所属表格ID")
    @TableField("table_id")
    private Long tableId;

    @Schema(description = "所属应用空间编码")
    @TableField("app_space_code")
    private String appSpaceCode;

    @Schema(description = "视图名称")
    @TableField("view_name")
    private String viewName;

    @Schema(description = "视图类型：grid/kanban/calendar/gallery/form")
    @TableField("view_type")
    private String viewType;

    @Schema(description = "视图描述")
    @TableField("description")
    private String description;

    @Schema(description = "视图配置（JSON格式）")
    @TableField("config")
    private String config;

    @Schema(description = "是否默认视图：1=是，0=否")
    @TableField("is_default")
    private Integer isDefault;

    @Schema(description = "是否公开：1=是，0=否")
    @TableField("is_public")
    private Integer isPublic;

    @Schema(description = "排序序号")
    @TableField("sort_order")
    private Integer sortOrder;

    @Schema(description = "创建人ID")
    @TableField("created_by")
    private Long createdBy;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    @Schema(description = "创建时间")
    private Date createTime;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    @Schema(description = "更新时间")
    private Date updateTime;
} 