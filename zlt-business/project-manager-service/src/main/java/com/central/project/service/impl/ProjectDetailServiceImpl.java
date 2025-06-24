package com.central.project.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.central.project.mapper.ProjectDetailMapper;
import com.central.project.model.ProjectDetail;
import com.central.project.service.IProjectDetailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

/**
 * 项目明细服务实现类
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@Service
public class ProjectDetailServiceImpl extends ServiceImpl<ProjectDetailMapper, ProjectDetail> implements IProjectDetailService {
    
    @Override
    public List<ProjectDetail> getByProjectId(Long projectId) {
        if (projectId == null) {
            return null;
        }
        
        LambdaQueryWrapper<ProjectDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectDetail::getProjectId, projectId)
                .eq(ProjectDetail::getDelflag, 0)
                .orderByAsc(ProjectDetail::getCreatedAt);
        
        return list(wrapper);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteByProjectId(Long projectId) {
        if (projectId == null) {
            return false;
        }
        
        LambdaQueryWrapper<ProjectDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectDetail::getProjectId, projectId)
                .eq(ProjectDetail::getDelflag, 0);
        
        List<ProjectDetail> details = list(wrapper);
        if (details != null && !details.isEmpty()) {
            Date now = new Date();
            for (ProjectDetail detail : details) {
                detail.setDelflag(1);
                detail.setUpdatedAt(now);
                // TODO: 设置修改人ID
                detail.setUpdatedBy(1L);
            }
            return updateBatchById(details);
        }
        
        return true;
    }
    
    @Override
    public List<ProjectDetail> getByParticipantId(Long participantId) {
        if (participantId == null) {
            return null;
        }
        
        LambdaQueryWrapper<ProjectDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectDetail::getParticipantId, participantId)
                .eq(ProjectDetail::getDelflag, 0)
                .orderByDesc(ProjectDetail::getCreatedAt);
        
        return list(wrapper);
    }
    
    @Override
    public ProjectDetail getByProjectIdAndParticipantId(Long projectId, Long participantId) {
        if (projectId == null || participantId == null) {
            return null;
        }
        
        LambdaQueryWrapper<ProjectDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectDetail::getProjectId, projectId)
                .eq(ProjectDetail::getParticipantId, participantId)
                .eq(ProjectDetail::getDelflag, 0);
        
        return getOne(wrapper);
    }
    
    @Override
    public List<ProjectDetail> getByRole(String role) {
        if (role == null || role.trim().isEmpty()) {
            return null;
        }
        
        LambdaQueryWrapper<ProjectDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectDetail::getRole, role)
                .eq(ProjectDetail::getDelflag, 0)
                .orderByDesc(ProjectDetail::getCreatedAt);
        
        return list(wrapper);
    }
    
    @Override
    public Boolean existsByProjectIdAndParticipantId(Long projectId, Long participantId) {
        if (projectId == null || participantId == null) {
            return false;
        }
        
        LambdaQueryWrapper<ProjectDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectDetail::getProjectId, projectId)
                .eq(ProjectDetail::getParticipantId, participantId)
                .eq(ProjectDetail::getDelflag, 0);
        
        return count(wrapper) > 0;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteByProjectIdAndParticipantId(Long projectId, Long participantId) {
        if (projectId == null || participantId == null) {
            return false;
        }
        
        LambdaQueryWrapper<ProjectDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectDetail::getProjectId, projectId)
                .eq(ProjectDetail::getParticipantId, participantId)
                .eq(ProjectDetail::getDelflag, 0);
        
        ProjectDetail detail = getOne(wrapper);
        if (detail != null) {
            detail.setDelflag(1);
            detail.setUpdatedAt(new Date());
            // TODO: 设置修改人ID
            detail.setUpdatedBy(1L);
            return updateById(detail);
        }
        
        return false;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateRoleByProjectIdAndParticipantId(Long projectId, Long participantId, String role) {
        if (projectId == null || participantId == null || role == null || role.trim().isEmpty()) {
            return false;
        }
        
        LambdaQueryWrapper<ProjectDetail> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(ProjectDetail::getProjectId, projectId)
                .eq(ProjectDetail::getParticipantId, participantId)
                .eq(ProjectDetail::getDelflag, 0);
        
        ProjectDetail detail = getOne(wrapper);
        if (detail != null) {
            detail.setRole(role);
            detail.setUpdatedAt(new Date());
            // TODO: 设置修改人ID
            detail.setUpdatedBy(1L);
            return updateById(detail);
        }
        
        return false;
    }
} 