package com.central.project.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.central.project.mapper.ProjectMapper;
import com.central.project.model.Project;
import com.central.project.model.ProjectDetail;
import com.central.project.model.dto.ProjectQueryDTO;
import com.central.project.model.dto.ProjectSaveDTO;
import com.central.project.service.IProjectService;
import com.central.project.service.IProjectDetailService;
import com.central.project.utils.IdUtils;
import com.central.common.context.TenantContextHolder;
import org.springframework.beans.BeanUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 项目服务实现类
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@Service
public class ProjectServiceImpl extends ServiceImpl<ProjectMapper, Project> implements IProjectService {
    
    @Autowired
    private IProjectDetailService projectDetailService;
    
    @Override
    public IPage<Project> getProjectPage(ProjectQueryDTO queryDTO) {
        Page<Project> page = new Page<>(queryDTO.getPage(), queryDTO.getSize());
        
        // 构建查询参数
        Map<String, Object> params = new HashMap<>();
        if (StringUtils.hasText(queryDTO.getName())) {
            params.put("name", queryDTO.getName());
        }
        if (StringUtils.hasText(queryDTO.getCategory())) {
            params.put("category", queryDTO.getCategory());
        }
        if (StringUtils.hasText(queryDTO.getStatus())) {
            params.put("status", queryDTO.getStatus());
        }
        if (queryDTO.getLeaderId() != null) {
            params.put("leaderId", queryDTO.getLeaderId());
        }
        if (StringUtils.hasText(queryDTO.getCustomerName())) {
            params.put("customerName", queryDTO.getCustomerName());
        }
        if (StringUtils.hasText(queryDTO.getKeyword())) {
            params.put("keyword", queryDTO.getKeyword());
        }
        if (StringUtils.hasText(queryDTO.getStartTimeBegin())) {
            params.put("startTimeBegin", queryDTO.getStartTimeBegin());
        }
        if (StringUtils.hasText(queryDTO.getStartTimeEnd())) {
            params.put("startTimeEnd", queryDTO.getStartTimeEnd());
        }
        if (StringUtils.hasText(queryDTO.getFinalStatus())) {
            params.put("finalStatus", queryDTO.getFinalStatus());
        }
        
        params.put("orderBy", queryDTO.getOrderBy());
        params.put("orderDirection", queryDTO.getOrderDirection());
        
        return baseMapper.selectProjectPage(page, params);
    }
    
