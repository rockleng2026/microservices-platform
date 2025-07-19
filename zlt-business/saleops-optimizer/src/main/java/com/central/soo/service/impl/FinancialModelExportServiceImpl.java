package com.central.soo.service.impl;

import com.alibaba.excel.EasyExcel;
import com.alibaba.excel.ExcelWriter;
import com.alibaba.excel.write.metadata.WriteSheet;
import com.central.soo.mapper.FinancialModelMapper;
import com.central.soo.mapper.ModelVariableMapper;
import com.central.soo.mapper.ChartAnalysisModelMapper;
import com.central.soo.mapper.ChartSeriesMapper;
import com.central.soo.model.entity.FinancialModel;
import com.central.soo.model.entity.ModelVariable;
import com.central.soo.model.entity.ChartAnalysisModel;
import com.central.soo.model.entity.ChartSeries;
import com.central.soo.model.dto.FinancialModelExportDTO;
import com.central.soo.model.dto.ModelVariableExportDTO;
import com.central.soo.model.dto.ChartAnalysisModelExportDTO;
import com.central.soo.model.dto.ChartSeriesExportDTO;
import com.central.soo.service.FinancialModelExportService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 财务模型导出服务实现
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Slf4j
@Service
public class FinancialModelExportServiceImpl implements FinancialModelExportService {

    @Autowired
    private FinancialModelMapper financialModelMapper;

    @Autowired
    private ModelVariableMapper modelVariableMapper;

    @Autowired
    private ChartAnalysisModelMapper chartAnalysisModelMapper;

    @Autowired
    private ChartSeriesMapper chartSeriesMapper;

    @Override
    public void exportModelToExcel(Long modelId, HttpServletResponse response) throws IOException {
        log.info("开始导出财务模型: {}", modelId);

        // 获取模型信息
        FinancialModel model = financialModelMapper.selectById(modelId);
        if (model == null) {
            throw new RuntimeException("财务模型不存在: " + modelId);
        }

        // 设置响应头
        String fileName = URLEncoder.encode(model.getModelName() + "_" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")), 
                StandardCharsets.UTF_8);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");

        // 创建Excel写入器
        try (ExcelWriter excelWriter = EasyExcel.write(response.getOutputStream()).build()) {
            
            // 1. 导出模型基本信息
            WriteSheet modelSheet = EasyExcel.writerSheet(0, "模型信息")
                    .head(FinancialModelExportDTO.class)
                    .build();
            FinancialModelExportDTO modelExportDTO = convertToModelExportDTO(model);
            excelWriter.write(List.of(modelExportDTO), modelSheet);

            // 2. 导出模型变量
            List<ModelVariable> variables = modelVariableMapper.selectByModelId(modelId);
            if (!variables.isEmpty()) {
                WriteSheet variableSheet = EasyExcel.writerSheet(1, "模型变量")
                        .head(ModelVariableExportDTO.class)
                        .build();
                List<ModelVariableExportDTO> variableExportDTOs = variables.stream()
                        .map(this::convertToVariableExportDTO)
                        .collect(Collectors.toList());
                excelWriter.write(variableExportDTOs, variableSheet);
            }

            // 3. 导出图表配置
            List<ChartAnalysisModel> charts = chartAnalysisModelMapper.selectByModelId(modelId);
            if (!charts.isEmpty()) {
                WriteSheet chartSheet = EasyExcel.writerSheet(2, "图表配置")
                        .head(ChartAnalysisModelExportDTO.class)
                        .build();
                List<ChartAnalysisModelExportDTO> chartExportDTOs = charts.stream()
                        .map(this::convertToChartExportDTO)
                        .collect(Collectors.toList());
                excelWriter.write(chartExportDTOs, chartSheet);

                // 4. 导出图表系列
                List<ChartSeriesExportDTO> allSeriesExportDTOs = charts.stream()
                        .flatMap(chart -> {
                            List<ChartSeries> series = chartSeriesMapper.selectByChartId(chart.getId());
                            return series.stream().map(this::convertToSeriesExportDTO);
                        })
                        .collect(Collectors.toList());

                if (!allSeriesExportDTOs.isEmpty()) {
                    WriteSheet seriesSheet = EasyExcel.writerSheet(3, "图表系列")
                            .head(ChartSeriesExportDTO.class)
                            .build();
                    excelWriter.write(allSeriesExportDTOs, seriesSheet);
                }
            }
        }

        log.info("财务模型导出完成: {}", modelId);
    }

