import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Statistic, Typography } from 'antd';
import { UserOutlined, TeamOutlined, BankOutlined, FileTextOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  return (
    <PageContainer
      header={{
        title: '工作台',
        breadcrumb: {},
      }}
    >
      <Row gutter={[16, 16]}>
        {/* 统计卡片 */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="员工总数"
              value={1128}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="部门数量"
              value={25}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="岗位数量"
              value={156}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="待办事项"
              value={8}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 快捷操作 */}
        <Col xs={24} md={12}>
          <Card title="快捷操作" size="small">
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <p>员工管理、部门管理、岗位管理等快捷入口</p>
            </div>
          </Card>
        </Col>

        {/* 最新动态 */}
        <Col xs={24} md={12}>
          <Card title="最新动态" size="small">
            <div style={{ padding: '20px 0', textAlign: 'center' }}>
              <p>系统动态、通知公告等信息</p>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 数据图表区域 */}
        <Col span={24}>
          <Card title="数据统计" size="small">
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#999' }}>
              <Title level={4} type="secondary">
                图表组件将在后续开发中集成
              </Title>
              <p>包括员工增长趋势、部门分布、岗位统计等可视化图表</p>
            </div>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Dashboard; 