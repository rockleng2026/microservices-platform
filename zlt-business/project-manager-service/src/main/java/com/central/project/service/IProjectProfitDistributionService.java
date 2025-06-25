package com.central.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.project.model.ProjectProfitDistribution;

import java.util.List;

/**
 * 项目毛利分配服务接口
 * 
 * @author Central Team
 * @since 2024-12-25
 */
public interface IProjectProfitDistributionService extends IService<ProjectProfitDistribution> {
    
    /**
     * 根据项目ID查询提成分配记录
     * @param projectId 项目ID
     * @return 分配记录列表
     */
    List<ProjectProfitDistribution> getByProjectId(Long projectId);
    
    /**
     * 根据项目ID删除提成分配记录
     * @param projectId 项目ID
     * @return 是否成功
     */
    Boolean deleteByProjectId(Long projectId);
    
    /**
     * 根据项目ID和审批状态查询提成分配记录
     * @param projectId 项目ID
     * @param finalStatus 审批状态
     * @return 分配记录列表
     */
    List<ProjectProfitDistribution> getByProjectIdAndStatus(Long projectId, String finalStatus);
    
    /**
     * 批量保存提成分配记录
     * @param distributions 分配记录列表
     * @return 是否成功
     */
    Boolean batchSave(List<ProjectProfitDistribution> distributions);
    
    /**
     * 检查项目是否有已审批通过的提成分配记录
     * @param projectId 项目ID
     * @return 是否存在已审批的记录
     */
    Boolean hasApprovedDistribution(Long projectId);
} 