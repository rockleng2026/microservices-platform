import React from 'react';
import { Card, Row, Col, Statistic, Typography, List, Tag, Progress, Timeline, Avatar, Button } from 'antd';
import { 
  UserOutlined, 
  TeamOutlined, 
  BankOutlined, 
  FileTextOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'umi';
import './Dashboard.less';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  // 模拟数据
  const recentActivities = [
    { id: 1, action: '张三入职技术部', time: '10分钟前', type: 'info' },
    { id: 2, action: '李四转岗到销售部', time: '30分钟前', type: 'warning' },
    { id: 3, action: '王五升职为项目经理', time: '1小时前', type: 'success' },
    { id: 4, action: '赵六申请离职', time: '2小时前', type: 'error' },
  ];

  const pendingTasks = [
    { id: 1, title: '审批张三的入职申请', priority: 'high', deadline: '今天' },
    { id: 2, title: '更新员工花名册', priority: 'medium', deadline: '明天' },
    { id: 3, title: '部门预算报告', priority: 'low', deadline: '本周' },
    { id: 4, title: '培训计划制定', priority: 'medium', deadline: '下周' },
  ];

  const departmentStats = [
    { name: '技术部', count: 25, trend: '+5' },
    { name: '销售部', count: 18, trend: '+2' },
    { name: '人事部', count: 6, trend: '0' },
    { name: '财务部', count: 4, trend: '-1' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'warning': return <ExclamationCircleOutlined style={{ color: '#faad14' }} />;
      case 'error': return <ExclamationCircleOutlined style={{ color: '#f5222d' }} />;
      default: return <ClockCircleOutlined style={{ color: '#1890ff' }} />;
    }
  };

  return (
    <div className="dashboard-container">
      {/* 欢迎横幅 */}
      <div className="welcome-banner">
        <div className="welcome-content">
          <h1 className="welcome-title">欢迎使用 Portal 3.0</h1>
          <p className="welcome-desc">企业级一体化管理平台，整合OA、CRM、组织架构等核心业务模块</p>
          <div className="welcome-stats">
            <div className="welcome-stat">
              <div className="welcome-stat-value">1,128</div>
              <div className="welcome-stat-label">总员工数</div>
            </div>
            <div className="welcome-stat">
              <div className="welcome-stat-value">25</div>
              <div className="welcome-stat-label">部门数量</div>
            </div>
            <div className="welcome-stat">
              <div className="welcome-stat-value">98.5%</div>
              <div className="welcome-stat-label">系统稳定性</div>
            </div>
          </div>
        </div>
      </div>

      {/* 功能模块网格 */}
      <div className="modules-grid">
        {/* 组织架构模块 */}
        <div className="module-card org" onClick={() => navigate('/organization/employees')}>
          <div className="module-header">
            <div className="module-icon">🌳</div>
            <div className="module-info">
              <h3 className="module-title">组织架构</h3>
              <p className="module-desc">部门管理、员工信息、权限配置</p>
            </div>
          </div>
          <div className="module-stats">
            <div className="module-stat">
              <div className="module-stat-value">25</div>
              <div className="module-stat-label">部门数</div>
            </div>
            <div className="module-stat">
              <div className="module-stat-value">1,128</div>
              <div className="module-stat-label">员工数</div>
            </div>
            <div className="module-stat">
              <div className="module-stat-value">156</div>
              <div className="module-stat-label">岗位数</div>
            </div>
          </div>
          <div className="module-actions">
            <button className="module-btn">查看详情</button>
            <button className="module-btn primary">立即使用</button>
          </div>
        </div>

        {/* CRM客户管理 */}
        <div className="module-card crm" onClick={() => navigate('/crm/customers')}>
          <div className="module-header">
            <div className="module-icon">👥</div>
            <div className="module-info">
              <h3 className="module-title">CRM客户管理</h3>
              <p className="module-desc">客户关系、销售跟进、业绩分析</p>
            </div>
          </div>
          <div className="module-stats">
            <div className="module-stat">
              <div className="module-stat-value">2,847</div>
              <div className="module-stat-label">总客户</div>
            </div>
            <div className="module-stat">
              <div className="module-stat-value">426</div>
              <div className="module-stat-label">潜在客户</div>
            </div>
            <div className="module-stat">
              <div className="module-stat-value">12</div>
              <div className="module-stat-label">今日新增</div>
            </div>
          </div>
          <div className="module-actions">
            <button className="module-btn">查看详情</button>
            <button className="module-btn primary">立即使用</button>
          </div>
        </div>

        {/* OA办公模块 */}
        <div className="module-card oa">
          <div className="module-header">
            <div className="module-icon">🏢</div>
            <div className="module-info">
              <h3 className="module-title">OA办公系统</h3>
              <p className="module-desc">日常办公、审批流程、任务管理</p>
            </div>
          </div>
          <div className="module-stats">
            <div className="module-stat">
              <div className="module-stat-value">15</div>
              <div className="module-stat-label">待办任务</div>
            </div>
            <div className="module-stat">
              <div className="module-stat-value">8</div>
              <div className="module-stat-label">待审批</div>
            </div>
            <div className="module-stat">
              <div className="module-stat-value">23</div>
              <div className="module-stat-label">今日消息</div>
            </div>
          </div>
          <div className="module-actions">
            <button className="module-btn">查看详情</button>
            <button className="module-btn primary">立即使用</button>
          </div>
        </div>

        {/* 销售管理 */}
        <div className="module-card sales">
          <div className="module-header">
            <div className="module-icon">📊</div>
            <div className="module-info">
              <h3 className="module-title">销售管理</h3>
              <p className="module-desc">销售统计、业绩分析、目标管理</p>
            </div>
          </div>
          <div className="module-stats">
            <div className="module-stat">
              <div className="module-stat-value">¥2.8M</div>
              <div className="module-stat-label">本月销售额</div>
            </div>
            <div className="module-stat">
              <div className="module-stat-value">85%</div>
              <div className="module-stat-label">目标完成率</div>
            </div>
            <div className="module-stat">
              <div className="module-stat-value">1,538</div>
              <div className="module-stat-label">成交订单</div>
            </div>
          </div>
          <div className="module-actions">
            <button className="module-btn">查看详情</button>
            <button className="module-btn primary">立即使用</button>
          </div>
        </div>

        {/* 人力资源 */}
        <div className="module-card hr">
          <div className="module-header">
            <div className="module-icon">👨‍💼</div>
            <div className="module-info">
              <h3 className="module-title">人力资源</h3>
              <p className="module-desc">招聘管理、绩效考核、薪资管理</p>
            </div>
          </div>
          <div className="module-stats">
            <div className="module-stat">
              <div className="module-stat-value">45</div>
              <div className="module-stat-label">招聘职位</div>
            </div>
            <div className="module-stat">
              <div className="module-stat-value">128</div>
              <div className="module-stat-label">待面试</div>
            </div>
            <div className="module-stat">
              <div className="module-stat-value">92%</div>
              <div className="module-stat-label">入职率</div>
            </div>
          </div>
          <div className="module-actions">
            <button className="module-btn">查看详情</button>
            <button className="module-btn primary">立即使用</button>
          </div>
        </div>

        {/* 财务管理 */}
        <div className="module-card finance">
          <div className="module-header">
            <div className="module-icon">💰</div>
            <div className="module-info">
              <h3 className="module-title">财务管理</h3>
              <p className="module-desc">财务报表、费用管理、资产统计</p>
            </div>
          </div>
          <div className="module-stats">
            <div className="module-stat">
              <div className="module-stat-value">¥58.2M</div>
              <div className="module-stat-label">总资产</div>
            </div>
            <div className="module-stat">
              <div className="module-stat-value">¥12.8M</div>
              <div className="module-stat-label">本月收入</div>
            </div>
            <div className="module-stat">
              <div className="module-stat-value">15.2%</div>
              <div className="module-stat-label">利润率</div>
            </div>
          </div>
          <div className="module-actions">
            <button className="module-btn">查看详情</button>
            <button className="module-btn primary">立即使用</button>
          </div>
        </div>
      </div>

      {/* 底部信息区域 */}
      <Row gutter={[24, 24]} style={{ marginTop: 32 }}>
        {/* 待办事项 */}
        <Col xs={24} lg={8}>
          <Card 
            title="待办事项" 
            extra={<a href="#more">查看全部 <RightOutlined /></a>}
            className="info-card"
          >
            <List
              dataSource={pendingTasks}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Tag color={getPriorityColor(item.priority)}>
                      {item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
                    </Tag>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<Avatar icon={<FileTextOutlined />} size="small" />}
                    title={<span style={{ fontSize: '14px' }}>{item.title}</span>}
                    description={<Text type="secondary" style={{ fontSize: '12px' }}>截止：{item.deadline}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 最新动态 */}
        <Col xs={24} lg={8}>
          <Card 
            title="最新动态" 
            extra={<a href="#more">查看全部 <RightOutlined /></a>}
            className="info-card"
          >
            <Timeline size="small">
              {recentActivities.map(activity => (
                <Timeline.Item 
                  key={activity.id}
                  dot={getActivityIcon(activity.type)}
                >
                  <div>
                    <div style={{ fontSize: '14px' }}>{activity.action}</div>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {activity.time}
                    </Text>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>

        {/* 系统状态 */}
        <Col xs={24} lg={8}>
          <Card 
            title="系统状态" 
            extra={<a href="#more">详细监控 <RightOutlined /></a>}
            className="info-card"
          >
            <div className="status-item">
              <div className="status-label">CPU使用率</div>
              <Progress percent={35} size="small" status="active" />
            </div>
            <div className="status-item">
              <div className="status-label">内存使用率</div>
              <Progress percent={68} size="small" status="active" />
            </div>
            <div className="status-item">
              <div className="status-label">磁盘使用率</div>
              <Progress percent={42} size="small" status="active" />
            </div>
            <div className="status-item">
              <div className="status-label">网络延迟</div>
              <div className="status-value">
                <span style={{ color: '#52c41a', fontWeight: 'bold' }}>12ms</span>
                <Text type="secondary"> 正常</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 