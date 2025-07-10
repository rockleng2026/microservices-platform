package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.soo.model.entity.ModelVariable;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;
import java.util.Map;

/**
 * 模型变量Mapper接口
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Mapper
public interface ModelVariableMapper extends BaseMapper<ModelVariable> {

    /**
     * 根据模型ID查询变量列表
     * 
     * @param modelId 模型ID
     * @return 变量列表
     */
    @Select("SELECT * FROM soo_model_variable WHERE model_id = #{modelId} ORDER BY display_order, id")
    List<ModelVariable> selectByModelId(@Param("modelId") Long modelId);

    /**
     * 根据模型ID和变量编码查询变量
     * 
     * @param modelId 模型ID
     * @param variableCode 变量编码
     * @return 模型变量
     */
    @Select("SELECT * FROM soo_model_variable WHERE model_id = #{modelId} AND variable_code = #{variableCode}")
    ModelVariable selectByModelIdAndCode(@Param("modelId") Long modelId, @Param("variableCode") String variableCode);

    /**
     * 查询模型的输入变量
     * 
     * @param modelId 模型ID
     * @return 输入变量列表
     */
    @Select("SELECT * FROM soo_model_variable WHERE model_id = #{modelId} AND variable_type = 'INPUT' ORDER BY display_order")
    List<ModelVariable> selectInputVariables(@Param("modelId") Long modelId);

    /**
     * 查询模型的计算变量
     * 
     * @param modelId 模型ID
     * @return 计算变量列表
     */
    @Select("SELECT * FROM soo_model_variable WHERE model_id = #{modelId} AND variable_type = 'CALC' ORDER BY display_order")
    List<ModelVariable> selectCalculationVariables(@Param("modelId") Long modelId);

    /**
     * 查询模型的API变量
     * 
     * @param modelId 模型ID
     * @return API变量列表
     */
    @Select("SELECT * FROM soo_model_variable WHERE model_id = #{modelId} AND variable_type = 'API' ORDER BY display_order")
    List<ModelVariable> selectApiVariables(@Param("modelId") Long modelId);

    /**
     * 查询模型的关键指标变量
     * 
     * @param modelId 模型ID
     * @return 关键指标变量列表
     */
    @Select("SELECT * FROM soo_model_variable WHERE model_id = #{modelId} AND is_key_indicator = 1 ORDER BY display_order")
    List<ModelVariable> selectKeyIndicators(@Param("modelId") Long modelId);

    /**
     * 查询变量统计信息
     * 
     * @param modelId 模型ID
     * @return 变量统计
     */
    @Select("SELECT " +
            "variable_type, " +
            "COUNT(*) as variable_count, " +
            "SUM(CASE WHEN is_required = 1 THEN 1 ELSE 0 END) as required_count, " +
            "SUM(CASE WHEN is_key_indicator = 1 THEN 1 ELSE 0 END) as key_indicator_count " +
            "FROM soo_model_variable " +
            "WHERE model_id = #{modelId} " +
            "GROUP BY variable_type")
    List<Map<String, Object>> selectVariableStatistics(@Param("modelId") Long modelId);

    /**
     * 检查变量编码是否在模型中唯一
     * 
     * @param modelId 模型ID
     * @param variableCode 变量编码
     * @param excludeId 排除的变量ID（用于更新时检查）
     * @return 是否存在
     */
    @Select("SELECT COUNT(*) FROM soo_model_variable " +
            "WHERE model_id = #{modelId} AND variable_code = #{variableCode} " +
            "AND (#{excludeId} IS NULL OR id != #{excludeId})")
    int checkVariableCodeExists(@Param("modelId") Long modelId, 
                               @Param("variableCode") String variableCode,
                               @Param("excludeId") Long excludeId);

    /**
     * 获取下一个显示顺序值
     * 
     * @param modelId 模型ID
     * @return 下一个显示顺序
     */
    @Select("SELECT COALESCE(MAX(display_order), 0) + 1 FROM soo_model_variable WHERE model_id = #{modelId}")
    int getNextDisplayOrder(@Param("modelId") Long modelId);
} 