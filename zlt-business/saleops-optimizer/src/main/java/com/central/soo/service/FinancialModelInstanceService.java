package com.central.soo.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.central.common.model.PageResult;
import com.central.soo.model.entity.FinancialModelInstance;
import com.central.soo.model.entity.ModelInstanceVariable;
import com.central.soo.model.entity.ModelVariable;

import java.util.List;
import java.util.Map;

/**
 * 财务模型实例服务接口
 * 
 * @author Portal 3.0 开发团队
 * @since 2024-12-19
 */
public interface FinancialModelInstanceService extends IService<FinancialModelInstance> {

    /**
     * 分页查询模型实例列表（返回PageResult格式）
     * 
     * @param page 页码
     * @param size 页大小
     * @param modelId 模型ID
     * @param projectId 项目ID
     * @param instanceStatus 实例状态
     * @param keyword 关键词
     * @param tenantId 租户ID
     * @return 分页结果
     */
    PageResult<FinancialModelInstance> pageInstances(Integer page, Integer size, Long modelId, 
                                                    Long projectId, String instanceStatus, String keyword, String tenantId);

    /**
     * 分页查询模型实例列表（返回Page格式，保留兼容性）
     * 
     * @param page 分页参数
     * @param modelId 模型ID
     * @param projectId 项目ID
     * @param instanceStatus 实例状态
     * @param keyword 关键词
     * @param tenantId 租户ID
     * @return 分页结果
     */
    Page<FinancialModelInstance> pageInstances(Page<FinancialModelInstance> page, Long modelId, 
                                              Long projectId, String instanceStatus, String keyword, String tenantId);

    /**
     * 创建模型实例
     * 
     * @param instance 实例信息
     * @return 创建的实例
     */
    FinancialModelInstance createInstance(FinancialModelInstance instance);

    /**
     * 更新模型实例
     * 
     * @param instance 实例信息
     * @return 更新后的实例
     */
    FinancialModelInstance updateInstance(FinancialModelInstance instance);

    /**
     * 获取实例详情
     * 
     * @param instanceId 实例ID
     * @return 实例详情
     */
    Map<String, Object> getInstanceDetail(Long instanceId);

    /**
     * 删除模型实例
     * 
     * @param instanceId 实例ID
     * @return 是否成功
     */
    boolean deleteInstance(Long instanceId);

    /**
     * 启用/禁用实例
     * 
     * @param instanceId 实例ID
     * @param isActive 是否启用
     * @return 是否成功
     */
    boolean toggleInstanceStatus(Long instanceId, boolean isActive);

    /**
     * 根据模型ID查询实例列表
     * 
     * @param modelId 模型ID
     * @param tenantId 租户ID
     * @return 实例列表
     */
    List<FinancialModelInstance> getInstancesByModelId(Long modelId, String tenantId);

    /**
     * 根据项目ID查询实例列表
     * 
     * @param projectId 项目ID
     * @param tenantId 租户ID
     * @return 实例列表
     */
    List<FinancialModelInstance> getInstancesByProjectId(Long projectId, String tenantId);

    /**
     * 根据实例编码查询实例
     * 
     * @param instanceCode 实例编码
     * @param tenantId 租户ID
     * @return 实例信息
     */
    FinancialModelInstance getByInstanceCode(String instanceCode, String tenantId);

    /**
     * 获取实例统计信息
     * 
     * @param tenantId 租户ID
     * @return 统计信息
     */
    Map<String, Object> getInstanceStatistics(String tenantId);

    /**
     * 获取最近使用的实例
     * 
     * @param tenantId 租户ID
     * @param limit 限制数量
     * @return 最近使用的实例列表
     */
    List<FinancialModelInstance> getRecentlyUsedInstances(String tenantId, int limit);

    /**
     * 克隆模型实例
     * 
     * @param sourceInstanceId 源实例ID
     * @param newInstanceCode 新实例编码
     * @param newInstanceName 新实例名称
     * @return 克隆的实例
     */
    FinancialModelInstance cloneInstance(Long sourceInstanceId, String newInstanceCode, String newInstanceName);

    /**
     * 验证实例完整性
     * 
     * @param instanceId 实例ID
     * @return 验证结果
     */
    Map<String, Object> validateInstance(Long instanceId);

    /**
     * 获取实例变量列表
     * 
     * @param instanceId 实例ID
     * @return 变量列表
     */
    List<ModelInstanceVariable> getInstanceVariables(Long instanceId);

    /**
     * 更新实例变量值
     * 
     * @param instanceId 实例ID
     * @param variables 变量列表
     * @return 是否成功
     */
    boolean updateInstanceVariables(Long instanceId, List<ModelInstanceVariable> variables);

    /**
     * 导出实例配置
     * 
     * @param instanceId 实例ID
     * @return 实例配置JSON
     */
    String exportInstanceConfig(Long instanceId);

    /**
     * 导入实例配置
     * 
     * @param configJson 实例配置JSON
     * @param tenantId 租户ID
     * @return 导入的实例
     */
    FinancialModelInstance importInstanceConfig(String configJson, String tenantId);

    /**
     * 创建实例变量
     * @param instanceId 实例ID
     * @param variables 变量列表
     * @return 是否成功
     */
    boolean createInstanceVariables(Long instanceId, List<ModelInstanceVariable> variables);

    /**
     * 获取实例试算数据
     * @param instanceId 实例ID
     * @return 试算数据
     */
    Map<String, Object> getTrialCalculationData(Long instanceId);

    /**
     * 执行实例计算（支持变量赋值和返回类型控制）
     * @param instanceId 实例ID
     * @param calculationType 计算类型
     * @param triggeredBy 触发人ID
     * @param variableValues 变量赋值（INPUT/API类型）
     * @param calcOnly 是否只返回CALC类型变量
     * @return 计算结果
     */
    Map<String, Object> executeCalculationV2(Long instanceId, String calculationType, Long triggeredBy, List<Map<String, Object>> variableValues, Boolean calcOnly);
} 