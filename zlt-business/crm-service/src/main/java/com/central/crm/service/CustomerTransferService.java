package com.central.crm.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.central.crm.model.CustomerTransfer;

import java.util.List;
import java.util.Map;

/**
 * 客户移交Service接口
 *
 * @author Central Team
 * @since 2024-12-19
 */
public interface CustomerTransferService extends IService<CustomerTransfer> {

    /**
     * 分页查询移交记录列表
     */
    IPage<CustomerTransfer> selectTransferPage(Page<CustomerTransfer> page, Map<String, Object> params);

    /**
     * 创建移交申请
     */
    boolean createTransfer(CustomerTransfer transfer);

    /**
     * 审批移交申请
     */
    boolean approveTransfer(Long transferId, String approvalStatus, String approvalNotes, Long approverId);

    /**
     * 查询待审批的移交申请
     */
    List<CustomerTransfer> getPendingApprovals(Map<String, Object> params);

    /**
     * 根据客户ID查询移交记录
     */
    List<CustomerTransfer> getByCustomerId(Long customerId);

    /**
     * 查询移交统计信息
     */
    Map<String, Object> getTransferStatistics(Map<String, Object> params);

    /**
     * 批量移交客户
     */
    Map<String, Object> batchTransferCustomers(List<Long> customerIds, Long toEmployeeId, String transferReason, Long operatorId);

    /**
     * 取消移交申请
     */
    boolean cancelTransfer(Long transferId, String cancelReason, Long operatorId);

    /**
     * 查询我的移交申请
     */
    List<CustomerTransfer> getMyTransferApplications(Long employeeId);

    /**
     * 查询需要我审批的移交申请
     */
    List<CustomerTransfer> getTransfersForApproval(Long approverId);

    /**
     * 移交历史记录
     */
    List<Map<String, Object>> getTransferHistory(Long customerId);

    /**
     * 导出移交记录
     */
    List<CustomerTransfer> exportTransfers(Map<String, Object> params);
}