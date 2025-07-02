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
  InputNumber,
  message,
  Tag,
  Popconfirm,
  Row,
  Col,
  Statistic,
  Tooltip
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { 
  getOpportunityList, 
  createOpportunity, 
  updateOpportunity, 
  deleteOpportunity,
  getOpportunityStatistics,
  getEmployeeList,
  getCustomerList
} from '../../../services/crm';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface Opportunity {
  id: string;
  opportunityId?: string;
  opportunityName: string;
  customerId: string;
  customerName: string;
  amount: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  ownerId: string;
  ownerName: string;
  description?: string;
  createTime: string;
  updateTime: string;
  status: number;
}

interface OpportunityForm {
  opportunityName: string;
  customerId: string;
  amount: number;
  stage: string;
  probability: number;
  expectedCloseDate: string;
  ownerId: string;
  description?: string;
}

interface Statistics {
  totalOpportunities: number;
  totalAmount: number;
  wonOpportunities: number;
  wonAmount: number;
  avgDealSize: number;
  winRate: number;
}

const OpportunityManagement: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [form] = Form.useForm();
  const [statistics, setStatistics] = useState<Statistics>({
    totalOpportunities: 0,
    totalAmount: 0,
    wonOpportunities: 0,
    wonAmount: 0,
    avgDealSize: 0,
    winRate: 0
  });

  // 搜索和筛选状态
  const [searchText, setSearchText] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('');
  const [ownerFilter, setOwnerFilter] = useState<string>('');
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

  // 商机阶段选项
  const stageOptions = [
    { value: 'qualification', label: '资格审查', color: 'blue' },
    { value: 'needs_analysis', label: '需求分析', color: 'cyan' },
    { value: 'proposal', label: '方案提议', color: 'geekblue' },
    { value: 'negotiation', label: '谈判', color: 'orange' },
    { value: 'closed_won', label: '成交', color: 'green' },
    { value: 'closed_lost', label: '失败', color: 'red' }
  ];

  // 获取阶段标签
  const getStageTag = (stage: string) => {
    const stageOption = stageOptions.find(s => s.value === stage);
    return stageOption ? (
      <Tag color={stageOption.color}>{stageOption.label}</Tag>
    ) : <Tag>{stage}</Tag>;
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

  // 加载商机列表
  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const queryParams = {
        pageNum: pagination.current,
        pageSize: pagination.pageSize,
        opportunityName: searchText || undefined,
        stage: stageFilter || undefined,
        ownerId: ownerFilter || undefined,
        startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: dateRange?.[1]?.format('YYYY-MM-DD')
      };

      const response = await getOpportunityList(queryParams);
      
      if (response.success && response.data) {
        setOpportunities(response.data.list || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0
        }));
      } else {
        message.error('加载商机列表失败');
      }
    } catch (error) {
      console.error('加载商机列表失败:', error);
      message.error('加载商机列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载统计数据
  const loadStatistics = async () => {
    try {
      const response = await getOpportunityStatistics({});
      if (response.success && response.data) {
        setStatistics(response.data);
      }
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadCustomers();
    loadOpportunities();
    loadStatistics();
  }, [pagination.current, pagination.pageSize]);

  // 搜索
  const handleSearch = () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    loadOpportunities();
  };

  // 重置
  const handleReset = () => {
    setSearchText('');
    setStageFilter('');
    setOwnerFilter('');
    setDateRange(null);
    setPagination(prev => ({ ...prev, current: 1 }));
    setTimeout(loadOpportunities, 0);
  };

  // 新增商机
  const handleAdd = () => {
    setEditingOpportunity(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 编辑商机
  const handleEdit = (record: Opportunity) => {
    setEditingOpportunity(record);
    form.setFieldsValue({
      ...record,
      id: record.opportunityId || record.id,
      expectedCloseDate: record.expectedCloseDate ? dayjs(record.expectedCloseDate) : null
    });
    setIsModalVisible(true);
  };

  // 删除商机
  const handleDelete = async (id: string) => {
    try {
      const response = await deleteOpportunity(id);
      if (response.success) {
        message.success('删除成功');
        loadOpportunities();
        loadStatistics();
      } else {
        message.error('删除失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  // 保存商机
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const opportunityData = {
        ...values,
        closeDate: values.expectedCloseDate?.format('YYYY-MM-DD')
      };
      
      delete opportunityData.expectedCloseDate;

      let response;
      if (editingOpportunity) {
        const opportunityId = editingOpportunity.opportunityId || editingOpportunity.id;
        response = await updateOpportunity(opportunityId, opportunityData);
      } else {
        response = await createOpportunity(opportunityData);
      }

      if (response.success) {
        message.success(editingOpportunity ? '更新成功' : '创建成功');
        setIsModalVisible(false);
        loadOpportunities();
        loadStatistics();
      } else {
        message.error(editingOpportunity ? '更新失败' : '创建失败');
      }
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  // 表格列定义
  const columns: ColumnsType<Opportunity> = [
    {
      title: '商机名称',
      dataIndex: 'opportunityName',
      key: 'opportunityName',
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
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount) => `¥${amount?.toLocaleString() || 0}`
    },
    {
      title: '阶段',
      dataIndex: 'stage',
      key: 'stage',
      width: 120,
      render: (stage) => getStageTag(stage)
    },
    {
      title: '成功概率',
      dataIndex: 'probability',
      key: 'probability',
      width: 100,
      render: (probability) => `${probability || 0}%`
    },
    {
      title: '预期成交日期',
      dataIndex: 'expectedCloseDate',
      key: 'expectedCloseDate',
      width: 120,
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
    },
    {
      title: '负责人',
      dataIndex: 'ownerName',
      key: 'ownerName',
      width: 100
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 120,
      render: (time) => time ? dayjs(time).format('YYYY-MM-DD') : '-'
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个商机吗?"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="opportunity-management">
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="总商机数"
              value={statistics.totalOpportunities}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="总金额"
              value={statistics.totalAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="成交商机"
              value={statistics.wonOpportunities}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="成交金额"
              value={statistics.wonAmount}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="平均单价"
              value={statistics.avgDealSize}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="成交率"
              value={statistics.winRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        {/* 搜索区域 */}
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Search
              placeholder="搜索商机名称"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              enterButton
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="选择阶段"
              value={stageFilter}
              onChange={setStageFilter}
              style={{ width: '100%' }}
              allowClear
            >
              {stageOptions.map(stage => (
                <Option key={stage.value} value={stage.value}>
                  {stage.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="选择负责人"
              value={ownerFilter}
              onChange={setOwnerFilter}
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
          <Col span={6}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              placeholder={['开始日期', '结束日期']}
            />
          </Col>
          <Col span={4}>
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
                新增商机
              </Button>
            </Space>
          </Col>
        </Row>

        {/* 表格 */}
        <Table
          columns={columns}
          dataSource={opportunities}
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

      {/* 新增/编辑弹窗 */}
      <Modal
        title={editingOpportunity ? '编辑商机' : '新增商机'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            stage: 'qualification',
            probability: 20
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="opportunityName"
                label="商机名称"
                rules={[{ required: true, message: '请输入商机名称' }]}
              >
                <Input placeholder="请输入商机名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="customerId"
                label="客户"
                rules={[{ required: true, message: '请选择客户' }]}
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
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="amount"
                label="金额"
                rules={[{ required: true, message: '请输入金额' }]}
              >
                <InputNumber
                  placeholder="请输入金额"
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  formatter={(value) => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\¥\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="stage"
                label="阶段"
                rules={[{ required: true, message: '请选择阶段' }]}
              >
                <Select placeholder="请选择阶段">
                  {stageOptions.map(stage => (
                    <Option key={stage.value} value={stage.value}>
                      {stage.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="probability"
                label="成功概率(%)"
                rules={[{ required: true, message: '请输入成功概率' }]}
              >
                <InputNumber
                  placeholder="请输入成功概率"
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expectedCloseDate"
                label="预期成交日期"
                rules={[{ required: true, message: '请选择预期成交日期' }]}
              >
                <DatePicker
                  placeholder="请选择预期成交日期"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="ownerId"
            label="负责人"
            rules={[{ required: true, message: '请选择负责人' }]}
          >
            <Select
              placeholder="请选择负责人"
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
            name="description"
            label="描述"
          >
            <Input.TextArea
              placeholder="请输入描述"
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OpportunityManagement;