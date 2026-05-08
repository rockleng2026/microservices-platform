package com.central.mall.service.impl;

import com.central.common.model.Result;
import com.central.mall.mapper.MallOrderMapper;
import com.central.mall.mapper.MallRefundMapper;
import com.central.mall.model.dto.RefundApplyDTO;
import com.central.mall.model.entity.MallOrder;
import com.central.mall.model.entity.MallRefund;
import com.central.mall.model.enums.RefundState;
import com.central.mall.service.IRefundService;
import com.central.mall.service.IPayService;
import com.central.mall.service.IStockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

/**
 * 退款服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefundServiceImpl implements IRefundService {

    private static final String REFUND_LOCK_PREFIX = "refund:order:";

    private final MallRefundMapper refundMapper;
    private final MallOrderMapper orderMapper;
    private final IPayService payService;
    private final IStockService stockService;
    private final RedissonClient redissonClient;

    @Override
    @Transactional
    public Result<?> applyRefund(RefundApplyDTO dto, Long userId) {
        // 1. 校验订单状态（只有已付款、已发货、已完成可以退款）
        MallOrder order = orderMapper.selectById(dto.getOrderId());
        if (order == null) {
            return Result.failed("订单不存在");
        }
        if (!order.getUserId().equals(userId)) {
            return Result.failed("无权操作此订单");
        }
        // status: 2=已付款, 3=已发货, 4=已完成
        if (order.getStatus() < 2 || order.getStatus() > 4) {
            return Result.failed("当前状态不允许申请退款");
        }

        // 2. 生成唯一退款单号（幂等键）
        String refundNo = UUID.randomUUID().toString().replace("-", "");

        // 3. 分布式锁防止并发重复申请
        RLock lock = redissonClient.getLock(REFUND_LOCK_PREFIX + dto.getOrderId());
        try {
            if (!lock.tryLock()) {
                return Result.failed("请求过于频繁，请稍后重试");
            }

            // 4. 检查是否已有进行中的退款申请
            List<MallRefund> existingRefunds = refundMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<MallRefund>()
                    .eq(MallRefund::getOrderId, dto.getOrderId())
                    .in(MallRefund::getStatus, 1, 2, 4) // 待审核、审核通过、退款中
            );
            if (!existingRefunds.isEmpty()) {
                return Result.failed("此订单已有进行中的退款申请");
            }

            // 5. 创建退款申请
            MallRefund refund = new MallRefund();
            refund.setOrderId(dto.getOrderId());
            refund.setOrderNo(order.getOrderNo());
            refund.setUserId(userId);
            refund.setRefundNo(refundNo);
            refund.setRefundType(dto.getRefundType());
            refund.setRefundAmount(dto.getRefundAmount());
            refund.setReason(dto.getReason());
            refund.setEvidenceImages(dto.getEvidenceImages());
            refund.setStatus(RefundState.PENDING_AUDIT.getCode());
            refund.setCreateTime(LocalDateTime.now());
            refund.setUpdateTime(LocalDateTime.now());

            refundMapper.insert(refund);

            return Result.succeed(refund.getId(), "退款申请已提交");
        } catch (Exception e) {
            log.error("Apply refund failed: orderId={}, error={}", dto.getOrderId(), e.getMessage(), e);
            return Result.failed("退款申请失败: " + e.getMessage());
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    @Override
    @Transactional
    public Result<?> cancelRefund(Long refundId, Long userId) {
        MallRefund refund = refundMapper.selectById(refundId);
        if (refund == null) {
            return Result.failed("退款申请不存在");
        }
        if (!refund.getUserId().equals(userId)) {
            return Result.failed("无权操作此退款申请");
        }
        // 只能取消待审核的申请
        if (!RefundState.canTransition(refund.getStatus(), RefundState.REFUND_FAILED.getCode())) {
            // 状态不是待审核
            return Result.failed("当前状态不允许取消");
        }

        refund.setStatus(RefundState.REFUND_FAILED.getCode());
        refund.setUpdateTime(LocalDateTime.now());
        refundMapper.updateById(refund);

        return Result.succeed(true, "已取消退款申请");
    }

    @Override
    public Result<?> getUserRefundList(Long userId, Map<String, Object> pageDTO) {
        // TODO: 实现分页查询
        List<MallRefund> refunds = refundMapper.selectList(
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<MallRefund>()
                .eq(MallRefund::getUserId, userId)
                .orderByDesc(MallRefund::getCreateTime)
        );
        return Result.succeed(refunds);
    }

    @Override
    public Result<?> getRefundDetail(Long refundId, Long userId) {
        MallRefund refund = refundMapper.selectById(refundId);
        if (refund == null) {
            return Result.failed("退款申请不存在");
        }
        if (userId != null && !refund.getUserId().equals(userId)) {
            return Result.failed("无权查看此退款申请");
        }
        return Result.succeed(refund);
    }

    @Override
    public Result<?> getAdminRefundList(Map<String, Object> queryDTO) {
        // TODO: 实现管理员多条件筛选查询
        List<MallRefund> refunds = refundMapper.selectList(
            new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<MallRefund>()
                .orderByDesc(MallRefund::getCreateTime)
        );
        return Result.succeed(refunds);
    }

    @Override
    @Transactional
    public Result<?> approveRefund(Long refundId, Long adminId, String remark) {
        MallRefund refund = refundMapper.selectById(refundId);
        if (refund == null) {
            return Result.failed("退款申请不存在");
        }
        // 状态转换校验：待审核 -> 审核通过
        if (!RefundState.canTransition(refund.getStatus(), RefundState.AUDIT_PASSED.getCode())) {
            return Result.failed("当前状态不允许审核");
        }

        // 更新状态为审核通过
        refund.setStatus(RefundState.AUDIT_PASSED.getCode());
        refund.setAdminId(adminId);
        refund.setAdminRemark(remark);
        refund.setUpdateTime(LocalDateTime.now());
        refundMapper.updateById(refund);

        // TODO: 调用微信退款API（REFUND-07）
        // 注意：实际应该在微信退款回调成功后再更新状态为退款中
        try {
            String wechatRefundNo = payService.processRefund(
                refund.getOrderId(),
                refund.getRefundAmount(),
                refund.getRefundNo()
            );
            // 更新微信退款单号
            refund.setWechatRefundNo(wechatRefundNo);
            refund.setStatus(RefundState.REFUNDING.getCode());
            refund.setUpdateTime(LocalDateTime.now());
            refundMapper.updateById(refund);

            // 注意：库存回增应该在微信退款成功回调后执行（REFUND-09）
            // 这里只是标记状态，实际回增在回调通知中处理
            return Result.succeed(true, "审核通过，退款处理中");
        } catch (Exception e) {
            log.error("Process refund failed: refundId={}, error={}", refundId, e.getMessage(), e);
            return Result.failed("退款处理失败: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public Result<?> rejectRefund(Long refundId, Long adminId, String remark) {
        MallRefund refund = refundMapper.selectById(refundId);
        if (refund == null) {
            return Result.failed("退款申请不存在");
        }
        // 状态转换校验：待审核 -> 审核拒绝
        if (!RefundState.canTransition(refund.getStatus(), RefundState.AUDIT_REJECTED.getCode())) {
            return Result.failed("当前状态不允许审核");
        }

        refund.setStatus(RefundState.AUDIT_REJECTED.getCode());
        refund.setAdminId(adminId);
        refund.setAdminRemark(remark);
        refund.setUpdateTime(LocalDateTime.now());
        refundMapper.updateById(refund);

        return Result.succeed(true, "已拒绝退款申请");
    }
}
