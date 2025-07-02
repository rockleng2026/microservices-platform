import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  Pagination,
  Spin,
  Popconfirm,
  Typography,
  Avatar,
  Badge,
  Tooltip,
  Empty
} from 'antd';
import type { ColumnType } from 'antd/es/table';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  MailOutlined,
  MessageOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import {
  getFollowRecords,
  createFollowRecord,
  updateFollowRecord,
  deleteFollowRecord,
  getFollowStatistics,
  getPendingFollowList,
  getCustomerList,
  getEmployeeList,
  CRMEnums,
  EnumUtils
} from '@/services/crm';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Title, Text, Paragraph } = Typography;

interface SearchFormData {
  customerName?: string;
  employeeId?: string;
  followType?: string;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
}

interface FollowRecord {
  followId: string;
  customerId: string;
  customerName: string;
  employeeId: string;
  employeeName: string;
  followType: string;
  followTime: string;
  content: string;
  nextFollowTime?: string;
  probability?: number;
  stage?: string;
  createTime: string;
  updateTime: string;
}

const FollowRecordList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [followRecords, setFollowRecords] = useState<FollowRecord[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FollowRecord | null>(null);
  const [customerList, setCustomerList] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [statistics, setStatistics] = useState({
    totalFollows: 0,
    todayFollows: 0,
    pendingFollows: 0,
    completionRate: 0
  });
  
  // 分页和查询状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });
  const [searchParams, setSearchParams] = useState<SearchFormData>({});
  
  const [form] = Form.useForm();
  const [searchForm] = Form.useForm();

  useEffect(() => {
    loadData();
    loadStatistics();
    loadCustomers();
    loadEmployees();
  }, []);

  useEffect(() => {
    loadFollowRecords();
  }, [pagination.current, pagination.pageSize, searchParams]);

  const loadData = async () => {
    await Promise.all([
      loadFollowRecords(),
      loadStatistics()
    ]);
  };

  const loadFollowRecords = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        size: pagination.pageSize,
        ...searchParams,
        startDate: searchParams.dateRange?.[0]?.format('YYYY-MM-DD'),
        endDate: searchParams.dateRange?.[1]?.format('YYYY-MM-DD')
      };
      
      const response = await getFollowRecords(params);
      if (response.success || response.resp_code === 0) {
        const data = response.data || response.datas;
        setFollowRecords(data.records || data.list || []);
        setPagination(prev => ({
          ...prev,
          total: data.total || data.totalCount || 0
        }));
      }
    } catch (error) {
      console.error('跟进记录加载错误:', error);
      message.error('获取跟进记录失败');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      setStatisticsLoading(true);
      const response = await getFollowStatistics({
        startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
        endDate: dayjs().endOf('month').format('YYYY-MM-DD')
      });
      if (response.success || response.resp_code === 0) {
        const data = response.data || response.datas;
        setStatistics({
          totalFollows: data.totalFollows || 0,
          todayFollows: data.todayFollows || 0,
          pendingFollows: data.pendingFollows || 0,
          completionRate: data.completionRate || 0
        });
      }
    } catch (error) {
      console.error('统计数据加载错误:', error);
    } finally {
      setStatisticsLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await getCustomerList({ page: 1, size: 100 });
      if (response.success || response.resp_code === 0) {
        const data = response.data || response.datas;
        setCustomerList(data.records || data.list || []);
      }
    } catch (error) {
      console.error('客户列表加载错误:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await getEmployeeList({ page: 1, size: 100 });
      if (response.success || response.resp_code === 0) {
        const data = response.data || response.datas;
        setEmployeeList(data.records || data.list || []);
      }
    } catch (error) {
      console.error('员工列表加载错误:', error);
    }
  };

  const handleSearch = (values: SearchFormData) => {
    setSearchParams(values);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleReset = () => {
    searchForm.resetFields();
    setSearchParams({});
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleAdd = () => {
    setEditingRecord(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (record: FollowRecord) => {
    setEditingRecord(record);
    setModalVisible(true);
    form.setFieldsValue({
      ...record,
      followTime: dayjs(record.followTime),
      nextFollowTime: record.nextFollowTime ? dayjs(record.nextFollowTime) : undefined
    });
  };

  const handleDelete = async (followId: string) => {
    try {
      await deleteFollowRecord(followId);
      message.success('删除成功');
      loadFollowRecords();
      loadStatistics();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = {
        ...values,
        followTime: values.followTime?.format('YYYY-MM-DD HH:mm:ss'),
        nextFollowTime: values.nextFollowTime?.format('YYYY-MM-DD HH:mm:ss')
      };

      if (editingRecord) {
        await updateFollowRecord(editingRecord.followId, formData);
        message.success('更新成功');
      } else {
        await createFollowRecord(formData);
        message.success('创建成功');
      }
      
      setModalVisible(false);
      loadFollowRecords();
      loadStatistics();
    } catch (error: any) {
      if (error.errorFields) {
        return; // 表单验证错误
      }
      message.error(editingRecord ? '更新失败' : '创建失败');
    }
  };

  const getFollowTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      'phone': <PhoneOutlined />,
      'visit': <EnvironmentOutlined />,
      'email': <MailOutlined />,
      'wechat': <MessageOutlined />,
      'other': <UserOutlined />
    };
    return icons[type] || <UserOutlined />;
  };

  const getFollowTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'phone': 'blue',
      'visit': 'green', 
      'email': 'orange',
      'wechat': 'cyan',
      'other': 'default'
    };
    return colors[type] || 'default';
  };

  const handleTableChange = (page: number, pageSize: number) => {
    setPagination({
      current: page,
      pageSize,
      total: pagination.total
    });
  };

  const renderFollowCard = (record: FollowRecord, index: number) => (
    <Card
      key={record.followId}
      style={{ marginBottom: 16 }}
      bodyStyle={{ padding: '20px' }}
      hoverable
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Tag 
            icon={getFollowTypeIcon(record.followType)}
            color={getFollowTypeColor(record.followType)}
            style={{ marginRight: 8 }}
          >
            {EnumUtils.getLabel(CRMEnums.FollowType, record.followType)}
          </Tag>
          <Title level={5} style={{ margin: 0, color: '#1890ff', cursor: 'pointer' }}>
            {record.customerName}
          </Title>
          <Text type="secondary">
            {dayjs(record.followTime).format('YYYY-MM-DD HH:mm')}
          </Text>
        </div>
        <Space>
          <Tooltip title="编辑">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确认删除此跟进记录？"
            onConfirm={() => handleDelete(record.followId)}
            okText="确认"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      </div>

      <Paragraph style={{ color: '#333', lineHeight: 1.6, marginBottom: 12 }}>
        {record.content}
      </Paragraph>

      <div style={{ display: 'flex', gap: 20, fontSize: 14, color: '#666' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <UserOutlined />
          <span>跟进人: {record.employeeName || '未知员工'}</span>
        </div>
        {record.probability && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrophyOutlined />
            <span>成交概率: {record.probability}%</span>
          </div>
        )}
        {record.nextFollowTime && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CalendarOutlined />
            <span>下次跟进: {dayjs(record.nextFollowTime).format('YYYY-MM-DD HH:mm')}</span>
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* 页面头部 - 渐变色背景 */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '24px'
      }}>
        <Title level={2} style={{ 
          color: 'white', 
          margin: '0 0 8px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          📝 跟进记录管理
        </Title>
        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16 }}>
          查看和管理所有客户跟进记录，追踪销售进度和客户关系维护
        </Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="跟进总数"
              value={statistics.totalFollows}
              prefix={<PhoneOutlined style={{ color: '#1890ff' }} />}
              loading={statisticsLoading}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日跟进"
              value={statistics.todayFollows}
              prefix={<ClockCircleOutlined style={{ color: '#52c41a' }} />}
              loading={statisticsLoading}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待跟进"
              value={statistics.pendingFollows}
              prefix={<UserOutlined style={{ color: '#fa8c16' }} />}
              loading={statisticsLoading}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="完成率"
              value={statistics.completionRate}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: '#722ed1' }} />}
              loading={statisticsLoading}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选工具栏 */}
      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'end' }}>
          <Form
            form={searchForm}
            layout="inline"
            onFinish={handleSearch}
            style={{ flex: 1, marginBottom: 0 }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'end' }}>
              <Form.Item name="customerName" label="客户名称" style={{ marginBottom: 0 }}>
                <Input 
                  placeholder="请输入客户名称" 
                  allowClear 
                  style={{ width: 180 }}
                />
              </Form.Item>
              
              <Form.Item name="employeeId" label="跟进人" style={{ marginBottom: 0 }}>
                <Select 
                  placeholder="请选择跟进人" 
                  allowClear
                  style={{ width: 150 }}
                >
                  {employeeList.map((employee: any) => (
                    <Option key={employee.employeeId} value={employee.employeeId}>
                      {employee.employeeName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item name="followType" label="跟进方式" style={{ marginBottom: 0 }}>
                <Select 
                  placeholder="请选择跟进方式" 
                  allowClear
                  style={{ width: 130 }}
                >
                  {EnumUtils.getOptions(CRMEnums.FollowType).map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item name="dateRange" label="跟进时间" style={{ marginBottom: 0 }}>
                <RangePicker style={{ width: 250 }} />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    查询
                  </Button>
                  <Button onClick={handleReset} icon={<ReloadOutlined />}>
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </div>
          </Form>
          
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增跟进
          </Button>
        </div>
      </Card>

      {/* 跟进记录列表 - 卡片式布局 */}
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            📊 跟进记录列表
            <Badge count={pagination.total} showZero style={{ backgroundColor: '#52c41a' }} />
          </div>
        }
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadData}>
              刷新
            </Button>
          </Space>
        }
        style={{ borderRadius: 12 }}
      >
        <Spin spinning={loading}>
          {followRecords.length > 0 ? (
            followRecords.map((record, index) => renderFollowCard(record, index))
          ) : (
            <Empty description="暂无跟进记录" />
          )}
        </Spin>
        
        {pagination.total > 0 && (
          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              showSizeChanger
              showQuickJumper
              showTotal={(total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`}
              onChange={handleTableChange}
              onShowSizeChange={handleTableChange}
            />
          </div>
        )}
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingRecord ? '编辑跟进记录' : '新增跟进记录'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          preserve={false}
        >
          <Form.Item
            name="customerId"
            label="客户"
            rules={[{ required: true, message: '请选择客户' }]}
          >
            <Select
              placeholder="请选择客户"
              showSearch
              filterOption={(input, option: any) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {customerList.map((customer: any) => (
                <Option key={customer.customerId} value={customer.customerId}>
                  {customer.customerName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="followType"
                label="跟进方式"
                rules={[{ required: true, message: '请选择跟进方式' }]}
              >
                <Select placeholder="请选择跟进方式">
                  {EnumUtils.getOptions(CRMEnums.FollowType).map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="followTime"
                label="跟进时间"
                rules={[{ required: true, message: '请选择跟进时间' }]}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="content"
            label="跟进内容"
            rules={[{ required: true, message: '请输入跟进内容' }]}
          >
            <TextArea
              rows={4}
              placeholder="请详细描述本次跟进情况..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="probability"
                label="成交概率(%)"
              >
                <Input type="number" min={0} max={100} placeholder="0-100" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nextFollowTime"
                label="下次跟进时间"
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default FollowRecordList;
