package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 图表指标系列配置实体
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Data
@TableName("soo_chart_series")
@Schema(description = "图表指标系列配置")
public class ChartSeries {

    private static final long serialVersionUID = 1L;

    @Schema(description = "系列ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @Schema(description = "关联图表ID")
    @TableField("chart_id")
    private Long chartId;

    @Schema(description = "系列名称")
    @TableField("series_name")
    private String seriesName;

    @Schema(description = "对应字段标识")
    @TableField("series_field")
    private String seriesField;

    @Schema(description = "系列类型: fixed-固定值, variable-变量, formula-公式")
    @TableField("series_type")
    private String seriesType;

    @Schema(description = "系列值: 可以是固定值(100), 变量(a), 或变量表达式(ax+b)")
    @TableField("series_value")
    private String seriesValue;

    @Schema(description = "系列颜色")
    @TableField("color")
    private String color;

    @Schema(description = "排序")
    @TableField("sort_order")
    private Integer sortOrder;

    @Schema(description = "创建时间")
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    // 非数据库字段
    @Schema(description = "关联的图表分析模型信息")
    @TableField(exist = false)
    private ChartAnalysisModel chartAnalysisModel;
} 