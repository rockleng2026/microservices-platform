package com.central.crm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.central.crm.model.CustomerFollow;

import java.util.List;
import java.util.Map;

/**
 * 客户跟进Service接口
 *
 * @author Central Team
 * @since 2024-12-19
 */
public interface CustomerFollowService extends IService<CustomerFollow> {

    /**
     * 分页查询跟进记录列表
     */
    IPage<CustomerFollow> selectFollowPage(Page<CustomerFollow> page, Map<String, Object> params);

    /**
     * 创建跟进记录
     */
    boolean createFollow(CustomerFollow follow);

    /**
     * 更新跟进记录
     */
    boolean updateFollow(CustomerFollow follow);

    /**
     * 删除跟进记录
     */
    boolean deleteFollow(Long followId);

    /**
     * 根据客户ID查询跟进记录
     */
    List<CustomerFollow> getByCustomerId(Long customerId);

    /**
     * 查询待跟进客户列表
     */
    List<Map<String, Object>> getPendingFollowList(Map<String, Object> params);

    /**
     * 查询跟进统计信息
     */
    Map<String, Object> getFollowStatistics(Map<String, Object> params);

    /**
     * 查询最近跟进记录
     */
    List<CustomerFollow> getRecentFollows(Map<String, Object> params);

    /**
     * 批量创建跟进记录
     */
    Map<String, Object> batchCreateFollows(List<CustomerFollow> follows);

    /**
     * 导出跟进记录数据
     */
    List<CustomerFollow> exportFollows(Map<String, Object> params);

    /**
     * 跟进提醒设置
     */
    boolean setFollowReminder(Long followId, String reminderTime, String reminderContent);

    /**
     * 获取我的跟进任务
     */
    List<Map<String, Object>> getMyFollowTasks(Long employeeId);
}