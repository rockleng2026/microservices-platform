package com.central.soo.utils;

import com.alibaba.excel.EasyExcel;
import com.central.soo.model.dto.MonthlyPerformanceImportDTO;
import lombok.extern.slf4j.Slf4j;

import java.io.FileOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Excel模板生成工具类
 */
@Slf4j
public class ExcelTemplateGenerator {

    public static void main(String[] args) {
        try {
            generateTemplate();
            log.info("模板文件生成成功");
        } catch (Exception e) {
            log.error("模板文件生成失败", e);
        }
    }

    /**
     * 生成月度绩效导入模板
     */
    public static void generateTemplate() throws IOException {
        String templatePath = "src/main/resources/template/monthly_performance_template.xlsx";
        
        // 创建示例数据
        List<MonthlyPerformanceImportDTO> templateData = new ArrayList<>();
        MonthlyPerformanceImportDTO example = new MonthlyPerformanceImportDTO();
        example.setMonth("2024-01");
        example.setEmployeeId(1001L);
        example.setEmployeeName("张三");
        example.setDepartmentId(1L);
        example.setDepartmentName("技术研发部");
        example.setPerformanceScore(new BigDecimal("85.5"));
        example.setPersonalProjectRevenue(new BigDecimal("50000"));
        example.setPersonalProjectMargin(new BigDecimal("0.20"));
        example.setTeamProjectRevenue(new BigDecimal("100000"));
        example.setTeamProjectMargin(new BigDecimal("0.15"));
        example.setStatus(1);
        templateData.add(example);
        
        // 生成Excel文件
        try (FileOutputStream outputStream = new FileOutputStream(templatePath)) {
            EasyExcel.write(outputStream, MonthlyPerformanceImportDTO.class)
                    .sheet("月度绩效导入模板")
                    .doWrite(templateData);
        }
        
        log.info("Excel模板已生成到: {}", templatePath);
    }
} 