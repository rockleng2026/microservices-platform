package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.soo.model.JobLevelSalary;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface JobLevelSalaryMapper extends BaseMapper<JobLevelSalary> {
    // 可扩展自定义SQL
} 