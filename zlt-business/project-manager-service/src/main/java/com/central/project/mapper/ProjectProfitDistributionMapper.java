package com.central.project.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.project.model.ProjectProfitDistribution;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 项目毛利分配Mapper
 * 
 * @author Central Team
 * @since 2024-12-25
 */
@Mapper
public interface ProjectProfitDistributionMapper extends BaseMapper<ProjectProfitDistribution> {
    
    /**
     * 根据项目ID查询提成分配记录
     * @param projectId 项目ID
     * @return 分配记录列表
     */
    List<ProjectProfitDistribution> selectByProjectId(@Param("projectId") Long projectId);
    
    /**
     * 根据项目ID删除提成分配记录
     * @param projectId 项目ID
     * @return 删除数量
     */
    int deleteByProjectId(@Param("projectId") Long projectId);
    
    /**
     * 根据项目ID和审批状态查询提成分配记录
     * @param projectId 项目ID
     * @param finalStatus 审批状态
     * @return 分配记录列表
     */
    List<ProjectProfitDistribution> selectByProjectIdAndStatus(@Param("projectId") Long projectId, 
                                                               @Param("finalStatus") String finalStatus);
    
    /**
     * 批量插入提成分配记录
     * @param distributions 分配记录列表
     * @return 插入数量
     */
    int batchInsert(@Param("list") List<ProjectProfitDistribution> distributions);
} 