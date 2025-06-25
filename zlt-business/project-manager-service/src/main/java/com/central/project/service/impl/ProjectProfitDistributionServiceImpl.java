package com.central.project.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.project.mapper.ProjectProfitDistributionMapper;
import com.central.project.model.ProjectProfitDistribution;
import com.central.project.service.IProjectProfitDistributionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 项目毛利分配服务实现类
 * 
 * @author Central Team
 * @since 2024-12-25
 */
@Slf4j
@Service
public class ProjectProfitDistributionServiceImpl extends ServiceImpl<ProjectProfitDistributionMapper, ProjectProfitDistribution> 
        implements IProjectProfitDistributionService {

    @Override
    public List<ProjectProfitDistribution> getByProjectId(Long projectId) {
        if (projectId == null) {
            return List.of();
        }
        return baseMapper.selectByProjectId(projectId);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteByProjectId(Long projectId) {
        if (projectId == null) {
            return false;
        }
        
        try {
            int deletedCount = baseMapper.deleteByProjectId(projectId);
            log.info("删除项目提成分配记录，项目ID: {}, 删除数量: {}", projectId, deletedCount);
            return true;
        } catch (Exception e) {
            log.error("删除项目提成分配记录失败，项目ID: {}", projectId, e);
            throw e;
        }
    }

    @Override
    public List<ProjectProfitDistribution> getByProjectIdAndStatus(Long projectId, String finalStatus) {
        if (projectId == null) {
            return List.of();
        }
        return baseMapper.selectByProjectIdAndStatus(projectId, finalStatus);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean batchSave(List<ProjectProfitDistribution> distributions) {
        if (distributions == null || distributions.isEmpty()) {
            return false;
        }
        
        try {
            int insertedCount = baseMapper.batchInsert(distributions);
            log.info("批量保存项目提成分配记录，数量: {}, 实际插入: {}", distributions.size(), insertedCount);
            return insertedCount > 0;
        } catch (Exception e) {
            log.error("批量保存项目提成分配记录失败", e);
            throw e;
        }
    }

    @Override
    public Boolean hasApprovedDistribution(Long projectId) {
        if (projectId == null) {
            return false;
        }
        
        List<ProjectProfitDistribution> approvedList = getByProjectIdAndStatus(projectId, "approved");
        return !approvedList.isEmpty();
    }
} 