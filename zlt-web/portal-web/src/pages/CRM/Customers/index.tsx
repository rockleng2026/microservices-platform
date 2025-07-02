import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Input, Select, message, Space, Table, Tag, Popconfirm, Row, Col, Statistic, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, PhoneOutlined, UserOutlined, BankOutlined, ReloadOutlined } from '@ant-design/icons';
import { getCustomerList, createCustomer, updateCustomer, deleteCustomer } from '@/services/crm';

const { Option } = Select;

const Customers: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await getCustomerList({
        search: searchText,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      
      console.log('客户管理 - API响应:', response);
      
      if (response.success || response.resp_code === 0) {
        const data = response.data || response.datas;
        setCustomers(data?.content || data || []);
      } else {
        message.error(response.message || '获取客户列表失败');
      }
    } catch (error) {
      console.error('获取客户列表失败:', error);
      message.error('获取客户列表失败，请检查网络连接和后端服务');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (customerId: number) => {
    try {
      const response = await deleteCustomer(customerId);
      if (response.success || response.resp_code === 0) {
        message.success('删除成功');
        loadCustomers();
      } else {
        message.error('删除失败');
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        customerType: values.customerType || 'individual',
        customerStatus: values.customerStatus || 'potential',
        ownerEmployeeId: 1, // 临时使用固定值
      };

      let response;
      if (editingRecord) {
        response = await updateCustomer(editingRecord.customerId, submitData);
      } else {
        response = await createCustomer(submitData);
      }

      if (response.success || response.resp_code === 0) {
        message.success(editingRecord ? '更新成功' : '新增成功');
        setModalVisible(false);
        form.resetFields();
        loadCustomers();
      } else {
        message.error('操作失败');
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '客户信息',
      key: 'customer',
      render: (record: any) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {record.customerType === 'individual' ? <UserOutlined style={{ marginRight: 4 }} /> : <BankOutlined style={{ marginRight: 4 }} />}
            {record.customerName}
          </div>
          {record.contactPhone && <div style={{ fontSize: '12px', color: '#666' }}>{record.contactPhone}</div>}
        </div>
      ),
    },
    {
      title: '客户类型',
      dataIndex: 'customerType',
      render: (type: string) => (
        <Tag color={type === 'individual' ? 'blue' : 'green'}>
          {type === 'individual' ? '个人客户' : '企业客户'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'customerStatus',
      render: (status: string) => {
        const statusMap: any = {
          potential: { color: 'orange', text: '潜在客户' },
          confirmed: { color: 'green', text: '已确认' },
          lost: { color: 'red', text: '已流失' },
        };
        const statusInfo = statusMap[status] || { color: 'default', text: status };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '行业',
      dataIndex: 'industry',
      render: (industry: string) => industry || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (record: any) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定要删除吗？" onConfirm={() => handleDelete(record.customerId)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h2> 客户管理</h2>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="客户总数" value={customers.length} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="已确认客户" 
              value={customers.filter(c => c.customerStatus === 'confirmed').length} 
              prefix={<BankOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="潜在客户" 
              value={customers.filter(c => c.customerStatus === 'potential').length} 
              prefix={<PhoneOutlined />} 
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic 
              title="企业客户" 
              value={customers.filter(c => c.customerType === 'enterprise').length} 
              prefix={<BankOutlined />} 
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Input
              placeholder="搜索客户名称..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
            />
            <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 120 }}>
              <Option value="all">全部状态</Option>
              <Option value="potential">潜在客户</Option>
              <Option value="confirmed">已确认</Option>
              <Option value="lost">已流失</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={loadCustomers}>刷新</Button>
          </div>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增客户
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={customers}
          rowKey="customerId"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑客户' : '新增客户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="customerName" label="客户名称" rules={[{ required: true }]}>
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          <Form.Item name="customerType" label="客户类型" rules={[{ required: true }]}>
            <Select placeholder="请选择客户类型">
              <Option value="individual">个人客户</Option>
              <Option value="enterprise">企业客户</Option>
            </Select>
          </Form.Item>
          <Form.Item name="customerStatus" label="客户状态" rules={[{ required: true }]}>
            <Select placeholder="请选择客户状态">
              <Option value="potential">潜在客户</Option>
              <Option value="confirmed">已确认</Option>
              <Option value="lost">已流失</Option>
            </Select>
          </Form.Item>
          <Form.Item name="contactPhone" label="联系电话">
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          <Form.Item name="contactEmail" label="邮箱地址">
            <Input placeholder="请输入邮箱地址" />
          </Form.Item>
          <Form.Item name="industry" label="所属行业">
            <Select placeholder="请选择行业">
              <Option value="互联网">互联网</Option>
              <Option value="金融">金融</Option>
              <Option value="制造业">制造业</Option>
              <Option value="教育">教育</Option>
              <Option value="其他">其他</Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="客户描述">
            <Input.TextArea rows={3} placeholder="请输入客户描述" />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">
                {editingRecord ? '更新' : '新增'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Customers;
