package com.central.multitable.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.multitable.mapper.MtFieldMapper;
import com.central.multitable.model.MtField;
import com.central.multitable.service.IMtFieldService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * 字段Service实现类
 *
 * @author multi-table-system
 */
@Slf4j
@Service
public class MtFieldServiceImpl extends ServiceImpl<MtFieldMapper, MtField> implements IMtFieldService {
    
    @Override
    public List<MtField> findByTableId(Long tableId) {
        return baseMapper.findByTableId(tableId);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createField(MtField field) {
        return save(field);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateField(MtField field) {
        return updateById(field);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteField(Long id) {
        return removeById(id);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchCreateFields(List<MtField> fields) {
        if (fields == null || fields.isEmpty()) {
            return false;
        }
        
        return baseMapper.batchInsert(fields) > 0;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateFieldOrders(List<Map<String, Object>> fieldOrders) {
        if (fieldOrders == null || fieldOrders.isEmpty()) {
            return false;
        }
        
        try {
            for (Map<String, Object> fieldOrder : fieldOrders) {
                Long id = Long.valueOf(fieldOrder.get("id").toString());
                Integer sortOrder = Integer.valueOf(fieldOrder.get("sortOrder").toString());
                baseMapper.updateSortOrder(id, sortOrder);
            }
            return true;
        } catch (Exception e) {
            log.error("更新字段排序失败", e);
            return false;
        }
    }
} 