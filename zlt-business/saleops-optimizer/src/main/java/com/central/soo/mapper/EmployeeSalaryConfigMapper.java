package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.soo.model.EmployeeSalaryConfig;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface EmployeeSalaryConfigMapper extends BaseMapper<EmployeeSalaryConfig> {
    // 可扩展自定义SQL
} 