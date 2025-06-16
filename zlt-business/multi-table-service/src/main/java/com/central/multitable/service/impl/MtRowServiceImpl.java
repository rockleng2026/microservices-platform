package com.central.multitable.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.common.model.PageResult;
import com.central.multitable.mapper.MtRowMapper;
import com.central.multitable.model.MtRow;
import com.central.multitable.service.IMtRowService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.MapUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 行数据Service实现类
 *
 * @author multi-table-system
 */
@Slf4j
@Service
public class MtRowServiceImpl extends ServiceImpl<MtRowMapper, MtRow> implements IMtRowService {
    
    @Override
    public PageResult<MtRow> findByTableId(Long tableId, Map<String, Object> params) {
        Page<MtRow> page = new Page<>(MapUtils.getInteger(params, "page"), MapUtils.getInteger(params, "limit"));
        List<MtRow> list = baseMapper.findByTableId(page, tableId, params);
        return PageResult.<MtRow>builder()
                .data(list)
                .code(0)
                .count(page.getTotal())
                .build();
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createRow(MtRow row) {
        row.setCreateTime(new Date());
        row.setUpdateTime(new Date());
        row.setVersion(1);
        row.setIsDeleted(false);
        return save(row);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateRow(MtRow row) {
        row.setUpdateTime(new Date());
        // 版本号递增
        if (row.getVersion() == null) {
            row.setVersion(1);
        } else {
            row.setVersion(row.getVersion() + 1);
        }
        return updateById(row);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteRows(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return false;
        }
        return baseMapper.deleteLogically(ids) > 0;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchCreateRows(List<MtRow> rows) {
        if (rows == null || rows.isEmpty()) {
            return false;
        }
        
        Date now = new Date();
        for (MtRow row : rows) {
            row.setCreateTime(now);
            row.setUpdateTime(now);
            row.setVersion(1);
            row.setIsDeleted(false);
        }
        
        return baseMapper.batchInsert(rows) > 0;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchUpdateRows(List<MtRow> rows) {
        if (rows == null || rows.isEmpty()) {
            return false;
        }
        
        Date now = new Date();
        for (MtRow row : rows) {
            row.setUpdateTime(now);
            if (row.getVersion() == null) {
                row.setVersion(1);
            } else {
                row.setVersion(row.getVersion() + 1);
            }
        }
        
        return baseMapper.batchUpdate(rows) > 0;
    }
    
    @Override
    public long countByTableId(Long tableId) {
        return baseMapper.countByTableId(tableId);
    }
} 