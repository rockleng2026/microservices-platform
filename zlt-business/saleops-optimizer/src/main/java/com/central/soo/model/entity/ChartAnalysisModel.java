package com.central.soo.model.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.central.common.model.BaseEntity;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

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
public class ChartAnalysisModel extends BaseEntity {

    private static final long serialVersionUID = 1L;

    @Schema(description = "图表分析模型ID")
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    @JsonProperty("xAxisName")
    @Schema(description = "X轴名称标识")
    @TableField("x_axis_name")
    private String xAxisName;

    @JsonProperty("xAxisField")
    @Schema(description = "X轴对应字段标识")
    @TableField("x_axis_field")
    private String xAxisField;

    @JsonProperty("xAxisUnit")
    @Schema(description = "X轴单位")
    @TableField("x_axis_unit")
    private String xAxisUnit;

    @JsonProperty("yAxisName")
    @Schema(description = "Y轴名称标识")
    @TableField("y_axis_name")
    private String yAxisName;

    @JsonProperty("yAxisField")
    @Schema(description = "Y轴对应字段标识")
    @TableField("y_axis_field")
    private String yAxisField;

    @JsonProperty("yAxisUnit")
    @Schema(description = "Y轴单位")
    @TableField("y_axis_unit")
    private String yAxisUnit;

    @JsonProperty("chartType")
    @Schema(description = "图表类型: line-线性图, bar-柱状图, scatter-散点图")
    @TableField("chart_type")
    private String chartType;

    @JsonProperty("simulationSteps")
    @Schema(description = "模拟步数")
    @TableField("simulation_steps")
    private Integer simulationSteps;

    @JsonProperty("modelId")
    @Schema(description = "关联的模型ID")
    @TableField("model_id")
    private Long modelId;

    @JsonProperty("chartName")
    @Schema(description = "图表名称")
    @TableField("chart_name")
    private String chartName;

    // 非数据库字段
    @Schema(description = "关联的财务模型信息")
    @TableField(exist = false)
    private FinancialModel financialModel;

    @Schema(description = "图表系列列表")
    @TableField(exist = false)
    private java.util.List<ChartSeries> chartSeriesList;
} 