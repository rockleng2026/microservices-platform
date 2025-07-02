package com.central.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.common.context.LoginUserContextHolder;
import com.central.common.context.TenantContextHolder;
import com.central.common.model.LoginAppUser;
import com.central.common.model.Result;
import com.central.common.model.SysUser;
import com.central.common.utils.LoginUserUtils;
import com.central.crm.feign.EmployeeFeignService;
import com.central.crm.mapper.CustomerMapper;
import com.central.crm.mapper.IndividualCustomerMapper;
import com.central.crm.mapper.CorporateCustomerMapper;
import com.central.crm.model.Customer;
import com.central.crm.model.IndividualCustomer;
import com.central.crm.model.CorporateCustomer;
import com.central.crm.model.vo.CustomerQueryVO;
import com.central.crm.model.vo.CustomerVO;
import com.central.crm.service.CustomerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.io.Serializable;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 客户管理Service实现类
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@Service
public class CustomerServiceImpl extends ServiceImpl<CustomerMapper, Customer> implements CustomerService {

    @Autowired
    private EmployeeFeignService employeeFeignService;

    @Autowired
    private IndividualCustomerMapper individualCustomerMapper;

    @Autowired
    private CorporateCustomerMapper corporateCustomerMapper;

    @Override
    public IPage<Customer> selectCustomerPage(Page<Customer> page, Map<String, Object> params) {
        return baseMapper.selectCustomerPage(page, params);
    }

    @Override
    public Customer getById(Serializable id) {
        Customer customer = super.getById(id);
        if (customer != null) {
            // 根据客户类型加载扩展信息
            if ("individual".equals(customer.getCustomerType())) {
                IndividualCustomer individual = individualCustomerMapper.selectByCustomerId((Long) id);
                customer.setIndividualCustomer(individual);
            } else if ("enterprise".equals(customer.getCustomerType())) {
                CorporateCustomer corporate = corporateCustomerMapper.selectByCustomerId((Long) id);
                customer.setCorporateCustomer(corporate);
            }
        }
        return customer;
    }

