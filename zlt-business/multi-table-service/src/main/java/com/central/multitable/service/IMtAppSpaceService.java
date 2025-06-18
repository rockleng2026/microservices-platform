package com.central.multitable.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.multitable.model.MtAppSpace;

import java.util.List;

/**
 * 应用空间Service接口
 *
 * @author zlt
 * @date 2025-06-17
 */
public interface IMtAppSpaceService extends IService<MtAppSpace> {

    /**
     * 根据租户ID查询应用空间列表
     *
     * @param tenantId 租户ID
     * @return 应用空间列表
     */
    List<MtAppSpace> listByTenantId(String tenantId);

    /**
     * 根据团队ID查询应用空间列表
     *
     * @param teamId 团队ID
     * @return 应用空间列表
     */
    List<MtAppSpace> listByTeamId(Long teamId);

    /**
     * 根据应用空间编码查询
     *
     * @param uniCode 应用空间编码
     * @return 应用空间
     */
    MtAppSpace getByUniCode(String uniCode);

    /**
     * 创建应用空间
     *
     * @param appSpace 应用空间信息
     * @return 是否创建成功
     */
    boolean createAppSpace(MtAppSpace appSpace);

    /**
     * 更新应用空间
     *
     * @param appSpace 应用空间信息
     * @return 是否更新成功
     */
    boolean updateAppSpace(MtAppSpace appSpace);

    /**
     * 删除应用空间
     *
     * @param id 应用空间ID
     * @return 是否删除成功
     */
    boolean deleteAppSpace(Long id);

    /**
     * 创建应用空间（包含默认表格和字段）
     *
     * @param tenantId 租户ID
     * @param teamId 团队ID
     * @param createdBy 创建人ID
     * @return 创建的应用空间
     */
    MtAppSpace createAppSpaceWithDefaultTable(String tenantId, Long teamId, Long createdBy);
} 