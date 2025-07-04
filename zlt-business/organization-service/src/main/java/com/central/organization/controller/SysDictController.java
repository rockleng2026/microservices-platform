package com.central.organization.controller;

import com.central.common.model.Result;
import com.central.common.model.PageResult;
import com.central.organization.model.dto.*;
import com.central.organization.model.vo.*;
import com.central.organization.service.ISysDictService;
import com.central.organization.service.impl.EmployeeServiceImpl;
import com.central.organization.utils.IdUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 通用字典配置控制器
 * 
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@RestController
@RequestMapping("/api/organization/dict")
public class SysDictController {

    @Autowired
    private ISysDictService dictService;

    // ============ 类目管理接口 ============

    /**
     * 分页查询类目列表
     * 
     * @param query 查询条件
     * @return 类目分页列表
     */
    @GetMapping("/category/page")
    public Result<PageResult<SysDictCategoryVO>> getCategoryPage(SysDictCategoryQueryDTO query) {
        try {
            EmployeeServiceImpl.PageResult<SysDictCategoryVO> servicePageResult = dictService.getCategoryPageList(query);
            
            // 转换为统一的PageResult格式
            PageResult<SysDictCategoryVO> pageResult = PageResult.<SysDictCategoryVO>builder()
                .count(servicePageResult.getTotal())
                .code(0)
                .data(servicePageResult.getRecords())
                .build();
                
            return Result.succeed(pageResult, "success");
        } catch (Exception ex) {
            log.error("分页查询字典类目列表失败", ex);
            return Result.failed("查询失败");
        }
    }

    /**
     * 查询所有启用的类目
     * 
     * @return 类目列表
     */
    @GetMapping("/category/enabled")
    public Result<List<SysDictCategoryVO>> getEnabledCategoryList() {
        try {
            // 这里需要从当前上下文获取租户ID，暂时使用默认值
            String tenantId = "default";
            List<SysDictCategoryVO> categories = dictService.getEnabledCategoryList(tenantId);
            return Result.succeed(categories);
        } catch (Exception ex) {
            log.error("查询启用类目列表失败", ex);
            return Result.failed("查询失败");
        }
    }

    /**
     * 根据ID查询类目详情
     * 
     * @param id 类目ID
     * @return 类目详情
     */
    @GetMapping("/category/{id}")
    public Result<SysDictCategoryVO> getCategoryById(@PathVariable String id) {
        try {
            Long categoryId = IdUtils.stringToLong(id);
            SysDictCategoryVO category = dictService.getCategoryById(categoryId);
            if (category == null) {
                return Result.failed("类目不存在");
            }
            return Result.succeed(category);
        } catch (Exception ex) {
            log.error("查询类目详情失败", ex);
            return Result.failed("查询失败");
        }
    }

    /**
     * 保存类目(新增或修改)
     * 
     * @param saveDTO 类目保存DTO
     * @return 类目ID
     */
    @PostMapping("/category/save")
    public Result<String> saveCategory(@RequestBody @Valid SysDictCategorySaveDTO saveDTO) {
        try {
            // ID转换处理
            if (saveDTO.getId() != null) {
                saveDTO.setId(IdUtils.stringToLong(saveDTO.getId().toString()));
            }

            Long categoryId = dictService.saveCategory(saveDTO);
            return Result.succeed(IdUtils.longToString(categoryId));
        } catch (Exception ex) {
            log.error("保存类目失败", ex);
            return Result.failed(ex.getMessage());
        }
    }

    /**
     * 更新类目状态
     * 
     * @param id 类目ID
     * @param status 状态
     * @return 操作结果
     */
    @PostMapping("/category/{id}/status")
    public Result<Void> updateCategoryStatus(@PathVariable String id, @RequestParam Integer status) {
        try {
            Long categoryId = IdUtils.stringToLong(id);
            Boolean success = dictService.updateCategoryStatus(categoryId, status);
            if (success) {
                return Result.succeed(null, "操作成功");
            } else {
                return Result.failed("操作失败");
            }
        } catch (Exception ex) {
            log.error("更新类目状态失败", ex);
            return Result.failed("操作失败");
        }
    }

    /**
     * 删除类目
     * 
     * @param id 类目ID
     * @return 操作结果
     */
    @DeleteMapping("/category/{id}")
    public Result<Void> deleteCategory(@PathVariable String id) {
        try {
            Long categoryId = IdUtils.stringToLong(id);
            Boolean success = dictService.deleteCategory(categoryId);
            if (success) {
                return Result.succeed(null, "删除成功");
            } else {
                return Result.failed("删除失败");
            }
        } catch (Exception ex) {
            log.error("删除类目失败", ex);
            return Result.failed(ex.getMessage());
        }
    }

