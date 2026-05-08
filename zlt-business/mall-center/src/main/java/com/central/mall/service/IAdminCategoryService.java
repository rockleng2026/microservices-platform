package com.central.mall.service;

import com.central.mall.model.dto.AdminCategoryDTO;

import java.util.List;

/**
 * Admin category management service interface.
 * Provides full CRUD operations for product categories including tree structure and sorting.
 *
 * @author Portal Team
 * @since 2026-05-08
 */
public interface IAdminCategoryService {

    /**
     * Get full category tree structure with nested children.
     *
     * @return list of root categories with nested children
     */
    List<AdminCategoryDTO> getCategoryTree();

    /**
     * Add a new category.
     * If parentId > 0, validates that parent exists.
     *
     * @param dto category data to create
     * @return true if created successfully
     */
    boolean addCategory(AdminCategoryDTO dto);

    /**
     * Update an existing category by id.
     * Preserves existing children.
     *
     * @param dto category data to update (must include id)
     * @return true if updated successfully
     */
    boolean updateCategory(AdminCategoryDTO dto);

    /**
     * Delete a category by id.
     * If the category has children, recursively delete children as well.
     *
     * @param id category id to delete
     * @return true if deleted successfully
     */
    boolean deleteCategory(Long id);

    /**
     * Sort categories by passing an ordered list of category ids.
     * D-10: reorder by passing ordered list of ids.
     *
     * @param ids ordered list of category ids
     * @return true if sorted successfully
     */
    boolean sortCategories(List<Long> ids);
}