    @Override
    public IPage<CustomerVO> getCustomerPageWithEmployee(CustomerQueryVO queryVO) {
        try {
            log.info("查询客户列表，参数: {}", queryVO);

            // 使用MyBatis Plus的分页查询
            Page<Customer> page = new Page<>(queryVO.getPage(), queryVO.getSize());
            QueryWrapper<Customer> wrapper = new QueryWrapper<>();
            wrapper.eq("is_deleted", 0);

            // 添加查询条件
            if (queryVO.getCustomerName() != null && !queryVO.getCustomerName().trim().isEmpty()) {
                wrapper.like("customer_name", queryVO.getCustomerName().trim());
            }
            if (queryVO.getCustomerType() != null && !queryVO.getCustomerType().trim().isEmpty()) {
                wrapper.eq("customer_type", queryVO.getCustomerType());
            }
            if (queryVO.getCustomerStatus() != null && !queryVO.getCustomerStatus().trim().isEmpty()) {
                wrapper.eq("customer_status", queryVO.getCustomerStatus());
            }
            if (queryVO.getOwnerEmployeeId() != null) {
                wrapper.eq("owner_employee_id", queryVO.getOwnerEmployeeId());
            }

            wrapper.orderByDesc("created_at");

            IPage<Customer> pageResult = page(page, wrapper);

            // 转换为CustomerVO并批量关联员工信息
            Page<CustomerVO> voPageResult = new Page<>(pageResult.getCurrent(), pageResult.getSize(), pageResult.getTotal());
            List<CustomerVO> voRecords = new ArrayList<>();

            if (pageResult.getRecords() != null && !pageResult.getRecords().isEmpty()) {
                // 收集所有员工ID并批量查询
                List<String> employeeIds = pageResult.getRecords().stream()
                    .filter(customer -> customer.getOwnerEmployeeId() != null)
                    .map(customer -> String.valueOf(customer.getOwnerEmployeeId()))
                    .distinct()
                    .collect(Collectors.toList());

                Map<String, Map<String, Object>> employeeMap = new HashMap<>();
                if (!employeeIds.isEmpty()) {
                    try {
                        Result<List<Map<String, Object>>> batchResult = employeeFeignService.getEmployeeBatchDetail(employeeIds);
                        if (batchResult != null && batchResult.getResp_code() == 0 && batchResult.getDatas() != null) {
                            for (Map<String, Object> employeeData : batchResult.getDatas()) {
                                String employeeId = String.valueOf(employeeData.get("id"));
                                employeeMap.put(employeeId, employeeData);
                            }
                        }
                    } catch (Exception e) {
                        log.warn("批量获取员工信息失败，error: {}", e.getMessage());
                    }
                }

                // 转换数据并关联员工信息
                for (Customer customer : pageResult.getRecords()) {
                    CustomerVO customerVO = new CustomerVO();
                    BeanUtils.copyProperties(customer, customerVO);

                    // 关联员工信息
                    if (customer.getOwnerEmployeeId() != null) {
                        String employeeId = String.valueOf(customer.getOwnerEmployeeId());
                        Map<String, Object> employeeData = employeeMap.get(employeeId);
                        if (employeeData != null) {
                            customerVO.setOwnerEmployeeName((String) employeeData.get("name"));
                            customerVO.setOwnerDepartmentName((String) employeeData.get("departmentName"));
                        }
                    }

                    voRecords.add(customerVO);
                }
            }

            voPageResult.setRecords(voRecords);
            return voPageResult;

        } catch (Exception e) {
            log.error("查询客户列表失败", e);
            throw new RuntimeException("查询客户列表失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createCustomer(Customer customer) {
        try {
            
            // 设置创建时间和创建者
            customer.setCreatedAt(new Date());
            // 获取当前登录用户信息
            LoginAppUser currentUser = LoginUserContextHolder.getUser();
            if (currentUser != null) {
                customer.setCreatedBy(currentUser.getId());
            } else {
                // 默认值，兼容非登录状态
                customer.setCreatedBy(1L);
            }
            
            // 设置租户ID
            String tenantId = TenantContextHolder.getTenant();
            if (tenantId != null) {
                customer.setTenantId(tenantId);
            }
            
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
            
            // 保存客户基本信息
            boolean result = save(customer);
            
            if (result) {
                // 保存扩展信息
                saveCustomerExtendedInfo(customer);
            }
            
            return result;
        } catch (Exception e) {
            log.error("创建客户失败", e);
            throw new RuntimeException("创建客户失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean updateCustomer(Customer customer) {
        try {
            // 设置更新时间和更新者
            customer.setUpdatedAt(new Date());
            // 获取当前登录用户信息
            LoginAppUser currentUser = LoginUserContextHolder.getUser();
            if (currentUser != null) {
                customer.setUpdatedBy(currentUser.getId());
            } else {
                // 默认值，兼容非登录状态
                customer.setUpdatedBy(1L);
            }
            
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
            
            // 更新客户基本信息
            boolean result = updateById(customer);
            
            if (result) {
                // 更新扩展信息
                updateCustomerExtendedInfo(customer);
            }
            
            return result;
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

    /**
     * 保存客户扩展信息
     */
    private void saveCustomerExtendedInfo(Customer customer) {
        try {
            Date now = new Date();
            Long currentUserId = getCurrentUserId();
            
            if ("individual".equals(customer.getCustomerType())) {
                // 保存个人客户扩展信息
                IndividualCustomer individual = extractIndividualCustomerInfo(customer);
                if (individual != null) {
                    individual.setCustomerId(customer.getCustomerId());
                    individual.setTenantId(customer.getTenantId());
                    individual.setCreatedAt(now);
                    individual.setCreatedBy(currentUserId);
                    individual.setUpdatedAt(now);
                    individual.setUpdatedBy(currentUserId);
                    individualCustomerMapper.insert(individual);
                }
                
            } else if ("enterprise".equals(customer.getCustomerType())) {
                // 保存企业客户扩展信息
                CorporateCustomer corporate = extractCorporateCustomerInfo(customer);
                if (corporate != null) {
                    corporate.setCustomerId(customer.getCustomerId());
                    corporate.setTenantId(customer.getTenantId());
                    corporate.setCreatedAt(now);
                    corporate.setCreatedBy(currentUserId);
                    corporate.setUpdatedAt(now);
                    corporate.setUpdatedBy(currentUserId);
                    corporateCustomerMapper.insert(corporate);
                }
            }
        } catch (Exception e) {
            log.error("保存客户扩展信息失败", e);
            throw new RuntimeException("保存客户扩展信息失败: " + e.getMessage());
        }
    }

    /**
     * 更新客户扩展信息
     */
    private void updateCustomerExtendedInfo(Customer customer) {
        try {
            Date now = new Date();
            Long currentUserId = getCurrentUserId();
            
            if ("individual".equals(customer.getCustomerType()) && customer.getIndividualCustomer() != null) {
                // 更新个人客户扩展信息
                IndividualCustomer individual = customer.getIndividualCustomer();
                individual.setCustomerId(customer.getCustomerId());
                individual.setTenantId(customer.getTenantId());
                individual.setUpdatedAt(now);
                individual.setUpdatedBy(currentUserId);
                
                // 先查询是否存在
                IndividualCustomer existing = individualCustomerMapper.selectByCustomerId(customer.getCustomerId());
                if (existing != null) {
                    individual.setId(existing.getId());
                    individual.setCreatedAt(existing.getCreatedAt());
                    individual.setCreatedBy(existing.getCreatedBy());
                    individualCustomerMapper.updateById(individual);
                } else {
                    individual.setCreatedAt(now);
                    individual.setCreatedBy(currentUserId);
                    individual.setTenantId(customer.getTenantId());
                    individualCustomerMapper.insert(individual);
                }
                
            } else if ("enterprise".equals(customer.getCustomerType()) && customer.getCorporateCustomer() != null) {
                // 更新企业客户扩展信息
                CorporateCustomer corporate = customer.getCorporateCustomer();
                corporate.setCustomerId(customer.getCustomerId());
                corporate.setTenantId(customer.getTenantId());
                corporate.setUpdatedAt(now);
                corporate.setUpdatedBy(currentUserId);
                
                // 先查询是否存在
                CorporateCustomer existing = corporateCustomerMapper.selectByCustomerId(customer.getCustomerId());
                if (existing != null) {
                    corporate.setId(existing.getId());
                    corporate.setCreatedAt(existing.getCreatedAt());
                    corporate.setCreatedBy(existing.getCreatedBy());
                    corporateCustomerMapper.updateById(corporate);
                } else {
                    corporate.setCreatedAt(now);
                    corporate.setCreatedBy(currentUserId);
                    corporate.setTenantId(customer.getTenantId());
                    corporateCustomerMapper.insert(corporate);
                }
            }
        } catch (Exception e) {
            log.error("更新客户扩展信息失败", e);
            throw new RuntimeException("更新客户扩展信息失败: " + e.getMessage());
        }
    }

    /**
     * 获取当前用户ID
     */
    private Long getCurrentUserId() {
        LoginAppUser currentUser = LoginUserContextHolder.getUser();
        if (currentUser != null) {
            return currentUser.getId();
        }
        return 1L; // 默认值
    }

    /**
     * 从Customer对象中提取个人客户扩展信息
     */
    private IndividualCustomer extractIndividualCustomerInfo(Customer customer) {
        // 由于前端传递的是扁平结构，我们需要从Customer对象中提取个人客户字段
        if (customer.getIndividualCustomer() != null) {
            return customer.getIndividualCustomer();
        }
        
        // 如果有扩展字段传递过来，这里需要根据实际的扩展字段进行提取
        // 目前Customer实体中还没有这些扩展字段的getter方法，需要前端传递嵌套对象
        return null;
    }

    /**
     * 从Customer对象中提取企业客户扩展信息
     */
    private CorporateCustomer extractCorporateCustomerInfo(Customer customer) {
        // 由于前端传递的是扁平结构，我们需要从Customer对象中提取企业客户字段
        if (customer.getCorporateCustomer() != null) {
            return customer.getCorporateCustomer();
        }
        
        // 如果有扩展字段传递过来，这里需要根据实际的扩展字段进行提取
        // 目前Customer实体中还没有这些扩展字段的getter方法，需要前端传递嵌套对象
        return null;
    }
}