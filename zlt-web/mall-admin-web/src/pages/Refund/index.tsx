/**
 * 退款审核列表页 - ADMIN-06-02
 * ProTable with status tabs, date range filter, search, approve/reject actions
 */
import React, { useState, useRef } from 'react';
import { Tabs, Tag, Button, Space, message, Modal, Input, Popconfirm } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ActionRef } from '@ant-design/pro-components';
import { request } from '@/utils/request';
import type { RefundListDTO, PageResponse } from './services/refund';
import { REFUND_STATUS, REFUND_STATUS_TEXT } from './services/refund';
import type { ColumnsType } from 'antd/lib/table';
import { EyeOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { TextArea } = Input;

// Status tag color mapping
const STATUS_COLORS: Record<number, string> = {
  [REFUND_STATUS.PENDING]: 'warning',     // 待审核 - orange
  [REFUND_STATUS.APPROVED]: 'processing',  // 已通过 - blue
  [REFUND_STATUS.REJECTED]: 'error',       // 已拒绝 - red
  [REFUND_STATUS.COMPLETED]: 'success',   // 已退款 - green
};

// Tab configurations
const TABS = [
  { key: 'all', label: '全部' },
  { key: String(REFUND_STATUS.PENDING), label: '待审核' },
  { key: String(REFUND_STATUS.APPROVED), label: '已通过' },
  { key: String(REFUND_STATUS.REJECTED), label: '已拒绝' },
  { key: String(REFUND_STATUS.COMPLETED), label: '已退款' },
];

// Refund reason options
const REFUND_REASONS = [
  { label: '商品损坏', value: '商品损坏' },
  { label: '商品与描述不符', value: '商品与描述不符' },
  { label: '错拍/多拍', value: '错拍/多拍' },
  { label: '不想买了', value: '不想买了' },
  { label: '其他', value: '其他' },
];

// Format money display
const formatMoney = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `¥${num.toFixed(2)}`;
};