    /**
     * 检查类目编码是否可用
     * 
     * @param code 类目编码
     * @param excludeId 排除的ID
     * @return 是否可用
     */
    @GetMapping("/category/check-code")
    public Result<Boolean> checkCategoryCodeAvailable(@RequestParam String code, 
                                                     @RequestParam(required = false) String excludeId) {
        try {
            Long excludeCategoryId = excludeId != null ? IdUtils.stringToLong(excludeId) : null;
            String tenantId = "default"; // 这里需要从当前上下文获取
            Boolean available = dictService.checkCategoryCodeAvailable(code, excludeCategoryId, tenantId);
            return Result.succeed(available);
        } catch (Exception ex) {
            log.error("检查类目编码可用性失败", ex);
            return Result.failed("检查失败");
        }
    }

    // ============ 明细项管理接口 ============

    /**
     * 分页查询明细项列表
     * 
     * @param query 查询条件
     * @return 明细项分页列表
     */
    @GetMapping("/item/page")
    public Result<PageResult<SysDictItemVO>> getItemPage(SysDictItemQueryDTO query) {
        try {
            // ID转换处理
            if (query.getCategoryId() != null) {
                query.setCategoryId(IdUtils.stringToLong(query.getCategoryId().toString()));
            }

            EmployeeServiceImpl.PageResult<SysDictItemVO> servicePageResult = dictService.getItemPageList(query);
            
            // 转换为统一的PageResult格式
            PageResult<SysDictItemVO> pageResult = PageResult.<SysDictItemVO>builder()
                .count(servicePageResult.getTotal())
                .code(0)
                .data(servicePageResult.getRecords())
                .build();
                
            return Result.succeed(pageResult, "success");
        } catch (Exception ex) {
            log.error("分页查询字典明细项列表失败", ex);
            return Result.failed("查询失败");
        }
    }

    /**
     * 根据类目ID查询明细项列表
     * 
     * @param categoryId 类目ID
     * @param status 状态(可选)
     * @return 明细项列表
     */
    @GetMapping("/item/category/{categoryId}")
    public Result<List<SysDictItemVO>> getItemsByCategoryId(@PathVariable String categoryId,
                                                           @RequestParam(required = false) Integer status) {
        try {
            Long catId = IdUtils.stringToLong(categoryId);
            String tenantId = "default"; // 这里需要从当前上下文获取
            List<SysDictItemVO> items = dictService.getItemsByCategoryId(catId, tenantId, status);
            return Result.succeed(items);
        } catch (Exception ex) {
            log.error("根据类目ID查询明细项失败", ex);
            return Result.failed("查询失败");
        }
    }

    /**
     * 根据类目编码查询明细项列表
     * 
     * @param categoryCode 类目编码
     * @param status 状态(可选)
     * @return 明细项列表
     */
    @GetMapping("/item/category-code/{categoryCode}")
    public Result<List<SysDictItemVO>> getItemsByCategoryCode(@PathVariable String categoryCode,
                                                             @RequestParam(required = false) Integer status) {
        try {
            String tenantId = "default"; // 这里需要从当前上下文获取
            List<SysDictItemVO> items = dictService.getItemsByCategoryCode(categoryCode, tenantId, status);
            return Result.succeed(items);
        } catch (Exception ex) {
            log.error("根据类目编码查询明细项失败", ex);
            return Result.failed("查询失败");
        }
    }

    /**
     * 根据ID查询明细项详情
     * 
     * @param id 明细项ID
     * @return 明细项详情
     */
    @GetMapping("/item/{id}")
    public Result<SysDictItemVO> getItemById(@PathVariable String id) {
        try {
            Long itemId = IdUtils.stringToLong(id);
            SysDictItemVO item = dictService.getItemById(itemId);
            if (item == null) {
                return Result.failed("明细项不存在");
            }
            return Result.succeed(item);
        } catch (Exception ex) {
            log.error("查询明细项详情失败", ex);
            return Result.failed("查询失败");
        }
    }

    /**
     * 保存明细项(新增或修改)
     * 
     * @param saveDTO 明细项保存DTO
     * @return 明细项ID
     */
    @PostMapping("/item/save")
    public Result<String> saveItem(@RequestBody @Valid SysDictItemSaveDTO saveDTO) {
        try {
            // ID转换处理
            if (saveDTO.getId() != null) {
                saveDTO.setId(IdUtils.stringToLong(saveDTO.getId().toString()));
            }
            if (saveDTO.getCategoryId() != null) {
                saveDTO.setCategoryId(IdUtils.stringToLong(saveDTO.getCategoryId().toString()));
            }

            Long itemId = dictService.saveItem(saveDTO);
            return Result.succeed(IdUtils.longToString(itemId));
        } catch (Exception ex) {
            log.error("保存明细项失败", ex);
            return Result.failed(ex.getMessage());
        }
    }

