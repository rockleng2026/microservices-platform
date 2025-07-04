package com.central.organization.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.organization.model.SysDictCategory;
import com.central.organization.model.dto.SysDictCategoryQueryDTO;
import com.central.organization.model.vo.SysDictCategoryVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 通用字典类目Mapper
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Mapper
public interface SysDictCategoryMapper extends BaseMapper<SysDictCategory> {

    /**
     * 分页查询类目列表
     *
     * @param query 查询条件
     * @return 类目列表
     */
    List<SysDictCategoryVO> selectPageList(@Param("query") SysDictCategoryQueryDTO query);

    /**
     * 查询总数
     *
     * @param query 查询条件
     * @return 总数
     */
    Long selectCount(@Param("query") SysDictCategoryQueryDTO query);

    /**
     * 根据ID查询详情
     *
     * @param id 类目ID
     * @return 类目详情
     */
    SysDictCategoryVO selectDetailById(@Param("id") Long id);

    /**
     * 根据编码查询类目
     *
     * @param code 类目编码
     * @param tenantId 租户ID
     * @param excludeId 排除的ID(修改时使用)
     * @return 类目信息
     */
    SysDictCategory selectByCode(@Param("code") String code, 
                                @Param("tenantId") String tenantId, 
                                @Param("excludeId") Long excludeId);

    /**
     * 查询所有启用的类目
     *
     * @param tenantId 租户ID
     * @return 类目列表
     */
    List<SysDictCategoryVO> selectEnabledList(@Param("tenantId") String tenantId);

    /**
     * 更新状态
     *
     * @param id 类目ID
     * @param status 状态
     * @return 影响行数
     */
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);
} 