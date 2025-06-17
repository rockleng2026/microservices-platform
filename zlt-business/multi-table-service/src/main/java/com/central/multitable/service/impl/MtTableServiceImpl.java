package com.central.multitable.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.common.model.PageResult;
import com.central.multitable.mapper.MtTableMapper;
import com.central.multitable.model.MtTable;
import com.central.multitable.model.dto.TableQueryDTO;
import com.central.multitable.service.IMtTableService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 表格Service实现类
 *
 * @author multi-table-system
 */
@Slf4j
@Service
public class MtTableServiceImpl extends ServiceImpl<MtTableMapper, MtTable> implements IMtTableService {
    
    @Override
    public PageResult<MtTable> findList(TableQueryDTO queryDTO) {
        // 处理默认值
        if (queryDTO.getPage() == null || queryDTO.getPage() < 1) {
            queryDTO.setPage(1);
        }
        if (queryDTO.getLimit() == null || queryDTO.getLimit() < 1) {
            queryDTO.setLimit(20);
        }
        
        // 创建分页对象
        Page<MtTable> page = new Page<>(queryDTO.getPage(), queryDTO.getLimit());
        
        // 调用Mapper查询方法
        List<MtTable> list = baseMapper.findList(page, queryDTO);
        
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
        // 移除手动设置时间字段，MyBatis-Plus会自动处理
        table.setStatus(1); // 设置状态为正常
        return save(table);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateTable(MtTable table) {
        // 移除手动设置时间字段，MyBatis-Plus会自动处理
        return updateById(table);
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteTable(Long id) {
        // TODO: 需要实现用户上下文获取，获取当前登录用户ID
        Long userId = 1L; // 临时使用默认值
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