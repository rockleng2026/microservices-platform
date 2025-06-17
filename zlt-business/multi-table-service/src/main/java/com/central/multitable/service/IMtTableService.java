package com.central.multitable.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.central.common.model.PageResult;
import com.central.multitable.model.MtTable;
import com.central.multitable.model.dto.TableQueryDTO;

import java.util.List;

/**
 * 表格Service接口
 *
 * @author multi-table-system
 */
public interface IMtTableService extends IService<MtTable> {
    
    /**
     * 分页查询表格列表
     *
     * @param queryDTO 查询参数
     * @return 分页结果
     */
    PageResult<MtTable> findList(TableQueryDTO queryDTO);
    
    /**
     * 根据团队ID查询表格
     *
     * @param teamId 团队ID
     * @return 表格列表
     */
    List<MtTable> findByTeamId(Long teamId);
    
    /**
     * 创建表格
     *
     * @param table 表格信息
     * @return 创建结果
     */
    boolean createTable(MtTable table);
    
    /**
     * 更新表格
     *
     * @param table 表格信息
     * @return 更新结果
     */
    boolean updateTable(MtTable table);
    
    /**
     * 删除表格
     *
     * @param id 表格ID
     * @return 删除结果
     */
    boolean deleteTable(Long id);
    
    /**
     * 复制表格
     *
     * @param id 源表格ID
     * @param name 新表格名称
     * @return 新表格
     */
    MtTable copyTable(Long id, String name);
}