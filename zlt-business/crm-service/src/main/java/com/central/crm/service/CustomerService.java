package com.central.crm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.central.crm.model.Customer;
import com.central.crm.model.vo.CustomerQueryVO;
import com.central.crm.model.vo.CustomerVO;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * 客户管理Service接口
 *
 * @author Central Team
 * @since 2024-12-19
 */
public interface CustomerService extends IService<Customer> {

    /**
     * 分页查询客户列表
     */
    IPage<Customer> selectCustomerPage(Page<Customer> page, Map<String, Object> params);
    
    /**
     * 分页查询客户列表（包含员工信息）
     */
    IPage<CustomerVO> getCustomerPageWithEmployee(CustomerQueryVO queryVO);

    /**
     * 创建客户
     */
    boolean createCustomer(Customer customer);

    /**
     * 更新客户
     */
    boolean updateCustomer(Customer customer);

    /**
     * 删除客户
     */
    boolean deleteCustomer(Long customerId);

    /**
     * 批量删除客户
     */
    boolean batchDeleteCustomers(List<Long> customerIds);

    /**
     * 检查客户名称是否存在
     */
    boolean checkCustomerNameExists(String customerName, Long customerId);

    /**
     * 检查手机号是否存在
     */
    boolean checkPhoneExists(String phone, Long customerId);

    /**
     * 检查邮箱是否存在
     */
    boolean checkEmailExists(String email, Long customerId);

    /**
     * 更新客户负责人
     */
    boolean updateCustomerOwner(Long customerId, Long newOwnerEmployeeId);

    /**
     * 批量更新客户状态
     */
    boolean batchUpdateCustomerStatus(List<Long> customerIds, String status, Long updatedBy);

    /**
     * 查询客户统计信息
     */
    Map<String, Object> getCustomerStatistics(Map<String, Object> params);

    /**
     * 查询客户分布统计
     */
    List<Map<String, Object>> getCustomerDistribution(Map<String, Object> params);

    /**
     * 查询高价值客户
     */
    List<Customer> getHighValueCustomers(String minRevenue, Integer limit);

    /**
     * 查询流失风险客户
     */
    List<Map<String, Object>> getChurnRiskCustomers(Integer daysSinceLastFollow);

    /**
     * 导入客户数据
     */
    Map<String, Object> importCustomers(List<Customer> customers);

    /**
     * 导出客户数据
     */
    List<Customer> exportCustomers(Map<String, Object> params);

    /**
     * 客户详情查看权限验证
     */
    boolean checkViewPermission(Long customerId, Long employeeId);

    /**
     * 客户编辑权限验证
     */
    boolean checkEditPermission(Long customerId, Long employeeId);

    /**
     * 获取客户关联的商机数量
     */
    int getOpportunityCount(Long customerId);

    /**
     * 获取客户关联的跟进记录数量
     */
    int getFollowCount(Long customerId);

    /**
     * 分配客户给销售人员
     */
    boolean assignCustomer(Long customerId, Long employeeId, String assignReason);
}