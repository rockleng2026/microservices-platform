package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.soo.model.entity.FinancialModelInstance;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 财务模型实例Mapper接口
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
@Mapper
public interface FinancialModelInstanceMapper extends BaseMapper<FinancialModelInstance> {

    /**
     * 分页查询模型实例列表
     * 
     * @param page 分页参数
     * @param modelId 模型ID
     * @param projectId 项目ID
     * @param instanceStatus 实例状态
     * @param keyword 关键词
     * @param tenantId 租户ID
     * @return 分页结果
     */
    Page<FinancialModelInstance> selectPageInstances(Page<FinancialModelInstance> page,
                                                    @Param("modelId") Long modelId,
                                                    @Param("projectId") Long projectId,
                                                    @Param("instanceStatus") String instanceStatus,
                                                    @Param("keyword") String keyword,
                                                    @Param("tenantId") String tenantId);

    /**
     * 根据模型ID查询实例列表
     * 
     * @param modelId 模型ID
     * @param tenantId 租户ID
     * @return 实例列表
     */
    List<FinancialModelInstance> selectByModelId(@Param("modelId") Long modelId, 
                                                @Param("tenantId") String tenantId);

    /**
     * 根据项目ID查询实例列表
     * 
     * @param projectId 项目ID
     * @param tenantId 租户ID
     * @return 实例列表
     */
    List<FinancialModelInstance> selectByProjectId(@Param("projectId") Long projectId, 
                                                  @Param("tenantId") String tenantId);

    /**
     * 根据实例编码查询实例
     * 
     * @param instanceCode 实例编码
     * @param tenantId 租户ID
     * @return 实例信息
     */
    FinancialModelInstance selectByInstanceCode(@Param("instanceCode") String instanceCode, 
                                               @Param("tenantId") String tenantId);

    /**
     * 获取实例详情（包含关联信息）
     * 
     * @param instanceId 实例ID
     * @return 实例详情
     */
    FinancialModelInstance selectInstanceDetail(@Param("instanceId") Long instanceId);

    /**
     * 获取实例统计信息
     * 
     * @param tenantId 租户ID
     * @return 统计信息
     */
    Map<String, Object> selectInstanceStatistics(@Param("tenantId") String tenantId);

    /**
     * 获取最近使用的实例
     * 
     * @param tenantId 租户ID
     * @param limit 限制数量
     * @return 最近使用的实例列表
     */
    List<FinancialModelInstance> selectRecentlyUsedInstances(@Param("tenantId") String tenantId, 
                                                            @Param("limit") int limit);

    /**
     * 更新实例状态
     * 
     * @param instanceId 实例ID
     * @param instanceStatus 实例状态
     * @return 更新结果
     */
    int updateInstanceStatus(@Param("instanceId") Long instanceId, 
                           @Param("instanceStatus") String instanceStatus);

    /**
     * 更新计算状态
     * 
     * @param instanceId 实例ID
     * @param calculationStatus 计算状态
     * @return 更新结果
     */
    int updateCalculationStatus(@Param("instanceId") Long instanceId, 
                              @Param("calculationStatus") String calculationStatus);
} 