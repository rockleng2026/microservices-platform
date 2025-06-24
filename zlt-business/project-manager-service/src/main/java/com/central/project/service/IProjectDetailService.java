package com.central.project.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.project.model.ProjectDetail;

import java.util.List;

/**
 * 项目明细服务接口
 * 
 * @author Central Team
 * @since 2024-12-19
 */
public interface IProjectDetailService extends IService<ProjectDetail> {
    
    /**
     * 根据项目ID查询项目参与人
     * 
     * @param projectId 项目ID
     * @return 项目参与人列表
     */
    List<ProjectDetail> getByProjectId(Long projectId);
    
    /**
     * 根据项目ID删除项目参与人（软删除）
     * 
     * @param projectId 项目ID
     * @return 是否成功
     */
    Boolean deleteByProjectId(Long projectId);
    
    /**
     * 根据参与人ID查询参与的项目
     * 
     * @param participantId 参与人ID
     * @return 项目明细列表
     */
    List<ProjectDetail> getByParticipantId(Long participantId);
    
    /**
     * 查询某个项目中某个人的角色
     * 
     * @param projectId 项目ID
     * @param participantId 参与人ID
     * @return 项目明细
     */
    ProjectDetail getByProjectIdAndParticipantId(Long projectId, Long participantId);
    
    /**
     * 根据角色查询项目参与人
     * 
     * @param role 角色
     * @return 项目明细列表
     */
    List<ProjectDetail> getByRole(String role);
    
    /**
     * 检查某人是否参与了某个项目
     * 
     * @param projectId 项目ID
     * @param participantId 参与人ID
     * @return 是否参与
     */
    Boolean existsByProjectIdAndParticipantId(Long projectId, Long participantId);
    
    /**
     * 删除特定项目的特定参与人（软删除）
     * 
     * @param projectId 项目ID
     * @param participantId 参与人ID
     * @return 是否成功
     */
    Boolean deleteByProjectIdAndParticipantId(Long projectId, Long participantId);
    
    /**
     * 更新特定项目中特定参与人的角色
     * 
     * @param projectId 项目ID
     * @param participantId 参与人ID
     * @param role 新角色
     * @return 是否成功
     */
    Boolean updateRoleByProjectIdAndParticipantId(Long projectId, Long participantId, String role);
} 