    @Override
    public void exportModelsToExcel(List<Long> modelIds, HttpServletResponse response) throws IOException {
        log.info("开始导出多个财务模型: {}", modelIds);

        if (modelIds == null || modelIds.isEmpty()) {
            throw new RuntimeException("模型ID列表不能为空");
        }

        // 设置响应头
        String fileName = URLEncoder.encode("财务模型批量导出_" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")), 
                StandardCharsets.UTF_8);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");

        // 创建Excel写入器
        try (ExcelWriter excelWriter = EasyExcel.write(response.getOutputStream()).build()) {
            
            // 1. 导出所有模型基本信息
            List<FinancialModel> models = financialModelMapper.selectBatchIds(modelIds);
            if (!models.isEmpty()) {
                WriteSheet modelSheet = EasyExcel.writerSheet(0, "模型信息")
                        .head(FinancialModelExportDTO.class)
                        .build();
                List<FinancialModelExportDTO> modelExportDTOs = models.stream()
                        .map(this::convertToModelExportDTO)
                        .collect(Collectors.toList());
                excelWriter.write(modelExportDTOs, modelSheet);
            }

            // 2. 导出所有模型变量
            List<ModelVariable> allVariables = modelIds.stream()
                    .flatMap(modelId -> modelVariableMapper.selectByModelId(modelId).stream())
                    .collect(Collectors.toList());
            
            if (!allVariables.isEmpty()) {
                WriteSheet variableSheet = EasyExcel.writerSheet(1, "模型变量")
                        .head(ModelVariableExportDTO.class)
                        .build();
                List<ModelVariableExportDTO> variableExportDTOs = allVariables.stream()
                        .map(this::convertToVariableExportDTO)
                        .collect(Collectors.toList());
                excelWriter.write(variableExportDTOs, variableSheet);
            }

            // 3. 导出所有图表配置
            List<ChartAnalysisModel> allCharts = modelIds.stream()
                    .flatMap(modelId -> chartAnalysisModelMapper.selectByModelId(modelId).stream())
                    .collect(Collectors.toList());

            if (!allCharts.isEmpty()) {
                WriteSheet chartSheet = EasyExcel.writerSheet(2, "图表配置")
                        .head(ChartAnalysisModelExportDTO.class)
                        .build();
                List<ChartAnalysisModelExportDTO> chartExportDTOs = allCharts.stream()
                        .map(this::convertToChartExportDTO)
                        .collect(Collectors.toList());
                excelWriter.write(chartExportDTOs, chartSheet);

                // 4. 导出所有图表系列
                List<ChartSeriesExportDTO> allSeriesExportDTOs = allCharts.stream()
                        .flatMap(chart -> {
                            List<ChartSeries> series = chartSeriesMapper.selectByChartId(chart.getId());
                            return series.stream().map(this::convertToSeriesExportDTO);
                        })
                        .collect(Collectors.toList());

                if (!allSeriesExportDTOs.isEmpty()) {
                    WriteSheet seriesSheet = EasyExcel.writerSheet(3, "图表系列")
                            .head(ChartSeriesExportDTO.class)
                            .build();
                    excelWriter.write(allSeriesExportDTOs, seriesSheet);
                }
            }
        }

        log.info("多个财务模型导出完成，共导出 {} 个模型", modelIds.size());
    }

