import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  message,
  Tag,
  Tooltip,
  Row,
  Col,
  Statistic,
  Empty,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  EditOutlined,
  ProjectOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { PageContainer } from '@ant-design/pro-components';
import { projectApi } from '@/services/project';
import ProjectDetail from '../components/ProjectDetail';
import type {
  Project,
  ProjectStatus,
  ApprovalStatus,
} from '@/types/project';

const { Search } = Input;
const { Option } = Select;

// 项目状态配置
const PROJECT_STATUS_CONFIG = {
  init: { text: '初始化', color: 'default', icon: <ClockCircleOutlined /> },
  running: { text: '进行中', color: 'processing', icon: <ClockCircleOutlined /> },
  closed: { text: '已结项', color: 'success', icon: <CheckCircleOutlined /> },
  rejected: { text: '已拒绝', color: 'error', icon: <CloseCircleOutlined /> },
  closure_pending: { text: '结项待审', color: 'warning', icon: <ClockCircleOutlined /> },
};

const MyProjectPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [leaderProjects, setLeaderProjects] = useState<Project[]>([]);
  const [participantProjects, setParticipantProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | undefined>();
  const [detailVisible, setDetailVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'leader' | 'participant'>('leader');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // 获取当前用户信息
  const getCurrentUserId = () => {
    const userInfo = localStorage.getItem('user_info');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        return user.id;
      } catch (error) {
        console.error('Failed to parse user info:', error);
      }
    }
    return null;
  };

  // 获取我负责的项目
  const fetchLeaderProjects = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      message.error('获取用户信息失败');
      return;
    }

    setLoading(true);
    try {
      const response = await projectApi.getProjectsByLeader(userId);
      if (response.code === 0) {
        setLeaderProjects(response.data || []);
      } else {
        message.error(response.message || '获取项目列表失败');
      }
    } catch (error) {
      message.error('获取项目列表失败');
      console.error('Failed to fetch leader projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取我参与的项目
  const fetchParticipantProjects = async () => {
    const userId = getCurrentUserId();
    if (!userId) {
      message.error('获取用户信息失败');
      return;
    }

    setLoading(true);
    try {
      const response = await projectApi.getProjectsByParticipant(userId);
      if (response.code === 0) {
        setParticipantProjects(response.data || []);
      } else {
        message.error(response.message || '获取项目列表失败');
      }
    } catch (error) {
      message.error('获取项目列表失败');
      console.error('Failed to fetch participant projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchLeaderProjects();
    fetchParticipantProjects();
  }, []);

  // 查看项目详情
  const handleViewProject = (project: Project) => {
    setCurrentProject(project);
    setDetailVisible(true);
  };

  // 过滤项目数据
  const getFilteredProjects = (projects: Project[]) => {
    return projects.filter(project => {
      const matchKeyword = !searchKeyword || 
        project.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (project.customerName && project.customerName.toLowerCase().includes(searchKeyword.toLowerCase()));
      
      const matchStatus = !statusFilter || project.status === statusFilter;
      
      return matchKeyword && matchStatus;
    });
  };

  // 获取统计数据
  const getStatistics = (projects: Project[]) => {
    const total = projects.length;
    const running = projects.filter(p => p.status === 'running').length;
    const closed = projects.filter(p => p.status === 'closed').length;
    const pending = projects.filter(p => p.status === 'init' || p.status === 'closure_pending').length;

    return { total, running, closed, pending };
  };

  // 表格列定义
  const columns: ColumnsType<Project> = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      ellipsis: true,
      render: (text: string, record: Project) => (
        <Tooltip title={text}>
          <Button type="link" onClick={() => handleViewProject(record)}>
            {text}
          </Button>
        </Tooltip>
      ),
    },
    {
      title: '项目分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: '立项时间',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 120,
      render: (text: string) => text ? dayjs(text).format('YYYY-MM-DD') : '-',
    },
    {
      title: '项目状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
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
      width: 150,
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record: Project) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewProject(record)}
          >
            查看
          </Button>
        </Space>
      ),
    },
  ];

  const leaderStats = getStatistics(leaderProjects);
  const participantStats = getStatistics(participantProjects);
  const currentProjects = activeTab === 'leader' ? leaderProjects : participantProjects;
  const filteredProjects = getFilteredProjects(currentProjects);
  const currentStats = activeTab === 'leader' ? leaderStats : participantStats;

  return (
    <PageContainer
      title="我的项目"
      breadcrumb={{
        routes: [
          { path: '/project', breadcrumbName: '项目管理' },
          { path: '/project/my', breadcrumbName: '我的项目' },
        ],
      }}
    >
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总项目数"
              value={currentStats.total}
              prefix={<ProjectOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中"
              value={currentStats.running}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已结项"
              value={currentStats.closed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待处理"
              value={currentStats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 标签切换 */}
        <div style={{ marginBottom: 16 }}>
          <Space size="large">
            <Button
              type={activeTab === 'leader' ? 'primary' : 'default'}
              icon={<TeamOutlined />}
              onClick={() => setActiveTab('leader')}
            >
              我负责的项目 ({leaderStats.total})
            </Button>
            <Button
              type={activeTab === 'participant' ? 'primary' : 'default'}
              icon={<TeamOutlined />}
              onClick={() => setActiveTab('participant')}
            >
              我参与的项目 ({participantStats.total})
            </Button>
          </Space>
        </div>

        {/* 搜索过滤 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={8}>
            <Search
              placeholder="搜索项目名称或客户名称"
              allowClear
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={(value) => setSearchKeyword(value)}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="项目状态"
              allowClear
              style={{ width: '100%' }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              {Object.entries(PROJECT_STATUS_CONFIG).map(([key, config]) => (
                <Option key={key} value={key}>
                  {config.text}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                if (activeTab === 'leader') {
                  fetchLeaderProjects();
                } else {
                  fetchParticipantProjects();
                }
              }}
            >
              刷新
            </Button>
          </Col>
        </Row>

        {/* 项目列表 */}
        {filteredProjects.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredProjects}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            }}
            scroll={{ x: 1000 }}
            size="middle"
          />
        ) : (
          <Empty
            description={
              searchKeyword || statusFilter
                ? '没有找到匹配的项目'
                : activeTab === 'leader'
                ? '您还没有负责任何项目'
                : '您还没有参与任何项目'
            }
          />
        )}
      </Card>

      {/* 项目详情弹窗 */}
      <ProjectDetail
        visible={detailVisible}
        project={currentProject}
        onCancel={() => setDetailVisible(false)}
        onEdit={() => {
          // 我的项目页面不提供编辑功能，跳转到项目列表页面
          setDetailVisible(false);
          message.info('请前往项目列表页面进行编辑');
        }}
      />
    </PageContainer>
  );
};

export default MyProjectPage; 