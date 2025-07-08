package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.soo.model.entity.SalarySummary;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import java.util.List;

/**
 * 薪酬统计汇总Mapper
 */
@Mapper
public interface SalarySummaryMapper extends BaseMapper<SalarySummary> {
    
    /**
     * 根据任务ID查询汇总统计
     */
    List<SalarySummary> selectByTaskId(@Param("taskId") String taskId);
    
    /**
     * 根据任务ID和部门ID查询汇总统计
     */
    SalarySummary selectByTaskIdAndDepartmentId(@Param("taskId") String taskId, @Param("departmentId") Long departmentId);
    
    /**
     * 根据任务ID删除统计数据
     */
    int deleteByTaskId(@Param("taskId") String taskId);
} 