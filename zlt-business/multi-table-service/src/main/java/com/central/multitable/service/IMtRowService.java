package com.central.multitable.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.common.model.PageResult;
import com.central.multitable.model.MtRow;

import java.util.List;
import java.util.Map;

/**
 * 行数据Service接口
 *
 * @author multi-table-system
 */
public interface IMtRowService extends IService<MtRow> {
    
    /**
     * 分页查询行数据
     *
     * @param tableId 表格ID
     * @param params 查询参数
     * @return 分页结果
     */
    PageResult<MtRow> findByTableId(Long tableId, Map<String, Object> params);
    
    /**
     * 创建行数据
     *
     * @param row 行数据
     * @return 创建结果
     */
    boolean createRow(MtRow row);
    
    /**
     * 更新行数据
     *
     * @param row 行数据
     * @return 更新结果
     */
    boolean updateRow(MtRow row);
    
    /**
     * 删除行数据
     *
     * @param ids 行ID列表
     * @return 删除结果
     */
    boolean deleteRows(List<Long> ids);
    
    /**
     * 批量创建行数据
     *
     * @param rows 行数据列表
     * @return 创建结果
     */
    boolean batchCreateRows(List<MtRow> rows);
    
    /**
     * 批量更新行数据
     *
     * @param rows 行数据列表
     * @return 更新结果
     */
    boolean batchUpdateRows(List<MtRow> rows);
    
    /**
     * 根据表格ID统计行数
     *
     * @param tableId 表格ID
     * @return 行数
     */
    long countByTableId(Long tableId);
}