package com.central.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.project.model.ProjectDetail;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 项目明细Mapper接口
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Mapper
public interface ProjectDetailMapper extends BaseMapper<ProjectDetail> {
    
    /**
     * 根据项目ID查询项目参与人详情（包含用户信息）
     * 
     * @param projectId 项目ID
     * @return 项目参与人详情列表
     */
    List<ProjectDetail> selectProjectParticipantsWithUserInfo(@Param("projectId") Long projectId);
    
    /**
     * 根据参与人ID查询参与的项目详情
     * 
     * @param participantId 参与人ID
     * @return 项目详情列表
     */
    List<ProjectDetail> selectProjectsByParticipant(@Param("participantId") Long participantId);
    
    /**
     * 统计项目的参与人数
     * 
     * @param projectId 项目ID
     * @return 参与人数
     */
    Long countParticipantsByProject(@Param("projectId") Long projectId);
    
    /**
     * 根据角色统计参与人数
     * 
     * @param projectId 项目ID
     * @param role 角色
     * @return 参与人数
     */
    Long countParticipantsByProjectAndRole(@Param("projectId") Long projectId, @Param("role") String role);
} 