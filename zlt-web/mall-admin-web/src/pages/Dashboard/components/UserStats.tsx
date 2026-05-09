import React from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { UserAnalysisDTO } from '@/services/admin/statistics';

interface UserStatsProps {
  data: UserAnalysisDTO | null;
  loading?: boolean;
}

// 格式化数字为千分位
const formatNumber = (num: number): string => {
  return num?.toLocaleString() || '0';
};

const UserStats: React.FC<UserStatsProps> = ({ data, loading }) => {
  if (!data) {
    return null;
  }

  return (
    <Card title="用户统计 (ADMIN-01-04)" style={{ marginTop: 16 }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Statistic
            title="今日新增用户"
            value={formatNumber(data.todayNewUsers)}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#3f8600' }}
          />
        </Col>
        <Col xs={12} md={6}>
          <Statistic
            title="本周新增用户"
            value={formatNumber(data.weekNewUsers)}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col xs={12} md={6}>
          <Statistic
            title="本月新增用户"
            value={formatNumber(data.monthNewUsers)}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Col>
        <Col xs={12} md={6}>
          <Statistic
            title="活跃用户"
            value={formatNumber(data.activeUsers)}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default UserStats;