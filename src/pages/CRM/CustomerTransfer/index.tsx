import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Modal,
  Form,
  message,
  Tag,
  Row,
  Col,
  Statistic,
  Tooltip,
  Avatar,
  Alert,
  Descriptions
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  CheckOutlined,
  CloseOutlined,
  EyeOutlined,
  UserOutlined,
  SwapOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { 
  getTransferList, 
  createTransfer, 
  approveTransfer,
  rejectTransfer,
  getTransferDetail,
  getEmployeeList,
  getCustomerList
} from '../../../services/crm';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TextArea } = Input;

interface CustomerTransfer {
  id: string;
  customerId: string;
  customerName: string;
  fromEmployeeId: string;
  fromEmployeeName: string;
  toEmployeeId: string;
  toEmployeeName: string;
  reason: string;
  status: string;
  approvalComments?: string;
  applyTime: string;
  approvalTime?: string;
  createTime: string;
  updateTime: string;
}

interface TransferForm {
  customerId: string;
  toEmployeeId: string;
  reason: string;
}

interface ApprovalForm {
  status: string;
  approvalComments: string;
}

const CustomerTransferManagement: React.FC = () => {
  const [transfers, setTransfers] = useState<CustomerTransfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isApprovalModalVisible, setIsApprovalModalVisible] = useState(false);
  const [editingTransfer, setEditingTransfer] = useState<CustomerTransfer | null>(null);
  const [viewingTransfer, setViewingTransfer] = useState<CustomerTransfer | null>(null);
  const [approvingTransfer, setApprovingTransfer] = useState<CustomerTransfer | null>(null);
  const [form] = Form.useForm();
  const [approvalForm] = Form.useForm();

  // 搜索和筛选状态
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [fromEmployeeFilter, setFromEmployeeFilter] = useState<string>('');
  const [toEmployeeFilter, setToEmployeeFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  // 分页
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 缓存
  const employeeCache = useRef<Map<string, any>>(new Map());
  const customerCache = useRef<Map<string, any>>(new Map());

  // 审批状态选项
  const statusOptions = [
    { value: 'pending', label: '待审批', color: 'orange' },
    { value: 'approved', label: '已通过', color: 'green' },
    { value: 'rejected', label: '已拒绝', color: 'red' }
  ];

  // 获取状态标签
  const getStatusTag = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption ? (
      <Tag color={statusOption.color}>{statusOption.label}</Tag>
    ) : <Tag>{status}</Tag>;
  };

  // 加载员工列表
  const loadEmployees = async () => {
    if (employeeCache.current.size > 0) return;
    
    try {
      const response = await getEmployeeList({ pageNum: 1, pageSize: 1000 });
      if (response.success && response.data?.list) {
        response.data.list.forEach((emp: any) => {
          employeeCache.current.set(emp.id, emp);
        });
      }
    } catch (error) {
      console.error('加载员工列表失败:', error);
    }
  };

  // 加载客户列表
  const loadCustomers = async () => {
    if (customerCache.current.size > 0) return;
    
    try {
      const response = await getCustomerList({ pageNum: 1, pageSize: 1000 });
      if (response.success && response.data?.list) {
        response.data.list.forEach((customer: any) => {
          customerCache.current.set(customer.id, customer);
        });
      }
    } catch (error) {
      console.error('加载客户列表失败:', error);
    }
  };

  // 加载移交记录列表
  const loadTransfers = async () => {
    setLoading(true);
    try {
      const queryParams = {
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        customerName: searchText || undefined,
        status: statusFilter || undefined,
        fromEmployeeId: fromEmployeeFilter || undefined,
        toEmployeeId: toEmployeeFilter || undefined,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD')
      };

      const response = await getTransferList(queryParams);
      
      if (response.success && response.data) {
        setTransfers(response.data.list || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0
        }));
      } else {
        message.error('加载移交记录失败');
      }
    } catch (error) {
      console.error('加载移交记录失败:', error);
      message.error('加载移交记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadCustomers();
    loadTransfers();
  }, [pagination.current, pagination.pageSize]);

  // 搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadTransfers();
  };

  // 重置
  const handleReset = () => {
    setSearchText('');
    setStatusFilter('');
    setFromEmployeeFilter('');
    setToEmployeeFilter('');
    setDateRange(null);
    setPagination(prev => ({ ...prev, current: 1 }));
    setTimeout(loadTransfers, 0);
  };

  // 新增移交申请
  const handleAdd = () => {
    setEditingTransfer(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 查看详情
  const handleView = async (record: CustomerTransfer) => {
    try {
      const response = await getTransferDetail(record.id);
      if (response.success && response.data) {
        setViewingTransfer(response.data);
        setIsDetailModalVisible(true);
      } else {
        message.error('获取详情失败');
      }
    } catch (error) {
      console.error('获取详情失败:', error);
      message.error('获取详情失败');
    }
  };

  // 审批
  const handleApproval = (record: CustomerTransfer) => {
    setApprovingTransfer(record);
    approvalForm.resetFields();
    setIsApprovalModalVisible(true);
  };

  // 保存移交申请
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const transferData: TransferForm = {
        ...values
      };

      const response = await createTransfer(transferData);

      if (response.success) {
        message.success('申请提交成功');
        setIsModalVisible(false);
        loadTransfers();
      } else {
        message.error('申请提交失败');
      }
    } catch (error) {
      console.error('申请提交失败:', error);
      message.error('申请提交失败');
    }
  };

  // 提交审批
  const handleApprovalSubmit = async () => {
    try {
      const values = await approvalForm.validateFields();
      const approvalData: ApprovalForm = {
        ...values
      };

      let response;
      if (approvalData.status === 'approved') {
        response = await approveTransfer(approvingTransfer!.id, approvalData);
      } else {
        response = await rejectTransfer(approvingTransfer!.id, approvalData);
      }

      if (response.success) {
        message.success('审批完成');
        setIsApprovalModalVisible(false);
        loadTransfers();
      } else {
        message.error('审批失败');
      }
    } catch (error) {
      console.error('审批失败:', error);
      message.error('审批失败');
    }
  };

  // 表格列定义
  const columns: ColumnsType<CustomerTransfer> = [
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
      ellipsis: {
        showTitle: false
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '原负责人',
      dataIndex: 'fromEmployeeName',
      key: 'fromEmployeeName',
      width: 120,
      render: (name) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          {name}
        </Space>
      )
    },
    {
      title: '新负责人',
      dataIndex: 'toEmployeeName',
      key: 'toEmployeeName',
      width: 120,
      render: (name) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} />
          {name}
        </Space>
      )
    },
    {
      title: '移交原因',
      dataIndex: 'reason',
      key: 'reason',
      width: 200,
      ellipsis: {
        showTitle: false
      },
      render: (text) => (
        <Tooltip placement="topLeft" title={text}>
          {text}
        </Tooltip>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => getStatusTag(status)
    },
    {
      title: '申请时间',
      dataIndex: 'applyTime',
      key: 'applyTime',
      width: 140,
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '审批时间',
      dataIndex: 'approvalTime',
      key: 'approvalTime',
      width: 140,
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            详情
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleApproval(record)}
            >
              审批
            </Button>
          )}
        </Space>
      )
    }
  ];

  // 统计数据
  const pendingCount = transfers.filter(t => t.status === 'pending').length;
  const approvedCount = transfers.filter(t => t.status === 'approved').length;
  const rejectedCount = transfers.filter(t => t.status === 'rejected').length;

  return (
    <div className="customer-transfer-management">
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总移交记录"
              value={transfers.length}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SwapOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审批"
              value={pendingCount}
              valueStyle={{ color: '#faad14' }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已通过"
              value={approvedCount}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已拒绝"
              value={rejectedCount}
              valueStyle={{ color: '#f5222d' }}
              prefix={<CloseOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 搜索区域 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={5}>
            <Search
              placeholder="搜索客户名称"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              enterButton
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="选择状态"
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              allowClear
            >
              {statusOptions.map(status => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="原负责人"
              value={fromEmployeeFilter}
              onChange={setFromEmployeeFilter}
              style={{ width: '100%' }}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {Array.from(employeeCache.current.values()).map((emp: any) => (
                <Option key={emp.id} value={emp.id}>
                  {emp.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="新负责人"
              value={toEmployeeFilter}
              onChange={setToEmployeeFilter}
              style={{ width: '100%' }}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {Array.from(employeeCache.current.values()).map((emp: any) => (
                <Option key={emp.id} value={emp.id}>
                  {emp.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={5}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
            />
          </Col>
          <Col span={2}>
            <Space>
              <Button
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                搜索
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
              >
                重置
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 操作按钮 */}
        <Row style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAdd}
              >
                申请移交
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={transfers}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (current, pageSize) => {
              setPagination(prev => ({ ...prev, current, pageSize }));
            }
          }}
          scroll={{ x: 1200 }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys
          }}
        />
      </Card>

      {/* 新增移交申请弹窗 */}
      <Modal
        title="申请客户移交"
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={500}
        destroyOnClose
      >
        <Alert
          message="移交说明"
          description="客户移交需要审批通过后才能生效，请谨慎填写移交原因。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="customerId"
            label="选择客户"
            rules={[{ required: true, message: '请选择要移交的客户' }]}
          >
            <Select
              placeholder="请选择客户"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {Array.from(customerCache.current.values()).map((customer: any) => (
                <Option key={customer.id} value={customer.id}>
                  {customer.customerName || customer.companyName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="toEmployeeId"
            label="新负责人"
            rules={[{ required: true, message: '请选择新负责人' }]}
          >
            <Select
              placeholder="请选择新负责人"
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {Array.from(employeeCache.current.values()).map((emp: any) => (
                <Option key={emp.id} value={emp.id}>
                  {emp.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="reason"
            label="移交原因"
            rules={[{ required: true, message: '请输入移交原因' }]}
          >
            <TextArea
              placeholder="请详细说明移交原因"
              rows={4}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 详情弹窗 */}
      <Modal
        title="移交详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        width={600}
      >
        {viewingTransfer && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="客户名称" span={2}>
              {viewingTransfer.customerName}
            </Descriptions.Item>
            <Descriptions.Item label="原负责人">
              {viewingTransfer.fromEmployeeName}
            </Descriptions.Item>
            <Descriptions.Item label="新负责人">
              {viewingTransfer.toEmployeeName}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              {getStatusTag(viewingTransfer.status)}
            </Descriptions.Item>
            <Descriptions.Item label="申请时间">
              {dayjs(viewingTransfer.applyTime).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
            <Descriptions.Item label="移交原因" span={2}>
              {viewingTransfer.reason}
            </Descriptions.Item>
            {viewingTransfer.approvalComments && (
              <Descriptions.Item label="审批意见" span={2}>
                {viewingTransfer.approvalComments}
              </Descriptions.Item>
            )}
            {viewingTransfer.approvalTime && (
              <Descriptions.Item label="审批时间" span={2}>
                {dayjs(viewingTransfer.approvalTime).format('YYYY-MM-DD HH:mm:ss')}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>

      {/* 审批弹窗 */}
      <Modal
        title="移交审批"
        open={isApprovalModalVisible}
        onOk={handleApprovalSubmit}
        onCancel={() => setIsApprovalModalVisible(false)}
        width={500}
        destroyOnClose
      >
        {approvingTransfer && (
          <>
            <Alert
              message="审批信息"
              description={
                <div>
                  <div>客户：{approvingTransfer.customerName}</div>
                  <div>原负责人：{approvingTransfer.fromEmployeeName}</div>
                  <div>新负责人：{approvingTransfer.toEmployeeName}</div>
                  <div>移交原因：{approvingTransfer.reason}</div>
                </div>
              }
              type="info"
              style={{ marginBottom: 16 }}
            />
            <Form
              form={approvalForm}
              layout="vertical"
            >
              <Form.Item
                name="status"
                label="审批结果"
                rules={[{ required: true, message: '请选择审批结果' }]}
              >
                <Select placeholder="请选择审批结果">
                  <Option value="approved">通过</Option>
                  <Option value="rejected">拒绝</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="approvalComments"
                label="审批意见"
                rules={[{ required: true, message: '请输入审批意见' }]}
              >
                <TextArea
                  placeholder="请输入审批意见"
                  rows={3}
                  maxLength={300}
                  showCount
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default CustomerTransferManagement;