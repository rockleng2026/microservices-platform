package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.soo.model.entity.ModelVariable;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Update;

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
     * 分页查询模型变量列表（含过滤条件）
     * 
     * @param page 分页对象
     * @param modelId 模型ID
     * @param keyword 关键词
     * @param variableType 变量类型
     * @param dataType 数据类型
     * @return 分页结果
     */
    @Select("<script>" +
            "SELECT * FROM soo_model_variable WHERE 1=1 " +
            "<if test='modelId != null'>AND model_id = #{modelId}</if> " +
            "<if test='variableType != null and variableType != \"\"'>AND variable_type = #{variableType}</if> " +
            "<if test='dataType != null and dataType != \"\"'>AND data_type = #{dataType}</if> " +
            "<if test='keyword != null and keyword != \"\"'>" +
            "AND (variable_name LIKE CONCAT('%', #{keyword}, '%') " +
            "OR variable_code LIKE CONCAT('%', #{keyword}, '%') " +
            "OR description LIKE CONCAT('%', #{keyword}, '%'))" +
            "</if> " +
            "ORDER BY display_order ASC, created_at DESC" +
            "</script>")
    Page<ModelVariable> selectPageVariables(
            Page<ModelVariable> page,
            @Param("modelId") Long modelId,
            @Param("keyword") String keyword,
            @Param("variableType") String variableType,
            @Param("dataType") String dataType
    );

    /**
     * 根据模型ID查询变量列表
     * 
     * @param modelId 模型ID
     * @return 变量列表
     */
    @Select("SELECT * FROM soo_model_variable WHERE model_id = #{modelId} ORDER BY display_order ASC")
    List<ModelVariable> selectByModelId(@Param("modelId") Long modelId);

    /**
     * 根据模型ID查询变量树形结构（根节点）
     * 
     * @param modelId 模型ID
     * @return 根变量列表
     */
    @Select("SELECT * FROM soo_model_variable WHERE model_id = #{modelId} AND (parent_id IS NULL OR parent_id = 0) ORDER BY display_order ASC")
    List<ModelVariable> selectRootVariablesByModelId(@Param("modelId") Long modelId);

    /**
     * 根据父变量ID查询子变量列表
     * 
     * @param parentId 父变量ID
     * @return 子变量列表
     */
    @Select("SELECT * FROM soo_model_variable WHERE parent_id = #{parentId} ORDER BY display_order ASC")
    List<ModelVariable> selectChildrenByParentId(@Param("parentId") Long parentId);

    /**
     * 根据变量ID查询父变量
     * 
     * @param id 变量ID
     * @return 父变量
     */
    @Select("SELECT p.* FROM soo_model_variable p " +
            "INNER JOIN soo_model_variable c ON p.id = c.parent_id " +
            "WHERE c.id = #{id}")
    ModelVariable selectParentById(@Param("id") Long id);

    /**
     * 查询变量的所有子变量（递归）
     * 
     * @param parentId 父变量ID
     * @return 所有子变量列表
     */
    @Select("WITH RECURSIVE variable_tree AS (" +
            "SELECT id, parent_id, variable_name, variable_code, variable_type, data_type, display_order, 1 as level " +
            "FROM soo_model_variable WHERE parent_id = #{parentId} " +
            "UNION ALL " +
            "SELECT v.id, v.parent_id, v.variable_name, v.variable_code, v.variable_type, v.data_type, v.display_order, vt.level + 1 " +
            "FROM soo_model_variable v " +
            "INNER JOIN variable_tree vt ON v.parent_id = vt.id" +
            ") " +
            "SELECT * FROM variable_tree ORDER BY level, display_order")
    List<ModelVariable> selectAllChildrenRecursive(@Param("parentId") Long parentId);

    /**
     * 查询变量的所有父变量（递归）
     * 
     * @param id 变量ID
     * @return 所有父变量列表
     */
    @Select("WITH RECURSIVE variable_tree AS (" +
            "SELECT id, parent_id, variable_name, variable_code, variable_type, data_type, display_order, 1 as level " +
            "FROM soo_model_variable WHERE id = #{id} " +
            "UNION ALL " +
            "SELECT v.id, v.parent_id, v.variable_name, v.variable_code, v.variable_type, v.data_type, v.display_order, vt.level + 1 " +
            "FROM soo_model_variable v " +
            "INNER JOIN variable_tree vt ON v.id = vt.parent_id" +
            ") " +
            "SELECT * FROM variable_tree ORDER BY level DESC")
    List<ModelVariable> selectAllParentsRecursive(@Param("id") Long id);

    /**
     * 根据变量编码查询变量
     * 
     * @param modelId 模型ID
     * @param variableCode 变量编码
     * @return 模型变量
     */
    @Select("SELECT * FROM soo_model_variable WHERE model_id = #{modelId} AND variable_code = #{variableCode}")
    ModelVariable selectByVariableCode(
            @Param("modelId") Long modelId,
            @Param("variableCode") String variableCode
    );

    /**
     * 获取模型变量统计信息
     * 
     * @param modelId 模型ID
     * @return 统计信息
     */
    @Select("<script>" +
            "SELECT " +
            "COUNT(*) as total_count, " +
            "SUM(CASE WHEN variable_type = 'INPUT' THEN 1 ELSE 0 END) as input_count, " +
            "SUM(CASE WHEN variable_type = 'CALC' THEN 1 ELSE 0 END) as calc_count, " +
            "SUM(CASE WHEN variable_type = 'API' THEN 1 ELSE 0 END) as api_count, " +
            "SUM(CASE WHEN is_required = 1 THEN 1 ELSE 0 END) as required_count, " +
            "SUM(CASE WHEN is_visible = 1 THEN 1 ELSE 0 END) as visible_count, " +
            "SUM(CASE WHEN is_key_indicator = 1 THEN 1 ELSE 0 END) as key_indicator_count, " +
            "SUM(CASE WHEN parent_id IS NOT NULL AND parent_id > 0 THEN 1 ELSE 0 END) as tree_variable_count " +
            "FROM soo_model_variable WHERE model_id = #{modelId}" +
            "</script>")
    Map<String, Object> selectVariableStatistics(@Param("modelId") Long modelId);

    /**
     * 检查变量编码是否重复
     * 
     * @param modelId 模型ID
     * @param variableCode 变量编码
     * @param excludeId 排除的变量ID（更新时使用）
     * @return 重复的数量
     */
    @Select("<script>" +
            "SELECT COUNT(*) FROM soo_model_variable WHERE model_id = #{modelId} " +
            "AND variable_code = #{variableCode} " +
            "<if test='excludeId != null'>AND id != #{excludeId}</if>" +
            "</script>")
    int checkVariableCodeExists(
            @Param("modelId") Long modelId,
            @Param("variableCode") String variableCode,
            @Param("excludeId") Long excludeId
    );

    /**
     * 批量删除变量
     * 
     * @param ids 变量ID列表
     * @return 删除行数
     */
    @Delete("<script>" +
            "DELETE FROM soo_model_variable WHERE id IN " +
            "<foreach collection='ids' item='id' open='(' separator=',' close=')'>" +
            "#{id}" +
            "</foreach>" +
            "</script>")
    int batchDeleteByIds(@Param("ids") List<Long> ids);

    /**
     * 获取模型变量的最大显示顺序
     * 
     * @param modelId 模型ID
     * @return 最大显示顺序
     */
    @Select("SELECT IFNULL(MAX(display_order), 0) FROM soo_model_variable WHERE model_id = #{modelId}")
    Integer selectMaxDisplayOrder(@Param("modelId") Long modelId);

    /**
     * 更新变量显示顺序
     * 
     * @param id 变量ID
     * @param displayOrder 显示顺序
     * @return 更新行数
     */
    @Update("UPDATE soo_model_variable SET display_order = #{displayOrder} WHERE id = #{id}")
    int updateDisplayOrder(
            @Param("id") Long id,
            @Param("displayOrder") Integer displayOrder
    );

    /**
     * 更新变量父级ID
     * 
     * @param id 变量ID
     * @param parentId 父级ID
     * @return 更新行数
     */
    @Update("UPDATE soo_model_variable SET parent_id = #{parentId} WHERE id = #{id}")
    int updateParentId(
            @Param("id") Long id,
            @Param("parentId") Long parentId
    );

    /**
     * 检查是否存在循环引用
     * 
     * @param id 变量ID
     * @param newParentId 新的父级ID
     * @return 是否存在循环引用
     */
    @Select("WITH RECURSIVE variable_tree AS (" +
            "SELECT id, parent_id FROM soo_model_variable WHERE id = #{newParentId} " +
            "UNION ALL " +
            "SELECT v.id, v.parent_id FROM soo_model_variable v " +
            "INNER JOIN variable_tree vt ON v.id = vt.parent_id" +
            ") " +
            "SELECT COUNT(*) FROM variable_tree WHERE id = #{id}")
    int checkCircularReference(
            @Param("id") Long id,
            @Param("newParentId") Long newParentId
    );

    /**
     * 获取变量的依赖关系
     * 
     * @param variableId 变量ID
     * @return 依赖的变量列表
     */
    @Select("SELECT DISTINCT v.* FROM soo_model_variable v " +
            "WHERE v.calculation_formula LIKE CONCAT('%', " +
            "(SELECT variable_code FROM soo_model_variable WHERE id = #{variableId}), '%') " +
            "OR v.constraint_formula LIKE CONCAT('%', " +
            "(SELECT variable_code FROM soo_model_variable WHERE id = #{variableId}), '%')")
    List<ModelVariable> selectDependencies(@Param("variableId") Long variableId);

    /**
     * 根据模型ID删除所有变量
     * 
     * @param modelId 模型ID
     * @return 删除行数
     */
    @Delete("DELETE FROM soo_model_variable WHERE model_id = #{modelId}")
    int deleteByModelId(@Param("modelId") Long modelId);
} 