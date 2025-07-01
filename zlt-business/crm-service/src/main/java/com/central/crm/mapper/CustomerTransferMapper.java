package com.central.crm.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.crm.model.CustomerTransfer;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 客户移交记录数据访问接口
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Mapper
public interface CustomerTransferMapper extends BaseMapper<CustomerTransfer> {

    /**
     * 分页查询移交记录列表
     */
    IPage<CustomerTransfer> selectTransferPage(Page<CustomerTransfer> page, @Param("params") Map<String, Object> params);

    /**
     * 查询待审批的移交申请
     */
    List<CustomerTransfer> selectPendingApprovals(@Param("params") Map<String, Object> params);

    /**
     * 根据客户ID查询移交记录
     */
    List<CustomerTransfer> selectByCustomerId(@Param("customerId") Long customerId);

    /**
     * 查询移交统计信息
     */
    Map<String, Object> selectTransferStatistics(@Param("params") Map<String, Object> params);
}