package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.soo.model.entity.ModelInstanceVariable;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 模型实例变量Mapper接口
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Mapper
public interface ModelInstanceVariableMapper extends BaseMapper<ModelInstanceVariable> {

    /**
     * 根据实例ID查询变量列表
     * 
     * @param instanceId 实例ID
     * @return 变量列表
     */
    List<ModelInstanceVariable> selectByInstanceId(@Param("instanceId") Long instanceId);

    /**
     * 根据实例ID和变量ID查询变量
     * 
     * @param instanceId 实例ID
     * @param variableId 变量ID
     * @return 变量信息
     */
    ModelInstanceVariable selectByInstanceAndVariable(@Param("instanceId") Long instanceId, 
                                                    @Param("variableId") Long variableId);

    /**
     * 批量插入实例变量
     * 
     * @param variables 变量列表
     * @return 插入结果
     */
    int batchInsert(@Param("variables") List<ModelInstanceVariable> variables);

    /**
     * 批量更新实例变量
     * 
     * @param variables 变量列表
     * @return 更新结果
     */
    int batchUpdate(@Param("variables") List<ModelInstanceVariable> variables);

    /**
     * 根据实例ID删除变量
     * 
     * @param instanceId 实例ID
     * @return 删除结果
     */
    int deleteByInstanceId(@Param("instanceId") Long instanceId);

    /**
     * 更新变量值
     * 
     * @param instanceId 实例ID
     * @param variableId 变量ID
     * @param variableValue 变量值
     * @return 更新结果
     */
    int updateVariableValue(@Param("instanceId") Long instanceId, 
                          @Param("variableId") Long variableId, 
                          @Param("variableValue") String variableValue);

    /**
     * 更新计算值
     * 
     * @param instanceId 实例ID
     * @param variableId 变量ID
     * @param calculatedValue 计算值
     * @param isCalculated 是否已计算
     * @return 更新结果
     */
    int updateCalculatedValue(@Param("instanceId") Long instanceId, 
                            @Param("variableId") Long variableId, 
                            @Param("calculatedValue") String calculatedValue, 
                            @Param("isCalculated") Integer isCalculated);
} 