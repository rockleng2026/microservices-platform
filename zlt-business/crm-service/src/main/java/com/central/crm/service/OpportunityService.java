package com.central.crm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.central.crm.model.Opportunity;

import java.util.List;
import java.util.Map;

/**
 * 商机管理Service接口
 *
 * @author Central Team
 * @since 2024-12-19
 */
public interface OpportunityService extends IService<Opportunity> {

    /**
     * 分页查询商机列表
     */
    IPage<Opportunity> selectOpportunityPage(Page<Opportunity> page, Map<String, Object> params);

    /**
     * 创建商机
     */
    boolean createOpportunity(Opportunity opportunity);

    /**
     * 更新商机
     */
    boolean updateOpportunity(Opportunity opportunity);

    /**
     * 删除商机
     */
    boolean deleteOpportunity(Long opportunityId);

    /**
     * 批量删除商机
     */
    boolean batchDeleteOpportunities(List<Long> opportunityIds);

    /**
     * 根据客户ID查询商机列表
     */
    List<Opportunity> getByCustomerId(Long customerId);

    /**
     * 查询商机漏斗统计
     */
    List<Map<String, Object>> getFunnelStatistics(Map<String, Object> params);

    /**
     * 查询商机成交统计
     */
    Map<String, Object> getWinStatistics(Map<String, Object> params);

    /**
     * 查询商机趋势统计
     */
    List<Map<String, Object>> getTrendStatistics(Map<String, Object> params);

    /**
     * 推进商机阶段
     */
    boolean advanceOpportunityStage(Long opportunityId, String newStage, Integer newProbability, String notes);

    /**
     * 成交商机
     */
    boolean winOpportunity(Long opportunityId, String actualAmount, String winReason, String notes);

    /**
     * 失败商机
     */
    boolean loseOpportunity(Long opportunityId, String loseReason, String notes);

    /**
     * 查询我的商机
     */
    List<Opportunity> getMyOpportunities(Long employeeId, String stage);

    /**
     * 查询即将到期的商机
     */
    List<Opportunity> getExpiringOpportunities(Integer days, Long employeeId);

    /**
     * 查询商机竞争对手分析
     */
    List<Map<String, Object>> getCompetitorAnalysis(Map<String, Object> params);

    /**
     * 预测商机成交概率
     */
    Map<String, Object> predictWinProbability(Long opportunityId);

    /**
     * 导入商机数据
     */
    Map<String, Object> importOpportunities(List<Opportunity> opportunities);

    /**
     * 导出商机数据
     */
    List<Opportunity> exportOpportunities(Map<String, Object> params);

    /**
     * 克隆商机
     */
    boolean cloneOpportunity(Long opportunityId, String newOpportunityName);

    /**
     * 关联竞争对手
     */
    boolean associateCompetitor(Long opportunityId, List<String> competitors);

    /**
     * 商机权限验证
     */
    boolean checkPermission(Long opportunityId, Long employeeId, String action);

    /**
     * 获取商机销售阶段配置
     */
    List<Map<String, Object>> getSalesStages();

    /**
     * 商机状态统计
     */
    Map<String, Object> getOpportunityStatusStatistics(Map<String, Object> params);
}