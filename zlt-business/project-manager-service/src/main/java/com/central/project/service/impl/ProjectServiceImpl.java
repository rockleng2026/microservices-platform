package com.central.project.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.central.project.mapper.ProjectMapper;
import com.central.project.model.Project;
import com.central.project.model.ProjectClosure;
import com.central.project.model.ProjectDetail;
import com.central.project.model.ProjectProfitDistribution;
import com.central.project.model.dto.ProjectQueryDTO;
import com.central.project.model.dto.ProjectSaveDTO;
import com.central.project.service.IProjectService;
import com.central.project.service.IProjectDetailService;
import com.central.project.service.IProjectClosureService;
import com.central.project.utils.IdUtils;
import com.central.common.context.TenantContextHolder;
import org.springframework.beans.BeanUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
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
    
    @Autowired
    private IProjectClosureService projectClosureService;
    
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
            // 收集需要查询的员工ID
            List<Long> employeeIds = new ArrayList<>();
            
            // 添加项目负责人ID
            if (project.getLeaderId() != null) {
                employeeIds.add(project.getLeaderId());
            }
            
            // 查询项目参与人详情
            List<ProjectDetail> participants = projectDetailService.getByProjectId(id);
            project.setParticipantDetails(participants);
            
            // 添加参与人ID
            if (participants != null && !participants.isEmpty()) {
                participants.forEach(detail -> {
                    if (detail.getParticipantId() != null) {
                        employeeIds.add(detail.getParticipantId());
                    }
                });
            }
            
            // 批量查询员工信息（这里需要调用organization-service）
            // TODO: 实现批量查询员工信息的逻辑
            // 目前先保持现有逻辑，后续可以通过Feign客户端调用organization-service
            
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
        log.info("处理项目参与人，项目ID: {}, 参与人数据: {}", project.getId(), saveDTO.getParticipants());
        
        // 如果传递了参与人数据（包括空数组），则需要更新参与人
        if (saveDTO.getParticipants() != null) {
            // 先删除原有参与人（如果是更新）
            if (saveDTO.getId() != null) {
                log.info("删除项目原有参与人，项目ID: {}", saveDTO.getId());
                boolean deleteResult = projectDetailService.deleteByProjectId(saveDTO.getId());
                log.info("删除结果: {}", deleteResult);
            }
            
            // 如果参与人列表不为空，则添加新的参与人
            if (!saveDTO.getParticipants().isEmpty()) {
                // 添加新的参与人
                for (ProjectSaveDTO.ProjectParticipantDTO participantDTO : saveDTO.getParticipants()) {
                    Long pid = null;
                    Object rawId = participantDTO.getParticipantId();
                    if (rawId != null) {
                        if (rawId instanceof String strId) {
                            try { pid = Long.valueOf(strId); } catch (Exception ignored) {}
                        } else if (rawId instanceof Long lId) {
                            pid = lId;
                        } else if (rawId instanceof Integer iId) {
                            pid = ((Integer) iId).longValue();
                        }
                    }
                    if (pid == null) {
                        log.warn("跳过无效的参与人ID: {}", rawId);
                        continue; // 跳过无效ID
                    }

                    ProjectDetail detail = new ProjectDetail();
                    // ID使用AUTO_INCREMENT，不需要手动设置
                    detail.setProjectId(project.getId());
                    detail.setParticipantId(pid);
                    detail.setRole(participantDTO.getRole());
                    detail.setTenantId(tenantId);
                    detail.setCreatedAt(now);
                    detail.setUpdatedAt(now);
                    detail.setCreatedBy(1L);
                    detail.setUpdatedBy(1L);
                    detail.setDelflag(0);
                    
                    log.info("保存项目参与人: projectId={}, participantId={}, role={}", 
                        project.getId(), pid, participantDTO.getRole());
                    boolean saveResult = projectDetailService.save(detail);
                    log.info("保存结果: {}", saveResult);
                }
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
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean completeProjectClosure(ProjectClosure closureData) {
        if (closureData == null || closureData.getProjectId() == null) {
            return false;
        }
        
        try {
            // 1. 保存结项数据到 project_closure 表
            boolean closureResult = projectClosureService.saveClosure(closureData);
            if (!closureResult) {
                log.error("保存项目结项数据失败，项目ID: {}", closureData.getProjectId());
                return false;
            }
            
            // 2. 更新项目状态为已结项
            Project project = new Project();
            project.setId(closureData.getProjectId());
            project.setStatus("closed");
            project.setUpdatedAt(new Date());
            project.setUpdatedBy(1L);
            
            boolean updateResult = updateById(project);
            if (!updateResult) {
                log.error("更新项目状态失败，项目ID: {}", closureData.getProjectId());
                return false;
            }
            
            log.info("项目结项完成，项目ID: {}, 毛利润: {}, 毛利率: {}%", 
                closureData.getProjectId(), closureData.getGrossProfit(), closureData.getGrossProfitRate());
            
            return true;
        } catch (Exception e) {
            log.error("项目结项处理失败，项目ID: {}", closureData.getProjectId(), e);
            throw e; // 重新抛出异常，触发事务回滚
        }
    }
    
    @Override
    public ProjectClosure getProjectClosure(Long projectId) {
        if (projectId == null) {
            return null;
        }
        
        return projectClosureService.getByProjectId(projectId);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean createProfitDistribution(Long projectId, List<ProjectProfitDistribution> distributions) {
        if (projectId == null || distributions == null || distributions.isEmpty()) {
            return false;
        }
        
        // TODO: 实现项目提成分配方案创建
        // 1. 保存分配方案到 project_profit_distribution 表
        // 2. 启动审批流程
        
        // 临时实现：返回成功
        log.info("创建项目提成分配方案，项目ID: {}, 分配数量: {}", projectId, distributions.size());
        return true;
    }
    
    @Override
    public List<ProjectProfitDistribution> getProfitDistribution(Long projectId) {
        if (projectId == null) {
            return new ArrayList<>();
        }
        
        // TODO: 实现从 project_profit_distribution 表查询分配信息
        // 临时返回空列表
        return new ArrayList<>();
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean approveProfitDistribution(Long projectId, Boolean approved, String reason) {
        if (projectId == null || approved == null) {
            return false;
        }
        
        // TODO: 实现项目提成分配审批
        // 1. 更新分配方案的审批状态
        // 2. 记录审批意见
        
        // 临时实现：返回成功
        log.info("审批项目提成分配，项目ID: {}, 审批结果: {}, 意见: {}", projectId, approved, reason);
        return true;
    }
} 