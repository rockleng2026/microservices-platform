package com.central.multitable.model;

import com.baomidou.mybatisplus.annotation.*;
import com.central.common.model.SuperEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

/**
 * 应用空间实体类
 *
 * @author zlt
 * @date 2025-06-17
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mt_app_space")
@Schema(description = "应用空间实体")
public class MtAppSpace extends SuperEntity {

    @Schema(description = "应用空间编码，唯一键")
    @TableField("uni_code")
    private String uniCode;

    @Schema(description = "所属租户ID")
    @TableField("tenant_id")
    private String tenantId;

    @Schema(description = "应用空间名称")
    @TableField("name")
    private String name;

    @Schema(description = "应用空间描述")
    @TableField("description")
    private String description;

    @Schema(description = "所属团队ID")
    @TableField("team_id")
    private Long teamId;

    @Schema(description = "图标")
    @TableField("icon")
    private String icon;

    @Schema(description = "颜色（十六进制）")
    @TableField("color")
    private String color;

    @Schema(description = "创建人ID")
    @TableField("created_by")
    private Long createdBy;

    @Schema(description = "表格数量")
    @TableField("table_count")
    private Integer tableCount;

    @Schema(description = "视图数量")
    @TableField("view_count")
    private Integer viewCount;

    @Schema(description = "是否模板：1=是，0=否")
    @TableField("is_template")
    private Integer isTemplate;

    @Schema(description = "模板分类")
    @TableField("template_category")
    private String templateCategory;

    @Schema(description = "状态：1=正常，0=删除")
    @TableField("status")
    private Integer status;

    @TableField(value = "created_at", fill = FieldFill.INSERT)
    @Schema(description = "创建时间")
    private Date createTime;

    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    @Schema(description = "更新时间")
    private Date updateTime;
} 