package com.central.soo.model.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import com.alibaba.excel.annotation.write.style.HeadStyle;
import com.alibaba.excel.enums.poi.FillPatternTypeEnum;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 图表分析模型导出DTO
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Data
@HeadStyle(fillPatternType = FillPatternTypeEnum.SOLID_FOREGROUND, fillForegroundColor = 24)
public class ChartAnalysisModelExportDTO {

    @ExcelProperty(value = "图表ID", index = 0)
    @ColumnWidth(10)
    private Long id;

    @ExcelProperty(value = "模型ID", index = 1)
    @ColumnWidth(10)
    private Long modelId;

    @ExcelProperty(value = "图表名称", index = 2)
    @ColumnWidth(25)
    private String chartName;

    @ExcelProperty(value = "X轴名称", index = 3)
    @ColumnWidth(20)
    private String xAxisName;

    @ExcelProperty(value = "X轴字段", index = 4)
    @ColumnWidth(20)
    private String xAxisField;

    @ExcelProperty(value = "X轴单位", index = 5)
    @ColumnWidth(15)
    private String xAxisUnit;

    @ExcelProperty(value = "Y轴名称", index = 6)
    @ColumnWidth(20)
    private String yAxisName;

    @ExcelProperty(value = "Y轴单位", index = 7)
    @ColumnWidth(15)
    private String yAxisUnit;

    @ExcelProperty(value = "图表类型", index = 8)
    @ColumnWidth(15)
    private String chartType;

    @ExcelProperty(value = "模拟步数", index = 9)
    @ColumnWidth(12)
    private Integer simulationSteps;

    @ExcelProperty(value = "创建时间", index = 10)
    @ColumnWidth(20)
    private LocalDateTime createdAt;

    @ExcelProperty(value = "更新时间", index = 11)
    @ColumnWidth(20)
    private LocalDateTime updatedAt;
} 