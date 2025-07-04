import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Tabs,
  Button,
  Space,
  Table,
  Select,
  message,
  Popconfirm,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { DictCategory, ExtendField, createDictCategory, updateDictCategory } from '@/services/system';

const { TextArea } = Input;

interface CategoryModalProps {
  visible: boolean;
  category?: DictCategory | null;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * 字典类目编辑弹窗
 */
const CategoryModal: React.FC<CategoryModalProps> = ({
  visible,
  category,
  onSave,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [extendFields, setExtendFields] = useState<ExtendField[]>([]);

  // 初始化表单
  useEffect(() => {
    if (visible) {
      if (category) {
        // 编辑模式
        form.setFieldsValue({
          categoryCode: category.categoryCode,
          categoryName: category.categoryName,
          description: category.description,
          sort: category.sort,
          enabled: category.enabled,
        });
        setExtendFields(category.extendSchema || []);
      } else {
        // 新建模式
        form.resetFields();
        form.setFieldsValue({
          enabled: true,
          sort: 0,
        });
        setExtendFields([]);
      }
    }
  }, [visible, category, form]);

  // 添加扩展字段
  const handleAddExtendField = () => {
    const newField: ExtendField = {
      fieldCode: '',
      fieldName: '',
      fieldType: 'TEXT',
      defaultValue: '',
      required: false,
      sort: extendFields.length,
    };
    setExtendFields([...extendFields, newField]);
  };

  // 删除扩展字段
  const handleDeleteExtendField = (index: number) => {
    const newFields = extendFields.filter((_, i) => i !== index);
    // 重新排序
    newFields.forEach((field, i) => {
      field.sort = i;
    });
    setExtendFields(newFields);
  };

  // 更新扩展字段
  const handleUpdateExtendField = (index: number, field: Partial<ExtendField>) => {
    const newFields = [...extendFields];
    newFields[index] = { ...newFields[index], ...field };
    setExtendFields(newFields);
  };

  // 保存
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // 验证扩展字段
      const validExtendFields = extendFields.filter(field => 
        field.fieldCode && field.fieldName
      );
      
      // 检查扩展字段编码重复
      const fieldCodes = validExtendFields.map(f => f.fieldCode);
      const duplicateCodes = fieldCodes.filter((code, index) => 
        fieldCodes.indexOf(code) !== index
      );
      if (duplicateCodes.length > 0) {
        message.error(`扩展字段编码重复: ${duplicateCodes.join(', ')}`);
        return;
      }

      setLoading(true);
      
      const data = {
        code: values.categoryCode,
        name: values.categoryName,
        description: values.description,
        sortOrder: values.sort,
        status: values.enabled ? 1 : 0,
        extendFields: validExtendFields,
      } as any;

      if (category) {
        await updateDictCategory(category.id, data);
        message.success('更新成功');
      } else {
        await createDictCategory(data);
        message.success('创建成功');
      }
      
      onSave();
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  // 扩展字段表格列定义
  const extendFieldColumns: ColumnsType<ExtendField> = [
    {
      title: '字段编码',
      dataIndex: 'fieldCode',
      width: 120,
      render: (value, record, index) => (
        <Input
          value={value}
          placeholder="字段编码"
          onChange={(e) => handleUpdateExtendField(index, { fieldCode: e.target.value })}
        />
      ),
    },
    {
      title: '字段名称',
      dataIndex: 'fieldName',
      width: 120,
      render: (value, record, index) => (
        <Input
          value={value}
          placeholder="字段名称"
          onChange={(e) => handleUpdateExtendField(index, { fieldName: e.target.value })}
        />
      ),
    },
    {
      title: '字段类型',
      dataIndex: 'fieldType',
      width: 100,
      render: (value, record, index) => (
        <Select
          value={value}
          onChange={(fieldType) => handleUpdateExtendField(index, { fieldType })}
          options={[
            { label: '文本', value: 'TEXT' },
            { label: '数字', value: 'NUMBER' },
            { label: '日期', value: 'DATE' },
            { label: '布尔', value: 'BOOLEAN' },
            { label: '选择', value: 'SELECT' },
          ]}
        />
      ),
    },
    {
      title: '默认值',
      dataIndex: 'defaultValue',
      width: 100,
      render: (value, record, index) => (
        <Input
          value={value}
          placeholder="默认值"
          onChange={(e) => handleUpdateExtendField(index, { defaultValue: e.target.value })}
        />
      ),
    },
    {
      title: '必填',
      dataIndex: 'required',
      width: 60,
      render: (value, record, index) => (
        <Switch
          checked={value}
          onChange={(required) => handleUpdateExtendField(index, { required })}
        />
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 60,
      render: (value, record, index) => (
        <InputNumber
          value={value}
          min={0}
          size="small"
          onChange={(sort) => handleUpdateExtendField(index, { sort: sort || 0 })}
        />
      ),
    },
    {
      title: '操作',
      width: 60,
      render: (_, record, index) => (
        <Popconfirm
          title="确认删除？"
          onConfirm={() => handleDeleteExtendField(index)}
        >
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Modal
      title={category ? '编辑字典类目' : '新建字典类目'}
      open={visible}
      onOk={handleSave}
      onCancel={onCancel}
      width={800}
      confirmLoading={loading}
      destroyOnClose
    >
      <Tabs 
        defaultActiveKey="basic" 
        items={[
          {
            key: 'basic',
            label: '基础信息',
            children: (
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  enabled: true,
                  sort: 0,
                }}
              >
                <Form.Item
                  name="categoryCode"
                  label="类目编码"
                  rules={[
                    { required: true, message: '请输入类目编码' },
                    { pattern: /^[A-Z][A-Z0-9_]*$/, message: '编码必须以大写字母开头，只能包含大写字母、数字和下划线' },
                  ]}
                >
                  <Input 
                    placeholder="例如: USER_TYPE" 
                    disabled={!!category}
                  />
                </Form.Item>

                <Form.Item
                  name="categoryName"
                  label="类目名称"
                  rules={[{ required: true, message: '请输入类目名称' }]}
                >
                  <Input placeholder="例如: 用户类型" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="描述信息"
                >
                  <TextArea
                    placeholder="类目用途和说明"
                    rows={3}
                  />
                </Form.Item>

                <Space size="large">
                  <Form.Item
                    name="sort"
                    label="排序号"
                    rules={[{ required: true, message: '请输入排序号' }]}
                  >
                    <InputNumber min={0} placeholder="0" />
                  </Form.Item>

                  <Form.Item
                    name="enabled"
                    label="启用状态"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                  </Form.Item>
                </Space>
              </Form>
            ),
          },
          {
            key: 'extend',
            label: '扩展字段',
            children: (
              <>
                <div style={{ marginBottom: 16 }}>
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={handleAddExtendField}
                    block
                  >
                    添加扩展字段
                  </Button>
                </div>

                <Table
                  columns={extendFieldColumns}
                  dataSource={extendFields}
                  pagination={false}
                  size="small"
                  rowKey={(record, index) => index?.toString() || '0'}
                  locale={{ emptyText: '暂无扩展字段' }}
                />
              </>
            ),
          },
        ]}
      />
    </Modal>
  );
};

export default CategoryModal; 