const RefundListPage: React.FC = () => {
  const actionRef = useRef<ActionRef>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState<RefundListDTO | null>(null);
  const [approveModalVisible, setApproveModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [approveRemark, setApproveRemark] = useState('');
  const [rejectRemark, setRejectRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get status value from tab key
  const getStatusValue = (key: string): number | null => {
    if (key === 'all') return null;
    return parseInt(key, 10);
  };

  // View refund detail
  const handleViewDetail = (record: RefundListDTO) => {
    setSelectedRefund(record);
    setDetailModalVisible(true);
  };

  // Approve refund
  const handleApprove = async () => {
    if (!selectedRefund) return;
    setSubmitting(true);
    try {
      // TODO: Wire up real API when Wave 2 is implemented
      // const success = await approveRefund(selectedRefund.id, approveRemark);
      console.log('Approve refund:', selectedRefund.id, approveRemark);
      message.success('退款申请已通过');
      setApproveModalVisible(false);
      setApproveRemark('');
      actionRef.current?.reload();
    } catch (error) {
      console.error('Failed to approve refund:', error);
      message.error('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // Reject refund
  const handleReject = async () => {
    if (!selectedRefund) return;
    if (!rejectRemark.trim()) {
      message.warning('请输入拒绝原因');
      return;
    }
    setSubmitting(true);
    try {
      // TODO: Wire up real API when Wave 2 is implemented
      // const success = await rejectRefund(selectedRefund.id, rejectRemark);
      console.log('Reject refund:', selectedRefund.id, rejectRemark);
      message.success('退款申请已拒绝');
      setRejectModalVisible(false);
      setRejectRemark('');
      actionRef.current?.reload();
    } catch (error) {
      console.error('Failed to reject refund:', error);
      message.error('操作失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  // Open approve modal
  const openApproveModal = (record: RefundListDTO) => {
    setSelectedRefund(record);
    setApproveRemark('');
    setApproveModalVisible(true);
  };

  // Open reject modal
  const openRejectModal = (record: RefundListDTO) => {
    setSelectedRefund(record);
    setRejectRemark('');
    setRejectModalVisible(true);
  };

  // Fetch refund list data
  const fetchRefundList = async (params: {
    page?: number;
    pageSize?: number;
    orderId?: number;
    status?: number | null;
    startTime?: string;
    endTime?: string;
  }) => {
    try {
      const response = await request<{ datas?: PageResponse<RefundListDTO> }>('/api/mall/admin/refund/list', {
        method: 'GET',
        params: {
          page: params.page || 1,
          pageSize: params.pageSize || 20,
          orderId: params.orderId,
          status: getStatusValue(activeTab),
          startTime: params.startTime,
          endTime: params.endTime,
        },
      });

      const data = response.datas || { records: [], total: 0, size: 20, current: 1 };
      return {
        data: data.records || [],
        total: data.total || 0,
        success: true,
      };
    } catch (error) {
      console.error('Failed to fetch refund list:', error);
      message.error('加载退款列表失败');
      return { data: [], total: 0, success: false };
    }
  };

  // Tab change handler
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    actionRef.current?.reload();
  };

  // ProTable columns
  const columns: ColumnsType<RefundListDTO> = [
    {
      title: '退款ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      copyable: true,
      width: 180,
      fixed: 'left',
    },
    {
      title: '用户',
      dataIndex: 'userName',
      key: 'userName',
      width: 100,
      align: 'center',
    },
    {
      title: '退款金额',
      dataIndex: 'refundAmount',
      key: 'refundAmount',
      width: 120,
      align: 'right',
      render: (amount: string) => formatMoney(amount),
    },
    {
      title: '退款原因',
      dataIndex: 'refundReason',
      key: 'refundReason',
      width: 120,
      align: 'center',
    },
    {
      title: '退款说明',
      dataIndex: 'refundDesc',
      key: 'refundDesc',
      ellipsis: true,
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'statusDesc',
      key: 'statusDesc',
      width: 100,
      align: 'center',
      render: (text: string, record: RefundListDTO) => (
        <Tag color={STATUS_COLORS[record.status] || 'default'}>{text}</Tag>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'applyTime',
      key: 'applyTime',
      width: 160,
      align: 'center',
      valueType: 'dateTime',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      align: 'center',
      fixed: 'right',
      render: (_: unknown, record: RefundListDTO) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          {record.status === REFUND_STATUS.PENDING && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => openApproveModal(record)}
              >
                通过
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => openRejectModal(record)}
              >
                拒绝
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        type="card"
        size="large"
      >
        {TABS.map((tab) => (
          <TabPane tab={tab.label} key={tab.key}>
            <ProTable
              actionRef={actionRef}
              rowKey="id"
              columns={columns}
              request={fetchRefundList}
              pagination={{
                pageSize: 20,
                showSizeChanger: false,
              }}
              search={{
                labelWidth: 'auto',
                filterType: 'query',
              }}
              scroll={{ x: 1200 }}
              toolBarRender={() => [
                <Space key="info">
                  <span style={{ color: '#888', fontSize: 12 }}>
                    筛选退款申请进行审核处理
                  </span>
                </Space>,
              ]}
            />
          </TabPane>
        ))}
      </Tabs>

      {/* Detail Modal */}
      <Modal
        title="退款详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        {selectedRefund && (
          <div>
            <p><strong>退款ID：</strong>{selectedRefund.id}</p>
            <p><strong>订单号：</strong>{selectedRefund.orderNo}</p>
            <p><strong>用户：</strong>{selectedRefund.userName} (ID: {selectedRefund.userId})</p>
            <p><strong>退款金额：</strong>{formatMoney(selectedRefund.refundAmount)}</p>
            <p><strong>退款原因：</strong>{selectedRefund.refundReason}</p>
            <p><strong>退款说明：</strong>{selectedRefund.refundDesc}</p>
            <p><strong>状态：</strong><Tag color={STATUS_COLORS[selectedRefund.status]}>{selectedRefund.statusDesc}</Tag></p>
            <p><strong>申请时间：</strong>{selectedRefund.applyTime}</p>
            {selectedRefund.handleTime && (
              <p><strong>处理时间：</strong>{selectedRefund.handleTime}</p>
            )}
            {selectedRefund.handleRemark && (
              <p><strong>处理备注：</strong>{selectedRefund.handleRemark}</p>
            )}
          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        title="通过退款申请"
        open={approveModalVisible}
        onCancel={() => setApproveModalVisible(false)}
        confirmLoading={submitting}
        onOk={handleApprove}
      >
        {selectedRefund && (
          <div>
            <p>确定通过退款申请 <strong>#{selectedRefund.id}</strong> 吗？</p>
            <p>订单号：{selectedRefund.orderNo}</p>
            <p>退款金额：{formatMoney(selectedRefund.refundAmount)}</p>
            <div style={{ marginTop: 16 }}>
              <label>备注（可选）：</label>
              <TextArea
                rows={3}
                value={approveRemark}
                onChange={(e) => setApproveRemark(e.target.value)}
                placeholder="输入处理备注..."
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="拒绝退款申请"
        open={rejectModalVisible}
        onCancel={() => setRejectModalVisible(false)}
        confirmLoading={submitting}
        onOk={handleReject}
      >
        {selectedRefund && (
          <div>
            <p>确定拒绝退款申请 <strong>#{selectedRefund.id}</strong> 吗？</p>
            <p>订单号：{selectedRefund.orderNo}</p>
            <p>退款金额：{formatMoney(selectedRefund.refundAmount)}</p>
            <div style={{ marginTop: 16 }}>
              <label>拒绝原因（必填）：</label>
              <TextArea
                rows={3}
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                placeholder="输入拒绝原因..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RefundListPage;