    /**
     * 批量保存明细项
     * 
     * @param batchSaveDTO 批量保存DTO
     * @return 成功保存的数量
     */
    @PostMapping("/item/batch-save")
    public Result<Integer> batchSaveItems(@RequestBody BatchSaveItemDTO batchSaveDTO) {
        try {
            Long categoryId = IdUtils.stringToLong(batchSaveDTO.getCategoryId().toString());
            
            // ID转换处理
            batchSaveDTO.getItems().forEach(item -> {
                if (item.getId() != null) {
                    item.setId(IdUtils.stringToLong(item.getId().toString()));
                }
                item.setCategoryId(categoryId);
            });

            Integer count = dictService.batchSaveItems(categoryId, batchSaveDTO.getItems());
            return Result.succeed(count, "批量保存成功");
        } catch (Exception ex) {
            log.error("批量保存明细项失败", ex);
            return Result.failed(ex.getMessage());
        }
    }

    /**
     * 更新明细项状态
     * 
     * @param id 明细项ID
     * @param status 状态
     * @return 操作结果
     */
    @PostMapping("/item/{id}/status")
    public Result<Void> updateItemStatus(@PathVariable String id, @RequestParam Integer status) {
        try {
            Long itemId = IdUtils.stringToLong(id);
            Boolean success = dictService.updateItemStatus(itemId, status);
            if (success) {
                return Result.succeed(null, "操作成功");
            } else {
                return Result.failed("操作失败");
            }
        } catch (Exception ex) {
            log.error("更新明细项状态失败", ex);
            return Result.failed("操作失败");
        }
    }

    /**
     * 删除明细项
     * 
     * @param id 明细项ID
     * @return 操作结果
     */
    @DeleteMapping("/item/{id}")
    public Result<Void> deleteItem(@PathVariable String id) {
        try {
            Long itemId = IdUtils.stringToLong(id);
            Boolean success = dictService.deleteItem(itemId);
            if (success) {
                return Result.succeed(null, "删除成功");
            } else {
                return Result.failed("删除失败");
            }
        } catch (Exception ex) {
            log.error("删除明细项失败", ex);
            return Result.failed(ex.getMessage());
        }
    }

    /**
     * 批量删除明细项
     * 
     * @param ids 明细项ID列表
     * @return 操作结果
     */
    @DeleteMapping("/item/batch")
    public Result<Void> batchDeleteItems(@RequestBody List<String> ids) {
        try {
            List<Long> itemIds = ids.stream()
                .map(IdUtils::stringToLong)
                .toList();
            
            Boolean success = dictService.batchDeleteItems(itemIds);
            if (success) {
                return Result.succeed(null, "批量删除成功");
            } else {
                return Result.failed("批量删除失败");
            }
        } catch (Exception ex) {
            log.error("批量删除明细项失败", ex);
            return Result.failed(ex.getMessage());
        }
    }

    /**
     * 检查明细项编码是否可用
     * 
     * @param categoryId 类目ID
     * @param itemCode 项目编码
     * @param excludeId 排除的ID
     * @return 是否可用
     */
    @GetMapping("/item/check-code")
    public Result<Boolean> checkItemCodeAvailable(@RequestParam String categoryId,
                                                 @RequestParam String itemCode, 
                                                 @RequestParam(required = false) String excludeId) {
        try {
            Long catId = IdUtils.stringToLong(categoryId);
            Long excludeItemId = excludeId != null ? IdUtils.stringToLong(excludeId) : null;
            String tenantId = "default"; // 这里需要从当前上下文获取
            Boolean available = dictService.checkItemCodeAvailable(catId, itemCode, excludeItemId, tenantId);
            return Result.succeed(available);
        } catch (Exception ex) {
            log.error("检查明细项编码可用性失败", ex);
            return Result.failed("检查失败");
        }
    }

    /**
     * 批量保存明细项DTO
     */
    public static class BatchSaveItemDTO {
        private Object categoryId;
        private List<SysDictItemSaveDTO> items;

        public Object getCategoryId() { return categoryId; }
        public void setCategoryId(Object categoryId) { this.categoryId = categoryId; }
        public List<SysDictItemSaveDTO> getItems() { return items; }
        public void setItems(List<SysDictItemSaveDTO> items) { this.items = items; }
    }
} 