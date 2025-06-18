package com.central.multitable.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.multitable.mapper.MtAppSpaceMapper;
import com.central.multitable.mapper.MtTableMapper;
import com.central.multitable.mapper.MtFieldMapper;
import com.central.multitable.model.MtAppSpace;
import com.central.multitable.model.MtTable;
import com.central.multitable.model.MtField;
import com.central.multitable.service.IMtAppSpaceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * 应用空间Service实现类
 *
 * @author zlt
 * @date 2025-06-17
 */
@Slf4j
@Service
public class MtAppSpaceServiceImpl extends ServiceImpl<MtAppSpaceMapper, MtAppSpace> implements IMtAppSpaceService {

    @Autowired
    private MtTableMapper mtTableMapper;

    @Autowired
    private MtFieldMapper mtFieldMapper;

    @Override
    public List<MtAppSpace> listByTenantId(String tenantId) {
        return baseMapper.findByTenantId(tenantId);
    }

    @Override
    public List<MtAppSpace> listByTeamId(Long teamId) {
        return baseMapper.findByTeamId(teamId);
    }

    @Override
    public MtAppSpace getByUniCode(String uniCode) {
        return baseMapper.findByUniCode(uniCode);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createAppSpace(MtAppSpace appSpace) {
        try {
            // 生成唯一编码
            if (appSpace.getUniCode() == null || appSpace.getUniCode().isEmpty()) {
                appSpace.setUniCode(generateUniCode());
            }
            
            // 设置默认值
            if (appSpace.getStatus() == null) {
                appSpace.setStatus(1);
            }
            if (appSpace.getTableCount() == null) {
                appSpace.setTableCount(0);
            }
            if (appSpace.getViewCount() == null) {
                appSpace.setViewCount(0);
            }
            if (appSpace.getIsTemplate() == null) {
                appSpace.setIsTemplate(0);
            }

            return save(appSpace);
        } catch (Exception e) {
            log.error("创建应用空间失败", e);
            throw new RuntimeException("创建应用空间失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateAppSpace(MtAppSpace appSpace) {
        try {
            return updateById(appSpace);
        } catch (Exception e) {
            log.error("更新应用空间失败", e);
            throw new RuntimeException("更新应用空间失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteAppSpace(Long id) {
        try {
            // 逻辑删除
            MtAppSpace appSpace = new MtAppSpace();
            appSpace.setId(id);
            appSpace.setStatus(0);
            return updateById(appSpace);
        } catch (Exception e) {
            log.error("删除应用空间失败", e);
            throw new RuntimeException("删除应用空间失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public MtAppSpace createAppSpaceWithDefaultTable(String tenantId, Long teamId, Long createdBy) {
        try {
            // 1. 创建应用空间
            MtAppSpace appSpace = new MtAppSpace();
            appSpace.setUniCode(generateUniCode());
            appSpace.setTenantId(tenantId);
            appSpace.setName("未命名");
            appSpace.setDescription("新建的应用空间");
            appSpace.setTeamId(teamId);
            appSpace.setIcon("📊");
            appSpace.setColor("#4CAF50");
            appSpace.setCreatedBy(createdBy);
            appSpace.setTableCount(1);
            appSpace.setViewCount(1);
            appSpace.setStatus(1);
            appSpace.setIsTemplate(0);
            
            // 保存应用空间
            save(appSpace);
            
            // 2. 创建默认表格
            MtTable table = createDefaultTable(appSpace, createdBy);
            
            // 3. 创建默认字段
            createDefaultFields(table, createdBy);
            
            return appSpace;
        } catch (Exception e) {
            log.error("创建应用空间失败", e);
            throw new RuntimeException("创建应用空间失败: " + e.getMessage());
        }
    }
    
    private MtTable createDefaultTable(MtAppSpace appSpace, Long createdBy) {
        MtTable table = new MtTable();
        table.setUniCode(generateUniCode());
        table.setAppSpaceCode(appSpace.getUniCode());
        table.setTenantId(appSpace.getTenantId());
        table.setName("未命名");
        table.setDescription("新建的多维表格");
        table.setTeamId(appSpace.getTeamId());
        table.setIcon("📋");
        table.setColor("#2196F3");
        table.setCreatedBy(createdBy);
        table.setFieldCount(4);
        table.setViewCount(1);
        table.setStatus(1);
        table.setIsTemplate(0);
        
        // 使用mapper插入
        mtTableMapper.insert(table);
        
        return table;
    }
    
    private void createDefaultFields(MtTable table, Long createdBy) {
        List<MtField> fields = new ArrayList<>();
        
        // 创建4个默认字段
        fields.add(createField(table.getId(), "col_1", "文本", "text", 1, createdBy));
        fields.add(createField(table.getId(), "col_2", "单选", "single_select", 2, createdBy));
        fields.add(createField(table.getId(), "col_3", "日期", "date", 3, createdBy));
        fields.add(createField(table.getId(), "col_4", "附件", "attachment", 4, createdBy));
        
        // 批量插入字段
        if (!fields.isEmpty()) {
            mtFieldMapper.batchInsert(fields);
        }
    }
    
    private MtField createField(Long tableId, String fieldKey, String fieldName, String fieldType, Integer sortOrder, Long createdBy) {
        MtField field = new MtField();
        field.setTableId(tableId);
        field.setFieldKey(fieldKey);
        field.setFieldName(fieldName);
        field.setFieldType(fieldType);
        field.setDescription(fieldName + "字段");
        field.setConfig(getDefaultFieldConfig(fieldType));
        field.setIsRequired(0);
        field.setIsUnique(0);
        field.setIsSystem(0);
        field.setIsHidden(0);
        field.setSortOrder(sortOrder);
        field.setWidth(120);
        field.setCreatedBy(createdBy);
        
        return field;
    }
    
    private String getDefaultFieldConfig(String fieldType) {
        switch (fieldType) {
            case "text":
                return "{\"maxLength\": 255, \"multiline\": false, \"placeholder\": \"请输入文本\"}";
            case "single_select":
                return "{\"options\": [{\"color\": \"#4CAF50\", \"label\": \"选项1\", \"value\": \"option1\"}, {\"color\": \"#2196F3\", \"label\": \"选项2\", \"value\": \"option2\"}], \"allowOther\": false}";
            case "date":
                return "{\"format\": \"YYYY-MM-DD\", \"timezone\": \"Asia/Shanghai\", \"includeTime\": false}";
            case "attachment":
                return "{\"maxSize\": 10485760, \"maxFiles\": 10, \"allowedTypes\": [\"image/*\", \"application/pdf\", \"application/msword\", \"application/vnd.openxmlformats-officedocument.wordprocessingml.document\"]}";
            default:
                return "{}";
        }
    }

    /**
     * 生成唯一编码
     *
     * @return 唯一编码
     */
    private String generateUniCode() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 24);
    }
} 