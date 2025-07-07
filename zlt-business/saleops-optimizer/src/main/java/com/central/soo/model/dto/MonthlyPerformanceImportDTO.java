package com.central.soo.model.dto;

import com.alibaba.excel.annotation.ExcelProperty;
import com.alibaba.excel.annotation.ExcelIgnore;
import lombok.Data;
import java.math.BigDecimal;

/**
 * 月度绩效导入数据传输对象
 */
@Data
public class MonthlyPerformanceImportDTO {
    /**
     * 行号（Excel中的行号，用于错误定位）
     */
    @ExcelIgnore
    private Integer rowNum;
    
    /**
     * 月份（格式：YYYY-MM）
     */
    @ExcelProperty(value = "月份*", index = 0)
    private String month;
    
    /**
     * 员工ID
     */
    @ExcelProperty(value = "员工ID*", index = 1)
    private Long employeeId;
    
    /**
     * 员工姓名
     */
    @ExcelProperty(value = "员工姓名*", index = 2)
    private String employeeName;
    
    /**
     * 部门ID
     */
    @ExcelProperty(value = "部门ID*", index = 3)
    private Long departmentId;
    
    /**
     * 部门名称
     */
    @ExcelProperty(value = "部门名称*", index = 4)
    private String departmentName;
    
    /**
     * 绩效得分
     */
    @ExcelProperty(value = "绩效得分*", index = 5)
    private BigDecimal performanceScore;
    
    /**
     * 个人项目营业额
     */
    @ExcelProperty(value = "个人项目营业额", index = 6)
    private BigDecimal personalProjectRevenue;
    
    /**
     * 个人项目毛利率
     */
    @ExcelProperty(value = "个人项目毛利率", index = 7)
    private BigDecimal personalProjectMargin;
    
    /**
     * 团队项目营业额
     */
    @ExcelProperty(value = "团队项目营业额", index = 8)
    private BigDecimal teamProjectRevenue;
    
    /**
     * 团队项目毛利率
     */
    @ExcelProperty(value = "团队项目毛利率", index = 9)
    private BigDecimal teamProjectMargin;
    
    /**
     * 状态（1：有效，0：无效）
     */
    @ExcelProperty(value = "状态", index = 10)
    private Integer status;
} 