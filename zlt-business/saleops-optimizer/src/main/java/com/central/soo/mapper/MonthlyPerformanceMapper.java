package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.soo.model.MonthlyPerformance;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MonthlyPerformanceMapper extends BaseMapper<MonthlyPerformance> {
    // 可扩展自定义SQL
} 