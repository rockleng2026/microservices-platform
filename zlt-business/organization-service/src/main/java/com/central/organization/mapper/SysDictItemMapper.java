package com.central.organization.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.organization.model.SysDictItem;
import com.central.organization.model.dto.SysDictItemQueryDTO;
import com.central.organization.model.vo.SysDictItemVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 通用字典明细项Mapper
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Mapper
public interface SysDictItemMapper extends BaseMapper<SysDictItem> {

    /**
     * 分页查询明细项列表
     *
     * @param query 查询条件
     * @return 明细项列表
     */
    List<SysDictItemVO> selectPageList(@Param("query") SysDictItemQueryDTO query);

    /**
     * 查询总数
     *
     * @param query 查询条件
     * @return 总数
     */
    Long selectCount(@Param("query") SysDictItemQueryDTO query);

    /**
     * 根据ID查询详情
     *
     * @param id 明细项ID
     * @return 明细项详情
     */
    SysDictItemVO selectDetailById(@Param("id") Long id);

    /**
     * 根据类目ID查询明细项列表
     *
     * @param categoryId 类目ID
     * @param tenantId 租户ID
     * @param status 状态(可选)
     * @return 明细项列表
     */
    List<SysDictItemVO> selectByCategoryId(@Param("categoryId") Long categoryId, 
                                          @Param("tenantId") String tenantId, 
                                          @Param("status") Integer status);

    /**
     * 根据类目编码查询明细项列表
     *
     * @param categoryCode 类目编码
     * @param tenantId 租户ID
     * @param status 状态(可选)
     * @return 明细项列表
     */
    List<SysDictItemVO> selectByCategoryCode(@Param("categoryCode") String categoryCode, 
                                            @Param("tenantId") String tenantId, 
                                            @Param("status") Integer status);

    /**
     * 根据编码查询明细项
     *
     * @param categoryId 类目ID
     * @param itemCode 项目编码
     * @param tenantId 租户ID
     * @param excludeId 排除的ID(修改时使用)
     * @return 明细项信息
     */
    SysDictItem selectByCode(@Param("categoryId") Long categoryId, 
                            @Param("itemCode") String itemCode, 
                            @Param("tenantId") String tenantId, 
                            @Param("excludeId") Long excludeId);

    /**
     * 查询类目下的明细项数量
     *
     * @param categoryId 类目ID
     * @return 明细项数量
     */
    Integer selectCountByCategoryId(@Param("categoryId") Long categoryId);

    /**
     * 更新状态
     *
     * @param id 明细项ID
     * @param status 状态
     * @return 影响行数
     */
    int updateStatus(@Param("id") Long id, @Param("status") Integer status);

    /**
     * 批量删除类目下的明细项
     *
     * @param categoryId 类目ID
     * @return 影响行数
     */
    int deleteByCategoryId(@Param("categoryId") Long categoryId);

    /**
     * 批量标记删除明细项(软删除)
     *
     * @param ids 明细项ID列表
     * @return 影响行数
     */
    int batchMarkDelete(@Param("ids") List<Long> ids);
} 