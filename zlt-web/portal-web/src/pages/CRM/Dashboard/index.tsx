import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import { UserOutlined, TeamOutlined, FundOutlined } from '@ant-design/icons';
import { getDashboardOverview } from '@/services/crm';

const CRMDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalCustomers: 0,
    newCustomersThisMonth: 0,
    totalOpportunities: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardOverview();
      if (response.success) {
        setDashboardData(response.data || response.datas);
      }
    } catch (error) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h2> CRM工作台</h2>
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
                value={dashboardData.newCustomersThisMonth}
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
      </Spin>
    </div>
  );
};

export default CRMDashboard;
