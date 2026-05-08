package com.central.mall.service;

import com.central.mall.model.dto.SalesTrendDTO;
import com.central.mall.model.dto.StatisticsDTO;
import com.central.mall.model.dto.StockWarningDTO;
import com.central.mall.model.dto.UserAnalysisDTO;

import java.util.List;

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

    /**
     * 获取销售趋势统计
     * 根据type确定日期分组维度，SQL使用status IN (2,3,4)过滤已付款/已发货/已完成的订单
     *
     * @param type 日期分组类型：day=按日, week=按周, month=按月
     * @param startDate 开始日期（格式：yyyy-MM-dd）
     * @param endDate 结束日期（格式：yyyy-MM-dd）
     * @return 销售趋势列表
     */
    List<SalesTrendDTO> getSalesTrend(String type, String startDate, String endDate);

    /**
     * 获取库存预警列表
     * 返回 stock <= 预警阈值(默认10) 的SKU
     *
     * @return 库存预警列表
     */
    List<StockWarningDTO> getStockWarningList();

    /**
     * 获取用户分析统计
     * 返回新增用户数和活跃用户数
     *
     * @return 用户分析DTO
     */
    UserAnalysisDTO getUserAnalysis();
}
