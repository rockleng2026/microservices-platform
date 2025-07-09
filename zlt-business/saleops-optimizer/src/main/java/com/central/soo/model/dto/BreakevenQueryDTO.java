package com.central.soo.model.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

/**
 * 盈亏平衡分析查询DTO
 */
@Data
@Schema(description = "盈亏平衡分析查询参数")
public class BreakevenQueryDTO {

    @Schema(description = "页码", example = "1")
    private Integer page = 1;

    @Schema(description = "每页大小", example = "10")
    private Integer size = 10;

    @Schema(description = "分析ID")
    private String analysisId;

    @Schema(description = "分析名称")
    private String analysisName;

    @Schema(description = "分析类型")
    private String analysisType;

    @Schema(description = "分析期间")
    private String analysisPeriod;

    @Schema(description = "分析期间范围-开始")
    private String periodStart;

    @Schema(description = "分析期间范围-结束")
    private String periodEnd;

    @Schema(description = "创建人ID")
    private Long creatorId;

    @Schema(description = "创建人姓名")
    private String creatorName;

    @Schema(description = "状态")
    private String status;

    @Schema(description = "状态列表")
    private List<String> statusList;

    @Schema(description = "是否实时计算")
    private Boolean isRealTime;

    @Schema(description = "是否自动重算")
    private Boolean autoRecalculation;

    @Schema(description = "创建时间-开始")
    private String createdStart;

    @Schema(description = "创建时间-结束")
    private String createdEnd;

    @Schema(description = "最后重算时间-开始")
    private String lastRecalculationStart;

    @Schema(description = "最后重算时间-结束")
    private String lastRecalculationEnd;

    @Schema(description = "关键词搜索")
    private String keyword;

    @Schema(description = "排序字段")
    private String sortField = "created_at";

    @Schema(description = "排序方向")
    private String sortDirection = "desc";

    @Schema(description = "是否包含详细信息")
    private Boolean includeDetails = false;

    /**
     * 租户ID
     */
    private String tenantId;
} 