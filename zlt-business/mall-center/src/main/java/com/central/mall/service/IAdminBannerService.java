package com.central.mall.service;

import com.central.mall.model.dto.BannerDTO;

import java.util.List;

/**
 * Admin banner management service interface.
 * Provides full CRUD operations for banner carousel including sorting.
 * D-04: Mixed link mode - supports internal goods (linkType=1) and external URL (linkType=2).
 *
 * @author Portal Team
 * @since 2026-05-08
 */
public interface IAdminBannerService {

    /**
     * Get all banners ordered by sort ascending.
     * Only returns banners with status=1 (enabled).
     *
     * @return list of banners ordered by sort
     */
    List<BannerDTO> getBannerList();

    /**
     * Add a new banner.
     * Validates linkType: 1=goods (requires valid goodsId), 2=external (stores externalUrl).
     *
     * @param dto banner data to create
     * @return true if created successfully
     */
    boolean addBanner(BannerDTO dto);

    /**
     * Update an existing banner by id.
     *
     * @param dto banner data to update (must include id)
     * @return true if updated successfully
     */
    boolean updateBanner(BannerDTO dto);

    /**
     * Delete a banner by id.
     *
     * @param id banner id to delete
     * @return true if deleted successfully
     */
    boolean deleteBanner(Long id);

    /**
     * Update sort order for a single banner.
     *
     * @param id banner id
     * @param sort new sort value
     * @return true if updated successfully
     */
    boolean updateSort(Long id, Integer sort);
}