package com.central.organization.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.organization.model.UserPersonalConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

/**
 * 用户个性化配置 Mapper接口
 * 
 * @author Portal Team
 * @since 2024-12-19
 */
@Mapper
public interface UserPersonalConfigMapper extends BaseMapper<UserPersonalConfig> {

    /**
     * 根据用户ID查询个性化配置
     * 
     * @param userId 用户ID
     * @param tenantId 租户ID
     * @return 用户个性化配置
     */
    UserPersonalConfig selectByUserId(@Param("userId") Long userId, @Param("tenantId") String tenantId);

    /**
     * 根据用户ID删除配置
     * 
     * @param userId 用户ID
     * @param tenantId 租户ID
     * @return 删除行数
     */
    int deleteByUserId(@Param("userId") Long userId, @Param("tenantId") String tenantId);

    /**
     * 初始化用户默认配置
     * 
     * @param config 配置对象
     * @return 插入行数
     */
    int insertDefaultConfig(UserPersonalConfig config);
} 