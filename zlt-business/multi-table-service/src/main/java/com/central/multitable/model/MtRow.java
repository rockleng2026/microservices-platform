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
 * 行数据实体类
 *
 * @author multi-table-system
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mt_row")
@Schema(description = "行数据信息")
public class MtRow extends SuperEntity {
    
    @TableId
    @Schema(description = "行ID")
    private Long id;
    
    @Schema(description = "所属表格ID")
    private Long tableId;
    
    @Schema(description = "行数据JSON")
    private String rowData;
    
    @Schema(description = "创建人ID")
    private Long createdBy;
    
    @Schema(description = "最后更新人ID")
    private Long updatedBy;
    
    @Schema(description = "数据版本号")
    private Integer version;
    
    @Schema(description = "是否删除")
    private Boolean isDeleted;
    
    // 重写父类的时间字段，指定正确的数据库字段名
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    @Schema(description = "创建时间")
    private Date createTime;
    
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    @Schema(description = "更新时间")
    private Date updateTime;
} 