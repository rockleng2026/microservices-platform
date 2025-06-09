import React, { useRef, useState } from 'react';
import { Card, Button, Modal, Form, Input, Select, message, Space, Table, Tag, Popconfirm, DatePicker, Row, Col, Statistic } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, PhoneOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';

// 客户类型定义
interface CustomerType {
  id: number;
  name: string;
  company: string;
  phone: string;
  email: string;
  industry: string;
  level: 'A' | 'B' | 'C';
  status: 'potential' | 'signed' | 'lost';
  source: string;
  assignedTo: string;
  value: number;
  createTime: string;
  lastContact?: string;
}

const Customers: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CustomerType | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 模拟客户数据
  const mockCustomers: CustomerType[] = [
    {
      id: 1,
      name: '张总',
      company: '阿里巴巴',
      phone: '13800138001',
      email: 'zhang@alibaba.com',
      industry: '互联网',
      level: 'A',
      status: 'signed',
      source: '线上推广',
      assignedTo: '李销售',
      value: 500000,
      createTime: '2023-01-15',
      lastContact: '2023-06-01',
    },
    {
      id: 2,
      name: '王经理',
      company: '腾讯科技',
      phone: '13800138002',
      email: 'wang@tencent.com',
      industry: '互联网',
      level: 'A',
      status: 'potential',
      source: '朋友介绍',
      assignedTo: '张销售',
      value: 800000,
      createTime: '2023-02-20',
      lastContact: '2023-05-28',
    },
    {
      id: 3,
      name: '刘总监',
      company: '字节跳动',
      phone: '13800138003',
      email: 'liu@bytedance.com',
      industry: '互联网',
      level: 'B',
      status: 'potential',
      source: '展会',
      assignedTo: '李销售',
      value: 300000,
      createTime: '2023-03-10',
      lastContact: '2023-05-25',
    },
    {
      id: 4,
      name: '陈总',
      company: '华为技术',
      phone: '13800138004',
      email: 'chen@huawei.com',
      industry: '通信',
      level: 'A',
      status: 'signed',
      source: '老客户推荐',
      assignedTo: '王销售',
      value: 1200000,
      createTime: '2023-04-05',
      lastContact: '2023-05-30',
    },
    {
      id: 5,
      name: '赵经理',
      company: '小米集团',
      phone: '13800138005',
      email: 'zhao@xiaomi.com',
      industry: '电子产品',
      level: 'B',
      status: 'lost',
      source: '冷拨电话',
      assignedTo: '张销售',
      value: 200000,
      createTime: '2023-05-15',
      lastContact: '2023-05-20',
    },
  ];

  const columns = [
    {
      title: '客户信息',
      key: 'customer',
      width: 200,
      render: (_: any, record: CustomerType) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            <UserOutlined style={{ marginRight: 4 }} />
            {record.name}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: 2 }}>
            {record.company}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <PhoneOutlined style={{ marginRight: 4 }} />
            {record.phone}
          </div>
        </div>
      ),
    },
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
      width: 100,
    },
    {
      title: '客户等级',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level: string) => (
        <Tag color={level === 'A' ? 'red' : level === 'B' ? 'orange' : 'blue'}>
          {level}级客户
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          potential: { color: 'blue', text: '潜在客户' },
          signed: { color: 'green', text: '已签约' },
          lost: { color: 'red', text: '已流失' },
        };
        const statusInfo = statusMap[status as keyof typeof statusMap];
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: '预估价值',
      dataIndex: 'value',
      key: 'value',
      width: 120,
      render: (value: number) => (
        <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
          ¥{(value / 10000).toFixed(1)}万
        </span>
      ),
    },
    {
      title: '负责人',
      dataIndex: 'assignedTo',
      key: 'assignedTo',
      width: 100,
    },
    {
      title: '客户来源',
      dataIndex: 'source',
      key: 'source',
      width: 120,
    },
    {
      title: '最后联系',
      dataIndex: 'lastContact',
      key: 'lastContact',
      width: 100,
      render: (date: string) => date || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as any,
      render: (_: any, record: CustomerType) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            icon={<PhoneOutlined />}
            onClick={() => message.info('拨打电话功能开发中...')}
          >
            联系
          </Button>
          <Popconfirm
            title="确定要删除这个客户吗？"
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
      ),
    },
  ];

  const handleAdd = () => {
    setEditingRecord(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: CustomerType) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRecord) {
        message.success('更新成功');
      } else {
        message.success('新增成功');
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error(editingRecord ? '更新失败' : '新增失败');
    }
  };

  const filteredData = mockCustomers.filter(item => {
    const matchesSearch = searchText ? (
      item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.company.toLowerCase().includes(searchText.toLowerCase()) ||
      item.phone.includes(searchText)
    ) : true;
    
    const matchesStatus = statusFilter === 'all' ? true : item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // 统计数据
  const totalCustomers = mockCustomers.length;
  const signedCustomers = mockCustomers.filter(c => c.status === 'signed').length;
  const potentialCustomers = mockCustomers.filter(c => c.status === 'potential').length;
  const totalValue = mockCustomers
    .filter(c => c.status === 'signed')
    .reduce((sum, c) => sum + c.value, 0);

  return (
    <div>
      <h2>客户管理</h2>
      
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="客户总数"
              value={totalCustomers}
              suffix="个"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已签约客户"
              value={signedCustomers}
              suffix="个"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="潜在客户"
              value={potentialCustomers}
              suffix="个"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="签约总价值"
              value={totalValue / 10000}
              suffix="万元"
              precision={1}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Input
              placeholder="搜索客户姓名、公司、电话..."
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Select
              style={{ width: 150 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Select.Option value="all">全部状态</Select.Option>
              <Select.Option value="potential">潜在客户</Select.Option>
              <Select.Option value="signed">已签约</Select.Option>
              <Select.Option value="lost">已流失</Select.Option>
            </Select>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增客户
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            defaultPageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
          }}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑客户' : '新增客户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="客户姓名"
                rules={[{ required: true, message: '请输入客户姓名' }]}
              >
                <Input placeholder="请输入客户姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="company"
                label="所属公司"
                rules={[{ required: true, message: '请输入所属公司' }]}
              >
                <Input placeholder="请输入所属公司" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="联系电话"
                rules={[
                  { required: true, message: '请输入联系电话' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
                ]}
              >
                <Input placeholder="请输入联系电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="邮箱地址"
                rules={[
                  { type: 'email', message: '请输入正确的邮箱格式' },
                ]}
              >
                <Input placeholder="请输入邮箱地址" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="industry"
                label="所属行业"
                rules={[{ required: true, message: '请选择所属行业' }]}
              >
                <Select placeholder="请选择所属行业">
                  <Select.Option value="互联网">互联网</Select.Option>
                  <Select.Option value="金融">金融</Select.Option>
                  <Select.Option value="制造业">制造业</Select.Option>
                  <Select.Option value="教育">教育</Select.Option>
                  <Select.Option value="医疗">医疗</Select.Option>
                  <Select.Option value="房地产">房地产</Select.Option>
                  <Select.Option value="零售">零售</Select.Option>
                  <Select.Option value="其他">其他</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="level"
                label="客户等级"
                rules={[{ required: true, message: '请选择客户等级' }]}
              >
                <Select placeholder="请选择客户等级">
                  <Select.Option value="A">A级客户（重要客户）</Select.Option>
                  <Select.Option value="B">B级客户（一般客户）</Select.Option>
                  <Select.Option value="C">C级客户（潜在客户）</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="客户状态"
                rules={[{ required: true, message: '请选择客户状态' }]}
              >
                <Select placeholder="请选择客户状态">
                  <Select.Option value="potential">潜在客户</Select.Option>
                  <Select.Option value="signed">已签约</Select.Option>
                  <Select.Option value="lost">已流失</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="source"
                label="客户来源"
                rules={[{ required: true, message: '请选择客户来源' }]}
              >
                <Select placeholder="请选择客户来源">
                  <Select.Option value="线上推广">线上推广</Select.Option>
                  <Select.Option value="朋友介绍">朋友介绍</Select.Option>
                  <Select.Option value="展会">展会</Select.Option>
                  <Select.Option value="老客户推荐">老客户推荐</Select.Option>
                  <Select.Option value="冷拨电话">冷拨电话</Select.Option>
                  <Select.Option value="其他">其他</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assignedTo"
                label="负责销售"
                rules={[{ required: true, message: '请选择负责销售' }]}
              >
                <Select placeholder="请选择负责销售">
                  <Select.Option value="李销售">李销售</Select.Option>
                  <Select.Option value="张销售">张销售</Select.Option>
                  <Select.Option value="王销售">王销售</Select.Option>
                  <Select.Option value="赵销售">赵销售</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="value"
                label="预估价值（元）"
                rules={[{ required: true, message: '请输入预估价值' }]}
              >
                <Input placeholder="请输入预估价值" type="number" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingRecord ? '更新' : '新增'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Customers; 