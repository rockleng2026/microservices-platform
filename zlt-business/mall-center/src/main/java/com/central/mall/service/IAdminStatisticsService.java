package com.central.mall.service;

import com.central.mall.model.dto.StatisticsDTO;

/**
 * 管理员统计服务接口
 * D-05: 统计数据准实时（Redis缓存，每5分钟刷新）
 */
public interface IAdminStatisticsService {

    /**
     * 获取今日统计数据
     * 从Redis缓存获取，缓存miss时计算并缓存5分钟
     *
     * @return 今日统计DTO
     */
    StatisticsDTO getTodayStatistics();
}
