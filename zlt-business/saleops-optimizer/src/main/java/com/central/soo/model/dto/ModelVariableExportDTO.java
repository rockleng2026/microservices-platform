package com.central.soo.model.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.write.style.ColumnWidth;
import com.alibaba.excel.annotation.write.style.HeadStyle;
import com.alibaba.excel.enums.poi.FillPatternTypeEnum;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 模型变量导出DTO
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Data
@HeadStyle(fillPatternType = FillPatternTypeEnum.SOLID_FOREGROUND, fillForegroundColor = 23)
public class ModelVariableExportDTO {

    @ExcelProperty(value = "变量ID", index = 0)
    @ColumnWidth(10)
    private Long id;

    @ExcelProperty(value = "模型ID", index = 1)
    @ColumnWidth(10)
    private Long modelId;

    @ExcelProperty(value = "变量编码", index = 2)
    @ColumnWidth(20)
    private String variableCode;

    @ExcelProperty(value = "变量名称", index = 3)
    @ColumnWidth(25)
    private String variableName;

    @ExcelProperty(value = "变量类型", index = 4)
    @ColumnWidth(15)
    private String variableType;

    @ExcelProperty(value = "数据类型", index = 5)
    @ColumnWidth(15)
    private String dataType;

    @ExcelProperty(value = "单位", index = 6)
    @ColumnWidth(10)
    private String unit;

    @ExcelProperty(value = "父级ID", index = 7)
    @ColumnWidth(10)
    private Long parentId;

    @ExcelProperty(value = "默认值", index = 8)
    @ColumnWidth(15)
    private BigDecimal defaultValue;

    @ExcelProperty(value = "最小值", index = 9)
    @ColumnWidth(15)
    private BigDecimal minValue;

    @ExcelProperty(value = "最大值", index = 10)
    @ColumnWidth(15)
    private BigDecimal maxValue;

    @ExcelProperty(value = "计算公式", index = 11)
    @ColumnWidth(40)
    private String calculationFormula;

    @ExcelProperty(value = "约束条件", index = 12)
    @ColumnWidth(40)
    private String constraintFormula;

    @ExcelProperty(value = "显示顺序", index = 13)
    @ColumnWidth(12)
    private Integer displayOrder;

    @ExcelProperty(value = "是否必填", index = 14)
    @ColumnWidth(12)
    private Boolean isRequired;

    @ExcelProperty(value = "是否关键指标", index = 15)
    @ColumnWidth(15)
    private Boolean isKeyIndicator;

    @ExcelProperty(value = "是否显示", index = 16)
    @ColumnWidth(12)
    private Boolean isVisible;

    @ExcelProperty(value = "变量描述", index = 17)
    @ColumnWidth(40)
    private String description;

    @ExcelProperty(value = "帮助说明", index = 18)
    @ColumnWidth(40)
    private String helpText;

    @ExcelProperty(value = "创建时间", index = 19)
    @ColumnWidth(20)
    private LocalDateTime createdAt;

    @ExcelProperty(value = "更新时间", index = 20)
    @ColumnWidth(20)
    private LocalDateTime updatedAt;
} 