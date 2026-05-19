import { PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { ActionType, ProColumns, ProTable } from '@ant-design/pro-table';
import { history } from 'umi';
import { message, Modal, Tabs, Tag, Button, Input, CopyOutlined } from 'antd';
import React, { useRef, useState } from 'react';
import { MallCouponTemplate, publishCoupon, offlineCoupon, CouponStatus, generateClaimCode } from './services/coupons';
import IssueModal from './components/IssueModal';
import StatisticsModal from './components/StatisticsModal';

const { TabPane } = Tabs;

/** 优惠券类型映射 */
const couponTypeMap = {
  1: { text: '满减券', status: 'Default' },
  2: { text: '折扣券', status: 'Processing' },
};

/** 优惠券状态映射 */
const couponStatusMap = {
  0: { text: '下架', status: 'Default' },
  1: { text: '发放中', status: 'Success' },
  2: { text: '已过期', status: 'Error' },
};

/** 有效期类型映射 */
const validTypeMap = {
  1: '固定时间',
  2: '领券后N天',
};

const CouponsPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [issueModalVisible, setIssueModalVisible] = useState(false);
  const [statisticsModalVisible, setStatisticsModalVisible] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<MallCouponTemplate | null>(null);

  /** 获取当前筛选的状态值 */
  const getStatusFilter = (): CouponStatus | undefined => {
    if (activeTab === 'all') return undefined;
    return parseInt(activeTab) as CouponStatus;
  };

  /** 刷新列表 */
  const reloadTable = () => {
    actionRef.current?.reload();
  };

  /** 处理发布优惠券 */
  const handlePublish = async (record: MallCouponTemplate) => {
    try {
      await publishCoupon(record.id);
      message.success('优惠券已发布');
      reloadTable();
    } catch (error) {
      message.error('发布失败');
    }
  };

  /** 处理下架优惠券 */
  const handleOffline = async (record: MallCouponTemplate) => {
    Modal.confirm({
      title: '确认下架',
      content: `确定要下架优惠券「${record.name}」吗？`,
      async onOk() {
        try {
          await offlineCoupon(record.id);
          message.success('优惠券已下架');
          reloadTable();
        } catch (error) {
          message.error('下架失败');
        }
      },
    });
  };

  /** 处理提前失效 */
  const handleExpireEarly = async (record: MallCouponTemplate) => {
    Modal.confirm({
      title: '确认提前失效',
      content: `确定要提前失效优惠券「${record.name}」吗？此操作将使优惠券立即失效。`,
      async onOk() {
        try {
          await offlineCoupon(record.id);
          message.success('优惠券已失效');
          reloadTable();
        } catch (error) {
          message.error('操作失败');
        }
      },
    });
  };

  /** 打开发放弹窗 */
  const handleOpenIssueModal = (record: MallCouponTemplate) => {
    setSelectedCoupon(record);
    setIssueModalVisible(true);
  };

  /** 打开统计弹窗 */
  const handleOpenStatisticsModal = (record: MallCouponTemplate) => {
    setSelectedCoupon(record);
    setStatisticsModalVisible(true);
  };

  /** 生成领取链接 - D-11 */
  const handleGenerateLink = async (record: MallCouponTemplate) => {
    try {
      const result = await generateClaimCode(record.id);
      Modal.success({
        title: '领取链接已生成',
        content: (
          <div>
            <p style={{ marginBottom: 8 }}>优惠券：{record.name}</p>
            <p style={{ marginBottom: 8 }}>领取码：{result.claimCode}</p>
            <p style={{ marginBottom: 8 }}>有效期至：{result.expireTime}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
              <Input.TextArea
                value={result.claimUrl}
                readOnly
                rows={1}
                style={{ flex: 1, fontSize: 12 }}
              />
              <Button
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(result.claimUrl);
                  message.success('链接已复制');
                }}
              >
                复制
              </Button>
            </div>
          </div>
        ),
        okText: '关闭',
      });
    } catch (error: any) {
      message.error(error?.message || '生成失败');
    }
  };

  /** 格式化金额/折扣显示 */
  const formatDiscount = (record: MallCouponTemplate): string => {
    if (record.type === 1) {
      return `¥${record.faceValue}`;
    } else {
      const rate = parseFloat(record.discountRate);
      return `${(rate * 10).toFixed(1)}折${record.maxDiscount ? ` (最高¥${record.maxDiscount})` : ''}`;
    }
  };

  const columns: ProColumns<MallCouponTemplate>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      copyable: true,
      hideInSearch: true,
    },
    {
      title: '优惠券名称',
      dataIndex: 'name',
      width: 180,
      copyable: true,
      hideInSearch: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueType: 'select',
      valueEnum: couponTypeMap,
      width: 100,
      hideInSearch: true,
      render: (_, record) => {
        const typeEnum = couponTypeMap[record.type];
        return <Tag>{typeEnum.text}</Tag>;
      },
    },
    {
      title: '面值/折扣',
      dataIndex: 'value',
      width: 140,
      hideInSearch: true,
      render: (_, record) => formatDiscount(record),
    },
    {
      title: '最低消费',
      dataIndex: 'minAmount',
      valueType: 'money',
      width: 120,
      hideInSearch: true,
    },
    {
      title: '总数量',
      dataIndex: 'totalCount',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '剩余数量',
      dataIndex: 'remainCount',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '每人限领',
      dataIndex: 'perUserLimit',
      width: 100,
      hideInSearch: true,
    },
    {
      title: '有效期类型',
      dataIndex: 'validType',
      valueType: 'select',
      valueEnum: validTypeMap,
      width: 120,
      hideInSearch: true,
      render: (_, record) => validTypeMap[record.validType],
    },
    {
      title: '有效期',
      dataIndex: 'validPeriod',
      width: 200,
      hideInSearch: true,
      render: (_, record) => {
        if (record.validType === 1) {
          return `${record.startTime} ~ ${record.endTime}`;
        } else {
          return `领券后${record.validDays}天`;
        }
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: couponStatusMap,
      width: 100,
      hideInSearch: true,
      render: (_, record) => {
        const statusEnum = couponStatusMap[record.status];
        return <Tag color={statusEnum.status === 'Success' ? 'success' : statusEnum.status === 'Error' ? 'error' : 'default'}>{statusEnum.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      width: 160,
      hideInSearch: true,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      key: 'actions',
      width: 280,
      hideInSearch: true,
      fixed: 'right',
      render: (_, record) => [
        <a key="edit" onClick={() => history.push(`/coupons/edit/${record.id}`)}>
          编辑
        </a>,
        record.status === 0 && (
          <a key="publish" onClick={() => handlePublish(record)} style={{ marginLeft: 8 }}>
            发布
          </a>
        ),
        record.status === 1 && (
          <>
            <a key="offline" onClick={() => handleOffline(record)} style={{ marginLeft: 8 }}>
              下架
            </a>
            <a key="expire" onClick={() => handleExpireEarly(record)} style={{ marginLeft: 8, color: '#ff4d4f' }}>
              提前失效
            </a>
          </>
        ),
        <a key="issue" onClick={() => handleOpenIssueModal(record)} style={{ marginLeft: 8 }}>
          发放
        </a>,
        <a key="statistics" onClick={() => handleOpenStatisticsModal(record)} style={{ marginLeft: 8 }}>
          统计
        </a>,
        <a key="link" onClick={() => handleGenerateLink(record)} style={{ marginLeft: 8, color: '#faad14' }}>
          生成链接
        </a>,
      ],
    },
  ];

  return (
    <PageContainer>
      <ProTable<MallCouponTemplate>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        search={false}
        pagination={false}
        toolBarRender={() => [
          <a key="create" onClick={() => history.push('/coupons/create')}>
            <PlusOutlined /> 创建优惠券
          </a>,
        ]}
        request={async (params) => {
          const status = getStatusFilter();
          const data = await import('./services/coupons').then(m => m.getCouponTemplateList(status));
          return { data, success: true };
        }}
        beforeSearch={(params) => {
          // 忽略分页参数，后端无分页
          return { ...params, page: undefined, pageSize: undefined };
        }}
        options={false}
        tableAlertRender={false}
      />
      {/* 状态 Tab 筛选 */}
      <div style={{ marginBottom: 16 }}>
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
          <TabPane tab="全部" key="all" />
          <TabPane tab="发放中" key="1" />
          <TabPane tab="已下架" key="0" />
          <TabPane tab="已过期" key="2" />
        </Tabs>
      </div>

      {/* 发放弹窗 */}
      <IssueModal
        visible={issueModalVisible}
        coupon={selectedCoupon}
        onClose={() => setIssueModalVisible(false)}
        onSuccess={reloadTable}
      />

      {/* 统计弹窗 */}
      <StatisticsModal
        visible={statisticsModalVisible}
        coupon={selectedCoupon}
        onClose={() => setStatisticsModalVisible(false)}
      />
    </PageContainer>
  );
};

export default CouponsPage;