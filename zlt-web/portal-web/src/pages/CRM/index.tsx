import React from 'react';
import { Card, Row, Col } from 'antd';
import { UserOutlined, FundOutlined, PhoneOutlined, SwapOutlined, BarChartOutlined, HomeOutlined } from '@ant-design/icons';
import { history } from '@umijs/max';

const CRMIndex: React.FC = () => {
  const navigateTo = (path: string) => {
    history.push(path);
  };

  const modules = [
    {
      title: 'CRM工作台',
      description: '全面的业务概览，实时数据看板',
      icon: <HomeOutlined style={{ fontSize: '48px', color: '#1890ff' }} />,
      path: '/crm/dashboard',
    },
    {
      title: '客户管理',
      description: '全生命周期客户管理',
      icon: <UserOutlined style={{ fontSize: '48px', color: '#52c41a' }} />,
      path: '/crm/customers',
    },
    {
      title: '商机管理',
      description: '销售漏斗管理',
      icon: <FundOutlined style={{ fontSize: '48px', color: '#fa541c' }} />,
      path: '/crm/opportunities',
    },
    {
      title: '跟进记录',
      description: '客户沟通记录',
      icon: <PhoneOutlined style={{ fontSize: '48px', color: '#722ed1' }} />,
      path: '/crm/follow-records',
    },
    {
      title: '客户移交',
      description: '客户转移审批',
      icon: <SwapOutlined style={{ fontSize: '48px', color: '#eb2f96' }} />,
      path: '/crm/transfers',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)', color: 'white', padding: '40px', borderRadius: '12px', textAlign: 'center', marginBottom: '32px' }}>
        <h1> CRM客户关系管理系统</h1>
        <p>现代化SaaS多租户客户关系管理平台</p>
      </div>

      <Row gutter={[24, 24]}>
        {modules.map((module, index) => (
          <Col xs={24} sm={12} md={8} lg={8} key={index}>
            <Card hoverable style={{ height: '200px', textAlign: 'center' }} onClick={() => navigateTo(module.path)}>
              <div style={{ padding: '24px 0' }}>
                {module.icon}
                <h3 style={{ margin: '16px 0 8px 0' }}>{module.title}</h3>
                <p style={{ color: '#8c8c8c' }}>{module.description}</p>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default CRMIndex;
