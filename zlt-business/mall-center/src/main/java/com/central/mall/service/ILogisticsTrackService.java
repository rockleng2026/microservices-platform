package com.central.mall.service;

import com.central.mall.model.dto.LogisticsTrackDTO;

public interface ILogisticsTrackService {

    /**
     * Get logistics tracking info for an order (DELIVERY-03, DELIVERY-04)
     */
    LogisticsTrackDTO getLogisticsInfo(Long orderId);

    /**
     * Force refresh logistics tracking from API
     */
    LogisticsTrackDTO refreshLogistics(Long orderId);
}