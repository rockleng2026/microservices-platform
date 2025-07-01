package com.central.crm.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.central.crm.model.Customer;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 客户数据访问接口
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Mapper
public interface CustomerMapper extends BaseMapper<Customer> {

    /**
     * 分页查询客户列表
     */
    IPage<Customer> selectCustomerPage(Page<Customer> page, @Param("params") Map<String, Object> params);

    /**
     * 查询客户统计信息
     */
    Map<String, Object> selectCustomerStatistics(@Param("params") Map<String, Object> params);

    /**
     * 查询客户分布统计
     */
    List<Map<String, Object>> selectCustomerDistribution(@Param("params") Map<String, Object> params);

    /**
     * 检查客户名称是否存在
     */
    Integer checkCustomerNameExists(@Param("customerName") String customerName, @Param("customerId") Long customerId);

    /**
     * 检查手机号是否存在
     */
    Integer checkPhoneExists(@Param("phone") String phone, @Param("customerId") Long customerId);

    /**
     * 检查邮箱是否存在
     */
    Integer checkEmailExists(@Param("email") String email, @Param("customerId") Long customerId);

    /**
     * 更新客户负责人
     */
    Integer updateCustomerOwner(@Param("customerId") Long customerId, @Param("newOwnerEmployeeId") Long newOwnerEmployeeId);

    /**
     * 批量更新客户状态
     */
    Integer batchUpdateCustomerStatus(@Param("customerIds") List<Long> customerIds, @Param("status") String status, @Param("updatedBy") Long updatedBy);

    /**
     * 查询高价值客户
     */
    List<Customer> selectHighValueCustomers(@Param("minRevenue") BigDecimal minRevenue, @Param("limit") Integer limit);

    /**
     * 查询流失风险客户
     */
    List<Map<String, Object>> selectChurnRiskCustomers(@Param("daysSinceLastFollow") Integer daysSinceLastFollow);
}