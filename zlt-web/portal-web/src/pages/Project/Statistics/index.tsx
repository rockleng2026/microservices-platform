import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Select,
  DatePicker,
  Space,
  Button,
  Tag,
  Divider,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ProjectOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageContainer } from '@ant-design/pro-components';
// import { Column, Pie } from '@ant-design/plots'; // 暂时注释掉，需要安装图表库
import { projectApi } from '@/services/project';
import type {
  Project,
  ProjectStatistics,
  ProjectStatus,
} from '@/types/project';

const { Option } = Select;
const { RangePicker } = DatePicker;

// 项目状态配置
const PROJECT_STATUS_CONFIG = {
  init: { text: '初始化', color: 'default', icon: <ClockCircleOutlined /> },
  running: { text: '进行中', color: 'processing', icon: <ClockCircleOutlined /> },
  closed: { text: '已结项', color: 'success', icon: <CheckCircleOutlined /> },
  rejected: { text: '已拒绝', color: 'error', icon: <CloseCircleOutlined /> },
  closure_pending: { text: '结项待审', color: 'warning', icon: <ClockCircleOutlined /> },
};

const ProjectStatisticsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<ProjectStatistics | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // 获取统计数据
  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await projectApi.getProjectStatistics();
      
      if (response.code === 0) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取最近项目
  const fetchRecentProjects = async () => {
    try {
      const response = await projectApi.getProjectPage({
        page: 1,
        size: 10,
        orderBy: 'createdAt',
        orderDirection: 'desc',
      });
      
      if (response.code === 0) {
        setRecentProjects(response.data.records);
      }
    } catch (error) {
      console.error('Failed to fetch recent projects:', error);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchStatistics();
    fetchRecentProjects();
  }, []);

  // 刷新数据
  const handleRefresh = () => {
    fetchStatistics();
    fetchRecentProjects();
  };

  // 生成图表数据
  const generateChartData = () => {
    if (!statistics) return { monthlyData: [], categoryData: [], statusData: [] };

    // 月度趋势数据
    const monthlyData = statistics.monthlyData.map(item => ({
      month: item.month,
      count: item.count,
    }));

    // 分类统计数据
    const categoryData = statistics.categoryData.map(item => ({
      category: item.category,
      count: item.count,
    }));

    // 状态分布数据
    const statusData = [
      { status: '初始化', count: statistics.initCount },
      { status: '进行中', count: statistics.runningCount },
      { status: '已结项', count: statistics.closedCount },
      { status: '已拒绝', count: statistics.rejectedCount },
    ].filter(item => item.count > 0);

    return { monthlyData, categoryData, statusData };
  };

  const { monthlyData, categoryData, statusData } = generateChartData();

  // 最近项目表格列定义
  const recentProjectColumns: ColumnsType<Project> = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (text: string) => text || '-',
    },
    {
      title: '负责人',
      dataIndex: 'leaderName',
      key: 'leaderName',
      width: 100,
      render: (text: string) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ProjectStatus) => {
        const config = PROJECT_STATUS_CONFIG[status];
        return (
          <Tag color={config?.color} icon={config?.icon}>
            {config?.text || status}
          </Tag>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (text: string) => dayjs(text).format('MM-DD HH:mm'),
    },
  ];

  // 计算完成率
  const getCompletionRate = () => {
    if (!statistics || statistics.totalCount === 0) return 0;
    return Math.round((statistics.closedCount / statistics.totalCount) * 100);
  };

  // 计算进行中项目占比
  const getRunningRate = () => {
    if (!statistics || statistics.totalCount === 0) return 0;
    return Math.round((statistics.runningCount / statistics.totalCount) * 100);
  };

  return (
    <PageContainer
      title="项目统计"
      breadcrumb={{
        routes: [
          { path: '/project', breadcrumbName: '项目管理' },
          { path: '/project/statistics', breadcrumbName: '项目统计' },
        ],
      }}
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            刷新数据
          </Button>
        </Space>
      }
    >
      {/* 概览统计 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总项目数"
              value={statistics?.totalCount || 0}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={statistics?.runningCount || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${statistics?.totalCount || 0}`}
            />
            <Progress 
              percent={getRunningRate()} 
              showInfo={false} 
              strokeColor="#52c41a"
              size="small"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已结项"
              value={statistics?.closedCount || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#13c2c2' }}
              suffix={`/ ${statistics?.totalCount || 0}`}
            />
            <Progress 
              percent={getCompletionRate()} 
              showInfo={false} 
              strokeColor="#13c2c2"
              size="small"
              style={{ marginTop: 8 }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="初始化"
              value={statistics?.initCount || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {/* 月度趋势 */}
        <Col span={12}>
          <Card title="月度项目趋势" extra={<BarChartOutlined />}>
            {monthlyData.length > 0 ? (
              <div style={{ height: 280, padding: '20px 0' }}>
                {monthlyData.map((item, index) => (
                  <div key={index} style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: 80, textAlign: 'right', marginRight: 16 }}>{item.month}</div>
                    <Progress 
                      percent={Math.round((item.count / Math.max(...monthlyData.map(d => d.count))) * 100)} 
                      strokeColor="#1890ff"
                      trailColor="#f0f0f0"
                      style={{ flex: 1, marginRight: 16 }}
                    />
                    <div style={{ width: 40, textAlign: 'left' }}>{item.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                暂无数据
              </div>
            )}
          </Card>
        </Col>

        {/* 项目状态分布 */}
        <Col span={12}>
          <Card title="项目状态分布" extra={<PieChartOutlined />}>
            {statusData.length > 0 ? (
              <div style={{ height: 280, padding: '20px 0' }}>
                {statusData.map((item, index) => (
                  <div key={index} style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span>{item.status}</span>
                      <span>{item.count} ({Math.round((item.count / (statistics?.totalCount || 1)) * 100)}%)</span>
                    </div>
                    <Progress 
                      percent={Math.round((item.count / (statistics?.totalCount || 1)) * 100)}
                      strokeColor={index === 0 ? '#faad14' : index === 1 ? '#52c41a' : index === 2 ? '#13c2c2' : '#ff4d4f'}
                      trailColor="#f0f0f0"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                暂无数据
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 分类统计 */}
      {categoryData.length > 0 && (
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Card title="项目分类统计" extra={<BarChartOutlined />}>
              <div style={{ height: 300, padding: '20px 0' }}>
                {categoryData.map((item, index) => (
                  <div key={index} style={{ marginBottom: 20, display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: 120, textAlign: 'right', marginRight: 16 }}>{item.category}</div>
                    <Progress 
                      percent={Math.round((item.count / Math.max(...categoryData.map(d => d.count))) * 100)} 
                      strokeColor="#52c41a"
                      trailColor="#f0f0f0"
                      style={{ flex: 1, marginRight: 16 }}
                    />
                    <div style={{ width: 60, textAlign: 'left' }}>{item.count} 个</div>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* 最近项目 */}
      <Row gutter={16}>
        <Col span={24}>
          <Card title="最近创建的项目" extra={<TeamOutlined />}>
            <Table
              columns={recentProjectColumns}
              dataSource={recentProjects}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{
                emptyText: '暂无最近项目',
              }}
            />
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default ProjectStatisticsPage; 