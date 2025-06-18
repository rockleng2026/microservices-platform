package com.central.multitable.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.multitable.model.MtAppSpace;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 应用空间Mapper接口
 *
 * @author zlt
 * @date 2025-06-17
 */
@Mapper
public interface MtAppSpaceMapper extends BaseMapper<MtAppSpace> {

    /**
     * 根据租户ID查询应用空间列表
     *
     * @param tenantId 租户ID
     * @return 应用空间列表
     */
    List<MtAppSpace> findByTenantId(@Param("tenantId") String tenantId);

    /**
     * 根据团队ID查询应用空间列表
     *
     * @param teamId 团队ID
     * @return 应用空间列表
     */
    List<MtAppSpace> findByTeamId(@Param("teamId") Long teamId);

    /**
     * 根据应用空间编码查询
     *
     * @param uniCode 应用空间编码
     * @return 应用空间
     */
    MtAppSpace findByUniCode(@Param("uniCode") String uniCode);
} 