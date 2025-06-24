package com.central.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.project.model.ProjectClosure;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 项目结项Mapper接口
 * 
 * @author Central Team
 * @since 2024-12-25
 */
@Mapper
public interface ProjectClosureMapper extends BaseMapper<ProjectClosure> {
    
    /**
     * 根据项目ID查询结项信息
     * @param projectId 项目ID
     * @return 结项信息
     */
    ProjectClosure selectByProjectId(@Param("projectId") Long projectId);
    
    /**
     * 根据项目ID删除结项信息
     * @param projectId 项目ID
     * @return 影响行数
     */
    int deleteByProjectId(@Param("projectId") Long projectId);
} 