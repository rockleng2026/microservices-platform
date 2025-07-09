package com.central.soo.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.soo.model.entity.BreakevenConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 盈亏平衡配置Mapper接口
 */
@Mapper
public interface BreakevenConfigMapper extends BaseMapper<BreakevenConfig> {

    /**
     * 根据配置键查询配置
     *
     * @param configKey 配置键
     * @param tenantId 租户ID
     * @return 配置信息
     */
    BreakevenConfig selectByConfigKey(@Param("configKey") String configKey, @Param("tenantId") Long tenantId);

    /**
     * 根据配置分类查询配置列表
     *
     * @param configCategory 配置分类
     * @param tenantId 租户ID
     * @return 配置列表
     */
    List<BreakevenConfig> selectByCategory(@Param("configCategory") String configCategory, @Param("tenantId") Long tenantId);

    /**
     * 查询所有启用的配置
     *
     * @param tenantId 租户ID
     * @return 启用的配置列表
     */
    List<BreakevenConfig> selectEnabledConfigs(@Param("tenantId") Long tenantId);

    /**
     * 更新配置值
     *
     * @param configKey 配置键
     * @param configValue 配置值
     * @param tenantId 租户ID
     * @return 更新记录数
     */
    int updateConfigValue(@Param("configKey") String configKey, @Param("configValue") String configValue, @Param("tenantId") Long tenantId);

    /**
     * 批量插入配置
     *
     * @param configs 配置列表
     * @return 插入记录数
     */
    int batchInsert(@Param("configs") List<BreakevenConfig> configs);
} 