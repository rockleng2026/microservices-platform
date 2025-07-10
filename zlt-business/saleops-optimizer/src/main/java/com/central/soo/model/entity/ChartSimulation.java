package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.central.common.model.SuperEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 图表模拟结果存储实体
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("soo_chart_simulation")
@Schema(description = "图表模拟结果存储")
public class ChartSimulation extends SuperEntity {

    private static final long serialVersionUID = 1L;

    @Schema(description = "模拟结果ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @Schema(description = "关联模型运行ID")
    @TableField("run_id")
    private Long runId;

    @Schema(description = "关联图表ID")
    @TableField("chart_id")
    private Long chartId;

    @Schema(description = "X轴值")
    @TableField("x_value")
    private BigDecimal xValue;

    @Schema(description = "关联系列ID")
    @TableField("series_id")
    private Long seriesId;

    @Schema(description = "Y轴值")
    @TableField("y_value")
    private BigDecimal yValue;

    @Schema(description = "计算时间")
    @TableField(value = "calculated_at", fill = FieldFill.INSERT)
    private LocalDateTime calculatedAt;

    // 非数据库字段
    @Schema(description = "关联的图表分析模型")
    @TableField(exist = false)
    private ChartAnalysisModel chartAnalysisModel;

    @Schema(description = "关联的图表系列")
    @TableField(exist = false)
    private ChartSeries chartSeries;
} 