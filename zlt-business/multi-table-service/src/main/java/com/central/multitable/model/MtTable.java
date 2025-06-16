package com.central.multitable.model;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.central.common.model.SuperEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

/**
 * 表格实体类
 *
 * @author multi-table-system
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mt_table")
@Schema(description = "表格信息")
public class MtTable extends SuperEntity {
    
    @Schema(description = "租户ID")
    private Long tenantId;
    
    @Schema(description = "表格名称")
    private String name;
    
    @Schema(description = "表格描述")
    private String description;
    
    @Schema(description = "所属团队ID")
    private Long teamId;
    
    @Schema(description = "表格图标")
    private String icon;
    
    @Schema(description = "表格颜色")
    private String color;
    
    @Schema(description = "创建人ID")
    private Long createdBy;
    
    @Schema(description = "是否删除")
    private Boolean isDeleted;
    
    @Schema(description = "删除时间")
    private Date deletedAt;
} 