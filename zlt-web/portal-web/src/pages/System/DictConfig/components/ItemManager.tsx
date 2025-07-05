import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  InputNumber,
  Switch,
  message,
  Popconfirm,
  Tooltip,
  Tag,
  Typography,
  Select,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  UndoOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  DictCategory,
  DictItem,
  ExtendField,
  getDictItems,
  batchSaveDictItems,
  batchDeleteDictItems,
  batchMarkDeleteDictItems,
  checkDictItemCode,
} from '@/services/system';

const { Text } = Typography;

interface ItemManagerProps {
  category: DictCategory;
  onCategoryUpdate: () => void;
}

interface EditableItem extends DictItem {
  isEditing?: boolean;
  isNew?: boolean;
  tempData?: Partial<DictItem>;
}

/**
 * 字典明细项管理组件
 */
const ItemManager: React.FC<ItemManagerProps> = ({ category, onCategoryUpdate }) => {
  const [items, setItems] = useState<EditableItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  
  // 缓存引用
  const itemsCache = useRef<Map<string, DictItem>>(new Map());

  // 加载明细项列表
  const loadItems = async () => {
    setLoading(true);
    try {
      const response = await getDictItems({
        categoryId: category.id,
        page: 1,
        size: 1000,
      });
      
      const itemList = response.data || [];
      
      setItems(itemList.map(item => ({ ...item, isEditing: false, isNew: false })));
      
      // 更新缓存
      itemsCache.current.clear();
      itemList.forEach(item => {
        itemsCache.current.set(item.id, item);
      });
    } catch (error) {
      console.error('加载字典明细项失败:', error);
      message.error('加载字典明细项失败');
    } finally {
      setLoading(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    loadItems();
  }, [category.id]);

  // 添加新行
  const handleAddRow = () => {
    const newItem: EditableItem = {
      id: Date.now().toString(), // 临时ID
      categoryId: category.id,
      itemCode: '',
      itemName: '',
      description: '',
      sortOrder: items.length,
      enabled: true,
      extendData: {},
      isEditing: true,
      isNew: true,
    };
    setItems([newItem, ...items]);
  };

  // 编辑行
  const handleEditRow = (record: EditableItem) => {
    setItems(items.map(item => 
      item.id === record.id
        ? { ...item, isEditing: true, tempData: { ...item } }
        : item
    ));
  };

  // 保存行
  const handleSaveRow = async (record: EditableItem) => {
    try {
      // 验证必填项
      if (!record.itemCode || !record.itemName) {
        message.error('编码和名称为必填项');
        return;
      }

      // 检查编码唯一性
      if (record.isNew || record.tempData?.itemCode !== record.itemCode) {
        const isUnique = await checkDictItemCode(
          category.id, 
          record.itemCode, 
          record.isNew ? undefined : record.id
        );
        if (!isUnique.data && !isUnique.datas) {
          message.error('编码已存在，请修改');
          return;
        }
      }

      // 验证扩展字段
      if (category.extendSchema) {
        for (const field of category.extendSchema) {
          if (field.required && !record.extendData?.[field.fieldCode]) {
            message.error(`扩展字段"${field.fieldName}"为必填项`);
            return;
          }
        }
      }

      // 保存到服务器
      await batchSaveDictItems([{
        id: record.isNew ? undefined : record.id,
        categoryId: record.categoryId,
        itemCode: record.itemCode,
        itemName: record.itemName,
        description: record.description,
        sortOrder: record.sortOrder,
        status: record.enabled ? 1 : 0,
        extendData: record.extendData,
      }]);

      message.success('保存成功');
      loadItems(); // 重新加载数据
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  // 取消编辑
  const handleCancelEdit = (record: EditableItem) => {
    if (record.isNew) {
      // 删除新增的行
      setItems(items.filter(item => item.id !== record.id));
    } else {
      // 恢复原始数据
      setItems(items.map(item => 
        item.id === record.id
          ? { ...record.tempData!, isEditing: false, tempData: undefined } as EditableItem
          : item
      ));
    }
  };

  // 硬删除选中行
  const handleHardDeleteSelected = async () => {
    try {
      const idsToDelete = selectedRowKeys
        .map(key => items.find(item => item.id.toString() === key))
        .filter(item => item && !item.isNew)
        .map(item => item!.id);

      if (idsToDelete.length > 0) {
        await batchDeleteDictItems(idsToDelete);
      }

      // 删除新增的行（未保存的）
      const newItemsToDelete = selectedRowKeys
        .map(key => items.find(item => item.id.toString() === key))
        .filter(item => item && item.isNew);

      if (newItemsToDelete.length > 0) {
        setItems(items.filter(item => 
          !newItemsToDelete.some(newItem => newItem!.id === item.id)
        ));
      }

      message.success('删除成功');
      setSelectedRowKeys([]);
      loadItems();
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  // 软删除选中行
  const handleSoftDeleteSelected = async () => {
    try {
      const idsToDelete = selectedRowKeys
        .map(key => items.find(item => item.id.toString() === key))
        .filter(item => item && !item.isNew)
        .map(item => item!.id);

      if (idsToDelete.length > 0) {
        await batchMarkDeleteDictItems(idsToDelete);
      }

      // 删除新增的行（未保存的）
      const newItemsToDelete = selectedRowKeys
        .map(key => items.find(item => item.id.toString() === key))
        .filter(item => item && item.isNew);

      if (newItemsToDelete.length > 0) {
        setItems(items.filter(item => 
          !newItemsToDelete.some(newItem => newItem!.id === item.id)
        ));
      }

      message.success('标记删除成功');
      setSelectedRowKeys([]);
      loadItems();
    } catch (error) {
      console.error('标记删除失败:', error);
      message.error('标记删除失败');
    }
  };

  // 批量保存
  const handleBatchSave = async () => {
    const editingItems = items.filter(item => item.isEditing);
    if (editingItems.length === 0) {
      message.warning('没有需要保存的数据');
      return;
    }

    setSaving(true);
    try {
      // 验证所有编辑中的行
      for (const item of editingItems) {
        if (!item.itemCode || !item.itemName) {
          message.error('所有行的编码和名称都为必填项');
          return;
        }
      }

      const saveData = editingItems.map(item => ({
        id: item.isNew ? undefined : item.id,
        categoryId: item.categoryId,
        itemCode: item.itemCode,
        itemName: item.itemName,
        description: item.description,
        sortOrder: item.sortOrder,
        status: item.enabled ? 1 : 0,
        extendData: item.extendData,
      }));

      await batchSaveDictItems(saveData);
      message.success('批量保存成功');
      loadItems();
    } catch (error) {
      console.error('批量保存失败:', error);
      message.error('批量保存失败');
    } finally {
      setSaving(false);
    }
  };

  // 更新项数据
  const updateItemData = (id: string, field: string, value: any) => {
    setItems(items.map(item => 
      item.id === id
        ? { ...item, [field]: value }
        : item
    ));
  };

  // 更新扩展数据
  const updateExtendData = (id: string, fieldCode: string, value: any) => {
    setItems(items.map(item => 
      item.id === id
        ? {
            ...item,
            extendData: {
              ...item.extendData,
              [fieldCode]: value,
            },
          }
        : item
    ));
  };

  // 渲染扩展字段编辑器
  const renderExtendFieldEditor = (field: ExtendField, value: any, itemId: string, disabled: boolean) => {
    const commonProps = {
      value,
      disabled,
      onChange: (val: any) => updateExtendData(itemId, field.fieldCode, val),
    };

    switch (field.fieldType) {
      case 'NUMBER':
        return <InputNumber {...commonProps} placeholder={field.defaultValue} />;
             case 'DATE':
         return (
           <Input
             {...commonProps}
             placeholder="YYYY-MM-DD"
             type="date"
           />
         );
      case 'BOOLEAN':
        return (
          <Switch
            checked={value}
            disabled={disabled}
            onChange={(checked) => updateExtendData(itemId, field.fieldCode, checked)}
          />
        );
      case 'SELECT':
        return (
          <Select
            {...commonProps}
            options={field.selectOptions?.map(opt => ({ label: opt, value: opt }))}
          />
        );
      default:
        return <Input {...commonProps} placeholder={field.defaultValue} />;
    }
  };

  // 构建表格列
  const buildColumns = (): ColumnsType<EditableItem> => {
    const baseColumns: ColumnsType<EditableItem> = [
      {
        title: '编码',
        dataIndex: 'itemCode',
        width: 120,
        render: (value, record) => (
          record.isEditing ? (
            <Input
              value={value}
              onChange={(e) => updateItemData(record.id, 'itemCode', e.target.value)}
              placeholder="字典项编码"
            />
          ) : (
            <Text code>{value}</Text>
          )
        ),
      },
      {
        title: '名称',
        dataIndex: 'itemName',
        width: 150,
        render: (value, record) => (
          record.isEditing ? (
            <Input
              value={value}
              onChange={(e) => updateItemData(record.id, 'itemName', e.target.value)}
              placeholder="字典项名称"
            />
          ) : (
            value
          )
        ),
      },
      {
        title: '描述',
        dataIndex: 'description',
        width: 200,
        render: (value, record) => (
          record.isEditing ? (
            <Input
              value={value}
              onChange={(e) => updateItemData(record.id, 'description', e.target.value)}
              placeholder="描述信息"
            />
          ) : (
            <Text type="secondary">{value}</Text>
          )
        ),
      },
      {
        title: '排序',
        dataIndex: 'sortOrder',
        width: 80,
        render: (value, record) => (
          record.isEditing ? (
            <InputNumber
              value={value}
              min={0}
              onChange={(val) => updateItemData(record.id, 'sortOrder', val || 0)}
            />
          ) : (
            value
          )
        ),
      },
      {
        title: '状态',
        dataIndex: 'enabled',
        width: 80,
        render: (value, record) => (
          record.isEditing ? (
            <Switch
              checked={value}
              onChange={(checked) => updateItemData(record.id, 'enabled', checked)}
            />
          ) : (
            <Tag color={value ? 'success' : 'default'}>
              {value ? '启用' : '禁用'}
            </Tag>
          )
        ),
      },
    ];

    // 添加扩展字段列
    const extendColumns: ColumnsType<EditableItem> = (category.extendSchema || [])
      .sort((a, b) => a.sort - b.sort)
      .map(field => ({
        title: field.fieldName,
        dataIndex: ['extendData', field.fieldCode],
        width: 120,
        render: (value, record) => (
          record.isEditing
            ? renderExtendFieldEditor(field, value, record.id, false)
            : field.fieldType === 'BOOLEAN'
            ? <Tag color={value ? 'success' : 'default'}>{value ? '是' : '否'}</Tag>
            : value
        ),
      }));

    // 操作列
    const actionColumn: ColumnsType<EditableItem> = [
      {
        title: '操作',
        width: 120,
        fixed: 'right',
        render: (_, record) => (
          <Space>
            {record.isEditing ? (
              <>
                <Tooltip title="保存">
                  <Button
                    type="text"
                    size="small"
                    icon={<CheckOutlined />}
                    onClick={() => handleSaveRow(record)}
                  />
                </Tooltip>
                <Tooltip title="取消">
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={() => handleCancelEdit(record)}
                  />
                </Tooltip>
              </>
            ) : (
              <Tooltip title="编辑">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() => handleEditRow(record)}
                />
              </Tooltip>
            )}
          </Space>
        ),
      },
    ];

    return [...baseColumns, ...extendColumns, ...actionColumn];
  };

  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    getCheckboxProps: (record: EditableItem) => ({
      disabled: record.isEditing,
    }),
  };

  return (
    <Card
      title={
        <div>
          <Text strong>{category.categoryName}</Text>
          <Text type="secondary" style={{ marginLeft: 8 }}>
            ({category.categoryCode})
          </Text>
        </div>
      }
      extra={
        <Space>
          <Button
            icon={<PlusOutlined />}
            onClick={handleAddRow}
          >
            新增行
          </Button>
          <Button
            icon={<SaveOutlined />}
            type="primary"
            loading={saving}
            onClick={handleBatchSave}
            disabled={!items.some(item => item.isEditing)}
          >
            批量保存
          </Button>
          <Popconfirm
            title="确认标记删除选中的明细项吗？此操作可恢复。"
            onConfirm={handleSoftDeleteSelected}
            disabled={selectedRowKeys.length === 0}
          >
            <Button
              icon={<DeleteOutlined />}
              disabled={selectedRowKeys.length === 0}
            >
              标记删除
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确认彻底删除选中的明细项吗？此操作不可恢复！"
            onConfirm={handleHardDeleteSelected}
            disabled={selectedRowKeys.length === 0}
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              disabled={selectedRowKeys.length === 0}
            >
              彻底删除
            </Button>
          </Popconfirm>
        </Space>
      }
    >
      <Table
        columns={buildColumns()}
        dataSource={items}
        rowKey="id"
        loading={loading}
        pagination={false}
        rowSelection={rowSelection}
        scroll={{ x: 'max-content' }}
        size="small"
        locale={{ emptyText: '暂无数据，点击"新增行"开始添加' }}
      />
    </Card>
  );
};

export default ItemManager; 