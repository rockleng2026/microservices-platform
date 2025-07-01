package com.central.crm.service.impl;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.crm.mapper.CustomerMapper;
import com.central.crm.model.Customer;
import com.central.crm.service.CustomerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

/**
 * 客户管理Service实现类
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@Service
public class CustomerServiceImpl extends ServiceImpl<CustomerMapper, Customer> implements CustomerService {

    @Override
    public IPage<Customer> selectCustomerPage(Page<Customer> page, Map<String, Object> params) {
        return baseMapper.selectCustomerPage(page, params);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createCustomer(Customer customer) {
        try {
            // 设置创建时间
            customer.setCreatedAt(new Date());
            
            // 验证客户名称唯一性
            if (checkCustomerNameExists(customer.getCustomerName(), null)) {
                throw new RuntimeException("客户名称已存在");
            }
            
            // 验证联系方式唯一性
            if (customer.getContactPhone() != null && checkPhoneExists(customer.getContactPhone(), null)) {
                throw new RuntimeException("联系电话已存在");
            }
            
            if (customer.getContactEmail() != null && checkEmailExists(customer.getContactEmail(), null)) {
                throw new RuntimeException("联系邮箱已存在");
            }
            
            return save(customer);
        } catch (Exception e) {
            log.error("创建客户失败", e);
            throw new RuntimeException("创建客户失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateCustomer(Customer customer) {
        try {
            // 设置更新时间
            customer.setUpdatedAt(new Date());
            
            // 验证客户名称唯一性（排除自己）
            if (checkCustomerNameExists(customer.getCustomerName(), customer.getCustomerId())) {
                throw new RuntimeException("客户名称已存在");
            }
            
            // 验证联系方式唯一性（排除自己）
            if (customer.getContactPhone() != null && checkPhoneExists(customer.getContactPhone(), customer.getCustomerId())) {
                throw new RuntimeException("联系电话已存在");
            }
            
            if (customer.getContactEmail() != null && checkEmailExists(customer.getContactEmail(), customer.getCustomerId())) {
                throw new RuntimeException("联系邮箱已存在");
            }
            
            return updateById(customer);
        } catch (Exception e) {
            log.error("更新客户失败", e);
            throw new RuntimeException("更新客户失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean deleteCustomer(Long customerId) {
        try {
            // 逻辑删除
            Customer customer = new Customer();
            customer.setCustomerId(customerId);
            customer.setIsDeleted(1);
            customer.setUpdatedAt(new Date());
            return updateById(customer);
        } catch (Exception e) {
            log.error("删除客户失败", e);
            throw new RuntimeException("删除客户失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchDeleteCustomers(List<Long> customerIds) {
        try {
            List<Customer> customers = new ArrayList<>();
            Date now = new Date();
            
            for (Long customerId : customerIds) {
                Customer customer = new Customer();
                customer.setCustomerId(customerId);
                customer.setIsDeleted(1);
                customer.setUpdatedAt(now);
                customers.add(customer);
            }
            
            return updateBatchById(customers);
        } catch (Exception e) {
            log.error("批量删除客户失败", e);
            throw new RuntimeException("批量删除客户失败: " + e.getMessage());
        }
    }

    @Override
    public boolean checkCustomerNameExists(String customerName, Long customerId) {
        try {
            Integer count = baseMapper.checkCustomerNameExists(customerName, customerId);
            return count != null && count > 0;
        } catch (Exception e) {
            log.error("检查客户名称失败", e);
            return false;
        }
    }

    @Override
    public boolean checkPhoneExists(String phone, Long customerId) {
        try {
            Integer count = baseMapper.checkPhoneExists(phone, customerId);
            return count != null && count > 0;
        } catch (Exception e) {
            log.error("检查手机号失败", e);
            return false;
        }
    }

    @Override
    public boolean checkEmailExists(String email, Long customerId) {
        try {
            Integer count = baseMapper.checkEmailExists(email, customerId);
            return count != null && count > 0;
        } catch (Exception e) {
            log.error("检查邮箱失败", e);
            return false;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateCustomerOwner(Long customerId, Long newOwnerEmployeeId) {
        try {
            Integer result = baseMapper.updateCustomerOwner(customerId, newOwnerEmployeeId);
            return result != null && result > 0;
        } catch (Exception e) {
            log.error("更新客户负责人失败", e);
            throw new RuntimeException("更新客户负责人失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean batchUpdateCustomerStatus(List<Long> customerIds, String status, Long updatedBy) {
        try {
            Integer result = baseMapper.batchUpdateCustomerStatus(customerIds, status, updatedBy);
            return result != null && result > 0;
        } catch (Exception e) {
            log.error("批量更新客户状态失败", e);
            throw new RuntimeException("批量更新客户状态失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getCustomerStatistics(Map<String, Object> params) {
        try {
            return baseMapper.selectCustomerStatistics(params);
        } catch (Exception e) {
            log.error("查询客户统计信息失败", e);
            return new HashMap<>();
        }
    }

    @Override
    public List<Map<String, Object>> getCustomerDistribution(Map<String, Object> params) {
        try {
            return baseMapper.selectCustomerDistribution(params);
        } catch (Exception e) {
            log.error("查询客户分布统计失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Customer> getHighValueCustomers(String minRevenue, Integer limit) {
        try {
            BigDecimal minRevenueDecimal = minRevenue != null ? new BigDecimal(minRevenue) : new BigDecimal("1000000");
            return baseMapper.selectHighValueCustomers(minRevenueDecimal, limit);
        } catch (Exception e) {
            log.error("查询高价值客户失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public List<Map<String, Object>> getChurnRiskCustomers(Integer daysSinceLastFollow) {
        try {
            return baseMapper.selectChurnRiskCustomers(daysSinceLastFollow);
        } catch (Exception e) {
            log.error("查询流失风险客户失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> importCustomers(List<Customer> customers) {
        Map<String, Object> result = new HashMap<>();
        int successCount = 0;
        int failCount = 0;
        List<String> errorMessages = new ArrayList<>();
        
        try {
            for (Customer customer : customers) {
                try {
                    createCustomer(customer);
                    successCount++;
                } catch (Exception e) {
                    failCount++;
                    errorMessages.add("客户【" + customer.getCustomerName() + "】导入失败: " + e.getMessage());
                }
            }
            
            result.put("total", customers.size());
            result.put("successCount", successCount);
            result.put("failCount", failCount);
            result.put("errorMessages", errorMessages);
            
            return result;
        } catch (Exception e) {
            log.error("导入客户数据失败", e);
            throw new RuntimeException("导入客户数据失败: " + e.getMessage());
        }
    }

    @Override
    public List<Customer> exportCustomers(Map<String, Object> params) {
        try {
            // 这里可以根据参数查询需要导出的客户数据
            return list();
        } catch (Exception e) {
            log.error("导出客户数据失败", e);
            return new ArrayList<>();
        }
    }

    @Override
    public boolean checkViewPermission(Long customerId, Long employeeId) {
        // 简化的权限验证逻辑，实际项目中应该根据业务需求实现
        return true;
    }

    @Override
    public boolean checkEditPermission(Long customerId, Long employeeId) {
        // 简化的权限验证逻辑，实际项目中应该根据业务需求实现
        return true;
    }

    @Override
    public int getOpportunityCount(Long customerId) {
        try {
            // 这里应该调用商机服务统计数量，暂时返回0
            return 0;
        } catch (Exception e) {
            log.error("获取客户商机数量失败", e);
            return 0;
        }
    }

    @Override
    public int getFollowCount(Long customerId) {
        try {
            // 这里应该调用跟进记录服务统计数量，暂时返回0
            return 0;
        } catch (Exception e) {
            log.error("获取客户跟进记录数量失败", e);
            return 0;
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean assignCustomer(Long customerId, Long employeeId, String assignReason) {
        try {
            return updateCustomerOwner(customerId, employeeId);
        } catch (Exception e) {
            log.error("分配客户失败", e);
            throw new RuntimeException("分配客户失败: " + e.getMessage());
        }
    }
}