    @Override
    public void exportAllModelsToExcel(HttpServletResponse response) throws IOException {
        log.info("开始导出所有财务模型");

        // 设置响应头
        String fileName = URLEncoder.encode("财务模型全量导出_" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")), 
                StandardCharsets.UTF_8);
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setCharacterEncoding("utf-8");
        response.setHeader("Content-disposition", "attachment;filename*=utf-8''" + fileName + ".xlsx");

        // 创建Excel写入器
        try (ExcelWriter excelWriter = EasyExcel.write(response.getOutputStream()).build()) {
            
            // 1. 导出所有模型基本信息
            List<FinancialModel> allModels = financialModelMapper.selectList(null);
            if (!allModels.isEmpty()) {
                WriteSheet modelSheet = EasyExcel.writerSheet(0, "模型信息")
                        .head(FinancialModelExportDTO.class)
                        .build();
                List<FinancialModelExportDTO> modelExportDTOs = allModels.stream()
                        .map(this::convertToModelExportDTO)
                        .collect(Collectors.toList());
                excelWriter.write(modelExportDTOs, modelSheet);
            }

            // 2. 导出所有模型变量
            List<ModelVariable> allVariables = modelVariableMapper.selectList(null);
            if (!allVariables.isEmpty()) {
                WriteSheet variableSheet = EasyExcel.writerSheet(1, "模型变量")
                        .head(ModelVariableExportDTO.class)
                        .build();
                List<ModelVariableExportDTO> variableExportDTOs = allVariables.stream()
                        .map(this::convertToVariableExportDTO)
                        .collect(Collectors.toList());
                excelWriter.write(variableExportDTOs, variableSheet);
            }

            // 3. 导出所有图表配置
            List<ChartAnalysisModel> allCharts = chartAnalysisModelMapper.selectList(null);
            if (!allCharts.isEmpty()) {
                WriteSheet chartSheet = EasyExcel.writerSheet(2, "图表配置")
                        .head(ChartAnalysisModelExportDTO.class)
                        .build();
                List<ChartAnalysisModelExportDTO> chartExportDTOs = allCharts.stream()
                        .map(this::convertToChartExportDTO)
                        .collect(Collectors.toList());
                excelWriter.write(chartExportDTOs, chartSheet);

                // 4. 导出所有图表系列
                List<ChartSeries> allSeries = chartSeriesMapper.selectList(null);
                if (!allSeries.isEmpty()) {
                    WriteSheet seriesSheet = EasyExcel.writerSheet(3, "图表系列")
                            .head(ChartSeriesExportDTO.class)
                            .build();
                    List<ChartSeriesExportDTO> seriesExportDTOs = allSeries.stream()
                            .map(this::convertToSeriesExportDTO)
                            .collect(Collectors.toList());
                    excelWriter.write(seriesExportDTOs, seriesSheet);
                }
            }
        }

        log.info("所有财务模型导出完成");
    }

    // ==================== 私有转换方法 ====================

    private FinancialModelExportDTO convertToModelExportDTO(FinancialModel model) {
        FinancialModelExportDTO dto = new FinancialModelExportDTO();
        BeanUtils.copyProperties(model, dto);
        return dto;
    }

    private ModelVariableExportDTO convertToVariableExportDTO(ModelVariable variable) {
        ModelVariableExportDTO dto = new ModelVariableExportDTO();
        BeanUtils.copyProperties(variable, dto);
        return dto;
    }

    private ChartAnalysisModelExportDTO convertToChartExportDTO(ChartAnalysisModel chart) {
        ChartAnalysisModelExportDTO dto = new ChartAnalysisModelExportDTO();
        BeanUtils.copyProperties(chart, dto);
        return dto;
    }

    private ChartSeriesExportDTO convertToSeriesExportDTO(ChartSeries series) {
        ChartSeriesExportDTO dto = new ChartSeriesExportDTO();
        BeanUtils.copyProperties(series, dto);
        return dto;
    }
} 