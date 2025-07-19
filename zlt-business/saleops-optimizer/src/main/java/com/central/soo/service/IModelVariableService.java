package com.central.soo.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.central.soo.model.entity.ModelVariable;

import java.util.List;
import java.util.Map;

/**
 * 模型变量服务接口
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
public interface IModelVariableService extends IService<ModelVariable> {

    /**
     * 分页查询模型变量列表
     * 
     * @param page 当前页
     * @param size 每页大小
     * @param modelId 模型ID
     * @param keyword 关键词
     * @param variableType 变量类型
     * @param dataType 数据类型
     * @return 分页结果
     */
    IPage<ModelVariable> getVariables(int page, int size, Long modelId, String keyword, String variableType, String dataType);

    /**
     * 根据模型ID查询变量列表
     * 
     * @param modelId 模型ID
     * @return 变量列表
     */
    List<ModelVariable> getVariablesByModelId(Long modelId);

    /**
     * 根据模型ID查询变量树形结构
     * 
     * @param modelId 模型ID
     * @return 变量树形结构
     */
    List<ModelVariable> getVariableTree(Long modelId);

    /**
     * 根据父变量ID查询子变量列表
     * 
     * @param parentId 父变量ID
     * @return 子变量列表
     */
    List<ModelVariable> getChildVariables(Long parentId);

    /**
     * 根据变量ID查询父变量
     * 
     * @param id 变量ID
     * @return 父变量
     */
    ModelVariable getParentVariable(Long id);

    /**
     * 查询变量的所有子变量（递归）
     * 
     * @param parentId 父变量ID
     * @return 所有子变量列表
     */
    List<ModelVariable> getAllChildrenRecursive(Long parentId);

    /**
     * 查询变量的所有父变量（递归）
     * 
     * @param id 变量ID
     * @return 所有父变量列表
     */
    List<ModelVariable> getAllParentsRecursive(Long id);

    /**
     * 创建模型变量
     * 
     * @param variable 变量信息
     * @return 创建的变量
     */
    ModelVariable createVariable(ModelVariable variable);

    /**
     * 更新模型变量
     * 
     * @param id 变量ID
     * @param variable 变量信息
     * @return 更新的变量
     */
    ModelVariable updateVariable(Long id, ModelVariable variable);

    /**
     * 删除模型变量
     * 
     * @param id 变量ID
     * @return 是否删除成功
     */
    boolean deleteVariable(Long id);

    /**
     * 批量删除模型变量
     * 
     * @param ids 变量ID列表
     * @return 是否删除成功
     */
    boolean batchDeleteVariables(List<Long> ids);

    /**
     * 移动变量到新的父级
     * 
     * @param id 变量ID
     * @param newParentId 新的父级ID
     * @return 是否移动成功
     */
    boolean moveVariable(Long id, Long newParentId);

    /**
     * 复制变量
     * 
     * @param id 源变量ID
     * @param newVariableCode 新变量编码
     * @param newVariableName 新变量名称
     * @return 复制的变量
     */
    ModelVariable cloneVariable(Long id, String newVariableCode, String newVariableName);

    /**
     * 检查变量编码是否重复
     * 
     * @param modelId 模型ID
     * @param variableCode 变量编码
     * @param excludeId 排除的变量ID
     * @return 是否重复
     */
    boolean checkVariableCodeExists(Long modelId, String variableCode, Long excludeId);

    /**
     * 获取变量统计信息
     * 
     * @param modelId 模型ID
     * @return 统计信息
     */
    Map<String, Object> getVariableStatistics(Long modelId);

    /**
     * 获取模型的变量数量
     * 
     * @param modelId 模型ID
     * @return 变量数量
     */
    int getVariableCountByModelId(Long modelId);

    /**
     * 验证公式表达式
     * 
     * @param modelId 模型ID
     * @param formula 公式表达式
     * @return 验证结果
     */
    Map<String, Object> validateFormula(Long modelId, String formula);

    /**
     * 验证约束条件
     * 
     * @param modelId 模型ID
     * @param parentId 父变量ID
     * @param constraintFormula 约束条件公式
     * @return 验证结果
     */
    Map<String, Object> validateConstraint(Long modelId, Long parentId, String constraintFormula);

    /**
     * 更新变量显示顺序
     * 
     * @param variables 变量ID和显示顺序映射
     * @return 是否更新成功
     */
    boolean updateVariableOrder(List<Map<String, Object>> variables);

    /**
     * 更新变量顺序（上下移动）
     * 
     * @param id 变量ID
     * @param direction 移动方向（up/down）
     * @return 是否更新成功
     */
    boolean updateVariableOrder(Long id, String direction);

    /**
     * 获取变量依赖关系
     * 
     * @param variableId 变量ID
     * @return 依赖的变量列表
     */
    List<ModelVariable> getVariableDependencies(Long variableId);

    /**
     * 检查是否存在循环引用
     * 
     * @param id 变量ID
     * @param newParentId 新的父级ID
     * @return 是否存在循环引用
     */
    boolean checkCircularReference(Long id, Long newParentId);

    /**
     * 构建变量树形结构
     * 
     * @param variables 变量列表
     * @return 树形结构
     */
    List<ModelVariable> buildVariableTree(List<ModelVariable> variables);

    /**
     * 导出变量配置
     * 
     * @param modelId 模型ID
     * @return JSON配置字符串
     */
    String exportVariables(Long modelId);

    /**
     * 导入变量配置
     * 
     * @param modelId 模型ID
     * @param configJson JSON配置字符串
     * @return 导入的变量列表
     */
    List<ModelVariable> importVariables(Long modelId, String configJson);
} 