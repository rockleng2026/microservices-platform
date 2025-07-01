import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, message, Space, Tag } from 'antd';
import { PlusOutlined, CheckOutlined, CloseOutlined, SwapOutlined } from '@ant-design/icons';
import { getTransferRecords, createTransferRequest, approveTransfer } from '@/services/crm';

const { Option } = Select;
const { TextArea } = Input;

interface TransferRecord {
  transferId: number;
  customerId: number;
  customerName?: string;
  fromEmployeeName?: string;
  toEmployeeName?: string;
  transferReason: string;
  transferTime: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvalTime?: string;
  approvalNotes?: string;
  createdAt: string;
}

const TransferList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [currentTransfer, setCurrentTransfer] = useState<TransferRecord | null>(null);
  const [form] = Form.useForm();
  const [approvalForm] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    loadTransfers();
  }, []);

  const loadTransfers = async (page = 1, size = 10) => {
    try {
      setLoading(true);
      const response = await getTransferRecords({
        page: page - 1,
        size,
      });
      if (response.success) {
        const data = response.data || response.datas;
        setTransfers(data.content || []);
        setPagination({
          current: page,
          pageSize: size,
          total: data.totalElements || 0,
        });
      }
    } catch (error) {
      message.error('获取移交记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setModalVisible(true);
    form.resetFields();
  };

  const handleApproval = (record: TransferRecord) => {
    setCurrentTransfer(record);
    setApprovalModalVisible(true);
    approvalForm.resetFields();
  };

  const handleSubmit = async (values: any) => {
    try {
      const response = await createTransferRequest(values);
      if (response.success) {
        message.success('移交申请提交成功');
        setModalVisible(false);
        loadTransfers(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleApprovalSubmit = async (values: any) => {
    if (!currentTransfer) return;
    
    try {
      const response = await approveTransfer(currentTransfer.transferId, values);
      if (response.success) {
        message.success('审批成功');
        setApprovalModalVisible(false);
        loadTransfers(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      message.error('审批失败');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'orange',
      'approved': 'green',
      'rejected': 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      'pending': '待审批',
      'approved': '已通过',
      'rejected': '已拒绝',
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: '原负责人',
      dataIndex: 'fromEmployeeName',
      key: 'fromEmployeeName',
    },
    {
      title: '新负责人',
      dataIndex: 'toEmployeeName',
      key: 'toEmployeeName',
    },
    {
      title: '移交原因',
      dataIndex: 'transferReason',
      key: 'transferReason',
      ellipsis: true,
      width: 200,
    },
    {
      title: '申请时间',
      dataIndex: 'transferTime',
      key: 'transferTime',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '审批状态',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: '审批时间',
      dataIndex: 'approvalTime',
      key: 'approvalTime',
      render: (date?: string) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: '审批备注',
      dataIndex: 'approvalNotes',
      key: 'approvalNotes',
      ellipsis: true,
      width: 150,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record: TransferRecord) => (
        <Space>
          {record.approvalStatus === 'pending' && (
            <Button
              type="link"
              icon={<CheckOutlined />}
              onClick={() => handleApproval(record)}
            >
              审批
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <SwapOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            客户移交
          </div>
        }
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            申请移交
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={transfers}
          rowKey="transferId"
          loading={loading}
          pagination={{
            ...pagination,
            onChange: (page, pageSize) => {
              loadTransfers(page, pageSize);
            },
          }}
        />
      </Card>

      {/* 申请移交弹窗 */}
      <Modal
        title="申请客户移交"
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
            <Select placeholder="请选择要移交的客户">
              {/* 这里应该从客户列表动态加载 */}
            </Select>
          </Form.Item>

          <Form.Item
            name="toEmployeeId"
            label="移交给"
            rules={[{ required: true, message: '请选择接收人' }]}
          >
            <Select placeholder="请选择接收人">
              {/* 这里应该从员工列表动态加载 */}
            </Select>
          </Form.Item>

          <Form.Item
            name="transferReason"
            label="移交原因"
            rules={[{ required: true, message: '请输入移交原因' }]}
          >
            <TextArea rows={4} placeholder="请详细说明移交原因" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 审批弹窗 */}
      <Modal
        title="审批客户移交"
        open={approvalModalVisible}
        onCancel={() => setApprovalModalVisible(false)}
        onOk={() => approvalForm.submit()}
        width={500}
      >
        <Form
          form={approvalForm}
          layout="vertical"
          onFinish={handleApprovalSubmit}
        >
          <div style={{ marginBottom: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
            <p><strong>客户：</strong>{currentTransfer?.customerName}</p>
            <p><strong>原负责人：</strong>{currentTransfer?.fromEmployeeName}</p>
            <p><strong>新负责人：</strong>{currentTransfer?.toEmployeeName}</p>
            <p><strong>移交原因：</strong>{currentTransfer?.transferReason}</p>
          </div>

          <Form.Item
            name="approved"
            label="审批结果"
            rules={[{ required: true, message: '请选择审批结果' }]}
          >
            <Select placeholder="请选择审批结果">
              <Option value={true}>通过</Option>
              <Option value={false}>拒绝</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="审批备注"
          >
            <TextArea rows={3} placeholder="请输入审批备注（选填）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TransferList;
