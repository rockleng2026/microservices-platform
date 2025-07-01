package com.central.crm.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.crm.model.CustomerFollow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 客户跟进记录数据访问接口
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Mapper
public interface CustomerFollowMapper extends BaseMapper<CustomerFollow> {

    /**
     * 分页查询跟进记录列表
     */
    IPage<CustomerFollow> selectFollowPage(Page<CustomerFollow> page, @Param("params") Map<String, Object> params);

    /**
     * 根据客户ID查询跟进记录
     */
    List<CustomerFollow> selectByCustomerId(@Param("customerId") Long customerId);

    /**
     * 查询待跟进客户列表
     */
    List<Map<String, Object>> selectPendingFollowList(@Param("params") Map<String, Object> params);

    /**
     * 查询跟进统计信息
     */
    Map<String, Object> selectFollowStatistics(@Param("params") Map<String, Object> params);

    /**
     * 查询最近跟进记录
     */
    List<CustomerFollow> selectRecentFollows(@Param("params") Map<String, Object> params);
}