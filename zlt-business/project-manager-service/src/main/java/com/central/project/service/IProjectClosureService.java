package com.central.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.project.model.ProjectClosure;

/**
 * 项目结项服务接口
 * 
 * @author Central Team
 * @since 2024-12-25
 */
public interface IProjectClosureService extends IService<ProjectClosure> {
    
    /**
     * 根据项目ID查询结项信息
     * @param projectId 项目ID
     * @return 结项信息
     */
    ProjectClosure getByProjectId(Long projectId);
    
    /**
     * 保存项目结项信息
     * @param closure 结项信息
     * @return 是否成功
     */
    Boolean saveClosure(ProjectClosure closure);
    
    /**
     * 根据项目ID删除结项信息
     * @param projectId 项目ID
     * @return 是否成功
     */
    Boolean deleteByProjectId(Long projectId);
} 