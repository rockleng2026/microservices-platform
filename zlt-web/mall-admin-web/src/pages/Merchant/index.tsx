/**
 * 商户管理页面 - ADMIN-09
 * 商户列表、审核、启用/禁用管理
 */
import React, { useState, useRef, useCallback } from 'react';
import { Tabs, Tag, Button, Space, Modal, Descriptions, Input, Select, message, Form } from 'antd';
import { SearchOutlined, EyeOutlined, CheckOutlined, CloseOutlined, StopOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionRef, ProColumns } from '@ant-design/pro-components';
import type { ColumnsType } from 'antd/lib/table';
import {
  getMerchantList,
  getMerchantDetail,
  reviewMerchant,
  MERCHANT_STATUS,
  MERCHANT_STATUS_TEXT,
  type MerchantDTO,
  type MerchantListParams,
  type MerchantReviewDTO,
} from './services/merchant';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

// Status tag color mapping
const STATUS_COLORS: Record<number, string> = {
  [MERCHANT_STATUS.PENDING_REVIEW]: 'warning',
  [MERCHANT_STATUS.APPROVED]: 'success',
  [MERCHANT_STATUS.REJECTED]: 'error',
  [MERCHANT_STATUS.DISABLED]: 'default',
};

// Tab configurations
const TABS = [
  { key: 'all', label: '全部' },
  { key: String(MERCHANT_STATUS.PENDING_REVIEW), label: '待审核' },
  { key: String(MERCHANT_STATUS.APPROVED), label: '已通过' },
  { key: String(MERCHANT_STATUS.REJECTED), label: '已拒绝' },
  { key: String(MERCHANT_STATUS.DISABLED), label: '已禁用' },
];

