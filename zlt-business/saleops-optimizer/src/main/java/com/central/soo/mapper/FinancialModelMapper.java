package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.soo.model.entity.FinancialModel;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 财务模型Mapper接口
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Mapper
public interface FinancialModelMapper extends BaseMapper<FinancialModel> {

    /**
     * 分页查询财务模型列表（含过滤条件）
     * 
     * @param page 分页对象
     * @param category 模型分类
     * @param keyword 关键词
     * @param isActive 是否启用
     * @param isTemplate 是否模板
     * @param tenantId 租户ID
     * @return 分页结果
     */
    Page<FinancialModel> selectPageModels(
            Page<FinancialModel> page,
            @Param("category") String category,
            @Param("keyword") String keyword,
            @Param("isActive") Boolean isActive,
            @Param("isTemplate") Boolean isTemplate,
            @Param("tenantId") String tenantId
    );

    /**
     * 根据模型编码查询模型
     * 
     * @param modelCode 模型编码
     * @param tenantId 租户ID
     * @return 财务模型
     */
    FinancialModel selectByModelCode(
            @Param("modelCode") String modelCode,
            @Param("tenantId") String tenantId
    );

    /**
     * 获取模型统计信息
     * 
     * @param modelId 模型ID
     * @return 统计信息
     */
    Map<String, Object> selectModelStatistics(@Param("modelId") Long modelId);

    /**
     * 获取模型分类汇总
     * 
     * @param tenantId 租户ID
     * @return 分类汇总
     */
    List<Map<String, Object>> selectCategorySummary(@Param("tenantId") String tenantId);

    /**
     * 获取最近使用的模型
     * 
     * @param tenantId 租户ID
     * @param limit 限制数量
     * @return 最近使用的模型列表
     */
    List<FinancialModel> selectRecentlyUsedModels(
            @Param("tenantId") String tenantId,
            @Param("limit") int limit
    );

    /**
     * 根据分类统计模型数量
     * 
     * @param tenantId 租户ID
     * @return 分类统计
     */
    List<Map<String, Object>> countModelsByCategory(@Param("tenantId") String tenantId);

    /**
     * 查询活跃模型列表
     * 
     * @param tenantId 租户ID
     * @return 活跃模型列表
     */
    List<FinancialModel> selectActiveModels(@Param("tenantId") String tenantId);

    /**
     * 查询模板模型列表
     * 
     * @return 模板模型列表
     */
    List<FinancialModel> selectTemplateModels();

    /**
     * 更新模型使用时间
     * 
     * @param modelId 模型ID
     * @return 更新行数
     */
    int updateLastUsedTime(@Param("modelId") Long modelId);

    /**
     * 批量更新模型状态
     * 
     * @param modelIds 模型ID列表
     * @param isActive 是否启用
     * @return 更新行数
     */
    int batchUpdateStatus(
            @Param("modelIds") List<Long> modelIds,
            @Param("isActive") Boolean isActive
    );

    /**
     * 复制模型基本信息
     * 
     * @param sourceModelId 源模型ID
     * @param targetModel 目标模型信息
     * @return 插入行数
     */
    int copyModelInfo(
            @Param("sourceModelId") Long sourceModelId,
            @Param("targetModel") FinancialModel targetModel
    );

    /**
     * 查询模型的子模型列表
     * 
     * @param parentModelId 父模型ID
     * @return 子模型列表
     */
    List<FinancialModel> selectChildModels(@Param("parentModelId") Long parentModelId);

    /**
     * 检查模型编码是否重复
     * 
     * @param modelCode 模型编码
     * @param tenantId 租户ID
     * @param excludeId 排除的模型ID（更新时使用）
     * @return 重复的数量
     */
    int checkModelCodeExists(
            @Param("modelCode") String modelCode,
            @Param("tenantId") String tenantId,
            @Param("excludeId") Long excludeId
    );
} 