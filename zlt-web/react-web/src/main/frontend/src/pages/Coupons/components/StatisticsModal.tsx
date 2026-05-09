/**
 * 优惠券统计弹窗 (BLOCKED 骨架)
 *
 * ADMIN-04-06 优惠券使用统计
 *
 * BLOCKED: 后端无统计聚合 endpoint
 * 需后端实现统计接口后填充数据
 */

import { Descriptions, Modal, Statistic, Typography } from 'antd';
import React from 'react';
import { MallCouponTemplate } from '../services/coupons';

const { Text } = Typography;

interface StatisticsModalProps {
  visible: boolean;
  coupon: MallCouponTemplate | null;
  onClose: () => void;
}

/**
 * 统计 Modal (BLOCKED 骨架)
 *
 * 功能说明:
 * - 显示优惠券的使用统计数据
 * - 当前无后端 API，数据为占位符
 *
 * TODO: 后端实现后替换为实际 API 调用
 *   GET /api-mall/admin/coupon/template/{id}/statistics
 *   需返回: 已发放数量、已使用数量、未使用数量、使用率
 */
const StatisticsModal: React.FC<StatisticsModalProps> = ({ visible, coupon, onClose }) => {
  return (
    <Modal
      title="优惠券统计"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <div style={{ marginBottom: 16, padding: 12, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 4 }}>
        <Text type="secondary">
          <strong>BLOCKED 状态</strong> — 后端 API 暂未实现
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          ADMIN-04-06: 优惠券使用统计
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: 12 }}>
          需后端实现统计聚合 endpoint 后填充实际数据
        </Text>
      </div>

      <Descriptions column={2} bordered size="small" title={coupon?.name}>
        <Descriptions.Item label="总数量">{coupon?.totalCount ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="剩余数量">{coupon?.remainCount ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="已发放数量" span={2}>
          <Text type="secondary">后端 API 暂未实现</Text>
        </Descriptions.Item>
        <Descriptions.Item label="已使用数量">
          <Text type="secondary">-</Text>
        </Descriptions.Item>
        <Descriptions.Item label="未使用数量">
          <Text type="secondary">-</Text>
        </Descriptions.Item>
        <Descriptions.Item label="使用率" span={2}>
          <Text type="secondary">-</Text>
        </Descriptions.Item>
      </Descriptions>

      <div style={{ marginTop: 24 }}>
        <Statistic title="已发放数量" value="-" />
      </div>
    </Modal>
  );
};

export default StatisticsModal;