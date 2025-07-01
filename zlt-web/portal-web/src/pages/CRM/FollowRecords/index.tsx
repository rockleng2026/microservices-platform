import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PhoneOutlined } from '@ant-design/icons';
import { getFollowRecords, createFollowRecord, updateFollowRecord, deleteFollowRecord } from '@/services/crm';

const { Option } = Select;
const { TextArea } = Input;

interface FollowRecord {
  followId: number;
  customerId: number;
  customerName?: string;
  employeeName?: string;
  followType: string;
  followTime: string;
  nextFollowTime?: string;
  content: string;
  stage: string;
  probability?: number;
  createdAt: string;
}

const FollowRecordList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [followRecords, setFollowRecords] = useState<FollowRecord[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FollowRecord | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    loadFollowRecords();
  }, []);

  const loadFollowRecords = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      const response = await getFollowRecords({
        page: page - 1,
        size,
      });
      if (response.success) {
        const data = response.data || response.datas;
        setFollowRecords(data.content || []);
        setPagination({
          current: page,
          pageSize: size,
          total: data.totalElements || 0,
        });
      }
    } catch (error) {
      message.error('获取跟进记录失败');
    } finally {
      setLoading(false);
    }
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
      followTime: record.followTime ? new Date(record.followTime) : null,
      nextFollowTime: record.nextFollowTime ? new Date(record.nextFollowTime) : null,
    });
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await deleteFollowRecord(id);
      if (response.success) {
        message.success('删除成功');
        loadFollowRecords(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        followTime: values.followTime?.format('YYYY-MM-DD HH:mm:ss'),
        nextFollowTime: values.nextFollowTime?.format('YYYY-MM-DD HH:mm:ss'),
      };

      let response;
      if (editingRecord) {
        response = await updateFollowRecord(editingRecord.followId, submitData);
      } else {
        response = await createFollowRecord(submitData);
      }
      
      if (response.success) {
        message.success(editingRecord ? '更新成功' : '创建成功');
        setModalVisible(false);
        loadFollowRecords(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getFollowTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'phone': 'blue',
      'visit': 'green',
      'email': 'orange',
      'wechat': 'cyan',
      'other': 'default',
    };
    return colors[type] || 'default';
  };

  const getFollowTypeText = (type: string) => {
    const texts: Record<string, string> = {
      'phone': '电话',
      'visit': '拜访',
      'email': '邮件',
      'wechat': '微信',
      'other': '其他',
    };
    return texts[type] || type;
  };

  const getStageText = (stage: string) => {
    const texts: Record<string, string> = {
      'potential': '潜在客户',
      'initial_contact': '初步接触',
      'requirement_confirmed': '需求确认',
      'solution_demo': '方案演示',
      'business_negotiation': '商务谈判',
      'won': '已成交',
      'lost': '已失败',
    };
    return texts[stage] || stage;
  };

  const columns = [
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: '跟进方式',
      dataIndex: 'followType',
      key: 'followType',
      render: (type: string) => (
        <Tag color={getFollowTypeColor(type)}>{getFollowTypeText(type)}</Tag>
      ),
    },
    {
      title: '跟进时间',
      dataIndex: 'followTime',
      key: 'followTime',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '下次跟进',
      dataIndex: 'nextFollowTime',
      key: 'nextFollowTime',
      render: (date?: string) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: '跟进内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 200,
    },
    {
      title: '客户阶段',
      dataIndex: 'stage',
      key: 'stage',
      render: (stage: string) => getStageText(stage),
    },
    {
      title: '成交概率',
      dataIndex: 'probability',
      key: 'probability',
      render: (probability?: number) => probability ? ${probability}% : '-',
    },
    {
      title: '跟进人',
      dataIndex: 'employeeName',
      key: 'employeeName',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: FollowRecord) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.followId)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <PhoneOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            跟进记录
          </div>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增跟进
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={followRecords}
          rowKey="followId"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              loadFollowRecords(page, pageSize);
            },
          }}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑跟进记录' : '新增跟进记录'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="customerId"
            label="客户"
            rules={[{ required: true, message: '请选择客户' }]}
          >
            <Select placeholder="请选择客户">
              {/* 这里应该从客户列表动态加载 */}
            </Select>
          </Form.Item>

          <Form.Item
            name="followType"
            label="跟进方式"
            rules={[{ required: true, message: '请选择跟进方式' }]}
          >
            <Select placeholder="请选择跟进方式">
              <Option value="phone">电话</Option>
              <Option value="visit">拜访</Option>
              <Option value="email">邮件</Option>
              <Option value="wechat">微信</Option>
              <Option value="other">其他</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="followTime"
            label="跟进时间"
            rules={[{ required: true, message: '请选择跟进时间' }]}
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="nextFollowTime"
            label="下次跟进时间"
          >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="content"
            label="跟进内容"
            rules={[{ required: true, message: '请输入跟进内容' }]}
          >
            <TextArea rows={4} placeholder="请输入跟进内容" />
          </Form.Item>

          <Form.Item
            name="stage"
            label="客户阶段"
            rules={[{ required: true, message: '请选择客户阶段' }]}
          >
            <Select placeholder="请选择客户阶段">
              <Option value="potential">潜在客户</Option>
              <Option value="initial_contact">初步接触</Option>
              <Option value="requirement_confirmed">需求确认</Option>
              <Option value="solution_demo">方案演示</Option>
              <Option value="business_negotiation">商务谈判</Option>
              <Option value="won">已成交</Option>
              <Option value="lost">已失败</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="probability"
            label="成交概率(%)"
          >
            <Input type="number" min={0} max={100} placeholder="请输入成交概率" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FollowRecordList;
