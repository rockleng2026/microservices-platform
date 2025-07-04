package com.central.organization.service.impl;

import cn.hutool.core.bean.BeanUtil;
import cn.hutool.core.collection.CollUtil;
import cn.hutool.core.util.StrUtil;
import cn.hutool.json.JSONUtil;
import com.central.organization.mapper.SysDictCategoryMapper;
import com.central.organization.mapper.SysDictItemMapper;
import com.central.organization.model.SysDictCategory;
import com.central.organization.model.SysDictItem;
import com.central.organization.model.dto.*;
import com.central.organization.model.vo.*;
import com.central.organization.service.ISysDictService;
import com.central.organization.service.impl.EmployeeServiceImpl;
import com.central.organization.utils.IdUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 通用字典服务实现类
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@Service
public class SysDictServiceImpl implements ISysDictService {

    @Autowired
    private SysDictCategoryMapper categoryMapper;

    @Autowired
    private SysDictItemMapper itemMapper;

    // ============ 类目管理实现 ============

    @Override
    public EmployeeServiceImpl.PageResult<SysDictCategoryVO> getCategoryPageList(SysDictCategoryQueryDTO query) {
        if (query == null) {
            query = new SysDictCategoryQueryDTO();
        }

        // 设置默认值
        if (query.getPage() == null || query.getPage() < 1) {
            query.setPage(1);
        }
        if (query.getSize() == null || query.getSize() < 1) {
            query.setSize(20);
        }
        if (StrUtil.isBlank(query.getTenantId())) {
            query.setTenantId("default"); // 从当前上下文获取
        }

        // 查询数据
        List<SysDictCategoryVO> records = categoryMapper.selectPageList(query);
        Long total = categoryMapper.selectCount(query);

        // 处理扩展字段和明细项数量统计
        records.forEach(this::enrichCategoryVO);

        // 构建分页结果
        EmployeeServiceImpl.PageResult<SysDictCategoryVO> pageResult = new EmployeeServiceImpl.PageResult<>();
        pageResult.setRecords(records);
        pageResult.setTotal(total);
        pageResult.setPage(query.getPage());
        pageResult.setSize(query.getSize());
        pageResult.setPages((int) Math.ceil((double) total / query.getSize()));

        return pageResult;
    }

    @Override
    public SysDictCategoryVO getCategoryById(Long id) {
        if (id == null) {
            return null;
        }
        SysDictCategoryVO categoryVO = categoryMapper.selectDetailById(id);
        if (categoryVO != null) {
            enrichCategoryVO(categoryVO);
        }
        return categoryVO;
    }

