package com.central.multitable.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.multitable.model.MtRow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 行数据Mapper接口
 *
 * @author multi-table-system
 */
@Mapper
public interface MtRowMapper extends BaseMapper<MtRow> {
    
    /**
     * 分页查询行数据
     *
     * @param page 分页参数
     * @param tableId 表格ID
     * @param params 查询参数
     * @return 行数据列表
     */
    List<MtRow> findByTableId(Page<MtRow> page, @Param("tableId") Long tableId, @Param("params") Map<String, Object> params);
    
    /**
     * 批量插入行数据
     *
     * @param rows 行数据列表
     * @return 影响行数
     */
    int batchInsert(@Param("rows") List<MtRow> rows);
    
    /**
     * 批量更新行数据
     *
     * @param rows 行数据列表
     * @return 影响行数
     */
    int batchUpdate(@Param("rows") List<MtRow> rows);
    
    /**
     * 逻辑删除行数据
     *
     * @param ids 行ID列表
     * @return 影响行数
     */
    int deleteLogically(@Param("ids") List<Long> ids);
    
    /**
     * 根据表格ID统计行数
     *
     * @param tableId 表格ID
     * @return 行数
     */
    long countByTableId(@Param("tableId") Long tableId);
} 