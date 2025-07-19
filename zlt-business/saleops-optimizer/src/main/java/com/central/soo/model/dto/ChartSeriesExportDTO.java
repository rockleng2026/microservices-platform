package com.central.soo.model.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import com.alibaba.excel.annotation.write.style.HeadStyle;
import com.alibaba.excel.enums.poi.FillPatternTypeEnum;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 图表系列导出DTO
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Data
@HeadStyle(fillPatternType = FillPatternTypeEnum.SOLID_FOREGROUND, fillForegroundColor = 25)
public class ChartSeriesExportDTO {

    @ExcelProperty(value = "系列ID", index = 0)
    @ColumnWidth(10)
    private Long id;

    @ExcelProperty(value = "图表ID", index = 1)
    @ColumnWidth(10)
    private Long chartId;

    @ExcelProperty(value = "系列名称", index = 2)
    @ColumnWidth(25)
    private String seriesName;

    @ExcelProperty(value = "系列字段", index = 3)
    @ColumnWidth(20)
    private String seriesField;

    @ExcelProperty(value = "系列类型", index = 4)
    @ColumnWidth(15)
    private String seriesType;

    @ExcelProperty(value = "系列值", index = 5)
    @ColumnWidth(30)
    private String seriesValue;

    @ExcelProperty(value = "系列颜色", index = 6)
    @ColumnWidth(15)
    private String color;

    @ExcelProperty(value = "排序", index = 7)
    @ColumnWidth(10)
    private Integer sortOrder;

    @ExcelProperty(value = "创建时间", index = 8)
    @ColumnWidth(20)
    private LocalDateTime createdAt;
} 