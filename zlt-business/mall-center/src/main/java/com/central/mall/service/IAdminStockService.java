package com.central.mall.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.central.mall.model.dto.SkuStockDTO;
import java.util.List;

public interface IAdminStockService {

    /**
     * Get SKU stock list with pagination (STOCK-04)
     */
    IPage<SkuStockDTO> getSkuStockPage(IPage<SkuStockDTO> page, java.util.Map<String, Object> params);

    /**
     * Get single SKU stock detail with recent stock logs (STOCK-04)
     */
    SkuStockDTO getSkuStockDetail(Long skuId);

    /**
     * Manual stock correction by admin (STOCK-05)
     */
    boolean correctStock(Long skuId, Integer change, String operator, String remark);

    /**
     * Get stock threshold (from mall_settings)
     */
    Integer getStockThreshold();

    /**
     * Get list of SKUs below threshold for alert notification (STOCK-06)
     */
    List<SkuStockDTO> getStockAlertList();

    /**
     * Create new SKU stock record (STOCK-07)
     * @param dto Stock creation data
     * @return Created SKU ID
     */
    Long createStock(com.central.mall.model.dto.StockCreateDTO dto);
}