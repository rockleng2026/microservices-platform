package com.central.multitable.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.central.multitable.model.MtField;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 表格字段定义Mapper
 *
 * @author zlt
 * @date 2025-06-17
 */
@Mapper
public interface MtFieldMapper extends BaseMapper<MtField> {
    
    /**
     * 根据表格ID查询字段列表
     *
     * @param tableId 表格ID
     * @return 字段列表
     */
    List<MtField> findByTableId(@Param("tableId") Long tableId);
    
    /**
     * 根据表格ID和字段标识查询字段
     *
     * @param tableId 表格ID
     * @param fieldKey 字段标识
     * @return 字段信息
     */
    MtField findByTableIdAndFieldKey(@Param("tableId") Long tableId, @Param("fieldKey") String fieldKey);
    
    /**
     * 根据字段类型查询字段列表
     *
     * @param fieldType 字段类型
     * @return 字段列表
     */
    List<MtField> findByFieldType(@Param("fieldType") String fieldType);
    
    /**
     * 批量插入字段
     *
     * @param fields 字段列表
     * @return 插入数量
     */
    int batchInsert(@Param("fields") List<MtField> fields);
    
    /**
     * 更新字段排序
     *
     * @param id 字段ID
     * @param sortOrder 排序序号
     * @return 影响行数
     */
    int updateSortOrder(@Param("id") Long id, @Param("sortOrder") Integer sortOrder);
} 