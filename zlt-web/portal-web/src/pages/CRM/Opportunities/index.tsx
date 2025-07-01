import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FundOutlined } from '@ant-design/icons';
import { getOpportunityList, createOpportunity, updateOpportunity, deleteOpportunity } from '@/services/crm';

const { Option } = Select;

interface Opportunity {
  opportunityId: number;
  opportunityName: string;
  customerName?: string;
  stage: string;
  probability?: number;
  expectedAmount?: number;
  expectedCloseDate?: string;
  ownerEmployeeName?: string;
  createdAt: string;
}

const OpportunityList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      const response = await getOpportunityList({
        page: page - 1,
        size,
      });
      if (response.success) {
        const data = response.data || response.datas;
        setOpportunities(data.content || []);
        setPagination({
          current: page,
          pageSize: size,
          total: data.totalElements || 0,
        });
      }
    } catch (error) {
      message.error('获取商机列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingOpportunity(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (record: Opportunity) => {
    setEditingOpportunity(record);
    setModalVisible(true);
    form.setFieldsValue(record);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await deleteOpportunity(id);
      if (response.success) {
        message.success('删除成功');
        loadOpportunities(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      let response;
      if (editingOpportunity) {
        response = await updateOpportunity(editingOpportunity.opportunityId, values);
      } else {
        response = await createOpportunity(values);
      }
      
      if (response.success) {
        message.success(editingOpportunity ? '更新成功' : '创建成功');
        setModalVisible(false);
        loadOpportunities(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'potential': 'default',
      'initial_contact': 'blue',
      'requirement_confirmed': 'cyan',
      'solution_demo': 'orange',
      'business_negotiation': 'purple',
      'contract_signed': 'green',
      'won': 'success',
      'lost': 'error',
    };
    return colors[stage] || 'default';
  };

  const getStageText = (stage: string) => {
    const texts: Record<string, string> = {
      'potential': '潜在客户',
      'initial_contact': '初步接触',
      'requirement_confirmed': '需求确认',
      'solution_demo': '方案演示',
      'business_negotiation': '商务谈判',
      'contract_signed': '合同签署',
      'won': '已成交',
      'lost': '已失败',
    };
    return texts[stage] || stage;
  };

  const columns = [
    {
      title: '商机名称',
      dataIndex: 'opportunityName',
      key: 'opportunityName',
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: '阶段',
      dataIndex: 'stage',
      key: 'stage',
      render: (stage: string) => (
        <Tag color={getStageColor(stage)}>{getStageText(stage)}</Tag>
      ),
    },
    {
      title: '成交概率',
      dataIndex: 'probability',
      key: 'probability',
      render: (probability: number) => probability ? ${probability}% : '-',
    },
    {
      title: '预期金额',
      dataIndex: 'expectedAmount',
      key: 'expectedAmount',
      render: (amount: number) => amount ? ${amount.toLocaleString()} : '-',
    },
    {
      title: '预期成交日期',
      dataIndex: 'expectedCloseDate',
      key: 'expectedCloseDate',
    },
    {
      title: '负责人',
      dataIndex: 'ownerEmployeeName',
      key: 'ownerEmployeeName',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: Opportunity) => (
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
            onClick={() => handleDelete(record.opportunityId)}
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
            <FundOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            商机管理
          </div>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增商机
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={opportunities}
          rowKey="opportunityId"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              loadOpportunities(page, pageSize);
            },
          }}
        />
      </Card>

      <Modal
        title={editingOpportunity ? '编辑商机' : '新增商机'}
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
            name="opportunityName"
            label="商机名称"
            rules={[{ required: true, message: '请输入商机名称' }]}
          >
            <Input placeholder="请输入商机名称" />
          </Form.Item>

          <Form.Item
            name="stage"
            label="商机阶段"
            rules={[{ required: true, message: '请选择商机阶段' }]}
          >
            <Select placeholder="请选择商机阶段">
              <Option value="potential">潜在客户</Option>
              <Option value="initial_contact">初步接触</Option>
              <Option value="requirement_confirmed">需求确认</Option>
              <Option value="solution_demo">方案演示</Option>
              <Option value="business_negotiation">商务谈判</Option>
              <Option value="contract_signed">合同签署</Option>
              <Option value="won">已成交</Option>
              <Option value="lost">已失败</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="probability"
            label="成交概率(%)"
          >
            <InputNumber
              min={0}
              max={100}
              placeholder="请输入成交概率"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="expectedAmount"
            label="预期金额"
          >
            <InputNumber
              min={0}
              placeholder="请输入预期金额"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="expectedCloseDate"
            label="预期成交日期"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="description"
            label="商机描述"
          >
            <Input.TextArea rows={4} placeholder="请输入商机描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OpportunityList;
