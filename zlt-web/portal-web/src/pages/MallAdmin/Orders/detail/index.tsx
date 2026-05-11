/**
 * 订单详情页 - ADMIN-03-10
 * Read-only view of complete order information
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'umi';
import { Card, Descriptions, Table, Tag, Button, Space, Spin, message, Timeline, Divider } from 'antd';
import { ArrowLeftOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';
import {
  getOrderDetail,
  OrderDetailDTO,
  OrderItemDTO,
  ORDER_STATUS,
  ORDER_STATUS_TEXT,
} from '../services/orders';
import { GOODS_TYPE_TEXT } from '../../Goods/services/goods';

const { Text } = require('antd');

// Parse specs JSON to display string
const parseSpecs = (specsJson: string | undefined): string => {
  if (!specsJson) return '-';
  try {
    const specs = JSON.parse(specsJson);
    return Object.entries(specs)
      .map(([key, value]) => `${key}:${value}`)
      .join(', ');
  } catch {
    return specsJson;
  }
};

// Status tag color mapping
const STATUS_COLORS: Record<number, string> = {
  [ORDER_STATUS.PENDING_PAYMENT]: 'warning',
  [ORDER_STATUS.PAID]: 'processing',
  [ORDER_STATUS.SHIPPED]: 'blue',
  [ORDER_STATUS.COMPLETED]: 'success',
  [ORDER_STATUS.CANCELLED]: 'default',
};

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetailDTO | null>(null);

  // Fetch order detail
  useEffect(() => {
    if (!id) {
      message.error('订单ID不存在');
      navigate('/mall-admin/orders');
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await getOrderDetail(parseInt(id, 10));
        if (!data) {
          message.error('订单不存在');
          navigate('/mall-admin/orders');
          return;
        }
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order detail:', error);
        message.error('加载订单详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, navigate]);

  // Order items table columns
  const itemColumns: ColumnsType<OrderItemDTO> = [
    {
      title: '商品信息',
      key: 'goodsInfo',
      width: 300,
      render: (_: unknown, record: OrderItemDTO) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.goodsName}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>{parseSpecs(record.specs)}</Text>
        </div>
      ),
    },
    {
      title: '图片',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image: string) => image ? <img src={image} alt="" style={{ width: 50, height: 50, objectFit: 'cover' }} /> : '-',
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      align: 'right',
      render: (price: string) => `¥${parseFloat(price).toFixed(2)}`,
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center',
    },
    {
      title: '小计',
      dataIndex: 'subtotal',
      key: 'subtotal',
      width: 120,
      align: 'right',
      render: (subtotal: string) => <Text strong>¥{parseFloat(subtotal).toFixed(2)}</Text>,
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>加载中...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/mall-admin/orders')}>
          返回订单列表
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Action buttons */}
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/mall-admin/orders')}>
          返回
        </Button>
      </Space>

      {/* Basic order info card */}
      <Card title="订单基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="订单ID">{order.id}</Descriptions.Item>
          <Descriptions.Item label="订单号">
            <Text copyable style={{ fontFamily: 'monospace' }}>{order.orderNo}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="用户ID">{order.userId}</Descriptions.Item>
          <Descriptions.Item label="商品类型">
            <Tag>{GOODS_TYPE_TEXT[order.goodsType] || '未知'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="订单状态">
            <Tag color={STATUS_COLORS[order.status] || 'default'}>
              {order.statusDesc || ORDER_STATUS_TEXT[order.status] || '未知'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="下单时间">{order.createTime}</Descriptions.Item>
          <Descriptions.Item label="总金额">¥{parseFloat(order.totalAmount).toFixed(2)}</Descriptions.Item>
          <Descriptions.Item label="实付金额">
            <Text strong style={{ color: '#cf1322' }}>¥{parseFloat(order.payAmount).toFixed(2)}</Text>
          </Descriptions.Item>
          {order.freightAmount && parseFloat(order.freightAmount) > 0 && (
            <Descriptions.Item label="运费">¥{parseFloat(order.freightAmount).toFixed(2)}</Descriptions.Item>
          )}
          {order.remark && (
            <Descriptions.Item label="用户备注" span={2}>
              <Text type="secondary">{order.remark}</Text>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Payment info */}
      {order.payTime && (
        <Card title="支付信息" style={{ marginBottom: 16 }}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="支付时间">{order.payTime}</Descriptions.Item>
            <Descriptions.Item label="支付状态">
              <Tag icon={<CheckCircleFilled />} color="success">已支付</Tag>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Delivery info (physical goods) */}
      {order.goodsType === 1 && (
        <Card title="收货地址" style={{ marginBottom: 16 }}>
          <Descriptions bordered>
            <Descriptions.Item label="收货人">{order.addressName || '-'}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{order.addressPhone || '-'}</Descriptions.Item>
            <Descriptions.Item label="详细地址" span={2}>{order.addressDetail || '-'}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Shipping info */}
      {order.shipTime && (
        <Card title="物流信息" style={{ marginBottom: 16 }}>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="发货时间">{order.shipTime}</Descriptions.Item>
            {order.delivery && (
              <>
                <Descriptions.Item label="物流公司">{order.delivery.expressName}</Descriptions.Item>
                <Descriptions.Item label="运单号">
                  <Text copyable style={{ fontFamily: 'monospace' }}>{order.delivery.waybillNo}</Text>
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        </Card>
      )}

      {/* Order items card */}
      <Card title={`订单商品（${order.items?.length || 0}件）`} style={{ marginBottom: 16 }}>
        <Table
          columns={itemColumns}
          dataSource={order.items || []}
          rowKey="id"
          pagination={false}
          size="small"
        />
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Text>商品总金额：</Text>
          <Text strong style={{ fontSize: 16, color: '#cf1322' }}>
            ¥{parseFloat(order.totalAmount).toFixed(2)}
          </Text>
        </div>
      </Card>

      {/* Timeline */}
      <Card title="订单时间线">
        <Timeline
          items={[
            order.createTime && {
              color: 'green',
              children: `下单时间：${order.createTime}`,
            },
            order.payTime && {
              color: 'blue',
              children: `支付时间：${order.payTime}`,
            },
            order.shipTime && {
              color: 'blue',
              children: `发货时间：${order.shipTime}`,
            },
            order.completeTime && {
              color: 'green',
              children: `完成时间：${order.completeTime}`,
            },
          ].filter(Boolean)}
        />
      </Card>
    </div>
  );
};

export default OrderDetailPage;