package com.central.multitable.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.central.multitable.model.MtFieldTypeDict;

import java.util.List;
import java.util.Map;

/**
 * 字段类型字典Service接口
 *
 * @author multi-table-system
 */
public interface IMtFieldTypeDictService extends IService<MtFieldTypeDict> {
    
    /**
     * 根据分类查询字段类型
     *
     * @param category 字段分类
     * @return 字段类型列表
     */
    List<MtFieldTypeDict> findByCategory(String category);
    
    /**
     * 根据类型标识查询字段类型
     *
     * @param typeKey 类型标识
     * @return 字段类型信息
     */
    MtFieldTypeDict findByTypeKey(String typeKey);
    
    /**
     * 查询所有启用的字段类型
     *
     * @return 字段类型列表
     */
    List<MtFieldTypeDict> findAllEnabled();
    
    /**
     * 按分类分组查询字段类型
     *
     * @return 分组后的字段类型
     */
    Map<String, List<MtFieldTypeDict>> findGroupByCategory();
}