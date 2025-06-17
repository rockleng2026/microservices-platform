package com.central.multitable.model;

import com.baomidou.mybatisplus.annotation.FieldFill;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.central.common.model.SuperEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

/**
 * 字段实体类
 *
 * @author multi-table-system
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mt_field")
@Schema(description = "字段信息")
public class MtField extends SuperEntity {
    
    @TableId
    @Schema(description = "字段ID")
    private Long id;
    
    @Schema(description = "所属表格ID")
    private Long tableId;
    
    @Schema(description = "字段标识")
    private String fieldKey;
    
    @Schema(description = "字段名称")
    private String fieldName;
    
    @Schema(description = "字段类型")
    private String fieldType;
    
    @Schema(description = "字段描述")
    private String description;
    
    @Schema(description = "字段配置JSON")
    private String config;
    
    @Schema(description = "默认值")
    private String defaultValue;
    
    @Schema(description = "是否必填")
    private Boolean isRequired;
    
    @Schema(description = "是否唯一")
    private Boolean isUnique;
    
    @Schema(description = "是否系统字段")
    private Boolean isSystem;
    
    @Schema(description = "是否隐藏")
    private Boolean isHidden;
    
    @Schema(description = "排序序号")
    private Integer sortOrder;
    
    @Schema(description = "列宽度")
    private Integer width;
    
    @Schema(description = "创建人ID")
    private Long createdBy;
    
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    @Schema(description = "创建时间")
    private Date createdAt;
    
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    @Schema(description = "更新时间")  
    private Date updatedAt;
    
    public Date getCreateTime() {
        return this.createdAt;
    }
    
    public void setCreateTime(Date createTime) {
        this.createdAt = createTime;
    }
    
    public Date getUpdateTime() {
        return this.updatedAt;
    }
    
    public void setUpdateTime(Date updateTime) {
        this.updatedAt = updateTime;
    }
} 