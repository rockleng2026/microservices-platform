package com.central.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.central.project.mapper.ProjectAccrualConfigMapper;
import com.central.project.model.ProjectAccrualConfig;
import com.central.project.service.IProjectAccrualConfigService;
import com.central.common.context.TenantContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.List;

@Service
public class ProjectAccrualConfigServiceImpl implements IProjectAccrualConfigService {
    @Resource
    private ProjectAccrualConfigMapper configMapper;

    @Override
    public List<ProjectAccrualConfig> getByProjectId(Long projectId) {
        return configMapper.selectList(new QueryWrapper<ProjectAccrualConfig>().eq("project_id", projectId));
    }

    @Override
    @Transactional
    public void saveOrUpdateBatch(List<ProjectAccrualConfig> configs, Long projectId) {
        configMapper.delete(new QueryWrapper<ProjectAccrualConfig>().eq("project_id", projectId));
        String tenantId = TenantContextHolder.getTenant();
        for (ProjectAccrualConfig config : configs) {
            config.setProjectId(projectId);
            config.setTenantId(tenantId);
            configMapper.insert(config);
        }
    }
} 