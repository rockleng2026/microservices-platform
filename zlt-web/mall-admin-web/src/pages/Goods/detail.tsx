/**
 * 商品详情页 - ADMIN-02-10
 * Read-only view of complete product information and SKU list
 */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'umi';
import { Card, Descriptions, Image, Table, Tag, Button, Space, Spin, message } from 'antd';
import { ArrowLeftOutlined, EditOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';
import { getGoodsDetail, updateGoodsStatus, AdminGoodsDTO, GOODS_STATUS, GOODS_STATUS_TEXT, GOODS_TYPE_TEXT } from './services/goods';
import GoodsModal from './components/GoodsModal';

const { Meta } = Card;

// Parse images JSON string to array
const parseImages = (imagesStr?: string): string[] => {
  if (!imagesStr) return [];
  try {
    return JSON.parse(imagesStr);
  } catch {
    return [];
  }
};

// Parse specs JSON to display string
const parseSpecs = (specsJson: string): string => {
  try {
    const specs = JSON.parse(specsJson);
    return Object.entries(specs)
      .map(([key, value]) => `${key}:${value}`)
      .join(', ');
  } catch {
    return specsJson;
  }
};

interface SkuDTO {
  id?: number;
  skuCode?: string;
  specs: string;
  price: number | string;
  stock: number;
  image?: string;
  status?: number;
}

const GoodsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [goods, setGoods] = useState<AdminGoodsDTO | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch goods detail
  useEffect(() => {
    if (!id) {
      message.error('商品ID不存在');
      navigate('/goods');
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await getGoodsDetail(parseInt(id, 10));
        setGoods(data);
      } catch (error) {
        console.error('Failed to fetch goods detail:', error);
        message.error('加载商品详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id, navigate]);

  // Handle status toggle
  const handleToggleStatus = async () => {
    if (!goods) return;

    const targetStatus = goods.status === GOODS_STATUS.ONLINE ? GOODS_STATUS.OFFLINE : GOODS_STATUS.ONLINE;
    const actionText = targetStatus === GOODS_STATUS.ONLINE ? '上架' : '下架';

    setActionLoading(true);
    try {
      await updateGoodsStatus(goods.id, targetStatus);
      setGoods({ ...goods, status: targetStatus });
      message.success(`商品已${actionText}`);
    } catch (error) {
      console.error('Failed to update status:', error);
      message.error(`${actionText}失败`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle modal success
  const handleModalSuccess = () => {
    setModalVisible(false);
    // Reload data
    if (id) {
      getGoodsDetail(parseInt(id, 10)).then(setGoods).catch(console.error);
    }
  };

  // SKU table columns
  const skuColumns: ColumnsType<SkuDTO> = [
    {
      title: '规格组合',
      dataIndex: 'specs',
      key: 'specs',
      width: 200,
      render: (specs: string) => parseSpecs(specs),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'right',
      render: (price: number | string) => `¥${typeof price === 'string' ? parseFloat(price) : price.toFixed(2)}`,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      align: 'center',
    },
    {
      title: 'SKU编码',
      dataIndex: 'skuCode',
      key: 'skuCode',
      width: 150,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (status: number) => (
        <Tag color={status === 1 ? 'success' : 'default'}>
          {status === 1 ? '上架' : '下架'}
        </Tag>
      ),
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

  if (!goods) {
    return (
      <div style={{ textAlign: 'center', padding: 100 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/goods')}>
          返回商品列表
        </Button>
      </div>
    );
  }

  const imageList = parseImages(goods.images);

  return (
    <div style={{ padding: 24 }}>
      {/* Action buttons */}
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/goods')}>
          返回
        </Button>
        <Button type="primary" icon={<EditOutlined />} onClick={() => setModalVisible(true)}>
          编辑
        </Button>
        <Button
          type={goods.status === GOODS_STATUS.ONLINE ? 'default' : 'primary'}
          danger={goods.status === GOODS_STATUS.ONLINE}
          icon={goods.status === GOODS_STATUS.ONLINE ? <DownloadOutlined /> : <UploadOutlined />}
          loading={actionLoading}
          onClick={handleToggleStatus}
        >
          {goods.status === GOODS_STATUS.ONLINE ? '下架' : '上架'}
        </Button>
      </Space>

      {/* Basic info card */}
      <Card title="商品基本信息" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="商品ID">{goods.id}</Descriptions.Item>
          <Descriptions.Item label="商品名称">{goods.name}</Descriptions.Item>
          <Descriptions.Item label="副标题">{goods.subTitle || '-'}</Descriptions.Item>
          <Descriptions.Item label="分类ID">{goods.categoryId}</Descriptions.Item>
          <Descriptions.Item label="商品类型">
            <Tag color="blue">{GOODS_TYPE_TEXT[goods.goodsType] || '未知'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="价格">¥{typeof goods.price === 'string' ? parseFloat(goods.price) : goods.price.toFixed(2)}</Descriptions.Item>
          <Descriptions.Item label="总库存">{goods.stock ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="排序">{goods.sort ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={goods.status === 1 ? 'success' : 'default'}>
              {GOODS_STATUS_TEXT[goods.status] || '未知'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">{goods.createTime || '-'}</Descriptions.Item>
          {goods.goodsType === 2 && (
            <Descriptions.Item label="虚拟商品链接" span={2}>
              {goods.virtualUrl || '-'}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      {/* Images card */}
      {imageList.length > 0 && (
        <Card title="商品图片" style={{ marginBottom: 16 }}>
          <Image.PreviewGroup>
            <Space size="large">
              {imageList.map((url, index) => (
                <Image key={index} src={url} width={120} height={120} style={{ objectFit: 'cover' }} />
              ))}
            </Space>
          </Image.PreviewGroup>
        </Card>
      )}

      {/* Detail card */}
      {goods.detail && (
        <Card title="商品详情" style={{ marginBottom: 16 }}>
          <div dangerouslySetInnerHTML={{ __html: goods.detail }} style={{ lineHeight: 1.8 }} />
        </Card>
      )}

      {/* SKU list card */}
      {goods.skus && goods.skus.length > 0 && (
        <Card title={`SKU 列表（${goods.skus.length}）`}>
          <Table
            columns={skuColumns}
            dataSource={goods.skus}
            rowKey={(record, index) => `sku-${index}`}
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {/* Edit modal */}
      <GoodsModal
        visible={modalVisible}
        goods={goods}
        onClose={() => setModalVisible(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default GoodsDetailPage;