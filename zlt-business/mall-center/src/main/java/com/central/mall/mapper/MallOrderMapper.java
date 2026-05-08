package com.central.mall.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.mall.model.entity.MallOrder;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MallOrderMapper extends BaseMapper<MallOrder> {
}