import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, InputNumber, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FundOutlined } from '@ant-design/icons';
import { getOpportunityList, createOpportunity, updateOpportunity, deleteOpportunity } from '@/services/crm';

const { Option } = Select;

const OpportunityList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [opportunities, setOpportunities] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const response = await getOpportunityList();
      if (response.success) {
        setOpportunities(response.data || response.datas || []);
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
    },
    {
      title: '成交概率',
      dataIndex: 'probability',
      key: 'probability',
      render: (probability) => probability ? probability + '%' : '-',
    },
    {
      title: '预期金额',
      dataIndex: 'expectedAmount',
      key: 'expectedAmount',
      render: (amount) => amount ? '' + amount.toLocaleString() : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
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
        />
      </Card>
    </div>
  );
};

export default OpportunityList;
