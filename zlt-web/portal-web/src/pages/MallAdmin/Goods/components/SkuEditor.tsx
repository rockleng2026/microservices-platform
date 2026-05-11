/**
 * SKU 规格编辑器 - ADMIN-02-09
 * Inline SKU/spec editor within product Modal
 */
import React, { useState, useEffect } from 'react';
import { Table, Button, InputNumber, Switch, Space, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/lib/table';

export interface SkuDTO {
  id?: number;
  skuCode?: string;
  specs: string;           // JSON: "{\"颜色\":\"红色\",\"尺寸\":\"XL\"}"
  price: number | string;
  stock: number;
  image?: string;
  status?: number;         // 0=下架, 1=上架
}

interface SkuEditorProps {
  value?: SkuDTO[];                    // Initial SKU list
  onChange?: (skus: SkuDTO[]) => void; // Called when SKUs change
}

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

const SkuEditor: React.FC<SkuEditorProps> = ({ value = [], onChange }) => {
  // Internal SKU list
  const [skus, setSkus] = useState<SkuDTO[]>(value);

  // Sync with external value changes
  useEffect(() => {
    setSkus(value);
  }, [value]);

  // Update internal state and notify parent
  const updateSkus = (newSkus: SkuDTO[]) => {
    setSkus(newSkus);
    onChange?.(newSkus);
  };

  // Add new SKU row
  const handleAdd = () => {
    const newSku: SkuDTO = {
      specs: '{}',
      price: 0,
      stock: 0,
      status: 1,
    };
    updateSkus([...skus, newSku]);
  };

  // Remove SKU
  const handleRemove = (index: number) => {
    const newSkus = skus.filter((_, i) => i !== index);
    updateSkus(newSkus);
  };

  // Update single SKU field
  const updateSku = (index: number, field: keyof SkuDTO, fieldValue: any) => {
    const newSkus = [...skus];
    newSkus[index] = { ...newSkus[index], [field]: fieldValue };
    updateSkus(newSkus);
  };

  // Table columns
  const columns: ColumnsType<SkuDTO> = [
    {
      title: '规格组合',
      dataIndex: 'specs',
      key: 'specs',
      width: 200,
      render: (_: unknown, record: SkuDTO, index: number) => (
        <InputNumber
          value={parseSpecs(record.specs)}
          onChange={(val) => {
            try {
              // Try to parse as JSON
              const parsed = JSON.parse(val);
              updateSku(index, 'specs', JSON.stringify(parsed));
            } catch {
              // Treat as plain text, try to build JSON
              const parts = val.split(',').map((p) => p.trim());
              const specsObj: Record<string, string> = {};
              parts.forEach((part) => {
                const [key, value] = part.split(':').map((s) => s.trim());
                if (key && value) specsObj[key] = value;
              });
              updateSku(index, 'specs', JSON.stringify(specsObj));
            }
          }}
          style={{ width: '100%' }}
          placeholder='格式: 颜色:红色,尺寸:XL'
        />
      ),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (_: unknown, record: SkuDTO, index: number) => (
        <InputNumber
          value={typeof record.price === 'string' ? parseFloat(record.price as string) : record.price}
          onChange={(val) => updateSku(index, 'price', val ?? 0)}
          min={0}
          precision={2}
          prefix="¥"
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 120,
      render: (_: unknown, record: SkuDTO, index: number) => (
        <InputNumber
          value={record.stock}
          onChange={(val) => updateSku(index, 'stock', val ?? 0)}
          min={0}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      align: 'center',
      render: (_: unknown, record: SkuDTO, index: number) => (
        <Switch
          checkedChildren="上架"
          unCheckedChildren="下架"
          checked={record.status === 1}
          onChange={(checked) => updateSku(index, 'status', checked ? 1 : 0)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_: unknown, record: SkuDTO, index: number) => (
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
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      {/* SKU table */}
      <Table
        columns={columns}
        dataSource={skus}
        rowKey={(_: unknown, index: number) => `sku-${index}`}
        pagination={false}
        size="small"
        style={{ marginBottom: 16 }}
      />

      {/* Add button */}
      <Button type="dashed" icon={<PlusOutlined />} onClick={handleAdd} style={{ width: '100%' }}>
        添加 SKU
      </Button>

      {/* Hint text */}
      {skus.length === 0 && (
        <div style={{ marginTop: 8, color: '#888', fontSize: 12, textAlign: 'center' }}>
          暂未添加 SKU，请点击上方按钮添加
        </div>
      )}
    </div>
  );
};

export default SkuEditor;