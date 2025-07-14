import React from 'react';
import { Card, Row, Col, Typography, Button } from 'antd';
import { UserOutlined, TeamOutlined, SettingOutlined, HistoryOutlined, BookOutlined, KeyOutlined } from '@ant-design/icons';
import { history } from 'umi';
import './index.less';

const { Title, Paragraph } = Typography;

/**
 * 系统管理模块首页
 */
const SystemIndex: React.FC = () => {
  const modules = [
    {
      title: '用户管理',
      icon: <UserOutlined />,
      description: '管理系统用户，包括用户的增删改查、状态控制、权限分配等功能',
      path: '/system/user',
      color: '#1890ff'
    },
    {
      title: '菜单管理',
      icon: <SettingOutlined />,
      description: '管理系统菜单结构，配置菜单权限，设置菜单显示逻辑',
      path: '/system/menu',
      color: '#52c41a'
    },
    {
      title: '角色管理',
      icon: <TeamOutlined />,
      description: '管理系统角色，分配角色权限，配置角色访问范围',
      path: '/system/role',
      color: '#faad14'
    },
    {
      title: '字典配置',
      icon: <BookOutlined />,
      description: '管理系统字典数据，配置类目和明细项，支持扩展字段定义',
      path: '/system/dict',
      color: '#722ed1'
    },
    {
      title: '操作日志',
      icon: <HistoryOutlined />,
      description: '查看系统操作日志，追踪用户行为，监控系统安全',
      path: '/system/log',
      color: '#f5222d'
    },
    {
      title: '账号管理',
      icon: <KeyOutlined />,
      description: '管理系统账号，支持员工账号的开通、停用、重置密码等操作',
      path: '/system/account',
      color: '#1890ff'
    }
  ];

  const handleNavigation = (path: string) => {
    history.push(path);
  };

  return (
    <div className="system-index">
      <div className="page-header">
        <Title level={2}>系统管理</Title>
        <Paragraph>
          系统管理模块提供了用户管理、菜单管理、角色管理、操作日志等核心功能，
          帮助管理员进行系统配置和权限控制。
        </Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {modules.map((module) => (
          <Col key={module.path} xs={24} sm={12} md={12} lg={6}>
            <Card
              className="module-card"
              hoverable
              actions={[
                <Button
                  type="primary"
                  onClick={() => handleNavigation(module.path)}
                >
                  进入模块
                </Button>
              ]}
            >
              <div className="module-content">
                <div 
                  className="module-icon"
                  style={{ color: module.color }}
                >
                  {module.icon}
                </div>
                <Title level={4}>{module.title}</Title>
                <Paragraph className="module-desc">
                  {module.description}
                </Paragraph>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="quick-stats" title="系统概览">
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <div className="stat-item">
              <div className="stat-number">1,234</div>
              <div className="stat-label">总用户数</div>
            </div>
          </Col>
          <Col span={6}>
            <div className="stat-item">
              <div className="stat-number">45</div>
              <div className="stat-label">菜单数量</div>
            </div>
          </Col>
          <Col span={6}>
            <div className="stat-item">
              <div className="stat-number">8</div>
              <div className="stat-label">角色数量</div>
            </div>
          </Col>
          <Col span={6}>
            <div className="stat-item">
              <div className="stat-number">5,678</div>
              <div className="stat-label">今日操作</div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SystemIndex; 