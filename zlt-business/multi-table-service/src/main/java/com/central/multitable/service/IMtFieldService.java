package com.central.multitable.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.multitable.model.MtField;

import java.util.List;
import java.util.Map;

/**
 * 字段Service接口
 *
 * @author multi-table-system
 */
public interface IMtFieldService extends IService<MtField> {
    
    /**
     * 根据表格ID查询字段列表
     *
     * @param tableId 表格ID
     * @return 字段列表
     */
    List<MtField> findByTableId(Long tableId);
    
    /**
     * 创建字段
     *
     * @param field 字段信息
     * @return 创建结果
     */
    boolean createField(MtField field);
    
    /**
     * 更新字段
     *
     * @param field 字段信息
     * @return 更新结果
     */
    boolean updateField(MtField field);
    
    /**
     * 删除字段
     *
     * @param id 字段ID
     * @return 删除结果
     */
    boolean deleteField(Long id);
    
    /**
     * 批量创建字段
     *
     * @param fields 字段列表
     * @return 创建结果
     */
    boolean batchCreateFields(List<MtField> fields);
    
    /**
     * 更新字段排序
     *
     * @param fieldOrders 字段排序信息
     * @return 更新结果
     */
    boolean updateFieldOrders(List<Map<String, Object>> fieldOrders);
} 