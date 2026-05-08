package com.central.mall.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.mall.model.entity.MallSettings;
import org.apache.ibatis.annotations.Mapper;

/**
 * 商户设置 Mapper
 */
@Mapper
public interface MallSettingsMapper extends BaseMapper<MallSettings> {
}
