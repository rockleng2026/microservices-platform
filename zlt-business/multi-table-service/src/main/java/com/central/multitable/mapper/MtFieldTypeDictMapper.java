package com.central.multitable.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.multitable.model.MtFieldTypeDict;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 字段类型字典Mapper接口
 *
 * @author multi-table-system
 */
@Mapper
public interface MtFieldTypeDictMapper extends BaseMapper<MtFieldTypeDict> {
    
    /**
     * 根据分类查询字段类型
     *
     * @param category 字段分类
     * @return 字段类型列表
     */
    List<MtFieldTypeDict> findByCategory(@Param("category") String category);
    
    /**
     * 根据类型标识查询字段类型
     *
     * @param typeKey 类型标识
     * @return 字段类型信息
     */
    MtFieldTypeDict findByTypeKey(@Param("typeKey") String typeKey);
    
    /**
     * 查询所有启用的字段类型
     *
     * @return 字段类型列表
     */
    List<MtFieldTypeDict> findAllEnabled();
} 