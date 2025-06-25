import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  message,
  Modal,
  Tag,
  Tooltip,
  Dropdown,
  Form,
  Row,
  Col,
} from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  MoreOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import type { ActionType } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { projectApi } from '@/services/project';
import ProjectForm from '../components/ProjectForm';
import ProjectDetail from '../components/ProjectDetail';
import ParticipantModal from '../components/ParticipantModal';
import ProjectClosureModal from '../components/ProjectClosureModal';
import ProfitDistributionModal from '../components/ProfitDistributionModal';
import type {
  Project,
  ProjectQueryParams,
  ProjectStatus,
  ApprovalStatus,
  TableAction,
} from '@/types/project';

const { Search } = Input;
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

// 审批状态配置
const APPROVAL_STATUS_CONFIG = {
  pending: { text: '待审批', color: 'warning' },
  approved: { text: '已通过', color: 'success' },
  rejected: { text: '已拒绝', color: 'error' },
};

// 利润计提状态配置
const PROFIT_DISTRIBUTION_STATUS_CONFIG = {
  not_set: { text: '未设置', color: 'default' },
  awaiting_approval: { text: '待审批', color: 'warning' },
  in_approval: { text: '审批中', color: 'processing' },
  approved: { text: '审批通过', color: 'success' },
  approval_failed: { text: '审批失败', color: 'error' },
  partially_settled: { text: '部分计提', color: 'orange' },
  settled: { text: '已计提完毕', color: 'green' },
};

const ProjectListPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchForm] = Form.useForm();
  const actionRef = useRef<ActionType>();

  // 弹窗状态
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [currentProject, setCurrentProject] = useState<Project | undefined>();
  
  // 详情弹窗
  const [detailVisible, setDetailVisible] = useState(false);
  
  // 参与人弹窗
  const [participantVisible, setParticipantVisible] = useState(false);

  // 项目结项弹窗
  const [closureVisible, setClosureVisible] = useState(false);
  
  // 项目提成弹窗
  const [profitDistributionVisible, setProfitDistributionVisible] = useState(false);

  // 搜索条件
  const [searchParams, setSearchParams] = useState<Partial<ProjectQueryParams>>({});

  // 获取项目列表
  const fetchProjects = async (params?: Partial<ProjectQueryParams>) => {
    setLoading(true);
    try {
      const queryParams: ProjectQueryParams = {
        page: current,
        size: pageSize,
        ...searchParams,
        ...params,
      };

      const response = await projectApi.getProjectPage(queryParams);
      
      if (response.resp_code === 0) {
        setProjectList(response.datas.records);
        setTotal(response.datas.total);
      } else {
        message.error(response.resp_msg || '获取项目列表失败');
      }
    } catch (error) {
      message.error('获取项目列表失败');
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchProjects();
  }, [current, pageSize]);

  // 搜索处理
  const handleSearch = (values: any) => {
    const params = { ...values };
    
    // 处理时间范围
    if (values.dateRange && values.dateRange.length === 2) {
      params.startTimeBegin = values.dateRange[0].format('YYYY-MM-DD');
      params.startTimeEnd = values.dateRange[1].format('YYYY-MM-DD');
      delete params.dateRange;
    }
    
    setSearchParams(params);
    setCurrent(1);
    fetchProjects(params);
  };

  // 重置搜索
  const handleResetSearch = () => {
    searchForm.resetFields();
    setSearchParams({});
    setCurrent(1);
    fetchProjects({});
  };

  // 新增项目
  const handleAdd = () => {
    setModalMode('create');
    setCurrentProject(undefined);
    setModalVisible(true);
  };

  // 编辑项目
  const handleEdit = async (record: Project) => {
    try {
      // 调用详情接口获取完整数据
      const response = await projectApi.getProjectById(record.id);
      if (response.resp_code === 0) {
        setModalMode('edit');
        setCurrentProject(response.datas);
        setModalVisible(true);
      } else {
        message.error(response.resp_msg || '获取项目详情失败');
      }
    } catch (error) {
      message.error('获取项目详情失败');
      console.error('Failed to fetch project detail:', error);
    }
  };

  // 查看项目
  const handleView = async (record: Project) => {
    try {
      // 调用详情接口获取完整数据
      const response = await projectApi.getProjectById(record.id);
      if (response.resp_code === 0) {
        setCurrentProject(response.datas);
        setDetailVisible(true);
      } else {
        message.error(response.resp_msg || '获取项目详情失败');
      }
    } catch (error) {
      message.error('获取项目详情失败');
      console.error('Failed to fetch project detail:', error);
    }
  };

  // 管理参与人
  const handleParticipant = (record: Project) => {
    setCurrentProject(record);
    setParticipantVisible(true);
  };

  // 删除项目
  const handleDelete = (record: Project) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除项目"${record.name}"吗？此操作不可撤销。`,
      onOk: async () => {
        try {
          const response = await projectApi.deleteProject(record.id);
          if (response.resp_code === 0) {
            message.success('删除成功');
            fetchProjects();
          } else {
            message.error(response.resp_msg || '删除失败');
          }
        } catch (error) {
          message.error('删除失败');
          console.error('Failed to delete project:', error);
        }
      },
    });
  };

  // 批量删除
  const handleBatchDelete = (selectedRowKeys: React.Key[]) => {
    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个项目吗？此操作不可撤销。`,
      onOk: async () => {
        try {
          const response = await projectApi.batchDeleteProjects(selectedRowKeys as string[]);
          if (response.resp_code === 0) {
            message.success('批量删除成功');
            fetchProjects();
          } else {
            message.error(response.resp_msg || '批量删除失败');
          }
        } catch (error) {
          message.error('批量删除失败');
          console.error('Failed to batch delete projects:', error);
        }
      },
    });
  };

  // 项目结项
  const handleClosure = (record: Project) => {
    setCurrentProject(record);
    setClosureVisible(true);
  };

  // 项目提成
  const handleProfitDistribution = (record: Project) => {
    setCurrentProject(record);
    setProfitDistributionVisible(true);
  };

  // 更新项目状态
  const handleUpdateStatus = (record: Project, status: string) => {
    Modal.confirm({
      title: '确认状态变更',
      content: `确定要将项目"${record.name}"的状态修改为"${PROJECT_STATUS_CONFIG[status as ProjectStatus]?.text}"吗？`,
      onOk: async () => {
        try {
          const response = await projectApi.updateProjectStatus(record.id, status);
          if (response.resp_code === 0) {
            message.success('状态更新成功');
            fetchProjects();
          } else {
            message.error(response.resp_msg || '状态更新失败');
          }
        } catch (error) {
          message.error('状态更新失败');
          console.error('Failed to update project status:', error);
        }
      },
    });
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
          <Button type="link" onClick={() => handleView(record)}>
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
      title: '项目负责人',
      dataIndex: 'leaderName',
      key: 'leaderName',
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
      title: '审批状态',
      dataIndex: 'finalStatus',
      key: 'finalStatus',
      width: 120,
      render: (status: ApprovalStatus) => {
        if (!status) return '-';
        const config = APPROVAL_STATUS_CONFIG[status];
        return (
          <Tag color={config?.color}>
            {config?.text || status}
          </Tag>
        );
      },
    },
    {
      title: '计提状态',
      dataIndex: 'profitDistributionStatus',
      key: 'profitDistributionStatus',
      width: 120,
      render: (status: string) => {
        if (!status || status === 'not_set') {
          return <Tag color="default">未设置</Tag>;
        }
        const statusMap = {
          awaiting_approval: { text: '待审批', color: 'warning' },
          in_approval: { text: '审批中', color: 'processing' },
          approved: { text: '审批通过', color: 'success' },
          approval_failed: { text: '审批失败', color: 'error' },
          partially_settled: { text: '部分计提', color: 'orange' },
          settled: { text: '已计提完毕', color: 'green' },
        };
        const config = statusMap[status as keyof typeof statusMap];
        return (
          <Tag color={config?.color || 'default'}>
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
      width: 180,
      fixed: 'right',
      render: (_, record: Project) => {
        const items = [
          {
            key: 'view',
            label: '查看详情',
            icon: <EyeOutlined />,
            onClick: () => handleView(record),
          },
          {
            key: 'edit',
            label: '编辑',
            icon: <EditOutlined />,
            onClick: () => handleEdit(record),
          },
          {
            key: 'participant',
            label: '管理参与人',
            icon: <UserOutlined />,
            onClick: () => handleParticipant(record),
          },
          {
            key: 'closure',
            label: '项目结项',
            icon: <CheckCircleOutlined />,
            onClick: () => handleClosure(record),
          },
          {
            key: 'profitDistribution',
            label: '项目提成',
            icon: <ExportOutlined />,
            onClick: () => handleProfitDistribution(record),
          },
          {
            type: 'divider' as const,
          },
          {
            key: 'delete',
            label: '删除',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => handleDelete(record),
          },
        ];

        return (
          <Space size="middle">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            >
              查看
            </Button>
            <Button
              type="link"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            >
              编辑
            </Button>
            <Dropdown
              menu={{ items }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button type="link" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  // 表格行选择
  const rowSelection: TableProps<Project>['rowSelection'] = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: Project[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
  };

  // 表格分页配置
  const pagination = {
    current,
    pageSize,
    total,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number, range: [number, number]) =>
      `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
    onChange: (page: number, size: number) => {
      setCurrent(page);
      setPageSize(size);
    },
  };

  return (
    <PageContainer
      title="项目列表"
      breadcrumb={{
        items: [
          { title: '项目管理' },
          { title: '项目列表' },
        ],
      }}
    >
      <Card>
        {/* 搜索表单 */}
        <Form
          form={searchForm}
          layout="inline"
          onFinish={handleSearch}
          style={{ marginBottom: 16 }}
        >
          <Row gutter={16} style={{ width: '100%' }}>
            <Col span={6}>
              <Form.Item name="keyword" label="关键词">
                <Input placeholder="项目名称/客户名称" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="category" label="项目分类">
                <Select placeholder="请选择" allowClear>
                  <Option value="党建项目">党建项目</Option>
                  <Option value="IDC项目">IDC项目</Option>
                  <Option value="软件项目">软件项目</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="status" label="项目状态">
                <Select placeholder="请选择" allowClear>
                  {Object.entries(PROJECT_STATUS_CONFIG).map(([key, config]) => (
                    <Option key={key} value={key}>
                      {config.text}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="dateRange" label="立项时间">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  查询
                </Button>
                <Button onClick={handleResetSearch} icon={<ReloadOutlined />}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>

        {/* 操作栏 */}
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              新增项目
            </Button>
            <Button icon={<ExportOutlined />}>
              导出数据
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => fetchProjects()}>
              刷新
            </Button>
          </Space>
        </div>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={projectList}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          rowSelection={rowSelection}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* 项目表单弹窗 */}
      <ProjectForm
        visible={modalVisible}
        mode={modalMode}
        project={currentProject}
        onCancel={() => setModalVisible(false)}
        onSuccess={() => {
          setModalVisible(false);
          fetchProjects();
        }}
      />

      {/* 项目详情弹窗 */}
      <ProjectDetail
        visible={detailVisible}
        project={currentProject}
        onCancel={() => setDetailVisible(false)}
        onEdit={(project) => {
          setDetailVisible(false);
          handleEdit(project);
        }}
      />

      {/* 参与人管理弹窗 */}
      <ParticipantModal
        visible={participantVisible}
        project={currentProject}
        onCancel={() => setParticipantVisible(false)}
        onSuccess={() => {
          setParticipantVisible(false);
          fetchProjects();
        }}
      />

      {/* 项目结项弹窗 */}
      <ProjectClosureModal
        visible={closureVisible}
        project={currentProject}
        onCancel={() => setClosureVisible(false)}
        onSuccess={() => {
          setClosureVisible(false);
          fetchProjects();
        }}
      />

      {/* 项目提成分配弹窗 */}
      <ProfitDistributionModal
        visible={profitDistributionVisible}
        project={currentProject}
        onCancel={() => setProfitDistributionVisible(false)}
        onSuccess={() => {
          setProfitDistributionVisible(false);
          fetchProjects();
        }}
      />
    </PageContainer>
  );
};

export default ProjectListPage; 