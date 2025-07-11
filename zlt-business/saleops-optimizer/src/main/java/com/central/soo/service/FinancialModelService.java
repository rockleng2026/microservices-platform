package com.central.soo.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.central.soo.model.entity.FinancialModel;

import java.util.List;
import java.util.Map;

/**
 * 财务模型服务接口
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
public interface FinancialModelService extends IService<FinancialModel> {

    /**
     * 创建财务模型
     * 
     * @param model 财务模型信息
     * @return 创建的模型
     */
    FinancialModel createModel(FinancialModel model);

    /**
     * 更新财务模型
     * 
     * @param model 财务模型信息
     * @return 更新的模型
     */
    FinancialModel updateModel(FinancialModel model);

    /**
     * 克隆财务模型
     * 
     * @param sourceModelId 源模型ID
     * @param newModelCode 新模型编码
     * @param newModelName 新模型名称
     * @param includeVariables 是否包含变量
     * @return 克隆的模型
     */
    FinancialModel cloneModel(Long sourceModelId, String newModelCode, String newModelName, boolean includeVariables);

    /**
     * 分页查询财务模型
     * 
     * @param page 分页信息
     * @param category 模型分类
     * @param keyword 关键词
     * @param isActive 是否启用
     * @param isTemplate 是否模板
     * @param tenantId 租户ID
     * @return 分页结果
     */
    Page<FinancialModel> pageModels(Page<FinancialModel> page, String category, String keyword, 
                                   Boolean isActive, Boolean isTemplate, String tenantId);

    /**
     * 根据模型编码查询模型
     * 
     * @param modelCode 模型编码
     * @param tenantId 租户ID
     * @return 财务模型
     */
    FinancialModel getByModelCode(String modelCode, String tenantId);

    /**
     * 获取模型详情（包含变量和统计信息）
     * 
     * @param modelId 模型ID
     * @return 模型详情
     */
    Map<String, Object> getModelDetail(Long modelId);

    /**
     * 获取模型统计信息
     * 
     * @param modelId 模型ID
     * @return 统计信息
     */
    Map<String, Object> getModelStatistics(Long modelId);

    /**
     * 获取模型分类汇总
     * 
     * @param tenantId 租户ID
     * @return 分类汇总
     */
    List<Map<String, Object>> getCategorySummary(String tenantId);

    /**
     * 获取最近使用的模型
     * 
     * @param tenantId 租户ID
     * @param limit 限制数量
     * @return 最近使用的模型列表
     */
    List<FinancialModel> getRecentlyUsedModels(String tenantId, int limit);

    /**
     * 删除财务模型（软删除）
     * 
     * @param modelId 模型ID
     * @return 是否成功
     */
    boolean deleteModel(Long modelId);

    /**
     * 启用/禁用模型
     * 
     * @param modelId 模型ID
     * @param isActive 是否启用
     * @return 是否成功
     */
    boolean toggleModelStatus(Long modelId, boolean isActive);

    /**
     * 验证模型完整性
     * 
     * @param modelId 模型ID
     * @return 验证结果
     */
    Map<String, Object> validateModel(Long modelId);

    /**
     * 导出模型配置
     * 
     * @param modelId 模型ID
     * @return 模型配置JSON
     */
    String exportModelConfig(Long modelId);

    /**
     * 导入模型配置
     * 
     * @param configJson 模型配置JSON
     * @param tenantId 租户ID
     * @return 导入的模型
     */
    FinancialModel importModelConfig(String configJson, String tenantId);

    /**
     * 获取盈亏平衡分析专用的财务模型列表
     * 
     * @return 盈亏平衡分析模型列表
     */
    List<FinancialModel> getBreakevenModels();
} 