import React from 'react';
import { Card, Statistic, Row, Col } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { StatisticsDTO } from '@/services/admin/statistics';

interface MetricCardsProps {
  data: StatisticsDTO | null;
  loading?: boolean;
}

// 格式化数字为千分位
const formatNumber = (num: number): string => {
  return num?.toLocaleString() || '0';
};

// 格式化金额
const formatCurrency = (amount: number): string => {
  return `¥${amount?.toLocaleString() || '0'}`;
};

const MetricCards: React.FC<MetricCardsProps> = ({ data, loading }) => {
  if (!data) {
    return null;
  }

  // 计算涨跌幅
  const orderChange = data.yesterdayOrderCount > 0
    ? ((data.todayOrderCount - data.yesterdayOrderCount) / data.yesterdayOrderCount * 100).toFixed(1)
    : '0';
  const salesChange = data.yesterdaySalesAmount > 0
    ? ((data.todaySalesAmount - data.yesterdaySalesAmount) / data.yesterdaySalesAmount * 100).toFixed(1)
    : '0';

  // 计算转化率
  const conversionRate = data.totalPv > 0 && data.todayOrderCount > 0
    ? (data.todayOrderCount / data.totalPv * 100).toFixed(2)
    : '0';

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
      {/* 订单数卡片 (ADMIN-01-01 per D-01) */}
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="今日订单数"
            value={formatNumber(data.todayOrderCount)}
            valueStyle={{ color: '#3f8600' }}
            suffix={
              data.yesterdayOrderCount > 0 && parseFloat(orderChange) !== 0 ? (
                <span style={{ fontSize: '14px', marginLeft: 8 }}>
                  {parseFloat(orderChange) > 0 ? (
                    <ArrowUpOutlined style={{ color: '#cf1322' }} />
                  ) : (
                    <ArrowDownOutlined style={{ color: '#3f8600' }} />
                  )}
                  <span style={{ color: parseFloat(orderChange) > 0 ? '#cf1322' : '#3f8600' }}>
                    {Math.abs(parseFloat(orderChange))}%
                  </span>
                </span>
              ) : null
            }
          />
          <div style={{ color: '#999', fontSize: '12px', marginTop: 8 }}>
            昨日: {formatNumber(data.yesterdayOrderCount)}
          </div>
        </Card>
      </Col>

      {/* 销售额卡片 (ADMIN-01-01 per D-01) */}
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="今日销售额"
            value={formatCurrency(data.todaySalesAmount)}
            valueStyle={{ color: '#cf1322' }}
            suffix={
              data.yesterdaySalesAmount > 0 && parseFloat(salesChange) !== 0 ? (
                <span style={{ fontSize: '14px', marginLeft: 8 }}>
                  {parseFloat(salesChange) > 0 ? (
                    <ArrowUpOutlined style={{ color: '#cf1322' }} />
                  ) : (
                    <ArrowDownOutlined style={{ color: '#3f8600' }} />
                  )}
                  <span style={{ color: parseFloat(salesChange) > 0 ? '#cf1322' : '#3f8600' }}>
                    {Math.abs(parseFloat(salesChange))}%
                  </span>
                </span>
              ) : null
            }
          />
          <div style={{ color: '#999', fontSize: '12px', marginTop: 8 }}>
            昨日: {formatCurrency(data.yesterdaySalesAmount)}
          </div>
        </Card>
      </Col>

      {/* 访客数卡片 (ADMIN-01-01 per D-01) */}
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="访客数"
            value={formatNumber(data.totalPv)}
            valueStyle={{ color: '#1890ff' }}
          />
          <div style={{ color: '#999', fontSize: '12px', marginTop: 8 }}>
            平均订单金额: {formatCurrency(data.avgOrderAmount)}
          </div>
        </Card>
      </Col>

      {/* 转化率卡片 (ADMIN-01-01 per D-01) */}
      <Col xs={24} sm={12} md={6}>
        <Card loading={loading}>
          <Statistic
            title="转化率"
            value={`${conversionRate}%`}
            valueStyle={{ color: '#722ed1' }}
          />
          <div style={{ color: '#999', fontSize: '12px', marginTop: 8 }}>
            待发货: {data.waitDeliveryCount}
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default MetricCards;