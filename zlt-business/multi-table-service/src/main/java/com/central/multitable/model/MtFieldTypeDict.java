package com.central.multitable.model;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.central.common.model.SuperEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 字段类型字典实体类
 *
 * @author multi-table-system
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mt_field_type_dict")
@Schema(description = "字段类型字典")
public class MtFieldTypeDict extends SuperEntity {
    
    @TableId
    @Schema(description = "字段类型ID")
    private Long id;
    
    @Schema(description = "字段类型标识")
    private String typeKey;
    
    @Schema(description = "字段类型名称")
    private String typeName;
    
    @Schema(description = "字段分类")
    private String category;
    
    @Schema(description = "字段类型描述")
    private String description;
    
    @Schema(description = "字段配置Schema")
    private String configSchema;
    
    @Schema(description = "是否系统字段")
    private Boolean isSystem;
    
    @Schema(description = "排序序号")
    private Integer sortOrder;
    
    @Schema(description = "状态")
    private Boolean status;
} 