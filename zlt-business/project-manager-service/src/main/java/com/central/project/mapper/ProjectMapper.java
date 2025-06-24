package com.central.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.project.model.Project;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 项目Mapper接口
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Mapper
public interface ProjectMapper extends BaseMapper<Project> {
    
    /**
     * 分页查询项目列表（带详细信息）
     * @param page 分页参数
     * @param params 查询参数
     * @return 项目分页列表
     */
    IPage<Project> selectProjectPage(Page<Project> page, @Param("params") Map<String, Object> params);
    
    /**
     * 根据ID查询项目详情（带关联信息）
     * @param id 项目ID
     * @return 项目详情
     */
    Project selectProjectDetailById(@Param("id") Long id);
    
    /**
     * 根据负责人ID查询项目列表
     * @param leaderId 负责人ID
     * @return 项目列表
     */
    List<Project> selectProjectsByLeaderId(@Param("leaderId") Long leaderId);
    
    /**
     * 根据参与人ID查询项目列表
     * @param participantId 参与人ID
     * @return 项目列表
     */
    List<Project> selectProjectsByParticipantId(@Param("participantId") Long participantId);
    
    /**
     * 根据状态查询项目列表
     * @param status 项目状态
     * @return 项目列表
     */
    List<Project> selectProjectsByStatus(@Param("status") String status);
    
    /**
     * 根据类别查询项目列表
     * @param category 项目类别
     * @return 项目列表
     */
    List<Project> selectProjectsByCategory(@Param("category") String category);
    
    /**
     * 查询项目统计信息
     * @return 统计信息
     */
    Map<String, Object> selectProjectStatistics();
    
    /**
     * 根据时间范围查询项目列表
     * @param startDate 开始时间
     * @param endDate 结束时间
     * @return 项目列表
     */
    List<Project> selectProjectsByDateRange(@Param("startDate") String startDate, @Param("endDate") String endDate);
    
    /**
     * 查询即将到期的项目
     * @param days 天数
     * @return 项目列表
     */
    List<Project> selectExpiringProjects(@Param("days") Integer days);
    
    /**
     * 批量更新项目状态
     * @param ids 项目ID列表
     * @param status 新状态
     * @return 更新数量
     */
    int batchUpdateStatus(@Param("ids") List<Long> ids, @Param("status") String status);
} 