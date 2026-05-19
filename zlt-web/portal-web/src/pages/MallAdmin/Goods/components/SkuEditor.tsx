/**
 * SKU 规格编辑器 - ADMIN-02-09
 * Improved SKU editor with better UX
 * - Specs displayed as readable text
 * - Add/Edit via modal
 * - Support for common spec types (颜色, 尺寸)
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Table, Button, InputNumber, Switch, Space, Popconfirm, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';

export interface SkuDTO {
  id?: number;
  skuCode?: string;
  specs: string;           // JSON: "{\"颜色\":\"红色\",\"尺寸\":\"XL\"}"
  price: number | string;
  costPrice?: number | string;  // 成本价 (D-09)
  stock: number;
  image?: string;
  status?: number;         // 0=下架, 1=上架
}

interface SkuEditorProps {
  value?: SkuDTO[];
  onChange?: (skus: SkuDTO[]) => void;
}

// 常用规格选项
const COMMON_SPECS = {
  '颜色': ['红色', '蓝色', '绿色', '黄色', '黑色', '白色', '银色', '金色'],
  '尺寸': ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  '尺码': ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
  '容量': ['64GB', '128GB', '256GB', '512GB', '1TB'],
  '版本': ['标准版', '高级版', '旗舰版'],
};

// Parse specs JSON to display string
const parseSpecsDisplay = (specsJson: string): string => {
  try {
    const specs = JSON.parse(specsJson);
    return Object.entries(specs)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' | ');
  } catch {
    return specsJson;
  }
};

// Parse specs JSON to object
const parseSpecs = (specsJson: string): Record<string, string> => {
  try {
    return JSON.parse(specsJson);
  } catch {
    return {};
  }
};

// Build specs JSON from object
const buildSpecsJson = (specsObj: Record<string, string>): string => {
  return JSON.stringify(specsObj);
};

interface SkuModalProps {
  visible: boolean;
  editingSku: SkuDTO | null;
  onSave: (sku: SkuDTO) => void;
  onCancel: () => void;
}

const SkuModal: React.FC<SkuModalProps> = ({ visible, editingSku, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [specs, setSpecs] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (visible) {
      if (editingSku) {
        const parsedSpecs = parseSpecs(editingSku.specs);
        setSpecs(parsedSpecs);
        form.setFieldsValue({
          skuCode: editingSku.skuCode,
          price: editingSku.price,
          costPrice: editingSku.costPrice,
          stock: editingSku.stock,
          status: editingSku.status === 1,
        });
      } else {
        setSpecs({});
        form.setFieldsValue({
          price: 0,
          costPrice: undefined,
          stock: 100,
          status: true,
        });
      }
    }
  }, [visible, editingSku, form]);

  const handleSave = () => {
    form.validateFields().then(() => {
      const values = form.getFieldsValue();
      const newSku: SkuDTO = {
        id: editingSku?.id,
        skuCode: values.skuCode || `SKU${Date.now()}`,
        specs: buildSpecsJson(specs),
        price: values.price,
        costPrice: values.costPrice,
        stock: values.stock ?? 0,
        status: values.status ? 1 : 0,
      };
      onSave(newSku);
    });
  };

  // Get all spec keys that have been added (even if value is empty string)
  const activeSpecKeys = useMemo(() => {
    return Object.keys(specs);
  }, [specs]);

  // Get spec key options (those that have at least one value)
  const specKeyOptions = Object.keys(COMMON_SPECS);

  return (
    <Modal
      title={editingSku ? '编辑 SKU' : '添加 SKU'}
      open={visible}
      onOk={handleSave}
      onCancel={onCancel}
      destroyOnClose
      width={500}
    >
      <Form form={form} layout="vertical">
        <Form.Item label="SKU编码" name="skuCode" tooltip="可选，不填则自动生成">
          <Input placeholder="如: SKU001" />
        </Form.Item>

        <div style={{ marginBottom: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>规格组合</div>
          {activeSpecKeys.map(key => (
            <div key={key} style={{ marginBottom: 12 }}>
              <div style={{ marginBottom: 4, color: '#666' }}>{key}</div>
              <Select
                value={specs[key] || undefined}
                onChange={(val) => setSpecs(prev => ({ ...prev, [key]: val }))}
                placeholder={`选择${key}`}
                style={{ width: '100%' }}
                options={COMMON_SPECS[key]?.map(v => ({ label: v, value: v })) || []}
              />
            </div>
          ))}
          {/* Add more spec types - show only available (not yet added) */}
          {(() => {
            const addedKeys = Object.keys(specs);
            const availableKeys = specKeyOptions.filter(k => !addedKeys.includes(k));
            if (availableKeys.length === 0) {
              return <span style={{ color: '#888', fontSize: 12 }}>已添加所有常用规格类型</span>;
            }
            return (
              <Button
                type="link"
                size="small"
                onClick={() => {
                  setSpecs(prev => ({ ...prev, [availableKeys[0]]: '' }));
                }}
              >
                + 添加规格类型
              </Button>
            );
          })()}
        </div>

        <Form.Item
          label="价格"
          name="price"
          rules={[{ required: true, message: '请输入价格' }]}
        >
          <InputNumber
            min={0}
            precision={2}
            prefix="¥"
            style={{ width: '100%' }}
          />
        </Form.Item>

        <Form.Item label="成本价" name="costPrice" tooltip="用于改价参考，不能低于成本价">
          <InputNumber
            min={0}
            precision={2}
            prefix="¥"
            style={{ width: '100%' }}
            placeholder="可选"
          />
        </Form.Item>

        <Form.Item
          label="库存"
          name="stock"
          rules={[{ required: true, message: '请输入库存' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item label="状态" name="status" valuePropName="checked">
          <Switch checkedChildren="上架" unCheckedChildren="下架" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const SkuEditor: React.FC<SkuEditorProps> = ({ value = [], onChange }) => {
  const [skus, setSkus] = useState<SkuDTO[]>(value);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSku, setEditingSku] = useState<SkuDTO | null>(null);

  // Sync with external value changes
  useEffect(() => {
    setSkus(value);
  }, [value]);

  // Update internal state and notify parent
  const updateSkus = (newSkus: SkuDTO[]) => {
    setSkus(newSkus);
    onChange?.(newSkus);
  };

  // Open add modal
  const handleAdd = () => {
    setEditingSku(null);
    setModalVisible(true);
  };

  // Open edit modal
  const handleEdit = (sku: SkuDTO) => {
    setEditingSku(sku);
    setModalVisible(true);
  };

  // Remove SKU
  const handleRemove = (index: number) => {
    const newSkus = skus.filter((_, i) => i !== index);
    updateSkus(newSkus);
  };

  // Save SKU from modal
  const handleSaveSku = (sku: SkuDTO) => {
    if (editingSku) {
      // Update existing
      const newSkus = [...skus];
      const index = skus.findIndex(s => s === editingSku);
      if (index !== -1) {
        newSkus[index] = sku;
        updateSkus(newSkus);
      }
    } else {
      // Add new
      updateSkus([...skus, sku]);
    }
    setModalVisible(false);
  };

  // Table columns
  const columns: ColumnsType<SkuDTO> = [
    {
      title: 'SKU编码',
      dataIndex: 'skuCode',
      key: 'skuCode',
      width: 100,
      render: (code: string) => code || '-',
    },
    {
      title: '规格组合',
      dataIndex: 'specs',
      key: 'specs',
      width: 200,
      render: (specs: string) => (
        <span style={{ color: specs === '{}' ? '#999' : '#333' }}>
          {parseSpecsDisplay(specs) || '未设置规格'}
        </span>
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number | string) => `¥${typeof price === 'string' ? price : price.toFixed(2)}`,
    },
    {
      title: '成本价',
      dataIndex: 'costPrice',
      key: 'costPrice',
      width: 100,
      render: (cost: number | string) => cost ? `¥${typeof cost === 'string' ? cost : cost.toFixed(2)}` : '-',
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      align: 'center',
      render: (status: number) => (
        <span style={{ color: status === 1 ? '#52c41a' : '#999' }}>
          {status === 1 ? '上架' : '下架'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_: unknown, record: SkuDTO, index: number) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确认删除该 SKU？"
            onConfirm={() => handleRemove(index)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* SKU table */}
      <Table
        columns={columns}
        dataSource={skus}
        rowKey={(record: SkuDTO) => `sku-${record.id || skus.indexOf(record)}`}
        pagination={false}
        size="small"
        style={{ marginBottom: 16 }}
        locale={{ emptyText: '暂无SKU，点击下方按钮添加' }}
      />

      {/* Add button */}
      <Button type="dashed" icon={<PlusOutlined />} onClick={handleAdd} style={{ width: '100%' }}>
        添加 SKU
      </Button>

      {/* Sku Modal */}
      <SkuModal
        visible={modalVisible}
        editingSku={editingSku}
        onSave={handleSaveSku}
        onCancel={() => setModalVisible(false)}
      />
    </div>
  );
};

export default SkuEditor;