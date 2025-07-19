package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.soo.model.entity.ModelInstanceCalculationHistory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 模型实例计算历史Mapper接口
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Mapper
public interface ModelInstanceCalculationHistoryMapper extends BaseMapper<ModelInstanceCalculationHistory> {

    /**
     * 分页查询计算历史
     * 
     * @param page 分页参数
     * @param instanceId 实例ID
     * @param calculationType 计算类型
     * @param calculationStatus 计算状态
     * @return 分页结果
     */
    Page<ModelInstanceCalculationHistory> selectPageHistory(Page<ModelInstanceCalculationHistory> page,
                                                           @Param("instanceId") Long instanceId,
                                                           @Param("calculationType") String calculationType,
                                                           @Param("calculationStatus") String calculationStatus);

    /**
     * 根据实例ID查询计算历史
     * 
     * @param instanceId 实例ID
     * @param limit 限制数量
     * @return 计算历史列表
     */
    List<ModelInstanceCalculationHistory> selectByInstanceId(@Param("instanceId") Long instanceId, 
                                                            @Param("limit") Integer limit);

    /**
     * 获取最新的计算历史
     * 
     * @param instanceId 实例ID
     * @return 最新的计算历史
     */
    ModelInstanceCalculationHistory selectLatestHistory(@Param("instanceId") Long instanceId);

    /**
     * 获取计算统计信息
     * 
     * @param instanceId 实例ID
     * @return 统计信息
     */
    Map<String, Object> selectCalculationStatistics(@Param("instanceId") Long instanceId);

    /**
     * 根据计算版本查询历史
     * 
     * @param instanceId 实例ID
     * @param calculationVersion 计算版本
     * @return 计算历史
     */
    ModelInstanceCalculationHistory selectByVersion(@Param("instanceId") Long instanceId, 
                                                   @Param("calculationVersion") String calculationVersion);

    /**
     * 删除实例的计算历史
     * 
     * @param instanceId 实例ID
     * @return 删除结果
     */
    int deleteByInstanceId(@Param("instanceId") Long instanceId);

    /**
     * 更新计算状态
     * 
     * @param id 历史记录ID
     * @param calculationStatus 计算状态
     * @param outputData 输出数据
     * @param errorMessage 错误信息
     * @param executionTime 执行时间
     * @return 更新结果
     */
    int updateCalculationResult(@Param("id") Long id, 
                              @Param("calculationStatus") String calculationStatus,
                              @Param("outputData") String outputData,
                              @Param("errorMessage") String errorMessage,
                              @Param("executionTime") Integer executionTime);
} 