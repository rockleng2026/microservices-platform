package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.soo.model.entity.PayrollResult;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface PayrollResultMapper extends BaseMapper<PayrollResult> {
    // 可扩展自定义SQL
} 