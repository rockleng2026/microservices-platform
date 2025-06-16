package com.central.multitable.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.common.model.PageResult;
import org.apache.commons.collections4.MapUtils;
import com.central.multitable.mapper.MtTableMapper;
import com.central.multitable.model.MtTable;
import com.central.multitable.service.IMtTableService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;
import java.util.Map;

/**
 * 表格Service实现类
 *
 * @author multi-table-system
 */
@Slf4j
@Service
public class MtTableServiceImpl extends ServiceImpl<MtTableMapper, MtTable> implements IMtTableService {
    
    @Override
    public PageResult<MtTable> findList(Map<String, Object> params) {
        Page<MtTable> page = new Page<>(MapUtils.getInteger(params, "page"), MapUtils.getInteger(params, "limit"));
        List<MtTable> list = baseMapper.findList(page, params);
        return PageResult.<MtTable>builder()
                .data(list)
                .code(0)
                .count(page.getTotal())
                .build();
    }
    
    @Override
    public List<MtTable> findByTeamId(Long teamId) {
        return baseMapper.findByTeamId(teamId);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createTable(MtTable table) {
        table.setCreateTime(new Date());
        table.setUpdateTime(new Date());
        table.setIsDeleted(false);
        return save(table);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateTable(MtTable table) {
        table.setUpdateTime(new Date());
        return updateById(table);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteTable(Long id) {
        // TODO: 需要获取当前用户ID
        Long userId = 1L; // 临时设置
        return baseMapper.deleteLogically(id, userId) > 0;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public MtTable copyTable(Long id, String name) {
        MtTable sourceTable = getById(id);
        if (sourceTable == null) {
            throw new RuntimeException("源表格不存在");
        }
        
        MtTable newTable = new MtTable();
        newTable.setTenantId(sourceTable.getTenantId());
        newTable.setName(name);
        newTable.setDescription(sourceTable.getDescription());
        newTable.setTeamId(sourceTable.getTeamId());
        newTable.setIcon(sourceTable.getIcon());
        newTable.setColor(sourceTable.getColor());
        newTable.setCreatedBy(sourceTable.getCreatedBy());
        
        createTable(newTable);
        
        // TODO: 复制字段和数据
        
        return newTable;
    }
} 