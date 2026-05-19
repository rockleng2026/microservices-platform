/**
 * 优惠券统计弹窗 (ADMIN-04-06)
 * 显示优惠券使用统计数据
 */

import { Card, Col, Row, Statistic, Modal, Typography, Spin } from 'antd';
import React from 'react';
import { MallCouponTemplate, getCouponStatistics, CouponStatistics } from '../services/coupons';

const { Text } = Typography;

interface StatisticsModalProps {
  visible: boolean;
  coupon: MallCouponTemplate | null;
  onClose: () => void;
}

const StatisticsModal: React.FC<StatisticsModalProps> = ({ visible, coupon, onClose }) => {
  const [loading, setLoading] = React.useState(false);
  const [stats, setStats] = React.useState<CouponStatistics | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (visible && coupon?.id) {
      setLoading(true);
      setError(null);
      getCouponStatistics(coupon.id)
        .then(data => {
          setStats(data);
        })
        .catch((err: any) => {
          setError(err?.message || '加载失败');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [visible, coupon?.id]);

  return (
    <Modal
      title="优惠券统计"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Spin spinning={loading}>
        {error ? (
          <div style={{ textAlign: 'center', padding: 24, color: '#ff4d4f' }}>{error}</div>
        ) : stats ? (
          <>
            <Card size="small" title={coupon?.name} style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title="总数量" value={stats.totalCount} />
                </Col>
                <Col span={12}>
                  <Statistic title="剩余数量" value={stats.remainCount} />
                </Col>
              </Row>
            </Card>

            <Card size="small" title="发放统计" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="已发放" value={stats.issuedCount} valueStyle={{ color: '#1890ff' }} />
                </Col>
                <Col span={8}>
                  <Statistic title="已使用" value={stats.usedCount} valueStyle={{ color: '#52c41a' }} />
                </Col>
                <Col span={8}>
                  <Statistic title="未使用" value={stats.unusedCount} valueStyle={{ color: '#faad14' }} />
                </Col>
              </Row>
            </Card>

            <Card size="small" title="使用率">
              <Statistic
                title="使用率"
                value={stats.usageRate}
                valueStyle={{ color: stats.usageRate === '0.0%' ? '#999' : '#52c41a', fontSize: 28 }}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  已使用 / 已发放 = {stats.usedCount} / {stats.issuedCount}
                </Text>
              </div>
            </Card>
          </>
        ) : null}
      </Spin>
    </Modal>
  );
};

export default StatisticsModal;