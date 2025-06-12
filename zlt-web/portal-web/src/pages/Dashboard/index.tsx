import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Tag } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  BankOutlined, 
  CheckCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Dashboard: React.FC = () => {
  const [currentPosition, setCurrentPosition] = useState<string>('');
  const [lastPositionChange, setLastPositionChange] = useState<string>('');

  // 监听岗位切换事件
  useEffect(() => {
    const handlePositionChange = (event: any) => {
      const position = event.detail?.position;
      if (position) {
        setCurrentPosition(position.name);
        setLastPositionChange(new Date().toLocaleString());
      }
    };

    window.addEventListener('positionChanged', handlePositionChange);
    
    return () => {
      window.removeEventListener('positionChanged', handlePositionChange);
    };
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      {/* 欢迎横幅 */}
      <Card 
        style={{ 
          background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
          color: 'white',
          marginBottom: '24px'
        }}
        bodyStyle={{ padding: '32px' }}
      >
        <Title level={2} style={{ color: 'white', margin: 0 }}>
          欢迎使用 Portal 3.0 企业管理平台
        </Title>
        <Paragraph style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px', margin: '12px 0 0 0' }}>
          基于岗位权限的企业级管理系统，支持动态权限控制和个性化配置
        </Paragraph>
        
        {currentPosition && (
          <Space style={{ marginTop: '16px' }}>
            <Tag icon={<CheckCircleOutlined />} color="success">
              当前岗位：{currentPosition}
            </Tag>
            {lastPositionChange && (
              <Tag icon={<InfoCircleOutlined />} color="blue">
                切换时间：{lastPositionChange}
              </Tag>
            )}
          </Space>
        )}
      </Card>

      {/* 统计信息 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="在线用户"
              value={156}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="部门数量"
              value={24}
              prefix={<BankOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="员工总数"
              value={892}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="今日任务"
              value={32}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 功能模块 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="岗位权限系统" style={{ height: '100%' }}>
            <Paragraph>
              • 基于岗位的权限控制系统<br/>
              • 支持多岗位用户权限管理<br/>
              • 动态菜单权限加载<br/>
              • 岗位切换实时生效
            </Paragraph>
            <Space>
              <Tag color="blue">权限管理</Tag>
              <Tag color="green">岗位切换</Tag>
              <Tag color="orange">动态菜单</Tag>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="个性化配置" style={{ height: '100%' }}>
            <Paragraph>
              • 个人主题设置<br/>
              • 默认岗位配置<br/>
              • 多语言支持<br/>
              • 通知偏好设置
            </Paragraph>
            <Space>
              <Tag color="purple">主题设置</Tag>
              <Tag color="cyan">语言配置</Tag>
              <Tag color="red">通知管理</Tag>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 使用说明 */}
      <Card title="功能使用说明" style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Title level={4}>岗位切换</Title>
            <Paragraph>
              1. 在右上角找到岗位选择器<br/>
              2. 点击下拉菜单选择目标岗位<br/>
              3. 系统将自动切换权限和菜单<br/>
              4. 页面会显示切换成功的提示
            </Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Title level={4}>权限说明</Title>
            <Paragraph>
              • 不同岗位拥有不同的菜单权限<br/>
              • 切换岗位后菜单会实时更新<br/>
              • 支持细粒度的功能权限控制<br/>
              • 权限变更立即生效
            </Paragraph>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Dashboard; 