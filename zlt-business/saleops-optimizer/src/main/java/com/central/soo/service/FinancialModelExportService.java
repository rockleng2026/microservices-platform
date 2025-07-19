package com.central.soo.service;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * 财务模型导出服务接口
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
public interface FinancialModelExportService {

    /**
     * 导出单个财务模型到Excel
     * 
     * @param modelId 模型ID
     * @param response HTTP响应对象
     * @throws IOException IO异常
     */
    void exportModelToExcel(Long modelId, HttpServletResponse response) throws IOException;

    /**
     * 导出多个财务模型到Excel
     * 
     * @param modelIds 模型ID列表
     * @param response HTTP响应对象
     * @throws IOException IO异常
     */
    void exportModelsToExcel(java.util.List<Long> modelIds, HttpServletResponse response) throws IOException;

    /**
     * 导出所有财务模型到Excel
     * 
     * @param response HTTP响应对象
     * @throws IOException IO异常
     */
    void exportAllModelsToExcel(HttpServletResponse response) throws IOException;
} 