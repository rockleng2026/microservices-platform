package com.central.project.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.central.project.mapper.ProjectAccrualDetailMapper;
import com.central.project.model.ProjectAccrualDetail;
import com.central.project.service.IProjectAccrualDetailService;
import com.central.common.context.TenantContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.List;

@Service
public class ProjectAccrualDetailServiceImpl implements IProjectAccrualDetailService {
    @Resource
    private ProjectAccrualDetailMapper detailMapper;

    @Override
    public List<ProjectAccrualDetail> getByProjectId(Long projectId) {
        return detailMapper.selectList(new QueryWrapper<ProjectAccrualDetail>().eq("project_id", projectId));
    }

    @Override
    @Transactional
    public void saveOrUpdateBatch(List<ProjectAccrualDetail> details, Long projectId) {
        detailMapper.delete(new QueryWrapper<ProjectAccrualDetail>().eq("project_id", projectId));
        String tenantId = TenantContextHolder.getTenant();
        for (ProjectAccrualDetail detail : details) {
            detail.setProjectId(projectId);
            detail.setTenantId(tenantId);
            detailMapper.insert(detail);
        }
    }
} 