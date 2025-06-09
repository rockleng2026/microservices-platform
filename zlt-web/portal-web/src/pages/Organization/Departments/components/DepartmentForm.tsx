import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, InputNumber, Switch, TreeSelect } from 'antd';

const { Option } = Select;
const { TextArea } = Input;

interface DepartmentFormProps {
  visible: boolean;
  title: string;
  type: 'add' | 'edit' | 'copy';
  initialValues?: any;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  treeData: any[];
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({
  visible,
  title,
  type,
  initialValues,
  onCancel,
  onSubmit,
  treeData,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && initialValues) {
      form.setFieldsValue(initialValues);
    }
    if (!visible) {
      form.resetFields();
    }
  }, [visible, initialValues]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onSubmit(values);
    } catch (error) {
      console.error('Form validation failed:', error);
    }
  };

  // 转换树数据用于TreeSelect
  const convertTreeData = (data: any[]): any[] => {
    return data.map(item => ({
      title: item.name,
      value: item.id,
      children: item.children ? convertTreeData(item.children) : undefined,
    }));
  };

  return (
    <Modal
      title={title}
      visible={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: 1, gradeid: 4 }}
      >
        {type === 'copy' && (
          <>
            <Form.Item name="sourceId" hidden>
              <Input />
            </Form.Item>
            <Form.Item label="源部门" name="sourceName">
              <Input disabled />
            </Form.Item>
          </>
        )}

        <Form.Item
          name="name"
          label="部门名称"
          rules={[{ required: true, message: '请输入部门名称' }]}
        >
          <Input placeholder="请输入部门名称" />
        </Form.Item>

        <Form.Item
          name="depNo"
          label="部门编号"
          rules={[{ required: true, message: '请输入部门编号' }]}
        >
          <Input placeholder="请输入部门编号" />
        </Form.Item>

        <Form.Item
          name={type === 'copy' ? 'targetParentId' : 'parentId'}
          label="上级部门"
        >
          <TreeSelect
            placeholder="请选择上级部门"
            treeData={convertTreeData(treeData)}
            allowClear
          />
        </Form.Item>

        <Form.Item
          name="gradeid"
          label="部门等级"
          rules={[{ required: true, message: '请选择部门等级' }]}
        >
          <Select placeholder="请选择部门等级">
            <Option value={1}>集团级</Option>
            <Option value={2}>公司级</Option>
            <Option value={3}>事业部级</Option>
            <Option value={4}>部门级</Option>
            <Option value={5}>科室级</Option>
            <Option value={6}>小组级</Option>
            <Option value={7}>班组级</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="directorId"
          label="部门主管"
        >
          <Select placeholder="请选择部门主管" allowClear>
            {/* TODO: 加载员工列表 */}
          </Select>
        </Form.Item>

        <Form.Item
          name="tel"
          label="联系电话"
        >
          <Input placeholder="请输入联系电话" />
        </Form.Item>

        <Form.Item
          name="address"
          label="办公地址"
        >
          <Input placeholder="请输入办公地址" />
        </Form.Item>

        <Form.Item
          name="description"
          label="部门描述"
        >
          <TextArea rows={3} placeholder="请输入部门描述" />
        </Form.Item>

        {type === 'copy' && (
          <Form.Item
            name="includeEmployees"
            label="是否包含员工"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        )}

        <Form.Item
          name="status"
          label="状态"
          valuePropName="checked"
        >
          <Switch checkedChildren="启用" unCheckedChildren="禁用" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DepartmentForm; 