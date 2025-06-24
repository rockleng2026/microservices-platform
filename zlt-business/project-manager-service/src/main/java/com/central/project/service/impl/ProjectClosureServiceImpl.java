package com.central.project.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.common.context.TenantContextHolder;
import com.central.project.mapper.ProjectClosureMapper;
import com.central.project.model.ProjectClosure;
import com.central.project.service.IProjectClosureService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

/**
 * 项目结项服务实现类
 * 
 * @author Central Team
 * @since 2024-12-25
 */
@Slf4j
@Service
public class ProjectClosureServiceImpl extends ServiceImpl<ProjectClosureMapper, ProjectClosure> implements IProjectClosureService {
    
    @Override
    public ProjectClosure getByProjectId(Long projectId) {
        if (projectId == null) {
            return null;
        }
        return baseMapper.selectByProjectId(projectId);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean saveClosure(ProjectClosure closure) {
        if (closure == null || closure.getProjectId() == null) {
            return false;
        }
        
        // 设置基础信息
        closure.setTenantId(TenantContextHolder.getTenant());
        Date now = new Date();
        
        if (closure.getId() == null) {
            // 新增
            closure.setCreatedAt(now);
            closure.setCreatedBy(1L); // TODO: 从当前用户获取
            closure.setUpdatedAt(now);
            closure.setUpdatedBy(1L); // TODO: 从当前用户获取
            closure.setDelflag(0);
            
            return save(closure);
        } else {
            // 更新
            closure.setUpdatedAt(now);
            closure.setUpdatedBy(1L); // TODO: 从当前用户获取
            
            return updateById(closure);
        }
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteByProjectId(Long projectId) {
        if (projectId == null) {
            return false;
        }
        return baseMapper.deleteByProjectId(projectId) > 0;
    }
} 