    @Override
    public Project getProjectDetailById(Long id) {
        if (id == null) {
            return null;
        }
        
        Project project = baseMapper.selectProjectDetailById(id);
        if (project != null) {
            // 查询项目参与人详情
            List<ProjectDetail> participants = projectDetailService.getByProjectId(id);
            project.setParticipantDetails(participants);
        }
        
        return project;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Project saveProject(ProjectSaveDTO saveDTO) {
        Project project = new Project();
        
        // 复制基本属性
        BeanUtils.copyProperties(saveDTO, project);
        
        Date now = new Date();
        String tenantId = TenantContextHolder.getTenant();
        if (!StringUtils.hasText(tenantId)) {
            tenantId = "default";
        }
        
        if (saveDTO.getId() != null) {
            // 更新
            project.setId(saveDTO.getId());
            project.setUpdatedAt(now);
            // TODO: 设置修改人ID
            project.setUpdatedBy(1L);
            updateById(project);
        } else {
            // 新增
            project.setId(IdUtils.generateId());
            project.setTenantId(tenantId);
            project.setStatus("init"); // 默认状态
            project.setDelflag(0);
            project.setCreatedAt(now);
            project.setUpdatedAt(now);
            // TODO: 设置创建人ID和修改人ID
            project.setCreatedBy(1L);
            project.setUpdatedBy(1L);
            save(project);
        }
        
        // 处理项目参与人
        if (saveDTO.getParticipants() != null && !saveDTO.getParticipants().isEmpty()) {
            // 先删除原有参与人（如果是更新）
            if (saveDTO.getId() != null) {
                projectDetailService.deleteByProjectId(saveDTO.getId());
            }
            
            // 添加新的参与人
            for (ProjectSaveDTO.ProjectParticipantDTO participantDTO : saveDTO.getParticipants()) {
                ProjectDetail detail = new ProjectDetail();
                detail.setId(IdUtils.generateId());
                detail.setProjectId(project.getId());
                detail.setParticipantId(participantDTO.getParticipantId());
                detail.setRole(participantDTO.getRole());
                detail.setTenantId(tenantId);
                detail.setCreatedAt(now);
                detail.setUpdatedAt(now);
                detail.setCreatedBy(1L);
                detail.setUpdatedBy(1L);
                detail.setDelflag(0);
                
                projectDetailService.save(detail);
            }
        }
        
        return project;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteProject(Long id) {
        if (id == null) {
            return false;
        }
        
        // 软删除项目
        Project project = new Project();
        project.setId(id);
        project.setDelflag(1);
        project.setUpdatedAt(new Date());
        // TODO: 设置修改人ID
        project.setUpdatedBy(1L);
        
        boolean result = updateById(project);
        
        // 同时删除项目参与人
        if (result) {
            projectDetailService.deleteByProjectId(id);
        }
        
        return result;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean batchDeleteProjects(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return false;
        }
        
        Date now = new Date();
        for (Long id : ids) {
            deleteProject(id);
        }
        
        return true;
    }
    
    @Override
    public Boolean updateProjectStatus(Long id, String status) {
        if (id == null || !StringUtils.hasText(status)) {
            return false;
        }
        
        Project project = new Project();
        project.setId(id);
        project.setStatus(status);
        project.setUpdatedAt(new Date());
        // TODO: 设置修改人ID
        project.setUpdatedBy(1L);
        
        return updateById(project);
    }
    
    @Override
    public Boolean batchUpdateProjectStatus(List<Long> ids, String status) {
        if (ids == null || ids.isEmpty() || !StringUtils.hasText(status)) {
            return false;
        }
        
        return baseMapper.batchUpdateStatus(ids, status) > 0;
    }
    
    @Override
    public List<Project> getProjectsByLeaderId(Long leaderId) {
        if (leaderId == null) {
            return new ArrayList<>();
        }
        return baseMapper.selectProjectsByLeaderId(leaderId);
    }
    
    @Override
    public List<Project> getProjectsByParticipantId(Long participantId) {
        if (participantId == null) {
            return new ArrayList<>();
        }
        return baseMapper.selectProjectsByParticipantId(participantId);
    }
    
    @Override
    public List<Project> getProjectsByStatus(String status) {
        if (!StringUtils.hasText(status)) {
            return new ArrayList<>();
        }
        return baseMapper.selectProjectsByStatus(status);
    }
    
    @Override
    public List<Project> getProjectsByCategory(String category) {
        if (!StringUtils.hasText(category)) {
            return new ArrayList<>();
        }
        return baseMapper.selectProjectsByCategory(category);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean approveProjectEstablishment(Long id, Boolean approved, String reason) {
        if (id == null || approved == null) {
            return false;
        }
        
        Project project = new Project();
        project.setId(id);
        project.setFinalStatus(approved ? "approved" : "rejected");
        if (approved) {
            project.setStatus("running");
        } else {
            project.setStatus("rejected");
        }
        project.setUpdatedAt(new Date());
        // TODO: 设置修改人ID
        project.setUpdatedBy(1L);
        
        // TODO: 记录审批意见到审批流程表
        
        return updateById(project);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean applyProjectClosure(Long id, Map<String, Object> closureData) {
        if (id == null || closureData == null) {
            return false;
        }
        
        // TODO: 创建项目结项记录
        // TODO: 启动结项审批流程
        
        // 更新项目状态为结项申请中
        Project project = new Project();
        project.setId(id);
        project.setStatus("closure_pending");
        project.setUpdatedAt(new Date());
        project.setUpdatedBy(1L);
        
        return updateById(project);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean approveProjectClosure(Long id, Boolean approved, String reason) {
        if (id == null || approved == null) {
            return false;
        }
        
        Project project = new Project();
        project.setId(id);
        project.setFinalStatus(approved ? "closed" : "closure_rejected");
        if (approved) {
            project.setStatus("closed");
        } else {
            project.setStatus("running");
        }
        project.setUpdatedAt(new Date());
        project.setUpdatedBy(1L);
        
        return updateById(project);
    }
    
    @Override
    public Map<String, Object> getProjectStatistics() {
        return baseMapper.selectProjectStatistics();
    }
    
    @Override
    public List<Project> getProjectsByDateRange(String startDate, String endDate) {
        if (!StringUtils.hasText(startDate) || !StringUtils.hasText(endDate)) {
            return new ArrayList<>();
        }
        return baseMapper.selectProjectsByDateRange(startDate, endDate);
    }
    
    @Override
    public List<Project> getExpiringProjects(Integer days) {
        if (days == null || days <= 0) {
            days = 7; // 默认7天
        }
        return baseMapper.selectExpiringProjects(days);
    }
    
    @Override
    public Boolean existsByName(String name, Long excludeId) {
        if (!StringUtils.hasText(name)) {
            return false;
        }
        
        LambdaQueryWrapper<Project> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Project::getName, name);
        wrapper.eq(Project::getDelflag, 0);
        
        if (excludeId != null) {
            wrapper.ne(Project::getId, excludeId);
        }
        
        return count(wrapper) > 0;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean addProjectParticipant(Long projectId, Long participantId, String role) {
        if (projectId == null || participantId == null || !StringUtils.hasText(role)) {
            return false;
        }
        
        // 检查是否已存在
        if (projectDetailService.existsByProjectIdAndParticipantId(projectId, participantId)) {
            return false;
        }
        
        ProjectDetail detail = new ProjectDetail();
        detail.setId(IdUtils.generateId());
        detail.setProjectId(projectId);
        detail.setParticipantId(participantId);
        detail.setRole(role);
        detail.setTenantId(TenantContextHolder.getTenant());
        detail.setCreatedAt(new Date());
        detail.setUpdatedAt(new Date());
        detail.setCreatedBy(1L);
        detail.setUpdatedBy(1L);
        detail.setDelflag(0);
        
        return projectDetailService.save(detail);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean removeProjectParticipant(Long projectId, Long participantId) {
        if (projectId == null || participantId == null) {
            return false;
        }
        
        return projectDetailService.deleteByProjectIdAndParticipantId(projectId, participantId);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateParticipantRole(Long projectId, Long participantId, String role) {
        if (projectId == null || participantId == null || !StringUtils.hasText(role)) {
            return false;
        }
        
        return projectDetailService.updateRoleByProjectIdAndParticipantId(projectId, participantId, role);
    }
} 