    @Override
    public List<SysDictCategoryVO> getEnabledCategoryList(String tenantId) {
        if (StrUtil.isBlank(tenantId)) {
            tenantId = "default"; // 从当前上下文获取
        }
        List<SysDictCategoryVO> categories = categoryMapper.selectEnabledList(tenantId);
        categories.forEach(this::enrichCategoryVO);
        return categories;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long saveCategory(SysDictCategorySaveDTO saveDTO) {
        // 数据校验
        validateCategoryData(saveDTO);

        SysDictCategory category = new SysDictCategory();
        BeanUtil.copyProperties(saveDTO, category);

        // 处理扩展字段Schema
        if (CollUtil.isNotEmpty(saveDTO.getExtendFields())) {
            String extendSchema = JSONUtil.toJsonStr(saveDTO.getExtendFields());
            category.setExtendSchema(extendSchema);
        }

        LocalDateTime now = LocalDateTime.now();
        if (category.getId() == null) {
            // 新增
            category.setId(IdUtils.nextId());
            category.setCreatedAt(now);
            category.setDelflag(0);
            
            // 设置租户ID和创建人
            if (StrUtil.isBlank(category.getTenantId())) {
                category.setTenantId("default");
            }
            if (category.getCreatedBy() == null) {
                category.setCreatedBy(1L); // 从当前上下文获取
            }
            
            categoryMapper.insert(category);
            log.info("新增字典类目成功: code={}, name={}", category.getCode(), category.getName());
        } else {
            // 修改
            category.setUpdatedAt(now);
            if (category.getUpdatedBy() == null) {
                category.setUpdatedBy(1L); // 从当前上下文获取
            }
            
            categoryMapper.updateById(category);
            log.info("修改字典类目成功: id={}, code={}, name={}", category.getId(), category.getCode(), category.getName());
        }

        return category.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateCategoryStatus(Long id, Integer status) {
        if (id == null || status == null) {
            return false;
        }
        return categoryMapper.updateStatus(id, status) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteCategory(Long id) {
        if (id == null) {
            return false;
        }

        // 检查是否有关联的明细项
        Integer itemCount = itemMapper.selectCountByCategoryId(id);
        if (itemCount != null && itemCount > 0) {
            throw new IllegalArgumentException("该类目下存在明细项，无法删除");
        }

        SysDictCategory category = categoryMapper.selectById(id);
        if (category == null) {
            return false;
        }

        boolean success = categoryMapper.deleteById(id) > 0;
        if (success) {
            log.info("删除字典类目成功: code={}, name={}", category.getCode(), category.getName());
        }
        
        return success;
    }

    @Override
    public Boolean checkCategoryCodeAvailable(String code, Long excludeId, String tenantId) {
        if (StrUtil.isBlank(code)) {
            return false;
        }
        if (StrUtil.isBlank(tenantId)) {
            tenantId = "default";
        }
        SysDictCategory existing = categoryMapper.selectByCode(code, tenantId, excludeId);
        return existing == null;
    }

    // ============ 明细项管理实现 ============

    @Override
    public EmployeeServiceImpl.PageResult<SysDictItemVO> getItemPageList(SysDictItemQueryDTO query) {
        if (query == null) {
            query = new SysDictItemQueryDTO();
        }

        // 设置默认值
        if (query.getPage() == null || query.getPage() < 1) {
            query.setPage(1);
        }
        if (query.getSize() == null || query.getSize() < 1) {
            query.setSize(20);
        }
        if (StrUtil.isBlank(query.getTenantId())) {
            query.setTenantId("default");
        }

        // 查询数据
        List<SysDictItemVO> records = itemMapper.selectPageList(query);
        Long total = itemMapper.selectCount(query);

        // 处理扩展数据
        records.forEach(this::enrichItemVO);

        // 构建分页结果
        EmployeeServiceImpl.PageResult<SysDictItemVO> pageResult = new EmployeeServiceImpl.PageResult<>();
        pageResult.setRecords(records);
        pageResult.setTotal(total);
        pageResult.setPage(query.getPage());
        pageResult.setSize(query.getSize());
        pageResult.setPages((int) Math.ceil((double) total / query.getSize()));

        return pageResult;
    }

    @Override
    public SysDictItemVO getItemById(Long id) {
        if (id == null) {
            return null;
        }
        SysDictItemVO itemVO = itemMapper.selectDetailById(id);
        if (itemVO != null) {
            enrichItemVO(itemVO);
        }
        return itemVO;
    }

    @Override
    public List<SysDictItemVO> getItemsByCategoryId(Long categoryId, String tenantId, Integer status) {
        if (categoryId == null) {
            return Collections.emptyList();
        }
        if (StrUtil.isBlank(tenantId)) {
            tenantId = "default";
        }
        List<SysDictItemVO> items = itemMapper.selectByCategoryId(categoryId, tenantId, status);
        items.forEach(this::enrichItemVO);
        return items;
    }

    @Override
    public List<SysDictItemVO> getItemsByCategoryCode(String categoryCode, String tenantId, Integer status) {
        if (StrUtil.isBlank(categoryCode)) {
            return Collections.emptyList();
        }
        if (StrUtil.isBlank(tenantId)) {
            tenantId = "default";
        }
        List<SysDictItemVO> items = itemMapper.selectByCategoryCode(categoryCode, tenantId, status);
        items.forEach(this::enrichItemVO);
        return items;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Long saveItem(SysDictItemSaveDTO saveDTO) {
        // 数据校验
        validateItemData(saveDTO);

        SysDictItem item = new SysDictItem();
        BeanUtil.copyProperties(saveDTO, item);

        // 处理扩展数据
        if (saveDTO.getExtendData() != null && !saveDTO.getExtendData().isEmpty()) {
            String extendData = JSONUtil.toJsonStr(saveDTO.getExtendData());
            item.setExtendData(extendData);
        }

        LocalDateTime now = LocalDateTime.now();
        if (item.getId() == null) {
            // 新增
            item.setId(IdUtils.nextId());
            item.setCreatedAt(now);
            item.setDelflag(0);
            
            // 设置租户ID和创建人
            if (StrUtil.isBlank(item.getTenantId())) {
                item.setTenantId("default");
            }
            if (item.getCreatedBy() == null) {
                item.setCreatedBy(1L);
            }
            
            itemMapper.insert(item);
            log.info("新增字典明细项成功: categoryId={}, itemCode={}, itemName={}", 
                item.getCategoryId(), item.getItemCode(), item.getItemName());
        } else {
            // 修改
            item.setUpdatedAt(now);
            if (item.getUpdatedBy() == null) {
                item.setUpdatedBy(1L);
            }
            
            itemMapper.updateById(item);
            log.info("修改字典明细项成功: id={}, itemCode={}, itemName={}", 
                item.getId(), item.getItemCode(), item.getItemName());
        }

        return item.getId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Integer batchSaveItems(Long categoryId, List<SysDictItemSaveDTO> saveList) {
        if (categoryId == null || CollUtil.isEmpty(saveList)) {
            return 0;
        }

        int successCount = 0;
        for (SysDictItemSaveDTO saveDTO : saveList) {
            try {
                saveDTO.setCategoryId(categoryId);
                saveItem(saveDTO);
                successCount++;
            } catch (Exception e) {
                log.error("批量保存明细项失败: categoryId={}, itemCode={}, error={}", 
                    categoryId, saveDTO.getItemCode(), e.getMessage(), e);
                // 这里可以选择抛出异常中断事务，或者记录错误继续处理
                throw new RuntimeException("保存明细项失败: " + saveDTO.getItemCode() + " - " + e.getMessage());
            }
        }

        log.info("批量保存字典明细项完成: categoryId={}, 成功数量={}", categoryId, successCount);
        return successCount;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean updateItemStatus(Long id, Integer status) {
        if (id == null || status == null) {
            return false;
        }
        return itemMapper.updateStatus(id, status) > 0;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean deleteItem(Long id) {
        if (id == null) {
            return false;
        }

        SysDictItem item = itemMapper.selectById(id);
        if (item == null) {
            return false;
        }

        boolean success = itemMapper.deleteById(id) > 0;
        if (success) {
            log.info("删除字典明细项成功: itemCode={}, itemName={}", item.getItemCode(), item.getItemName());
        }
        
        return success;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Boolean batchDeleteItems(List<Long> ids) {
        if (CollUtil.isEmpty(ids)) {
            return false;
        }

        int deletedCount = 0;
        for (Long id : ids) {
            try {
                if (deleteItem(id)) {
                    deletedCount++;
                }
            } catch (Exception e) {
                log.error("批量删除明细项失败: id={}, error={}", id, e.getMessage(), e);
                throw new RuntimeException("删除明细项失败: " + id + " - " + e.getMessage());
            }
        }

        log.info("批量删除字典明细项完成: 删除数量={}", deletedCount);
        return deletedCount > 0;
    }

    @Override
    public Boolean checkItemCodeAvailable(Long categoryId, String itemCode, Long excludeId, String tenantId) {
        if (categoryId == null || StrUtil.isBlank(itemCode)) {
            return false;
        }
        if (StrUtil.isBlank(tenantId)) {
            tenantId = "default";
        }
        SysDictItem existing = itemMapper.selectByCode(categoryId, itemCode, tenantId, excludeId);
        return existing == null;
    }

    // ============ 私有辅助方法 ============

    /**
     * 丰富类目VO数据
     */
    private void enrichCategoryVO(SysDictCategoryVO categoryVO) {
        if (categoryVO == null) {
            return;
        }

        // 处理状态描述
        categoryVO.setStatusText(categoryVO.getStatus() == 1 ? "启用" : "禁用");

        // 解析扩展字段Schema
        if (StrUtil.isNotBlank(categoryVO.getExtendFields().toString())) {
            try {
                List<SysDictCategoryVO.ExtendFieldVO> extendFields = JSONUtil.toList(
                    categoryVO.getExtendFields().toString(), 
                    SysDictCategoryVO.ExtendFieldVO.class
                );
                // 处理字段类型和必填描述
                extendFields.forEach(field -> {
                    field.setTypeText(getFieldTypeText(field.getType()));
                    field.setRequiredText(field.getRequired() == 1 ? "是" : "否");
                });
                categoryVO.setExtendFields(extendFields);
            } catch (Exception e) {
                log.warn("解析扩展字段Schema失败: categoryId={}, error={}", categoryVO.getId(), e.getMessage());
                categoryVO.setExtendFields(Collections.emptyList());
            }
        } else {
            categoryVO.setExtendFields(Collections.emptyList());
        }

        // 查询明细项数量
        try {
            Long categoryId = IdUtils.stringToLong(categoryVO.getId());
            Integer itemCount = itemMapper.selectCountByCategoryId(categoryId);
            categoryVO.setItemCount(itemCount != null ? itemCount : 0);
        } catch (Exception e) {
            log.warn("查询明细项数量失败: categoryId={}, error={}", categoryVO.getId(), e.getMessage());
            categoryVO.setItemCount(0);
        }
    }

    /**
     * 丰富明细项VO数据
     */
    private void enrichItemVO(SysDictItemVO itemVO) {
        if (itemVO == null) {
            return;
        }

        // 处理状态描述
        itemVO.setStatusText(itemVO.getStatus() == 1 ? "启用" : "禁用");
        itemVO.setIsDefaultText(itemVO.getIsDefault() == 1 ? "是" : "否");

        // 解析扩展数据
        if (StrUtil.isNotBlank(itemVO.getExtendData().toString())) {
            try {
                Map<String, Object> extendData = JSONUtil.toBean(itemVO.getExtendData().toString(), Map.class);
                itemVO.setExtendData(extendData);
            } catch (Exception e) {
                log.warn("解析扩展数据失败: itemId={}, error={}", itemVO.getId(), e.getMessage());
                itemVO.setExtendData(Collections.emptyMap());
            }
        } else {
            itemVO.setExtendData(Collections.emptyMap());
        }
    }

    /**
     * 获取字段类型描述
     */
    private String getFieldTypeText(String type) {
        if (StrUtil.isBlank(type)) {
            return "";
        }
        return switch (type.toLowerCase()) {
            case "string" -> "文本";
            case "number" -> "数字";
            case "date" -> "日期";
            case "boolean" -> "布尔";
            default -> type;
        };
    }

    /**
     * 校验类目数据
     */
    private void validateCategoryData(SysDictCategorySaveDTO saveDTO) {
        if (saveDTO == null) {
            throw new IllegalArgumentException("类目数据不能为空");
        }

        // 检查编码唯一性
        Boolean codeAvailable = checkCategoryCodeAvailable(saveDTO.getCode(), saveDTO.getId(), "default");
        if (!codeAvailable) {
            throw new IllegalArgumentException("类目编码已存在: " + saveDTO.getCode());
        }

        // 校验扩展字段配置
        if (CollUtil.isNotEmpty(saveDTO.getExtendFields())) {
            Set<String> codes = new HashSet<>();
            for (SysDictCategorySaveDTO.ExtendFieldDTO field : saveDTO.getExtendFields()) {
                if (codes.contains(field.getCode())) {
                    throw new IllegalArgumentException("扩展字段编码重复: " + field.getCode());
                }
                codes.add(field.getCode());
            }
        }
    }

    /**
     * 校验明细项数据
     */
    private void validateItemData(SysDictItemSaveDTO saveDTO) {
        if (saveDTO == null) {
            throw new IllegalArgumentException("明细项数据不能为空");
        }

        // 检查编码唯一性
        Boolean codeAvailable = checkItemCodeAvailable(saveDTO.getCategoryId(), saveDTO.getItemCode(), saveDTO.getId(), "default");
        if (!codeAvailable) {
            throw new IllegalArgumentException("明细项编码已存在: " + saveDTO.getItemCode());
        }
    }
}