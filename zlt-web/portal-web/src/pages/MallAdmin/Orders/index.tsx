/**
 * 订单列表页 - ADMIN-03-01
 * ProTable with status tabs, date range filter, search
 */
import React, { useState, useRef } from 'react';
import { useNavigate } from 'umi';
import { Tabs, Tag, Button, Space, message } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import type { ActionRef } from '@ant-design/pro-components';
import { request } from '@/utils/request';
import type { OrderListDTO, PageResponse } from './services/orders';
import { ORDER_STATUS, ORDER_STATUS_TEXT } from './services/orders';
import type { ColumnsType } from 'antd/lib/table';
import { FileTextOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

// Status tag color mapping
const STATUS_COLORS: Record<number, string> = {
  [ORDER_STATUS.PENDING_PAYMENT]: 'warning',   // 待付款 - orange
  [ORDER_STATUS.PAID]: 'processing',          // 已付款 - blue
  [ORDER_STATUS.SHIPPED]: 'blue',              // 已发货 - blue
  [ORDER_STATUS.COMPLETED]: 'success',         // 已完成 - green
  [ORDER_STATUS.CANCELLED]: 'default',        // 已取消 - gray
};

// Tab configurations
const TABS = [
  { key: 'all', label: '全部' },
  { key: String(ORDER_STATUS.PENDING_PAYMENT), label: '待付款' },
  { key: String(ORDER_STATUS.PAID), label: '已付款' },
  { key: String(ORDER_STATUS.SHIPPED), label: '已发货' },
  { key: String(ORDER_STATUS.COMPLETED), label: '已完成' },
  { key: String(ORDER_STATUS.CANCELLED), label: '已取消' },
];

const OrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const actionRef = useRef<ActionRef>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  // Get status value from tab key
  const getStatusValue = (key: string): number | null => {
    if (key === 'all') return null;
    return parseInt(key, 10);
  };

  // Format money display
  const formatMoney = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `¥${num.toFixed(2)}`;
  };

  // ProTable columns
  const columns: ColumnsType<OrderListDTO> = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      copyable: true,
      width: 180,
      fixed: 'left',
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
      align: 'center',
    },
    {
      title: '商品类型',
      dataIndex: 'goodsTypeDesc',
      key: 'goodsTypeDesc',
      width: 100,
      align: 'center',
    },
    {
      title: '订单总额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      align: 'right',
      render: (amount: string) => formatMoney(amount),
    },
    {
      title: '实付金额',
      dataIndex: 'payAmount',
      key: 'payAmount',
      width: 120,
      align: 'right',
      render: (amount: string) => formatMoney(amount),
    },
    {
      title: '状态',
      dataIndex: 'statusDesc',
      key: 'statusDesc',
      width: 100,
      align: 'center',
      render: (text: string, record: OrderListDTO) => (
        <Tag color={STATUS_COLORS[record.status] || 'default'}>{text}</Tag>
      ),
    },
    {
      title: '下单时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      align: 'center',
      valueType: 'dateTime',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      align: 'center',
      fixed: 'right',
      render: (_: unknown, record: OrderListDTO) => (
        <Button
          type="link"
          size="small"
          icon={<FileTextOutlined />}
          onClick={() => navigate(`/mall-admin/orders/detail/${record.id}`)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  // Fetch order list data
  const fetchOrderList = async (params: {
    page?: number;
    pageSize?: number;
    orderNo?: string;
    status?: number | null;
    startTime?: string;
    endTime?: string;
    keyword?: string;
  }) => {
    try {
      const response = await request<{ datas?: PageResponse<OrderListDTO> }>('/api-mall/api/mall/admin/order/list', {
        method: 'GET',
        params: {
          page: params.page || 1,
          pageSize: params.pageSize || 20,
          orderNo: params.orderNo,
          status: getStatusValue(activeTab),
          startTime: params.startTime,
          endTime: params.endTime,
          keyword: params.keyword,
        },
      });

      const data = response.datas || { records: [], total: 0, size: 20, current: 1 };
      return {
        data: data.records || [],
        total: data.total || 0,
        success: true,
      };
    } catch (error) {
      console.error('Failed to fetch order list:', error);
      message.error('加载订单列表失败');
      return { data: [], total: 0, success: false };
    }
  };

  // Tab change handler
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    actionRef.current?.reload();
  };

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
              request={fetchOrderList}
              pagination={{
                pageSize: 20,
                showSizeChanger: false,
              }}
              search={{
                labelWidth: 'auto',
                filterType: 'query',
              }}
              scroll={{ x: 1000 }}
              toolBarRender={() => [
                <Space key="actions">
                  <span style={{ color: '#888', fontSize: 12 }}>
                    共 {(actionRef.current as unknown as { reload?: () => void }) ? '' : '0'} 个订单
                  </span>
                </Space>,
              ]}
            />
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default OrderListPage;
