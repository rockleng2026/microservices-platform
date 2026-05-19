/**
 * Logistics Management Page - ADMIN-07
 * Tab 1: Logistics Tracking - search by Order ID with tracking timeline
 * Tab 2: Express Company Management - ProTable with CRUD actions
 */
import React, { useState } from 'react';
import { Tabs, Input, Button, Card, Timeline, Tag, Space, Typography, message, Modal, Form, Input as AntInput, InputNumber, Select, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { createExpress, updateExpress, deleteExpress, updateExpressStatus, getLogisticsTracking } from './services/logistics';
import type { ExpressDTO, ExpressListParams, LogisticsTrackDTO, LogisticsTrace, LOGISTICS_STATUS_COLORS } from './services/logistics';
import { EXPRESS_STATUS, EXPRESS_STATUS_TEXT, LOGISTICS_STATUS_TEXT, LOGISTICS_STATUS_COLORS as TRACK_STATUS_COLORS } from './services/logistics';

const { TabPane } = Tabs;
const { Text } = Typography;

// ============= Tab 1: Logistics Tracking =============

interface TrackingSearchResult {
  orderId: number;
  orderNo: string;
  waybillNo: string;
  expressCode: string;
  expressName: string;
  status: number;
  statusDesc: string;
  traces: LogisticsTrace[];
  lastUpdateTime: string;
}

const LogisticsTrackingTab: React.FC = () => {
  const [orderId, setOrderId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<TrackingSearchResult | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Search tracking by order ID
  const handleSearch = async () => {
    const id = parseInt(orderId.trim(), 10);
    if (isNaN(id) || id <= 0) {
      message.warning('请输入有效的订单ID');
      return;
    }

    setLoading(true);
    setNotFound(false);
    setTrackingData(null);

    try {
      const result = await getLogisticsTracking(id);
      if (result) {
        setTrackingData(result as TrackingSearchResult);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Failed to fetch logistics tracking:', error);
      message.error('查询物流信息失败');
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key in input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Search Section */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Space>
            <Input
              placeholder="请输入订单ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{ width: 300 }}
              allowClear
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleSearch}
              loading={loading}
            >
              查询
            </Button>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            输入订单ID查询物流轨迹信息，仅显示已发货的实物订单
          </Text>
        </Space>
      </Card>

      {/* Tracking Result */}
      {loading && (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <Text type="secondary">正在查询物流信息...</Text>
        </Card>
      )}

      {notFound && !loading && (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <Text type="secondary">未找到该订单的物流信息，请确认订单已发货</Text>
        </Card>
      )}

      {trackingData && !loading && (
        <Card title="物流跟踪信息">
          {/* Basic Info */}
          <div style={{ marginBottom: 24 }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Space>
                <Text strong>快递公司：</Text>
                <Text>{trackingData.expressName}</Text>
                <Text type="secondary">({trackingData.expressCode})</Text>
              </Space>
              <Space>
                <Text strong>运单号：</Text>
                <Text copyable>{trackingData.waybillNo}</Text>
              </Space>
              <Space>
                <Text strong>订单号：</Text>
                <Text copyable>{trackingData.orderNo}</Text>
              </Space>
              <Space>
                <Text strong>当前状态：</Text>
                <Tag color={TRACK_STATUS_COLORS[trackingData.status] || 'default'}>
                  {trackingData.statusDesc}
                </Tag>
              </Space>
              <Space>
                <Text strong>最后更新：</Text>
                <Text type="secondary">{trackingData.lastUpdateTime}</Text>
              </Space>
            </Space>
          </div>

          {/* Timeline */}
          <Text strong style={{ display: 'block', marginBottom: 16 }}>物流轨迹</Text>
          {trackingData.traces && trackingData.traces.length > 0 ? (
            <Timeline
              items={trackingData.traces.map((trace, index) => ({
                color: index === 0 ? 'blue' : 'gray',
                children: (
                  <div key={index}>
                    <Text strong>{trace.time}</Text>
                    <br />
                    <Text>{trace.location}</Text>
                    <br />
                    <Text type="secondary">{trace.description}</Text>
                  </div>
                ),
              }))}
            />
          ) : (
            <Text type="secondary">暂无物流轨迹信息</Text>
          )}
        </Card>
      )}
    </div>
  );
};

// ============= Tab 2: Express Company Management =============

// Express status color mapping
const STATUS_COLORS: Record<number, string> = {
  [EXPRESS_STATUS.ENABLED]: 'success',
  [EXPRESS_STATUS.DISABLED]: 'default',
};

// Status options for filter
const STATUS_OPTIONS = [
  { label: '全部', value: -1 },
  { label: '已启用', value: EXPRESS_STATUS.ENABLED },
  { label: '已禁用', value: EXPRESS_STATUS.DISABLED },
];

const ExpressManagementTab: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingExpress, setEditingExpress] = useState<ExpressDTO | undefined>();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  // Handle Add
  const handleAdd = () => {
    setModalMode('create');
    setEditingExpress(undefined);
    form.resetFields();
    setModalVisible(true);
  };

  // Handle Edit
  const handleEdit = (record: ExpressDTO) => {
    setModalMode('edit');
    setEditingExpress(record);
    form.setFieldsValue({
      name: record.name,
      code: record.code,
      logo: record.logo,
      sort: record.sort,
      status: record.status,
    });
    setModalVisible(true);
  };

  // Handle Delete
  const handleDelete = async (id: number) => {
    try {
      const success = await deleteExpress(id);
      if (success) {
        message.success('删除快递公司成功');
        return true;
      } else {
        message.error('删除快递公司失败');
        return false;
      }
    } catch (error) {
      console.error('Failed to delete express:', error);
      message.error('删除快递公司失败');
      return false;
    }
  };

  // Handle Status Toggle
  const handleToggleStatus = async (record: ExpressDTO) => {
    const newStatus = record.status === EXPRESS_STATUS.ENABLED
      ? EXPRESS_STATUS.DISABLED
      : EXPRESS_STATUS.ENABLED;

    try {
      const success = await updateExpressStatus(record.id!, newStatus);
      if (success) {
        message.success(`${newStatus === EXPRESS_STATUS.ENABLED ? '启用' : '禁用'}成功`);
        return true;
      } else {
        message.error('更新状态失败');
        return false;
      }
    } catch (error) {
      console.error('Failed to update express status:', error);
      message.error('更新状态失败');
      return false;
    }
  };

  // Handle Modal Submit
  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const expressData: ExpressDTO = {
        id: editingExpress?.id,
        name: values.name,
        code: values.code,
        logo: values.logo,
        sort: values.sort || 0,
        status: values.status ?? EXPRESS_STATUS.ENABLED,
      };

      let success: boolean;
      if (modalMode === 'create') {
        success = await createExpress(expressData);
      } else {
        success = await updateExpress(expressData);
      }

      if (success) {
        message.success(`${modalMode === 'create' ? '创建' : '更新'}快递公司成功`);
        setModalVisible(false);
        form.resetFields();
        // Reload table - handled by ProTable's actionRef
        window.location.reload();
      } else {
        message.error(`${modalMode === 'create' ? '创建' : '更新'}快递公司失败`);
      }
    } catch (error) {
      console.error('Form validation failed or API error:', error);
      // Validation error handled by Ant Design Form
    } finally {
      setSaving(false);
    }
  };

  // ProTable columns
  const columns: ProColumns<ExpressDTO>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
      search: false,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      align: 'center',
      search: false,
    },
    {
      title: '编码',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      align: 'center',
      search: false,
    },
    {
      title: 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      width: 100,
      align: 'center',
      search: false,
      render: (logo?: string) => logo ? (
        <img src={logo} alt="logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
      ) : (
        <Text type="secondary">-</Text>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
      width: 80,
      align: 'center',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      search: false,
      render: (status: number) => (
        <Tag color={STATUS_COLORS[status] || 'default'}>
          {EXPRESS_STATUS_TEXT[status] || '未知'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      align: 'center',
      search: false,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      align: 'center',
      search: false,
      render: (_: unknown, record: ExpressDTO) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="删除后无法恢复，是否继续？"
            onConfirm={() => handleDelete(record.id!)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" size="small" danger>
              删除
            </Button>
          </Popconfirm>
          {record.status === EXPRESS_STATUS.ENABLED ? (
            <Button type="link" size="small" onClick={() => handleToggleStatus(record)}>
              禁用
            </Button>
          ) : (
            <Button type="link" size="small" onClick={() => handleToggleStatus(record)}>
              启用
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Fetch express list
  const fetchExpressList = async (params: {
    page?: number;
    pageSize?: number;
    status?: number | null;
    keyword?: string;
  }) => {
    try {
      const listParams: ExpressListParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        status: params.status,
        keyword: params.keyword,
      };

      // Import dynamically to avoid circular deps
      const { getExpressList } = await import('./services/logistics');
      const response = await getExpressList(listParams);

      return {
        data: response.records || [],
        total: response.total || 0,
        success: true,
      };
    } catch (error) {
      console.error('Failed to fetch express list:', error);
      message.error('加载快递公司列表失败');
      return { data: [], total: 0, success: false };
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <ProTable<ExpressDTO>
        rowKey="id"
        columns={columns}
        request={fetchExpressList}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
        }}
        search={{
          labelWidth: 'auto',
          filterType: 'query',
        }}
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            添加快递公司
          </Button>,
        ]}
        scroll={{ x: 1000 }}
      />

      {/* Create/Edit Modal */}
      <Modal
        title={modalMode === 'create' ? '添加快递公司' : '编辑快递公司'}
        open={modalVisible}
        onOk={handleModalSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        confirmLoading={saving}
        okText={modalMode === 'create' ? '创建' : '保存'}
        cancelText="取消"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            sort: 0,
            status: EXPRESS_STATUS.ENABLED,
          }}
        >
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入快递公司名称' }]}
          >
            <AntInput placeholder="如：顺丰速运" />
          </Form.Item>
          <Form.Item
            name="code"
            label="编码"
            rules={[
              { required: true, message: '请输入快递公司编码' },
              { pattern: /^[A-Z0-9_]+$/, message: '编码只能包含大写字母、数字和下划线' },
            ]}
          >
            <AntInput placeholder="如：SF" disabled={modalMode === 'edit'} />
          </Form.Item>
          <Form.Item
            name="logo"
            label="Logo URL"
          >
            <AntInput placeholder="https://example.com/logo.png" />
          </Form.Item>
          <Form.Item
            name="sort"
            label="排序"
          >
            <InputNumber min={0} max={9999} style={{ width: 200 }} />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
          >
            <Select options={STATUS_OPTIONS.filter(o => o.value !== -1)} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// ============= Main Logistics Page =============

const LogisticsPage: React.FC = () => {
  return (
    <Tabs defaultActiveKey="tracking" type="card" size="large">
      <TabPane tab="物流跟踪" key="tracking">
        <LogisticsTrackingTab />
      </TabPane>
      <TabPane tab="快递公司管理" key="express">
        <ExpressManagementTab />
      </TabPane>
    </Tabs>
  );
};

export default LogisticsPage;