const MerchantListPage: React.FC = () => {
  const actionRef = useRef<ActionRef>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [keyword, setKeyword] = useState<string>('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<MerchantDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rejectVisible, setRejectVisible] = useState(false);
  const [rejectMerchant, setRejectMerchant] = useState<MerchantDTO | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);

  // Get status value from tab key
  const getStatusValue = (key: string): number | null => {
    if (key === 'all') return null;
    return parseInt(key, 10);
  };

  // Fetch merchant list data
  const fetchMerchantList = useCallback(async (params: {
    page?: number;
    pageSize?: number;
  }) => {
    try {
      const searchParams: MerchantListParams = {
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        status: getStatusValue(activeTab),
        keyword: keyword || undefined,
      };
      const data = await getMerchantList(searchParams);
      return {
        data: data.records || [],
        total: data.total || 0,
        success: true,
      };
    } catch (error) {
      console.error('Failed to fetch merchant list:', error);
      message.error('加载商户列表失败');
      return { data: [], total: 0, success: false };
    }
  }, [activeTab, keyword]);

  // Handle tab change
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    actionRef.current?.reload();
  };

  // Handle search
  const handleSearch = () => {
    actionRef.current?.reload();
  };

  // Handle keyword press enter
  const handleKeywordPressEnter = () => {
    handleSearch();
  };

  // Handle view detail
  const handleViewDetail = async (merchant: MerchantDTO) => {
    setDetailVisible(true);
    setDetailLoading(true);
    setSelectedMerchant(merchant);
    try {
      const detail = await getMerchantDetail(merchant.id);
      if (detail) {
        setSelectedMerchant(detail);
      }
    } catch (error) {
      console.error('Failed to fetch merchant detail:', error);
    } finally {
      setDetailLoading(false);
    }
  };

  // Handle close detail modal
  const handleCloseDetail = () => {
    setDetailVisible(false);
    setSelectedMerchant(null);
  };

  // Handle approve merchant
  const handleApprove = (merchant: MerchantDTO) => {
    Modal.confirm({
      title: '确认通过',
      content: `确定要通过商户「${merchant.merchantName}」的入驻申请吗？`,
      async onOk() {
        setActionLoading(true);
        try {
          const success = await reviewMerchant(merchant.id, { status: MERCHANT_STATUS.APPROVED });
          if (success) {
            message.success('商户审核通过');
            actionRef.current?.reload();
          } else {
            message.error('操作失败，请重试');
          }
        } catch (error) {
          console.error('Approve failed:', error);
          message.error('操作失败');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Handle reject - open modal
  const handleRejectClick = (merchant: MerchantDTO) => {
    setRejectMerchant(merchant);
    setRejectReason('');
    setRejectVisible(true);
  };

  // Handle confirm reject
  const handleConfirmReject = async () => {
    if (!rejectMerchant) return;
    if (!rejectReason.trim()) {
      message.error('请输入拒绝原因');
      return;
    }
    setRejectVisible(false);
    setActionLoading(true);
    try {
      const success = await reviewMerchant(rejectMerchant.id, {
        status: MERCHANT_STATUS.REJECTED,
        rejectReason: rejectReason.trim(),
      });
      if (success) {
        message.success('已拒绝商户入驻申请');
        actionRef.current?.reload();
      } else {
        message.error('操作失败，请重试');
      }
    } catch (error) {
      console.error('Reject failed:', error);
      message.error('操作失败');
    } finally {
      setActionLoading(false);
      setRejectMerchant(null);
      setRejectReason('');
    }
  };

  // Handle disable merchant
  const handleDisable = (merchant: MerchantDTO) => {
    Modal.confirm({
      title: '确认禁用',
      content: `确定要禁用商户「${merchant.merchantName}」吗？禁用后该商户将无法正常运营。`,
      async onOk() {
        setActionLoading(true);
        try {
          const success = await reviewMerchant(merchant.id, { status: MERCHANT_STATUS.DISABLED });
          if (success) {
            message.success('商户已禁用');
            actionRef.current?.reload();
          } else {
            message.error('操作失败，请重试');
          }
        } catch (error) {
          console.error('Disable failed:', error);
          message.error('操作失败');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // Handle enable merchant
  const handleEnable = (merchant: MerchantDTO) => {
    Modal.confirm({
      title: '确认启用',
      content: `确定要启用商户「${merchant.merchantName}」吗？`,
      async onOk() {
        setActionLoading(true);
        try {
          const success = await reviewMerchant(merchant.id, { status: MERCHANT_STATUS.APPROVED });
          if (success) {
            message.success('商户已启用');
            actionRef.current?.reload();
          } else {
            message.error('操作失败，请重试');
          }
        } catch (error) {
          console.error('Enable failed:', error);
          message.error('操作失败');
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  // ProTable columns
  const columns: ColumnsType<MerchantDTO> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
    },
    {
      title: '商户名称',
      dataIndex: 'merchantName',
      key: 'merchantName',
      width: 180,
      ellipsis: true,
    },
    {
      title: '商户编码',
      dataIndex: 'merchantCode',
      key: 'merchantCode',
      width: 140,
      ellipsis: true,
    },
    {
      title: '联系人',
      dataIndex: 'contactName',
      key: 'contactName',
      width: 100,
      align: 'center',
    },
    {
      title: '联系电话',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 130,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: number) => (
        <Tag color={STATUS_COLORS[status] || 'default'}>
          {MERCHANT_STATUS_TEXT[status] || '未知'}
        </Tag>
      ),
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      key: 'createTime',
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
      render: (_: unknown, record: MerchantDTO) => {
        const actions: React.ReactNode[] = [
          <Button
            key="view"
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>,
        ];

        // Pending review: Approve / Reject
        if (record.status === MERCHANT_STATUS.PENDING_REVIEW) {
          actions.push(
            <Button
              key="approve"
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record)}
              loading={actionLoading}
            >
              通过
            </Button>,
            <Button
              key="reject"
              type="link"
              size="small"
              danger
              icon={<CloseOutlined />}
              onClick={() => handleRejectClick(record)}
            >
              拒绝
            </Button>
          );
        }

        // Approved: Disable
        if (record.status === MERCHANT_STATUS.APPROVED) {
          actions.push(
            <Button
              key="disable"
              type="link"
              size="small"
              danger
              icon={<StopOutlined />}
              onClick={() => handleDisable(record)}
              loading={actionLoading}
            >
              禁用
            </Button>
          );
        }

        // Disabled: Enable
        if (record.status === MERCHANT_STATUS.DISABLED) {
          actions.push(
            <Button
              key="enable"
              type="link"
              size="small"
              icon={<PlayCircleOutlined />}
              onClick={() => handleEnable(record)}
              loading={actionLoading}
            >
              启用
            </Button>
          );
        }

        return <Space size="small">{actions}</Space>;
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={handleTabChange} style={{ marginBottom: 16 }}>
        {TABS.map((tab) => (
          <TabPane key={tab.key} tab={tab.label} />
        ))}
      </Tabs>

      {/* Search Filters */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="搜索商户名称/编码"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onPressEnter={handleKeywordPressEnter}
          style={{ width: 200 }}
          allowClear
          prefix={<SearchOutlined />}
        />
        <Button type="primary" onClick={handleSearch}>
          搜索
        </Button>
      </Space>

      {/* Merchant Table */}
      <ProTable
        columns={columns}
        rowKey="id"
        actionRef={actionRef}
        request={fetchMerchantList}
        pagination={{
          defaultPageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        scroll={{ x: 1200 }}
        search={false}
        toolBarRender={false}
      />

      {/* Detail Modal */}
      <Modal
        title="商户详情"
        open={detailVisible}
        onCancel={handleCloseDetail}
        footer={[
          <Button key="close" onClick={handleCloseDetail}>
            关闭
          </Button>,
        ]}
        width={680}
        loading={detailLoading}
      >
        {selectedMerchant && (
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="商户ID">{selectedMerchant.id}</Descriptions.Item>
            <Descriptions.Item label="商户编码">{selectedMerchant.merchantCode}</Descriptions.Item>
            <Descriptions.Item label="商户名称" span={2}>{selectedMerchant.merchantName}</Descriptions.Item>
            <Descriptions.Item label="联系人">{selectedMerchant.contactName}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{selectedMerchant.contactPhone}</Descriptions.Item>
            <Descriptions.Item label="联系邮箱">{selectedMerchant.contactEmail || '-'}</Descriptions.Item>
            <Descriptions.Item label="营业执照" span={2}>
              {selectedMerchant.businessLicense ? (
                <a href={selectedMerchant.businessLicense} target="_blank" rel="noopener noreferrer">
                  查看营业执照
                </a>
              ) : (
                '-'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={STATUS_COLORS[selectedMerchant.status] || 'default'}>
                {selectedMerchant.statusDesc || MERCHANT_STATUS_TEXT[selectedMerchant.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="审核时间">
              {selectedMerchant.reviewTime || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="拒绝原因" span={2}>
              {selectedMerchant.rejectReason || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{selectedMerchant.createTime}</Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {selectedMerchant.updateTime || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="拒绝入驻申请"
        open={rejectVisible}
        onCancel={() => setRejectVisible(false)}
        onOk={handleConfirmReject}
        okText="确认拒绝"
        okButtonProps={{ danger: true }}
      >
        <Form layout="vertical">
          <Form.Item label="拒绝原因" required>
            <TextArea
              rows={3}
              placeholder="请输入拒绝原因，将通知商户"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              maxLength={200}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MerchantListPage;
