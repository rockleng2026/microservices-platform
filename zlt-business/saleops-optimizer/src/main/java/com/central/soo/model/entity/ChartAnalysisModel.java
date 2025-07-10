package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.central.common.model.SuperEntity;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 图表分析模型配置实体
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("soo_chart_analysis_model")
@Schema(description = "图表分析模型配置")
public class ChartAnalysisModel extends SuperEntity {

    private static final long serialVersionUID = 1L;

    @Schema(description = "图表分析模型ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @Schema(description = "关联的模型ID")
    @TableField("model_id")
    private Long modelId;

    @Schema(description = "图表名称")
    @TableField("chart_name")
    private String chartName;

    @Schema(description = "X轴对应字段标识")
    @TableField("x_axis_field")
    private String xAxisField;

    @Schema(description = "X轴单位")
    @TableField("x_axis_unit")
    private String xAxisUnit;

    @Schema(description = "Y轴对应字段标识")
    @TableField("y_axis_field")
    private String yAxisField;

    @Schema(description = "Y轴单位")
    @TableField("y_axis_unit")
    private String yAxisUnit;

    @Schema(description = "图表类型: line-线性图, bar-柱状图, scatter-散点图")
    @TableField("chart_type")
    private String chartType;

    @Schema(description = "模拟步数")
    @TableField("simulation_steps")
    private Integer simulationSteps;

    @Schema(description = "创建时间")
    @TableField(value = "created_at", fill = FieldFill.INSERT)
    private LocalDateTime createdAt;

    @Schema(description = "更新时间")
    @TableField(value = "updated_at", fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;

    // 非数据库字段
    @Schema(description = "关联的财务模型信息")
    @TableField(exist = false)
    private FinancialModel financialModel;

    @Schema(description = "图表系列列表")
    @TableField(exist = false)
    private java.util.List<ChartSeries> chartSeriesList;
} 