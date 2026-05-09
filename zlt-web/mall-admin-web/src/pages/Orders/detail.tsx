/**
 * 订单详情页 - ADMIN-03-02, ADMIN-03-06
 * Order detail with items, address, payment, delivery info and action buttons
 */
import React, { useState, useEffect } from 'react';
import { useParams, history } from 'umi';
import {
  Card,
  Row,
  Col,
  Descriptions,
  Table,
  Tag,
  Button,
  Space,
  message,
  Alert,
  Spin,
  Divider,
  Modal,
  Input,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  CloseCircleOutlined,
  CarOutlined,
  CommentOutlined,
} from '@ant-design/icons';
import { getOrderDetail, ORDER_STATUS } from './services/orders';
import type { OrderDetailDTO, OrderItemDTO } from './services/orders';
import PriceEditor from './components/PriceEditor';
import ShipModal from './components/ShipModal';
import CloseModal from './components/CloseModal';

const { TextArea } = Input;

// Status tag color mapping
const STATUS_COLORS: Record<number, string> = {
  [ORDER_STATUS.PENDING_PAYMENT]: 'warning',
  [ORDER_STATUS.PAID]: 'processing',
  [ORDER_STATUS.SHIPPED]: 'blue',
  [ORDER_STATUS.COMPLETED]: 'success',
  [ORDER_STATUS.CANCELLED]: 'default',
};

