package com.central.multitable.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.multitable.model.MtTable;
import com.central.multitable.model.dto.TableQueryDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 表格Mapper接口
 *
 * @author multi-table-system
 */
@Mapper
public interface MtTableMapper extends BaseMapper<MtTable> {
    
    /**
     * 分页查询表格列表
     *
     * @param page 分页参数
     * @param queryDTO 查询参数
     * @return 表格列表
     */
    List<MtTable> findList(Page<MtTable> page, @Param("query") TableQueryDTO queryDTO);
    
    /**
     * 根据团队ID查询表格
     *
     * @param teamId 团队ID
     * @return 表格列表
     */
    List<MtTable> findByTeamId(@Param("teamId") Long teamId);
    
    /**
     * 根据租户ID查询表格
     *
     * @param tenantId 租户ID
     * @return 表格列表
     */
    List<MtTable> findByTenantId(@Param("tenantId") String tenantId);
    
    /**
     * 逻辑删除表格
     *
     * @param id 表格ID
     * @param userId 操作用户ID
     * @return 影响行数
     */
    int deleteLogically(@Param("id") Long id, @Param("userId") Long userId);
} 