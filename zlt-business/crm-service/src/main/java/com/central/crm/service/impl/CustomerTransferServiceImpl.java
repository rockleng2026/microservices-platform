package com.central.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.central.crm.mapper.CustomerMapper;
import com.central.crm.mapper.CustomerTransferMapper;
import com.central.crm.model.Customer;
import com.central.crm.model.CustomerTransfer;
import com.central.crm.service.CustomerTransferService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * 客户移交Service实现类
 *
 * @author Central Team
 * @since 2024-12-19
 */
@Slf4j
@Service
public class CustomerTransferServiceImpl extends ServiceImpl<CustomerTransferMapper, CustomerTransfer> implements CustomerTransferService {

    @Autowired
    private CustomerMapper customerMapper;

    @Override
    public IPage<CustomerTransfer> selectTransferPage(Page<CustomerTransfer> page, Map<String, Object> params) {
        return baseMapper.selectTransferPage(page, params);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean createTransfer(CustomerTransfer transfer) {
        try {
            // 设置创建时间和移交时间
            transfer.setCreatedAt(new Date());
            transfer.setTransferTime(new Date());
            // 设置默认审批状态
            transfer.setApprovalStatus("待审批");
            
            return save(transfer);
        } catch (Exception e) {
            log.error("创建移交申请失败", e);
            throw new RuntimeException("创建移交申请失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean approveTransfer(Long transferId, String approvalStatus, String approvalNotes, Long approverId) {
        try {
            CustomerTransfer transfer = new CustomerTransfer();
            transfer.setTransferId(transferId);
            transfer.setApprovalStatus(approvalStatus);
            transfer.setApprovalNotes(approvalNotes);
            transfer.setApprovalTime(new Date());
            transfer.setUpdatedAt(new Date());
            transfer.setUpdatedBy(approverId);
            
            boolean updateResult = updateById(transfer);
            
            // 如果审批通过，更新客户负责人
            if ("已通过".equals(approvalStatus) && updateResult) {
                CustomerTransfer fullTransfer = getById(transferId);
                if (fullTransfer != null) {
                    customerMapper.updateCustomerOwner(fullTransfer.getCustomerId(), fullTransfer.getToEmployeeId());
                }
            }
            
            return updateResult;
        } catch (Exception e) {
            log.error("审批移交申请失败", e);
            throw new RuntimeException("审批移交申请失败: " + e.getMessage());
        }
    }

    @Override
    public List<CustomerTransfer> getPendingApprovals(Map<String, Object> params) {
        return baseMapper.selectPendingApprovals(params);
    }

    @Override
    public List<CustomerTransfer> getByCustomerId(Long customerId) {
        return baseMapper.selectByCustomerId(customerId);
    }

    @Override
    public Map<String, Object> getTransferStatistics(Map<String, Object> params) {
        return baseMapper.selectTransferStatistics(params);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> batchTransferCustomers(List<Long> customerIds, Long toEmployeeId, String transferReason, Long operatorId) {
        Map<String, Object> result = new HashMap<>();
        int successCount = 0;
        int failCount = 0;
        List<String> errorMessages = new ArrayList<>();

        for (Long customerId : customerIds) {
            try {
                // 获取客户信息
                Customer customer = customerMapper.selectById(customerId);
                if (customer == null) {
                    failCount++;
                    errorMessages.add("客户ID " + customerId + " 不存在");
                    continue;
                }

                // 创建移交记录
                CustomerTransfer transfer = new CustomerTransfer();
                transfer.setCustomerId(customerId);
                transfer.setFromEmployeeId(customer.getOwnerEmployeeId());
                transfer.setToEmployeeId(toEmployeeId);
                transfer.setTransferReason(transferReason);
                transfer.setCreatedBy(operatorId);

                if (createTransfer(transfer)) {
                    successCount++;
                } else {
                    failCount++;
                    errorMessages.add("客户 " + customer.getCustomerName() + " 移交申请创建失败");
                }
            } catch (Exception e) {
                failCount++;
                errorMessages.add("客户ID " + customerId + " 移交异常: " + e.getMessage());
            }
        }

        result.put("totalCount", customerIds.size());
        result.put("successCount", successCount);
        result.put("failCount", failCount);
        result.put("errorMessages", errorMessages);

        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean cancelTransfer(Long transferId, String cancelReason, Long operatorId) {
        try {
            CustomerTransfer transfer = new CustomerTransfer();
            transfer.setTransferId(transferId);
            transfer.setApprovalStatus("已取消");
            transfer.setApprovalNotes(cancelReason);
            transfer.setApprovalTime(new Date());
            transfer.setUpdatedAt(new Date());
            transfer.setUpdatedBy(operatorId);
            
            return updateById(transfer);
        } catch (Exception e) {
            log.error("取消移交申请失败", e);
            throw new RuntimeException("取消移交申请失败: " + e.getMessage());
        }
    }

    @Override
    public List<CustomerTransfer> getMyTransferApplications(Long employeeId) {
        LambdaQueryWrapper<CustomerTransfer> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CustomerTransfer::getFromEmployeeId, employeeId)
               .or()
               .eq(CustomerTransfer::getToEmployeeId, employeeId)
               .orderByDesc(CustomerTransfer::getTransferTime);
        
        return list(wrapper);
    }

    @Override
    public List<CustomerTransfer> getTransfersForApproval(Long approverId) {
        Map<String, Object> params = new HashMap<>();
        params.put("approverId", approverId);
        params.put("approvalStatus", "待审批");
        
        return baseMapper.selectPendingApprovals(params);
    }

    @Override
    public List<Map<String, Object>> getTransferHistory(Long customerId) {
        try {
            List<CustomerTransfer> transfers = getByCustomerId(customerId);
            List<Map<String, Object>> history = new ArrayList<>();
            
            for (CustomerTransfer transfer : transfers) {
                Map<String, Object> item = new HashMap<>();
                item.put("transferTime", transfer.getTransferTime());
                item.put("fromEmployeeId", transfer.getFromEmployeeId());
                item.put("toEmployeeId", transfer.getToEmployeeId());
                item.put("transferReason", transfer.getTransferReason());
                item.put("approvalStatus", transfer.getApprovalStatus());
                item.put("approvalTime", transfer.getApprovalTime());
                item.put("approvalNotes", transfer.getApprovalNotes());
                history.add(item);
            }
            
            return history;
        } catch (Exception e) {
            log.error("获取移交历史记录失败", e);
            throw new RuntimeException("获取移交历史记录失败: " + e.getMessage());
        }
    }

    @Override
    public List<CustomerTransfer> exportTransfers(Map<String, Object> params) {
        LambdaQueryWrapper<CustomerTransfer> wrapper = new LambdaQueryWrapper<>();
        
        // 根据参数构建查询条件
        if (params.get("approvalStatus") != null) {
            wrapper.eq(CustomerTransfer::getApprovalStatus, params.get("approvalStatus"));
        }
        if (params.get("fromEmployeeId") != null) {
            wrapper.eq(CustomerTransfer::getFromEmployeeId, params.get("fromEmployeeId"));
        }
        if (params.get("toEmployeeId") != null) {
            wrapper.eq(CustomerTransfer::getToEmployeeId, params.get("toEmployeeId"));
        }
        if (params.get("startDate") != null) {
            wrapper.ge(CustomerTransfer::getTransferTime, params.get("startDate"));
        }
        if (params.get("endDate") != null) {
            wrapper.le(CustomerTransfer::getTransferTime, params.get("endDate"));
        }
        
        wrapper.orderByDesc(CustomerTransfer::getTransferTime);
        
        return list(wrapper);
    }
}