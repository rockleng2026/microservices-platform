/**
 * 库存管理页面 - ADMIN-05
 * SKU stock management with search, filter, and manual correction
 */
import React, { useState, useRef, useCallback } from 'react';
import { Button, Space, message, Modal, Form, Input, InputNumber, Select, Tag } from 'antd';
import { ReloadOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ActionRef, ProColumns } from '@ant-design/pro-components';
import { request } from '@/utils/request';

interface SkuStockDTO {
  id: number;
  goodsId: number;
  goodsName?: string;
  skuCode: string;
  specs: string;
  price: number;
  stock: number;
  status: number;
}

interface StockCreateForm {
  goodsId: number;
  skuCode: string;
  specs: string;
  price: number;
  stock: number;
  status: number;
}

const StockPage: React.FC = () => {
  const actionRef = useRef<ActionRef>(null);
  const [correctModalVisible, setCorrectModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedSku, setSelectedSku] = useState<SkuStockDTO | null>(null);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();

  // Fetch stock list
  const fetchStockList = useCallback(async (params: {
    page?: number;
    pageSize?: number;
    goodsId?: number;
    keyword?: string;
    goodsName?: string;
  }) => {
    // Support both keyword and goodsName (ProTable sends column dataIndex as param name)
    const searchKeyword = params.keyword || params.goodsName;
    try {
      const response = await request<{ datas?: { records: SkuStockDTO[]; total: number } }>('/api-mall/api/mall/admin/stock/list', {
        method: 'GET',
        params: {
          page: params.page || 1,
          pageSize: params.pageSize || 20,
          goodsId: params.goodsId,
          keyword: searchKeyword,
        },
      });
      const data = response.datas;
      return {
        data: data?.records || [],
        total: data?.total || 0,
        success: true,
      };
    } catch (error) {
      console.error('Failed to fetch stock list:', error);
      message.error('加载库存列表失败');
      return { data: [], total: 0, success: false };
    }
  }, []);

  // Handle stock correction
  const handleCorrect = (record: SkuStockDTO) => {
    setSelectedSku(record);
    form.setFieldsValue({ change: 0, operator: '', remark: '' });
    setCorrectModalVisible(true);
  };

  // Open create modal
  const handleOpenCreate = () => {
    createForm.resetFields();
    setCreateModalVisible(true);
  };

  // Submit new stock record
  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      await request('/api-mall/api/mall/admin/stock', {
        method: 'POST',
        data: {
          goodsId: values.goodsId,
          skuCode: values.skuCode,
          specs: values.specs || '{}',
          price: values.price,
          stock: values.stock ?? 0,
          status: values.status ?? 1,
        },
      });
      message.success('库存录入成功');
      setCreateModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('Failed to create stock:', error);
      message.error('库存录入失败');
    }
  };

  // Submit correction
  const handleCorrectSubmit = async () => {
    if (!selectedSku) return;
    try {
      const values = await form.validateFields();
      await request(`/api-mall/api/mall/admin/stock/${selectedSku.id}/correct`, {
        method: 'PUT',
        data: {
          change: values.change,
          operator: values.operator,
          remark: values.remark || '',
        },
      });
      message.success('库存修正成功');
      setCorrectModalVisible(false);
      actionRef.current?.reload();
    } catch (error) {
      console.error('Failed to correct stock:', error);
      message.error('库存修正失败');
    }
  };

  // Parse specs JSON
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

  // Columns
  const columns: ProColumns<SkuStockDTO>[] = [
    {
      title: 'SKU ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      align: 'center',
      search: false,
    },
    {
      title: '商品ID',
      dataIndex: 'goodsId',
      key: 'goodsId',
      width: 100,
      align: 'center',
      search: false,
    },
    {
      title: '商品名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
      width: 200,
      align: 'center',
      search: true,
      render: (goodsName: string | undefined) => goodsName || '-',
    },
    {
      title: 'SKU编码',
      dataIndex: 'skuCode',
      key: 'skuCode',
      width: 150,
      search: true,
    },
    {
      title: '规格',
      dataIndex: 'specs',
      key: 'specs',
      width: 200,
      search: false,
      render: (specs: string) => parseSpecs(specs),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'right',
      search: false,
      render: (price: number) => `¥${price.toFixed(2)}`,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 100,
      align: 'center',
      search: false,
      render: (stock: number) => {
        const color = stock <= 10 ? 'red' : stock <= 50 ? 'orange' : 'green';
        return <Tag color={color}>{stock}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      search: false,
      render: (status: number) => (
        <Tag color={status === 1 ? 'success' : 'default'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      search: false,
      render: (_: unknown, record: SkuStockDTO) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleCorrect(record)}
        >
          修正
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <ProTable<SkuStockDTO>
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={fetchStockList}
        pagination={{
          pageSize: 20,
          showSizeChanger: false,
        }}
        search={{
          labelWidth: 'auto',
          filterType: 'query',
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
          >
            录入
          </Button>,
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          >
            刷新
          </Button>,
        ]}
      />

      {/* Stock Correction Modal */}
      <Modal
        title="库存修正"
        open={correctModalVisible}
        onOk={handleCorrectSubmit}
        onCancel={() => setCorrectModalVisible(false)}
        destroyOnClose
      >
        {selectedSku && (
          <div style={{ marginBottom: 16 }}>
            <p><strong>SKU:</strong> {selectedSku.skuCode}</p>
            <p><strong>规格:</strong> {parseSpecs(selectedSku.specs)}</p>
            <p><strong>当前库存:</strong> {selectedSku.stock}</p>
          </div>
        )}
        <Form form={form} layout="vertical">
          <Form.Item
            name="change"
            label="修正数量"
            rules={[{ required: true, message: '请输入修正数量（正数=增加，负数=减少）' }]}
            tooltip="输入正数增加库存，负数减少库存"
          >
            <Input type="number" placeholder="例如: 10 或 -5" />
          </Form.Item>
          <Form.Item
            name="operator"
            label="操作人"
            rules={[{ required: true, message: '请输入操作人' }]}
          >
            <Input placeholder="请输入操作人姓名" />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea placeholder="可选备注信息" />
          </Form.Item>
        </Form>
      {/* Stock Create Modal */}
      <Modal
        title="库存录入"
        open={createModalVisible}
        onOk={handleCreateSubmit}
        onCancel={() => setCreateModalVisible(false)}
        destroyOnClose
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="goodsId"
            label="商品ID"
            rules={[{ required: true, message: '请输入商品ID' }]}
          >
            <InputNumber min={1} placeholder="请输入商品ID" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="skuCode"
            label="SKU编码"
            rules={[{ required: true, message: '请输入SKU编码' }]}
          >
            <Input placeholder="请输入SKU编码（唯一）" />
          </Form.Item>
          <Form.Item name="specs" label="规格JSON">
            <Input placeholder='例如: {"color":"red","size":"M"}' />
          </Form.Item>
          <Form.Item
            name="price"
            label="价格"
            rules={[{ required: true, message: '请输入价格' }]}
          >
            <InputNumber min={0.01} precision={2} placeholder="请输入价格" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock" label="初始库存">
            <InputNumber min={0} placeholder="请输入初始库存数量" style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select
              placeholder="请选择状态"
              options={[
                { label: '启用', value: 1 },
                { label: '禁用', value: 0 },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StockPage;