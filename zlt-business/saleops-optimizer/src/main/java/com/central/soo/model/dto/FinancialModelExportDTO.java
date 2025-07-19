package com.central.soo.model.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import com.alibaba.excel.annotation.write.style.HeadStyle;
import com.alibaba.excel.enums.poi.FillPatternTypeEnum;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 财务模型导出DTO
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Data
@HeadStyle(fillPatternType = FillPatternTypeEnum.SOLID_FOREGROUND, fillForegroundColor = 22)
public class FinancialModelExportDTO {

    @ExcelProperty(value = "模型ID", index = 0)
    @ColumnWidth(10)
    private Long id;

    @ExcelProperty(value = "模型编码", index = 1)
    @ColumnWidth(20)
    private String modelCode;

    @ExcelProperty(value = "模型名称", index = 2)
    @ColumnWidth(25)
    private String modelName;

    @ExcelProperty(value = "模型版本", index = 3)
    @ColumnWidth(15)
    private String modelVersion;

    @ExcelProperty(value = "模型分类", index = 4)
    @ColumnWidth(20)
    private String modelCategory;

    @ExcelProperty(value = "模型描述", index = 5)
    @ColumnWidth(40)
    private String modelDescription;

    @ExcelProperty(value = "父模型ID", index = 6)
    @ColumnWidth(12)
    private Long parentModelId;

    @ExcelProperty(value = "是否为模板", index = 7)
    @ColumnWidth(12)
    private Boolean isTemplate;

    @ExcelProperty(value = "是否启用", index = 8)
    @ColumnWidth(12)
    private Boolean isActive;

    @ExcelProperty(value = "创建人ID", index = 9)
    @ColumnWidth(12)
    private Long creatorId;

    @ExcelProperty(value = "租户ID", index = 10)
    @ColumnWidth(15)
    private String tenantId;

    @ExcelProperty(value = "创建时间", index = 11)
    @ColumnWidth(20)
    private LocalDateTime createdAt;

    @ExcelProperty(value = "更新时间", index = 12)
    @ColumnWidth(20)
    private LocalDateTime updatedAt;
} 