package com.central.organization.service;

import com.central.organization.model.dto.*;
import com.central.organization.model.vo.*;
import com.central.organization.service.impl.EmployeeServiceImpl;

import java.util.List;

/**
 * 通用字典服务接口
 *
 * @author Central Team
 * @since 2024-12-19
 */
public interface ISysDictService {

    // ============ 类目管理 ============
    
    /**
     * 分页查询类目列表
     *
     * @param query 查询条件
     * @return 分页结果
     */
    EmployeeServiceImpl.PageResult<SysDictCategoryVO> getCategoryPageList(SysDictCategoryQueryDTO query);

    /**
     * 根据ID查询类目详情
     *
     * @param id 类目ID
     * @return 类目详情
     */
    SysDictCategoryVO getCategoryById(Long id);

    /**
     * 查询所有启用的类目
     *
     * @param tenantId 租户ID
     * @return 类目列表
     */
    List<SysDictCategoryVO> getEnabledCategoryList(String tenantId);

    /**
     * 保存类目(新增或修改)
     *
     * @param saveDTO 类目保存DTO
     * @return 类目ID
     */
    Long saveCategory(SysDictCategorySaveDTO saveDTO);

    /**
     * 更新类目状态
     *
     * @param id 类目ID
     * @param status 状态
     * @return 是否成功
     */
    Boolean updateCategoryStatus(Long id, Integer status);

    /**
     * 删除类目
     *
     * @param id 类目ID
     * @return 是否成功
     */
    Boolean deleteCategory(Long id);

    /**
     * 检查类目编码是否可用
     *
     * @param code 类目编码
     * @param excludeId 排除的ID
     * @param tenantId 租户ID
     * @return 是否可用
     */
    Boolean checkCategoryCodeAvailable(String code, Long excludeId, String tenantId);

    // ============ 明细项管理 ============
    
    /**
     * 分页查询明细项列表
     *
     * @param query 查询条件
     * @return 分页结果
     */
    EmployeeServiceImpl.PageResult<SysDictItemVO> getItemPageList(SysDictItemQueryDTO query);

    /**
     * 根据ID查询明细项详情
     *
     * @param id 明细项ID
     * @return 明细项详情
     */
    SysDictItemVO getItemById(Long id);

    /**
     * 根据类目ID查询明细项列表
     *
     * @param categoryId 类目ID
     * @param tenantId 租户ID
     * @param status 状态(可选)
     * @return 明细项列表
     */
    List<SysDictItemVO> getItemsByCategoryId(Long categoryId, String tenantId, Integer status);

    /**
     * 根据类目编码查询明细项列表
     *
     * @param categoryCode 类目编码
     * @param tenantId 租户ID
     * @param status 状态(可选)
     * @return 明细项列表
     */
    List<SysDictItemVO> getItemsByCategoryCode(String categoryCode, String tenantId, Integer status);

    /**
     * 保存明细项(新增或修改)
     *
     * @param saveDTO 明细项保存DTO
     * @return 明细项ID
     */
    Long saveItem(SysDictItemSaveDTO saveDTO);

    /**
     * 批量保存明细项
     *
     * @param categoryId 类目ID
     * @param saveList 明细项保存DTO列表
     * @return 成功保存的数量
     */
    Integer batchSaveItems(Long categoryId, List<SysDictItemSaveDTO> saveList);

    /**
     * 更新明细项状态
     *
     * @param id 明细项ID
     * @param status 状态
     * @return 是否成功
     */
    Boolean updateItemStatus(Long id, Integer status);

    /**
     * 删除明细项
     *
     * @param id 明细项ID
     * @return 是否成功
     */
    Boolean deleteItem(Long id);

    /**
     * 批量删除明细项
     *
     * @param ids 明细项ID列表
     * @return 是否成功
     */
    Boolean batchDeleteItems(List<Long> ids);

    /**
     * 检查明细项编码是否可用
     *
     * @param categoryId 类目ID
     * @param itemCode 项目编码
     * @param excludeId 排除的ID
     * @param tenantId 租户ID
     * @return 是否可用
     */
    Boolean checkItemCodeAvailable(Long categoryId, String itemCode, Long excludeId, String tenantId);
} 