package com.central.multitable.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 表格查询参数DTO
 *
 * @author multi-table-system
 */
@Data
@Schema(description = "表格查询参数")
public class TableQueryDTO {
    
    @Schema(description = "页码", example = "1", defaultValue = "1")
    private Integer page = 1;
    
    @Schema(description = "每页大小", example = "20", defaultValue = "20")
    private Integer limit = 20;
    
    @Schema(description = "表格名称", example = "员工信息表")
    private String name;
    
    @Schema(description = "团队ID", example = "1")
    private Long teamId;
    
    @Schema(description = "创建者ID", example = "1")
    private Long createdBy;
    
    @Schema(description = "是否已删除", example = "false")
    private Boolean isDeleted = false;
    
    @Schema(description = "排序字段", example = "updated_at")
    private String orderBy = "updated_at";
    
    @Schema(description = "排序方向", example = "desc")
    private String orderDirection = "desc";
} 