// Status flow timeline
const STATUS_TIMELINE = [
  { status: 1, label: '待付款', icon: 'clock' },
  { status: 2, label: '已付款', icon: 'check' },
  { status: 3, label: '已发货', icon: 'car' },
  { status: 4, label: '已完成', icon: 'flag' },
  { status: 5, label: '已取消', icon: 'close' },
];

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [orderDetail, setOrderDetail] = useState<OrderDetailDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [remarkModalVisible, setRemarkModalVisible] = useState<boolean>(false);
  const [remarkText, setRemarkText] = useState<string>('');
  const [priceEditorVisible, setPriceEditorVisible] = useState<boolean>(false);
  const [shipModalVisible, setShipModalVisible] = useState<boolean>(false);
  const [closeModalVisible, setCloseModalVisible] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Fetch order detail on mount
  useEffect(() => {
    fetchDetail();
  }, [id]);

  // Fetch order detail
  const fetchDetail = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await getOrderDetail(parseInt(id, 10));
      setOrderDetail(data);
      if (data) {
        setRemarkText(data.remark || '');
      }
    } catch (error) {
      console.error('Failed to fetch order detail:', error);
      message.error('加载订单详情失败');
    } finally {
      setLoading(false);
    }
  };

  // Format money
  const formatMoney = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `¥${num.toFixed(2)}`;
  };

  // Parse specs JSON
  const parseSpecs = (specs: string): Record<string, string> => {
    try {
      return JSON.parse(specs);
    } catch {
      return {};
    }
  };

  // Check if action button should be shown based on status
  const canShip = orderDetail?.status === ORDER_STATUS.PAID;
  const canAdjustPrice = [ORDER_STATUS.PENDING_PAYMENT, ORDER_STATUS.PAID, ORDER_STATUS.SHIPPED].includes(orderDetail?.status || 0);
  const canClose = [ORDER_STATUS.PENDING_PAYMENT, ORDER_STATUS.PAID].includes(orderDetail?.status || 0);

  // Order items columns
  const itemColumns = [
    {
      title: '商品图片',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image: string) =>
        image ? (
          <img src={image} alt="商品图片" style={{ width: 60, height: 60, objectFit: 'cover' }} />
        ) : (
          <span>-</span>
        ),
    },
    {
      title: '商品名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: 200,
    },
    {
      title: '规格',
      dataIndex: 'specs',
      key: 'specs',
      width: 150,
      render: (specs: string) => {
        const specsObj = parseSpecs(specs);
        return (
          <div>
            {Object.entries(specsObj).map(([key, value]) => (
              <div key={key}>
                {key}: {value}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      title: '单价',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      align: 'right',
      render: (price: string) => formatMoney(price),
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
      width: 100,
      align: 'right',
      render: (subtotal: string) => formatMoney(subtotal),
    },
  ];

  // Get status flow step
  const getStatusStep = (status: number): number => {
    const index = STATUS_TIMELINE.findIndex((s) => s.status === status);
    return index >= 0 ? index : 0;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" tip="加载订单详情..." />
      </div>
    );
  }

  if (!orderDetail) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Alert type="error" message="订单不存在或加载失败" />
        <Button type="primary" onClick={() => history.back()} style={{ marginTop: 16 }}>
          返回
        </Button>
      </div>
    );
  }

  const currentStep = getStatusStep(orderDetail.status);

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => history.back()}>
          返回
        </Button>
      </div>

      {/* Virtual goods notice */}
      {orderDetail.goodsType === 2 && (
        <Alert
          message="虚拟商品订单"
          description="虚拟商品订单在支付成功后自动完成，无需手动确认收货"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Order Status Card */}
      <Card title="订单状态" style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Tag color={STATUS_COLORS[orderDetail.status]} style={{ fontSize: 16, padding: '4px 16px' }}>
              {orderDetail.statusDesc}
            </Tag>
            <div style={{ marginTop: 16 }}>
              {STATUS_TIMELINE.map((step, index) => (
                <span key={step.status} style={{ color: index <= currentStep ? '#1890ff' : '#ccc' }}>
                  {step.label}
                  {index < STATUS_TIMELINE.length - 1 && ' → '}
                </span>
              ))}
            </div>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <div>订单号: {orderDetail.orderNo}</div>
            <div style={{ color: '#888' }}>下单时间: {orderDetail.createTime}</div>
          </Col>
        </Row>
      </Card>

      {/* Order Info */}
      <Row gutter={16}>
        {/* Basic Info */}
        <Col span={12}>
          <Card title="订单信息">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="订单号">{orderDetail.orderNo}</Descriptions.Item>
              <Descriptions.Item label="用户ID">{orderDetail.userId}</Descriptions.Item>
              <Descriptions.Item label="商品类型">{orderDetail.goodsTypeDesc}</Descriptions.Item>
              <Descriptions.Item label="下单时间">{orderDetail.createTime}</Descriptions.Item>
              {orderDetail.payTime && (
                <Descriptions.Item label="支付时间">{orderDetail.payTime}</Descriptions.Item>
              )}
              {orderDetail.shipTime && (
                <Descriptions.Item label="发货时间">{orderDetail.shipTime}</Descriptions.Item>
              )}
              {orderDetail.completeTime && (
                <Descriptions.Item label="完成时间">{orderDetail.completeTime}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        {/* Amount Info */}
        <Col span={12}>
          <Card title="金额信息">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="商品总额">
                {formatMoney(orderDetail.totalAmount)}
              </Descriptions.Item>
              <Descriptions.Item label="运费">
                {formatMoney(orderDetail.freightAmount || '0')}
              </Descriptions.Item>
              <Descriptions.Item label="应付金额">
                <strong>{formatMoney(orderDetail.totalAmount)}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="实付金额">
                <strong style={{ color: '#f5222d', fontSize: 18 }}>
                  {formatMoney(orderDetail.payAmount)}
                </strong>
                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => setPriceEditorVisible(true)}
                  disabled={!canAdjustPrice}
                >
                  改价
                </Button>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Address Info (for physical goods) */}
      {orderDetail.goodsType === 1 && orderDetail.addressDetail && (
        <Card title="收货地址" style={{ marginTop: 16 }}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="收货人">{orderDetail.addressName}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{orderDetail.addressPhone}</Descriptions.Item>
            <Descriptions.Item label="收货地址">{orderDetail.addressDetail}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Delivery Info (if shipped) */}
      {orderDetail.delivery && (
        <Card title="物流信息" style={{ marginTop: 16 }}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="快递公司">{orderDetail.delivery.expressName}</Descriptions.Item>
            <Descriptions.Item label="快递编码">{orderDetail.delivery.expressCode}</Descriptions.Item>
            <Descriptions.Item label="运单号">{orderDetail.delivery.waybillNo}</Descriptions.Item>
            <Descriptions.Item label="发货时间">{orderDetail.delivery.createTime}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* Order Items */}
      <Card title="商品明细" style={{ marginTop: 16 }}>
        <Table
          rowKey="id"
          columns={itemColumns}
          dataSource={orderDetail.items || []}
          pagination={false}
          size="small"
        />
      </Card>

      {/* Admin Remark */}
      <Card title="管理员备注" style={{ marginTop: 16 }}>
        <TextArea
          rows={3}
          value={remarkText}
          onChange={(e) => setRemarkText(e.target.value)}
          placeholder="添加备注信息..."
          disabled
        />
        <div style={{ marginTop: 8 }}>
          <Button
            type="primary"
            icon={<CommentOutlined />}
            onClick={() => setRemarkModalVisible(true)}
          >
            添加备注
          </Button>
        </div>
      </Card>

      {/* Action Buttons */}
      <Card style={{ marginTop: 16 }}>
        <Space size="large">
          <Button onClick={() => history.back()}>返回</Button>

          {canShip && (
            <Button type="primary" icon={<CarOutlined />} onClick={() => setShipModalVisible(true)}>
              发货
            </Button>
          )}

          {canAdjustPrice && (
            <Button icon={<EditOutlined />} onClick={() => setPriceEditorVisible(true)}>
              改价
            </Button>
          )}

          <Button icon={<CommentOutlined />} onClick={() => setRemarkModalVisible(true)}>
            备注
          </Button>

          {canClose && (
            <Button danger icon={<CloseCircleOutlined />} onClick={() => setCloseModalVisible(true)}>
              关单
            </Button>
          )}
        </Space>
      </Card>

      {/* Modals */}
      <PriceEditor
        visible={priceEditorVisible}
        orderId={orderDetail.id}
        currentAmount={orderDetail.payAmount}
        onCancel={() => setPriceEditorVisible(false)}
        onSuccess={() => {
          setPriceEditorVisible(false);
          fetchDetail();
        }}
      />

      <ShipModal
        visible={shipModalVisible}
        orderId={orderDetail.id}
        onCancel={() => setShipModalVisible(false)}
        onSuccess={() => {
          setShipModalVisible(false);
          fetchDetail();
        }}
      />

      <CloseModal
        visible={closeModalVisible}
        orderId={orderDetail.id}
        onCancel={() => setCloseModalVisible(false)}
        onSuccess={() => {
          setCloseModalVisible(false);
          fetchDetail();
        }}
      />

      {/* Remark Modal */}
      <Modal
        title="添加备注"
        open={remarkModalVisible}
        onCancel={() => setRemarkModalVisible(false)}
        onOk={async () => {
          setSubmitting(true);
          try {
            const { addAdminRemark } = await import('./services/orders');
            const success = await addAdminRemark(orderDetail.id, remarkText);
            if (success) {
              message.success('备注添加成功');
              setRemarkModalVisible(false);
              fetchDetail();
            } else {
              message.error('备注添加失败');
            }
          } catch (error) {
            message.error('备注添加失败');
          } finally {
            setSubmitting(false);
          }
        }}
        confirmLoading={submitting}
      >
        <TextArea
          rows={4}
          value={remarkText}
          onChange={(e) => setRemarkText(e.target.value)}
          placeholder="输入备注信息..."
        />
      </Modal>
    </div>
  );
};

export default OrderDetailPage;
