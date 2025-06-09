import React, { useState, useRef } from 'react';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { 
  Card, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Tag, 
  Space, 
  message,
  Dropdown,
  Popconfirm,
  Badge,
  Timeline,
  Descriptions,
  Steps,
  Progress
} from 'antd';
import { 
  PlusOutlined, 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  MoreOutlined,
  BellOutlined,
  CalendarOutlined,
  UserOutlined
} from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import './index.less';

const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;

interface TaskRecord {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  assignee: string;
  creator: string;
  startDate: string;
  dueDate: string;
  category: string;
  progress: number;
  tags: string[];
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  approver?: string;
  createdAt: string;
  updatedAt: string;
}

const Tasks: React.FC = () => {
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TaskRecord | null>(null);
  const [currentRecord, setCurrentRecord] = useState<TaskRecord | null>(null);
  const [loading, setLoading] = useState(false);

  // 模拟数据
  const mockData: TaskRecord[] = [
    {
      id: '1',
      title: '完成项目需求分析',
      description: '分析Portal 3.0项目的详细需求，包括功能模块、技术栈选择等',
      priority: 'high',
      status: 'processing',
      assignee: '张三',
      creator: '李经理',
      startDate: '2024-01-15',
      dueDate: '2024-01-25',
      category: '项目管理',
      progress: 65,
      tags: ['重要', '紧急'],
      approvalStatus: 'approved',
      approver: '王总监',
      createdAt: '2024-01-15 09:00:00',
      updatedAt: '2024-01-20 14:30:00'
    },
    {
      id: '2',
      title: '员工培训计划制定',
      description: '制定Q1季度的员工培训计划，包括技术培训和管理培训',
      priority: 'medium',
      status: 'pending',
      assignee: '王五',
      creator: '人事部',
      startDate: '2024-01-20',
      dueDate: '2024-02-05',
      category: '人力资源',
      progress: 0,
      tags: ['培训'],
      approvalStatus: 'pending',
      createdAt: '2024-01-20 10:15:00',
      updatedAt: '2024-01-20 10:15:00'
    },
    {
      id: '3',
      title: '系统安全检测',
      description: '对现有系统进行全面的安全检测，发现并修复潜在漏洞',
      priority: 'high',
      status: 'completed',
      assignee: '赵六',
      creator: '技术部',
      startDate: '2024-01-10',
      dueDate: '2024-01-18',
      category: '技术开发',
      progress: 100,
      tags: ['安全', '完成'],
      approvalStatus: 'approved',
      approver: '技术总监',
      createdAt: '2024-01-10 08:30:00',
      updatedAt: '2024-01-18 17:00:00'
    },
    {
      id: '4',
      title: '客户满意度调研',
      description: '对重点客户进行满意度调研，收集反馈意见',
      priority: 'medium',
      status: 'processing',
      assignee: '李四',
      creator: '客服部',
      startDate: '2024-01-18',
      dueDate: '2024-01-30',
      category: '客户服务',
      progress: 40,
      tags: ['调研'],
      approvalStatus: 'approved',
      approver: '客服经理',
      createdAt: '2024-01-18 11:20:00',
      updatedAt: '2024-01-22 16:45:00'
    }
  ];

  const priorityConfig = {
    high: { color: 'red', text: '高优先级' },
    medium: { color: 'orange', text: '中优先级' },
    low: { color: 'green', text: '低优先级' }
  };

  const statusConfig = {
    pending: { color: 'default', text: '待开始' },
    processing: { color: 'blue', text: '进行中' },
    completed: { color: 'green', text: '已完成' },
    cancelled: { color: 'red', text: '已取消' }
  };

  const approvalStatusConfig = {
    pending: { color: 'orange', text: '待审批' },
    approved: { color: 'green', text: '已审批' },
    rejected: { color: 'red', text: '已拒绝' }
  };

  const columns: ProColumns<TaskRecord>[] = [
    {
      title: '任务编号',
      dataIndex: 'id',
      width: 100,
      fixed: 'left',
    },
    {
      title: '任务标题',
      dataIndex: 'title',
      width: 200,
      fixed: 'left',
      render: (text, record) => (
        <a onClick={() => handleViewDetail(record)}>{text}</a>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      renderFormItem: () => (
        <Select placeholder="选择优先级">
          <Option value="high">高优先级</Option>
          <Option value="medium">中优先级</Option>
          <Option value="low">低优先级</Option>
        </Select>
      ),
      render: (_, record) => (
        <Tag color={priorityConfig[record.priority].color}>
          {priorityConfig[record.priority].text}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      renderFormItem: () => (
        <Select placeholder="选择状态">
          <Option value="pending">待开始</Option>
          <Option value="processing">进行中</Option>
          <Option value="completed">已完成</Option>
          <Option value="cancelled">已取消</Option>
        </Select>
      ),
      render: (_, record) => (
        <Tag color={statusConfig[record.status].color}>
          {statusConfig[record.status].text}
        </Tag>
      ),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 120,
      search: false,
      render: (progress) => (
        <Progress 
          percent={progress} 
          size="small" 
          status={progress === 100 ? 'success' : 'active'}
        />
      ),
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      width: 100,
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      width: 100,
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 120,
      renderFormItem: () => (
        <Select placeholder="选择分类">
          <Option value="项目管理">项目管理</Option>
          <Option value="人力资源">人力资源</Option>
          <Option value="技术开发">技术开发</Option>
          <Option value="客户服务">客户服务</Option>
          <Option value="财务管理">财务管理</Option>
        </Select>
      ),
    },
    {
      title: '审批状态',
      dataIndex: 'approvalStatus',
      width: 100,
      render: (_, record) => {
        if (!record.approvalStatus) return '-';
        return (
          <Tag color={approvalStatusConfig[record.approvalStatus].color}>
            {approvalStatusConfig[record.approvalStatus].text}
          </Tag>
        );
      },
    },
    {
      title: '截止日期',
      dataIndex: 'dueDate',
      width: 120,
      valueType: 'date',
      sorter: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 160,
      valueType: 'dateTime',
      search: false,
      sorter: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 180,
      fixed: 'right',
      render: (text, record) => [
        <Button
          key="view"
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          查看
        </Button>,
        <Button
          key="edit"
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>,
        <Dropdown
          key="more"
          menu={{
            items: [
              {
                key: 'approve',
                icon: <CheckOutlined />,
                label: '审批通过',
                disabled: record.approvalStatus !== 'pending'
              },
              {
                key: 'reject',
                icon: <CloseOutlined />,
                label: '审批拒绝',
                disabled: record.approvalStatus !== 'pending'
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: '删除',
                danger: true
              }
            ],
            onClick: ({ key }) => handleMenuClick(key, record)
          }}
        >
          <Button type="link" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      ],
    },
  ];

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: TaskRecord) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ...record,
      startDate: record.startDate,
      dueDate: record.dueDate,
    });
    setIsModalVisible(true);
  };

  const handleViewDetail = (record: TaskRecord) => {
    setCurrentRecord(record);
    setIsDetailVisible(true);
  };

  const handleMenuClick = (key: string, record: TaskRecord) => {
    switch (key) {
      case 'approve':
        message.success(`任务 ${record.title} 审批通过`);
        actionRef.current?.reload();
        break;
      case 'reject':
        message.warning(`任务 ${record.title} 审批拒绝`);
        actionRef.current?.reload();
        break;
      case 'delete':
        Modal.confirm({
          title: '确认删除',
          content: `确定要删除任务 "${record.title}" 吗？`,
          onOk: () => {
            message.success('删除成功');
            actionRef.current?.reload();
          }
        });
        break;
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 模拟API调用
      setTimeout(() => {
        if (editingRecord) {
          message.success('任务更新成功');
        } else {
          message.success('任务创建成功');
        }
        setIsModalVisible(false);
        setLoading(false);
        actionRef.current?.reload();
      }, 1000);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div className="tasks-container">
      <Card>
        <ProTable<TaskRecord>
          headerTitle="任务管理"
          actionRef={actionRef}
          rowKey="id"
          search={{
            labelWidth: 'auto',
            defaultCollapsed: false,
          }}
          toolBarRender={() => [
            <Button
              key="add"
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              新建任务
            </Button>,
          ]}
          request={async (params, sort, filter) => {
            // 模拟API调用
            return Promise.resolve({
              data: mockData,
              success: true,
              total: mockData.length,
            });
          }}
          columns={columns}
          scroll={{ x: 1400 }}
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
          }}
        />
      </Card>

      {/* 新建/编辑任务Modal */}
      <Modal
        title={editingRecord ? '编辑任务' : '新建任务'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            priority: 'medium',
            status: 'pending',
            category: '项目管理'
          }}
        >
          <Form.Item
            label="任务标题"
            name="title"
            rules={[{ required: true, message: '请输入任务标题' }]}
          >
            <Input placeholder="请输入任务标题" />
          </Form.Item>

          <Form.Item
            label="任务描述"
            name="description"
            rules={[{ required: true, message: '请输入任务描述' }]}
          >
            <TextArea rows={4} placeholder="请输入任务描述" />
          </Form.Item>

          <Form.Item
            label="负责人"
            name="assignee"
            rules={[{ required: true, message: '请选择负责人' }]}
          >
            <Select placeholder="请选择负责人">
              <Option value="张三">张三</Option>
              <Option value="李四">李四</Option>
              <Option value="王五">王五</Option>
              <Option value="赵六">赵六</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="优先级"
            name="priority"
            rules={[{ required: true, message: '请选择优先级' }]}
          >
            <Select>
              <Option value="high">高优先级</Option>
              <Option value="medium">中优先级</Option>
              <Option value="low">低优先级</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="任务分类"
            name="category"
            rules={[{ required: true, message: '请选择任务分类' }]}
          >
            <Select>
              <Option value="项目管理">项目管理</Option>
              <Option value="人力资源">人力资源</Option>
              <Option value="技术开发">技术开发</Option>
              <Option value="客户服务">客户服务</Option>
              <Option value="财务管理">财务管理</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="开始日期"
            name="startDate"
            rules={[{ required: true, message: '请选择开始日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="截止日期"
            name="dueDate"
            rules={[{ required: true, message: '请选择截止日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="标签"
            name="tags"
          >
            <Select mode="tags" placeholder="请输入标签">
              <Option value="重要">重要</Option>
              <Option value="紧急">紧急</Option>
              <Option value="培训">培训</Option>
              <Option value="安全">安全</Option>
              <Option value="调研">调研</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 任务详情Modal */}
      <Modal
        title="任务详情"
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {currentRecord && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="任务编号">{currentRecord.id}</Descriptions.Item>
              <Descriptions.Item label="任务标题">{currentRecord.title}</Descriptions.Item>
              <Descriptions.Item label="负责人">{currentRecord.assignee}</Descriptions.Item>
              <Descriptions.Item label="创建人">{currentRecord.creator}</Descriptions.Item>
              <Descriptions.Item label="优先级">
                <Tag color={priorityConfig[currentRecord.priority].color}>
                  {priorityConfig[currentRecord.priority].text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={statusConfig[currentRecord.status].color}>
                  {statusConfig[currentRecord.status].text}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="分类">{currentRecord.category}</Descriptions.Item>
              <Descriptions.Item label="审批状态">
                {currentRecord.approvalStatus ? (
                  <Tag color={approvalStatusConfig[currentRecord.approvalStatus].color}>
                    {approvalStatusConfig[currentRecord.approvalStatus].text}
                  </Tag>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="开始日期">{currentRecord.startDate}</Descriptions.Item>
              <Descriptions.Item label="截止日期">{currentRecord.dueDate}</Descriptions.Item>
              <Descriptions.Item label="进度" span={2}>
                <Progress percent={currentRecord.progress} />
              </Descriptions.Item>
              <Descriptions.Item label="标签" span={2}>
                {currentRecord.tags.map(tag => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </Descriptions.Item>
              <Descriptions.Item label="任务描述" span={2}>
                {currentRecord.description}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 16 }}>
              <h4>任务进展</h4>
              <Timeline>
                <Timeline.Item color="green">
                  <p>任务创建</p>
                  <p style={{ color: '#999', fontSize: '12px' }}>{currentRecord.createdAt}</p>
                </Timeline.Item>
                {currentRecord.approvalStatus === 'approved' && (
                  <Timeline.Item color="blue">
                    <p>审批通过</p>
                    <p style={{ color: '#999', fontSize: '12px' }}>审批人：{currentRecord.approver}</p>
                  </Timeline.Item>
                )}
                {currentRecord.status === 'processing' && (
                  <Timeline.Item color="blue">
                    <p>任务进行中</p>
                    <p style={{ color: '#999', fontSize: '12px' }}>进度：{currentRecord.progress}%</p>
                  </Timeline.Item>
                )}
                {currentRecord.status === 'completed' && (
                  <Timeline.Item color="green">
                    <p>任务完成</p>
                    <p style={{ color: '#999', fontSize: '12px' }}>{currentRecord.updatedAt}</p>
                  </Timeline.Item>
                )}
              </Timeline>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Tasks; 