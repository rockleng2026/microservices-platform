import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, DatePicker, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, PhoneOutlined } from '@ant-design/icons';
import { getFollowRecords, createFollowRecord, updateFollowRecord, deleteFollowRecord } from '@/services/crm';

const { Option } = Select;
const { TextArea } = Input;

const FollowRecordList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [followRecords, setFollowRecords] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadFollowRecords();
  }, []);

  const loadFollowRecords = async () => {
    try {
      setLoading(true);
      const response = await getFollowRecords();
      if (response.success) {
        setFollowRecords(response.data || response.datas || []);
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

  const getFollowTypeColor = (type) => {
    const colors = {
      'phone': 'blue',
      'visit': 'green',
      'email': 'orange',
      'wechat': 'cyan',
      'other': 'default',
    };
    return colors[type] || 'default';
  };

  const getFollowTypeText = (type) => {
    const texts = {
      'phone': '电话',
      'visit': '拜访',
      'email': '邮件',
      'wechat': '微信',
      'other': '其他',
    };
    return texts[type] || type;
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
      render: (type) => (
        <Tag color={getFollowTypeColor(type)}>{getFollowTypeText(type)}</Tag>
      ),
    },
    {
      title: '跟进时间',
      dataIndex: 'followTime',
      key: 'followTime',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: '跟进内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 200,
    },
    {
      title: '成交概率',
      dataIndex: 'probability',
      key: 'probability',
      render: (probability) => probability ? probability + '%' : '-',
    },
    {
      title: '跟进人',
      dataIndex: 'employeeName',
      key: 'employeeName',
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
        />
      </Card>
    </div>
  );
};

export default FollowRecordList;
