import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Progress,
  List,
  Avatar,
  Tag,
  Button,
  Space,
  Alert,
  Typography,
  Timeline,
  Badge
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  TrophyOutlined,
  PhoneOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  getDashboardStats,
  getTopPerformers,
  getRecentActivities,
  getPendingTasks,
  getSalesChart,
  getUpcomingFollowUps
} from '../../../services/crm';

const { Title, Text } = Typography;

interface DashboardStats {
  totalCustomers: number;
  totalOpportunities: number;
  totalRevenue: number;
  monthlyRevenue: number;
  conversionRate: number;
  newCustomersThisMonth: number;
  activeOpportunities: number;
  wonDealsThisMonth: number;
  avgDealSize: number;
  salesTarget: number;
  salesAchievement: number;
  targetProgress: number;
}

interface TopPerformer {
  id: string;
  name: string;
  avatar?: string;
  dealsWon: number;
  revenue: number;
  rank: number;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  operator: string;
}

interface PendingTask {
  id: string;
  title: string;
  type: string;
  priority: string;
  dueDate: string;
  customerName: string;
}

interface UpcomingFollowUp {
  id: string;
  customerName: string;
  contactPerson: string;
  scheduledTime: string;
  type: string;
  status: string;
}

const CRMDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCustomers: 0,
    totalOpportunities: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    conversionRate: 0,
    newCustomersThisMonth: 0,
    activeOpportunities: 0,
    wonDealsThisMonth: 0,
    avgDealSize: 0,
    salesTarget: 0,
    salesAchievement: 0,
    targetProgress: 0
  });
  
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [pendingTasks, setPendingTasks] = useState<PendingTask[]>([]);
  const [upcomingFollowUps, setUpcomingFollowUps] = useState<UpcomingFollowUp[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载工作台数据
  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        statsResponse,
        performersResponse,
        activitiesResponse,
        tasksResponse,
        followUpsResponse
      ] = await Promise.all([
        getDashboardStats({}),
        getTopPerformers({}),
        getRecentActivities({}),
        getPendingTasks({}),
        getUpcomingFollowUps({})
      ]);

      console.log('Dashboard statsResponse:', statsResponse);
      if (statsResponse.success && statsResponse.data) {
        const data = statsResponse.data;
        console.log('Dashboard data received:', data);
        const newStats = {
          totalCustomers: data.totalCustomers || 0,
          totalOpportunities: data.totalOpportunities || 0,
          totalRevenue: parseFloat(data.monthlyRevenue?.replace(/[¥,]/g, '') || '0') || 0,
          monthlyRevenue: parseFloat(data.monthlyRevenue?.replace(/[¥,]/g, '') || '0') || 0,
          conversionRate: parseFloat(data.conversionRate?.replace('%', '') || '0') || 0,
          newCustomersThisMonth: data.newCustomersMonth || 0,
          activeOpportunities: data.activeOpportunities || 0,
          wonDealsThisMonth: data.wonOpportunities || 0,
          avgDealSize: 0,
          salesTarget: 1000000, // 临时设置
          salesAchievement: parseFloat(data.monthlyRevenue?.replace(/[¥,]/g, '') || '0') || 0,
          targetProgress: parseFloat(data.conversionRate?.replace('%', '') || '0') || 0
        };
        console.log('Dashboard newStats:', newStats);
        setStats(newStats);
      }

      if (performersResponse.success && performersResponse.data) {
        setTopPerformers(performersResponse.data);
      }

      if (activitiesResponse.success && activitiesResponse.data) {
        setRecentActivities(activitiesResponse.data);
      }

      if (tasksResponse.success && tasksResponse.data) {
        setPendingTasks(tasksResponse.data);
      }

      if (followUpsResponse.success && followUpsResponse.data) {
        setUpcomingFollowUps(followUpsResponse.data);
      }
    } catch (error) {
      console.error('加载工作台数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // 获取优先级颜色
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  // 获取活动类型图标
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call': return <PhoneOutlined />;
      case 'meeting': return <CalendarOutlined />;
      case 'email': return <UserOutlined />;
      default: return <ClockCircleOutlined />;
    }
  };

  // 待办任务表格列
  const taskColumns: ColumnsType<PendingTask> = [
    {
      title: '任务',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.customerName}
          </Text>
        </div>
      )
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (priority) => (
        <Tag color={getPriorityColor(priority)}>
          {priority === 'high' ? '高' : priority === 'medium' ? '中' : '低'}
        </Tag>
      )
    },
    {
      title: '截止时间',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date) => dayjs(date).format('MM-DD HH:mm')
    }
  ];

  // 即将跟进表格列
  const followUpColumns: ColumnsType<UpcomingFollowUp> = [
    {
      title: '客户',
      dataIndex: 'customerName',
      key: 'customerName',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {record.contactPerson}
          </Text>
        </div>
      )
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type) => (
        <Tag color="blue">
          {type === 'call' ? '电话' : type === 'meeting' ? '会议' : '邮件'}
        </Tag>
      )
    },
    {
      title: '时间',
      dataIndex: 'scheduledTime',
      key: 'scheduledTime',
      width: 120,
      render: (time) => dayjs(time).format('MM-DD HH:mm')
    }
  ];

  return (
    <div className="crm-dashboard">
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总客户数"
              value={stats.totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
              suffix={
                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                  <Text type="secondary">本月新增: {stats.newCustomersThisMonth}</Text>
                </div>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总商机数"
              value={stats.totalOpportunities}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={
                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                  <Text type="secondary">活跃: {stats.activeOpportunities}</Text>
                </div>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月收入"
              value={stats.monthlyRevenue}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#722ed1' }}
              suffix={
                <div style={{ fontSize: '14px', marginTop: '4px' }}>
                  <Text type="secondary">成交: {stats.wonDealsThisMonth} 笔</Text>
                </div>
              }
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="转化率"
              value={stats.conversionRate}
              precision={1}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#eb2f96' }}
              formatter={(value) => (
                <div>
                  <div>{value}%</div>
                  <div style={{ fontSize: '14px', marginTop: '4px' }}>
                    <Text type="secondary">平均单价: ¥{stats.avgDealSize?.toLocaleString()}</Text>
                  </div>
                </div>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 销售目标进度 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={24}>
          <Card title="销售目标进度" extra={
            <Text type="secondary">
              目标: ¥{stats.salesTarget?.toLocaleString()} | 已完成: ¥{stats.salesAchievement?.toLocaleString()}
            </Text>
          }>
            <Progress
              percent={stats.targetProgress}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
              status={stats.targetProgress >= 100 ? 'success' : 'active'}
              format={(percent) => `${percent}%`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        {/* 销售排行榜 */}
        <Col span={8}>
          <Card 
            title="销售排行榜" 
            extra={<Button type="link">查看更多</Button>}
            style={{ height: '400px' }}
          >
            <List
              dataSource={topPerformers}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Badge count={item.rank} color={index < 3 ? '#f50' : '#108ee9'}>
                        <Avatar 
                          src={item.avatar} 
                          icon={<UserOutlined />}
                          style={{ backgroundColor: index < 3 ? '#87d068' : '#1890ff' }}
                        />
                      </Badge>
                    }
                    title={item.name}
                    description={`成交 ${item.dealsWon} 笔 | ¥${item.revenue?.toLocaleString()}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* 最近活动 */}
        <Col span={8}>
          <Card 
            title="最近活动" 
            extra={<Button type="link">查看更多</Button>}
            style={{ height: '400px' }}
          >
            <Timeline
              items={recentActivities.map(activity => ({
                color: 'blue',
                dot: getActivityIcon(activity.type),
                children: (
                  <div>
                    <div style={{ fontWeight: 500 }}>{activity.title}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {activity.description}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      {activity.operator} · {dayjs(activity.time).fromNow()}
                    </div>
                  </div>
                )
              }))}
            />
          </Card>
        </Col>

        {/* 快捷操作 */}
        <Col span={8}>
          <Card title="快捷操作" style={{ height: '400px' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button type="primary" size="large" icon={<UserOutlined />} block>
                新增客户
              </Button>
              <Button size="large" icon={<TrophyOutlined />} block>
                新增商机
              </Button>
              <Button size="large" icon={<PhoneOutlined />} block>
                记录跟进
              </Button>
              <Button size="large" icon={<CalendarOutlined />} block>
                安排拜访
              </Button>
              <Button size="large" icon={<TeamOutlined />} block>
                客户移交
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={16}>
        {/* 待办任务 */}
        <Col span={12}>
          <Card 
            title={
              <Space>
                <span>待办任务</span>
                <Badge count={pendingTasks.length} />
              </Space>
            }
            extra={<Button type="link">查看全部</Button>}
            style={{ height: '350px' }}
          >
            <Table
              columns={taskColumns}
              dataSource={pendingTasks}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ y: 240 }}
            />
          </Card>
        </Col>

        {/* 即将跟进 */}
        <Col span={12}>
          <Card 
            title={
              <Space>
                <span>即将跟进</span>
                <Badge count={upcomingFollowUps.length} />
              </Space>
            }
            extra={<Button type="link">查看全部</Button>}
            style={{ height: '350px' }}
          >
            <Table
              columns={followUpColumns}
              dataSource={upcomingFollowUps}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ y: 240 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 提醒区域 */}
      <Row style={{ marginTop: 16 }}>
        <Col span={24}>
          <Alert
            message="系统提醒"
            description={
              <div>
                <div>• 今日有 {upcomingFollowUps.length} 个客户需要跟进</div>
                <div>• 本周有 {pendingTasks.length} 个待办任务</div>
                <div>• 销售目标完成度: {stats.targetProgress}%</div>
              </div>
            }
            type="info"
            showIcon
            closable
          />
        </Col>
      </Row>
    </div>
  );
};

export default CRMDashboard; 