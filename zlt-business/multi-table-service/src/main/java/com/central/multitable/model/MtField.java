package com.central.multitable.model;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 表格字段定义实体类
 *
 * @author zlt
 * @date 2025-06-17
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("mt_field")
@Schema(description = "表格字段定义")
public class MtField implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id", type = IdType.AUTO)
    @Schema(description = "字段ID，主键")
    private Long id;

    @TableField("table_id")
    @Schema(description = "所属表格ID")
    private Long tableId;

    @TableField("field_key")
    @Schema(description = "字段标识（表内唯一），格式col_1,col_2,col_3...col_100")
    private String fieldKey;

    @TableField("field_name")
    @Schema(description = "字段名称")
    private String fieldName;

    @TableField("field_type")
    @Schema(description = "字段类型（关联字典表type_key）")
    private String fieldType;

    @TableField("description")
    @Schema(description = "字段描述")
    private String description;

    @TableField("config")
    @Schema(description = "字段配置（JSON格式）")
    private String config;

    @TableField("default_value")
    @Schema(description = "默认值")
    private String defaultValue;

    @TableField("is_required")
    @Schema(description = "是否必填：1=是，0=否")
    private Integer isRequired;

    @TableField("is_unique")
    @Schema(description = "是否唯一：1=是，0=否")
    private Integer isUnique;

    @TableField("is_system")
    @Schema(description = "是否系统字段：1=是，0=否")
    private Integer isSystem;

    @TableField("is_hidden")
    @Schema(description = "是否隐藏：1=是，0=否")
    private Integer isHidden;

    @TableField("sort_order")
    @Schema(description = "排序序号")
    private Integer sortOrder;

    @TableField("width")
    @Schema(description = "列宽度（像素）")
    private Integer width;

    @TableField("created_by")
    @Schema(description = "创建人ID")
    private Long createdBy;

    @TableField("created_at")
    @Schema(description = "创建时间")
    private LocalDateTime createdAt;

    @TableField("updated_at")
    @Schema(description = "更新时间")
    private LocalDateTime updatedAt;
} 