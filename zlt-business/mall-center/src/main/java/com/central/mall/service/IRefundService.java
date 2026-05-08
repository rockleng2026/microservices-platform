package com.central.mall.service;

import com.central.common.model.Result;
import com.central.mall.model.dto.RefundApplyDTO;

import java.util.Map;

/**
 * 退款服务接口
 */
public interface IRefundService {

    /**
     * 用户申请退款
     */
    Result<?> applyRefund(RefundApplyDTO dto, Long userId);

    /**
     * 用户取消退款申请
     */
    Result<?> cancelRefund(Long refundId, Long userId);

    /**
     * 用户查看退款列表
     */
    Result<?> getUserRefundList(Long userId, Map<String, Object> pageDTO);

    /**
     * 用户查看退款详情
     */
    Result<?> getRefundDetail(Long refundId, Long userId);

    /**
     * 管理员查看退款列表（多条件筛选）
     */
    Result<?> getAdminRefundList(Map<String, Object> queryDTO);

    /**
     * 管理员审核通过退款申请
     */
    Result<?> approveRefund(Long refundId, Long adminId, String remark);

    /**
     * 管理员审核拒绝退款申请
     */
    Result<?> rejectRefund(Long refundId, Long adminId, String remark);
}
