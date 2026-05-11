/**
 * 商品列表页 - ADMIN-02-04
 * ProTable with search, filter, pagination, and batch operations
 */
import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'umi';
import { Button, Space, message, Modal, Tag } from 'antd';
import { PlusOutlined, UploadOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionRef, ProColumns } from '@ant-design/pro-components';
import {
  getGoodsList,
  deleteGoods,
  batchUpdateStatus,
  GOODS_STATUS,
  GOODS_STATUS_TEXT,
  GOODS_TYPE,
  GOODS_TYPE_TEXT,
  AdminGoodsDTO,
} from './services/goods';
import GoodsModal from './components/GoodsModal';

const { confirm } = Modal;

// Status tag color mapping
const STATUS_COLORS: Record<number, string> = {
  [GOODS_STATUS.OFFLINE]: 'default',
  [GOODS_STATUS.ONLINE]: 'success',
};

// Goods type tag color
const TYPE_COLORS: Record<number, string> = {
  [GOODS_TYPE.PHYSICAL]: 'blue',
  [GOODS_TYPE.VIRTUAL]: 'purple',
};

const GoodsListPage: React.FC = () => {
  const navigate = useNavigate();
  const actionRef = useRef<ActionRef>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoods, setEditingGoods] = useState<AdminGoodsDTO | null>(null);

  // Fetch goods list data
  const fetchGoodsList = useCallback(async (params: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    categoryId?: number;
    status?: number;
    goodsType?: number;
  }) => {
    try {
      const data = await getGoodsList({
        page: params.page || 1,
        pageSize: params.pageSize || 20,
        keyword: params.keyword,
        categoryId: params.categoryId,
        status: params.status,
        goodsType: params.goodsType,
      });

      return {
        data: data.records || [],
        total: data.total || 0,
        success: true,
      };
    } catch (error) {
      console.error('Failed to fetch goods list:', error);
      message.error('加载商品列表失败');
      return { data: [], total: 0, success: false };
    }
  }, []);

  // Handle create new goods
  const handleCreate = () => {
    setEditingGoods(null);
    setModalVisible(true);
  };

  // Handle edit goods
  const handleEdit = (goods: AdminGoodsDTO) => {
    setEditingGoods(goods);
    setModalVisible(true);
  };

  // Handle delete goods
  const handleDelete = async (goods: AdminGoodsDTO) => {
    confirm({
      title: '确认删除',
      content: `确定要删除商品「${goods.name}」吗？删除后不可恢复。`,
      async onOk() {
        try {
          await deleteGoods(goods.id);
          message.success('删除成功');
          actionRef.current?.reload();
        } catch (error) {
          console.error('Delete failed:', error);
          message.error('删除失败');
        }
      },
    });
  };

  // Handle batch publish
  const handleBatchPublish = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要上架的商品');
      return;
    }

    confirm({
      title: '确认批量上架',
      content: `确定要上架选中的 ${selectedRowKeys.length} 个商品吗？`,
      async onOk() {
        try {
          await batchUpdateStatus(selectedRowKeys as number[], GOODS_STATUS.ONLINE);
          message.success(`成功上架 ${selectedRowKeys.length} 个商品`);
          setSelectedRowKeys([]);
          actionRef.current?.reload();
        } catch (error) {
          console.error('Batch publish failed:', error);
          message.error('批量上架失败');
        }
      },
    });
  };

  // Handle batch unpublish
  const handleBatchUnpublish = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要下架的商品');
      return;
    }

    confirm({
      title: '确认批量下架',
      content: `确定要下架选中的 ${selectedRowKeys.length} 个商品吗？`,
      async onOk() {
        try {
          await batchUpdateStatus(selectedRowKeys as number[], GOODS_STATUS.OFFLINE);
          message.success(`成功下架 ${selectedRowKeys.length} 个商品`);
          setSelectedRowKeys([]);
          actionRef.current?.reload();
        } catch (error) {
          console.error('Batch unpublish failed:', error);
          message.error('批量下架失败');
        }
      },
    });
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalVisible(false);
    setEditingGoods(null);
  };

  // Handle modal success
  const handleModalSuccess = () => {
    setModalVisible(false);
    setEditingGoods(null);
    actionRef.current?.reload();
  };

  // ProTable columns
  const columns: ProColumns<AdminGoodsDTO>[] = [
    {
      title: '商品ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      align: 'center',
      search: false,
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      copyable: true,
      ellipsis: true,
      width: 200,
    },
    {
      title: '分类',
      dataIndex: 'categoryId',
      key: 'categoryId',
      valueType: 'select',
      width: 120,
      align: 'center',
      fieldProps: {
        options: [
          { label: '全部', value: undefined },
          // TODO: Load from category API
        ],
      },
      search: false,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      valueType: 'money',
      width: 120,
      align: 'right',
      search: false,
    },
    {
      title: '类型',
      dataIndex: 'goodsType',
      key: 'goodsType',
      valueType: 'select',
      width: 100,
      align: 'center',
      valueEnum: {
        [GOODS_TYPE.PHYSICAL]: { text: GOODS_TYPE_TEXT[GOODS_TYPE.PHYSICAL], status: 'Processing' },
        [GOODS_TYPE.VIRTUAL]: { text: GOODS_TYPE_TEXT[GOODS_TYPE.VIRTUAL], status: 'Default' },
      },
      render: (_: unknown, record: AdminGoodsDTO) => (
        <Tag color={TYPE_COLORS[record.goodsType] || 'default'}>
          {GOODS_TYPE_TEXT[record.goodsType] || '未知'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      valueType: 'select',
      width: 100,
      align: 'center',
      valueEnum: {
        [GOODS_STATUS.OFFLINE]: { text: GOODS_STATUS_TEXT[GOODS_STATUS.OFFLINE], status: 'Default' },
        [GOODS_STATUS.ONLINE]: { text: GOODS_STATUS_TEXT[GOODS_STATUS.ONLINE], status: 'Success' },
      },
      render: (_: unknown, record: AdminGoodsDTO) => (
        <Tag color={STATUS_COLORS[record.status] || 'default'}>
          {GOODS_STATUS_TEXT[record.status] || '未知'}
        </Tag>
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
      title: '库存/已售',
      key: 'stockSales',
      width: 120,
      align: 'center',
      search: false,
      render: (_: unknown, record: AdminGoodsDTO) => (
        <span style={{ fontSize: 12 }}>
          {record.stock ?? '-'}/{record.sales ?? '-'}
        </span>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      valueType: 'dateTime',
      width: 170,
      align: 'center',
      search: false,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      align: 'center',
      fixed: 'right',
      search: false,
      render: (_: unknown, record: AdminGoodsDTO) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => navigate(`/mall-admin/goods/detail/${record.id}`)}
          >
            详情
          </Button>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <ProTable<AdminGoodsDTO>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={fetchGoodsList}
        pagination={{
          pageSize: 20,
          showSizeChanger: false,
        }}
        search={{
          labelWidth: 'auto',
          filterType: 'query',
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        scroll={{ x: 1200 }}
        toolBarRender={() => [
          <Button key="create" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建商品
          </Button>,
          <Button
            key="publish"
            icon={<UploadOutlined />}
            disabled={selectedRowKeys.length === 0}
            onClick={handleBatchPublish}
          >
            批量上架{selectedRowKeys.length > 0 ? ` (${selectedRowKeys.length})` : ''}
          </Button>,
          <Button
            key="unpublish"
            icon={<DownloadOutlined />}
            disabled={selectedRowKeys.length === 0}
            onClick={handleBatchUnpublish}
          >
            批量下架{selectedRowKeys.length > 0 ? ` (${selectedRowKeys.length})` : ''}
          </Button>,
        ]}
      />

      <GoodsModal
        visible={modalVisible}
        goods={editingGoods}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default GoodsListPage;