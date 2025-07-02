import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import { UserOutlined, TeamOutlined, FundOutlined } from '@ant-design/icons';
import { getDashboardOverview } from '@/services/crm';

const CRMDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: 0,
    newCustomersMonth: 0,
    totalOpportunities: 0,
    newCustomersToday: 0,
    totalFollows: 0,
    wonOpportunities: 0,
    pendingFollows: 0,
    conversionRate: '0%',
    activeOpportunities: 0,
    monthlyRevenue: '¥0',
    newCustomersWeek: 0,
    lostOpportunities: 0,
    followsToday: 0,
    revenueGrowth: '0%'
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardOverview();
      console.log('Dashboard response:', response);
      if (response.success || response.resp_code === 0) {
        const data = response.data || response.datas;
        console.log('Dashboard data:', data);
        setDashboardData(data);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2>CRM工作台</h2>
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card>
              <Statistic
                title="客户总数"
                value={dashboardData.totalCustomers}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="本月新增"
                value={dashboardData.newCustomersMonth}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="商机总数"
                value={dashboardData.totalOpportunities}
                prefix={<FundOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 第二行统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="今日新增客户"
                value={dashboardData.newCustomersToday}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="本周新增客户"
                value={dashboardData.newCustomersWeek}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="活跃商机"
                value={dashboardData.activeOpportunities}
                prefix={<FundOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="赢单商机"
                value={dashboardData.wonOpportunities}
                prefix={<FundOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 第三行统计卡片 */}
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="跟进总数"
                value={dashboardData.totalFollows}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="待跟进"
                value={dashboardData.pendingFollows}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="转化率"
                value={dashboardData.conversionRate}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="月度营收"
                value={dashboardData.monthlyRevenue}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default CRMDashboard;
